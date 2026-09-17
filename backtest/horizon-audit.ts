#!/usr/bin/env tsx
/**
 * Horizon Audit — Variant B (Phase 4 recalibration)
 *
 * Аудит горизонта паттернов на реальных исторических данных.
 * Загружает 1m-свечи через существующий data-loader (Deriv для forex,
 * Binance для crypto), ресэмплирует в целевой таймфрейм, прогоняет
 * ВСЕ детекторы на каждой исторической свече и оценивает направленную
 * точность на нескольких горизонтах экспирации (expiryBars).
 *
 * Методология (direction-horizon-source-variant-B.md, раздел 3):
 *  1. Хронологическое разбиение: holdout (60/20/20) или walk-forward.
 *  2. Выбор лучшего expiryBars — ТОЛЬКО по train/validation данным.
 *  3. Финальная оценка — на отложённых test-данных (holdout) или
 *     агрегация по fold-level test-наблюдениям (walk-forward).
 *  4. Точный двусторонний биномиальный тест значимости против baseline=0.5
 *     (см. ./significance.ts) — формальный критерий, НЕ заменяется Wilson.
 *  5. Минимальный порог числа срабатываний — MIN_SAMPLES_FOR_SIGNIFICANCE
 *     (200, см. ./significance.ts).
 *  6. Предупреждение о множественных сравнениях (Holm-Bonferroni).
 *  7. Градуированный Wilson-критерий: нижняя граница интервала Уилсона
 *     даёт консервативную оценку надёжности, особенно на малых выборках,
 *     БЕЗ замены формального теста значимости. Паттерн может пройти
 *     Wilson-гейт, но не пройти формальный тест — и наоборот.
 *
 * Фаза 4 расширения:
 *  - Пулинг по нескольким инструментам (--symbols=EURUSD,USDJPY,...).
 *  - Глобальное разбиение по timestamp (не по barIndex внутри одного symbol).
 *  - Walk-forward режим (--split=walkforward) с purge-зазором между
 *    train/validation и test каждого fold.
 *  - Per-symbol breakdown в отчёте.
 *  - Wilson lower bound и passesWilsonGate в каждой строкке результата.
 *  - Метаданные пула (инструменты, корреляционное предупреждение).
 *
 * Использование:
 *   # Holdout, single symbol (обратно совместимо):
 *   npm run backtest:horizon-audit -- --symbol=EURUSD --timeframe=15m \
 *     --from=2026-06-16 --to=2026-09-16
 *
 *   # Pooled, walk-forward:
 *   npm run backtest:horizon-audit -- --symbols=EURUSD,USDJPY,GBPUSD \
 *     --timeframe=1m --from=2026-06-16 --to=2026-09-16 --split=walkforward
 */

import { fileURLToPath } from 'node:url';
import { loadHistory } from './data-loader';
import { resample } from './resampler';
import { binomialSignificanceTest, MIN_SAMPLES_FOR_SIGNIFICANCE } from './significance';
import { wilsonLowerBound } from '@/lib/wilson';
import { assignHoldoutPartitions, computeFoldBoundaries, assignFoldIndex, type FoldBoundary } from './horizon-partitioning';
import { detectAllPatterns } from '@/compute/patterns';
import { computeIndicators } from '@/compute/IndicatorAggregator';
import { computeStructure } from '@/compute/indicators/trend-structure';
import { calcSmartMoney } from '@/compute/indicators/smart-money';
import { timeframeSchema, ALL_FEATURES, DEFAULT_INDICATOR_CONFIG } from '@/types/domain';
import type { Candle, Timeframe, PatternName, SignalDirection } from '@/types/domain';

// ─── CLI ───────────────────────────────────────────────────────────

interface CliArgs {
  symbols: string[];
  from: string;
  to: string;
  timeframe: string;
  outputDir: string;
  windowSize: number;
  minSamples: number;
  significanceAlpha: number;
  split: 'holdout' | 'walkforward';
  walkForwardFolds: number;
  purgeBars: number;
  wilsonMargin: number;
}

function parseArgs(): CliArgs {
  const args = process.argv.slice(2);
  const map = new Map<string, string>();
  for (const arg of args) {
    const eqIdx = arg.indexOf('=');
    if (eqIdx > 0 && arg.startsWith('--')) {
      map.set(arg.slice(2, eqIdx), arg.slice(eqIdx + 1));
    }
  }
  const symbolArg = map.get('symbol');
  const symbolsArg = map.get('symbols');
  const symbols = symbolsArg
    ? symbolsArg.split(',').map((s) => s.trim()).filter(Boolean)
    : symbolArg
      ? [symbolArg]
      : ['EURUSD'];

  const splitArg = map.get('split') ?? 'holdout';
  return {
    symbols,
    from: map.get('from') ?? '2026-06-16',
    to: map.get('to') ?? '2026-09-16',
    timeframe: map.get('timeframe') ?? '15m',
    outputDir: map.get('output') ?? 'backtest/output',
    windowSize: parseInt(map.get('window') ?? '500', 10),
    minSamples: parseInt(map.get('min-samples') ?? '30', 10),
    significanceAlpha: parseFloat(map.get('alpha') ?? '0.05'),
    split: splitArg === 'walkforward' ? 'walkforward' : 'holdout',
    walkForwardFolds: parseInt(map.get('wf-folds') ?? '5', 10),
    purgeBars: parseInt(map.get('purge-bars') ?? '30', 10),
    wilsonMargin: parseFloat(map.get('wilson-margin') ?? '0.0'),
  };
}

// ─── Pattern horizon grids (from pattern-audit-checklist-variant-B.md) ─

const HORIZON_GRIDS: Record<string, number[]> = {
  'impulse-breakout': [1, 2, 3],
  'liquidity-sweep-reaction': [1, 2, 3],
  'order-block-continuation': [5, 10, 20, 30],
  'harmonic-pattern': [10, 20, 30],
  'strong-order-block-reaction': [1, 2, 3, 5, 10, 20, 30],
  'macd-deceleration-continuation': [5, 10, 20, 30],
  'fvg-return': [1, 2, 3, 5, 10, 20, 30],
  'fvg-rejection': [1, 2, 3, 5],
  'fvg-breaker-block': [5, 10, 20, 30],
  'fvg-nested': [5, 10, 20, 30],
  'order-block-breaker': [5, 10, 20, 30],
  'order-block-nested': [5, 10, 20, 30],
  'liquidity-sweep': [1, 2, 3],
  'hammer': [1, 2, 3, 5],
  'shooting-star': [1, 2, 3, 5],
  'inverted-hammer': [1, 2, 3, 5],
  'hanging-man': [1, 2, 3, 5],
  'marubozu-bullish': [1, 2, 3],
  'marubozu-bearish': [1, 2, 3],
  'bullish-engulfing': [1, 2, 3, 5],
  'bearish-engulfing': [1, 2, 3, 5],
  'bullish-harami': [2, 3, 5, 10],
  'bearish-harami': [2, 3, 5, 10],
  'piercing-line': [1, 2, 3, 5],
  'dark-cloud-cover': [1, 2, 3, 5],
  'tweezer-bottom': [1, 2, 3, 5],
  'tweezer-top': [1, 2, 3, 5],
  'morning-star': [3, 5, 10],
  'evening-star': [3, 5, 10],
  'three-white-soldiers': [3, 5, 10],
  'three-black-crows': [3, 5, 10],
  'abandoned-baby-bottom': [3, 5, 10],
  'abandoned-baby-top': [3, 5, 10],
  'pin-bar': [1, 2, 3, 5],
  'rising-three-methods': [10, 20, 30],
  'falling-three-methods': [10, 20, 30],
  'consolidation-breakout': [1, 2, 3, 5],
  'inside-bar': [1, 2, 3, 5],
  'mean-reversion': [5, 10, 15, 20],
};

const EXCLUDED_PATTERNS = new Set<PatternName>(['doji', 'spinning-top']);

// ─── Types ─────────────────────────────────────────────────────────

export interface Occurrence {
  patternName: PatternName;
  setupType: string | null;
  direction: SignalDirection;
  symbolId: string;
  barIndex: number;
  time: number;
  entryPrice: number;
  confidence: number;
  partition: 'train' | 'validation' | 'test';
  fold: number;
  outcomes: Map<number, number>;
}

interface PerSymbolStat {
  symbolId: string;
  totalOccurrences: number;
  testCount: number;
  testDecided: number;
  testAccuracy: number | null;
}

export interface PatternResult_ {
  patternName: PatternName;
  setupType: string | null;
  totalOccurrences: number;
  trainValCount: number;
  testCount: number;
  bestExpiryBars: number | null;
  testAccuracy: number | null;
  testWinCount: number | null;
  testDecidedCount: number | null;
  baselineMean: number | null;
  baselineStd: number | null;
  pValue: number | null;
  significant: boolean | null;
  wilsonLowerBound: number | null;
  passesWilsonGate: boolean | null;
  status: 'ok' | 'insufficient-data' | 'no-detections';
  perSymbol: PerSymbolStat[];
  perExpiry: {
    expiryBars: number;
    trainValAccuracy: number;
    testAccuracy: number;
    testDecided: number;
  }[];
  /**
   * Только для walk-forward режима: по одной записи на каждый оценённый
   * fold (fold 0 пропускается — у него нет предыстории для train).
   * Диагностика: если bestExpiry заметно "прыгает" между фолдами — это
   * сигнал нестабильности выбора горизонта, а не единственное "истинное"
   * число.
   */
  perFold: {
    fold: number;
    trainCount: number;
    bestExpiryBars: number | null;
    testDecided: number;
    testWins: number;
  }[];
}

interface PoolMeta {
  symbols: string[];
  split: 'holdout' | 'walkforward';
  walkForwardFolds: number;
  purgeBars: number;
  wilsonMargin: number;
  correlationWarning: string;
  perSymbolCandleCounts: { symbolId: string; candles1m: number; candlesResampled: number }[];
}

// ─── Core audit ─────────────────────────────────────────────────────

function buildOccurrences(
  candles: Candle[],
  symbolId: string,
  activeFeatures: PatternName[],
  config: typeof DEFAULT_INDICATOR_CONFIG,
  windowSize: number,
  maxExpiry: number,
): Occurrence[] {
  const occurrences: Occurrence[] = [];
  const minStart = Math.max(windowSize, 50);

  for (let i = minStart; i < candles.length - maxExpiry; i++) {
    const window = candles.slice(i - windowSize + 1, i + 1);

    const { snapshot } = computeIndicators(window, config, activeFeatures);
    const structure = computeStructure(window, 50, true, config.atrPeriod);
    const smartMoney = calcSmartMoney(window);

    const patterns = detectAllPatterns(
      window,
      activeFeatures,
      snapshot,
      structure,
      smartMoney,
      config.atrPeriod,
      { fast: config.macdFast, slow: config.macdSlow, signal: config.macdSignal },
      {
        minLegAtr: config.harmonicMinLegAtr,
        fibTolerancePct: config.harmonicFibTolerancePct,
        htfFactor: config.harmonicHtfFactor,
      },
    );

    const entryCandle = candles[i];

    for (const p of patterns) {
      if (EXCLUDED_PATTERNS.has(p.name)) continue;
      const grid = HORIZON_GRIDS[p.name];
      if (!grid) continue;

      const outcomes = new Map<number, number>();
      for (const expiry of grid) {
        if (i + expiry >= candles.length) {
          outcomes.set(expiry, 0);
          continue;
        }
        const expiryCandle = candles[i + expiry];
        const isBuy = p.direction === 'buy';
        if (expiryCandle.close === entryCandle.close) {
          outcomes.set(expiry, 0);
        } else {
          const win = isBuy
            ? expiryCandle.close > entryCandle.close
            : expiryCandle.close < entryCandle.close;
          outcomes.set(expiry, win ? 1 : -1);
        }
      }

      occurrences.push({
        patternName: p.name,
        setupType: p.setupType ?? null,
        direction: p.direction,
        symbolId,
        barIndex: i,
        time: entryCandle.time,
        entryPrice: entryCandle.close,
        confidence: p.confidence,
        partition: 'train',
        fold: 0,
        outcomes,
      });
    }
  }

  return occurrences;
}

// ─── Accuracy computation ──────────────────────────────────────────
// Partitioning functions (assignHoldoutPartitions, computeFoldBoundaries,
// assignFoldIndex) are imported from ./horizon-partitioning.ts — extracted
// for testability. computeWalkForwardResult() (below) uses fold indices to
// perform genuine walk-forward evaluation.

export function accuracyForExpiry(
  occs: Occurrence[],
  expiry: number,
): { accuracy: number; decided: number; wins: number } {
  let wins = 0;
  let decided = 0;
  for (const o of occs) {
    const out = o.outcomes.get(expiry);
    if (out === undefined) continue;
    if (out === 0) continue;
    decided++;
    if (out === 1) wins++;
  }
  return { accuracy: decided > 0 ? wins / decided : 0, decided, wins };
}

export function selectBestExpiry(
  trainVal: Occurrence[],
  grid: number[],
): { bestExpiry: number; bestAccuracy: number } | null {
  let bestExpiry = grid[0];
  let bestAccuracy = -1;
  for (const expiry of grid) {
    const { accuracy, decided } = accuracyForExpiry(trainVal, expiry);
    if (decided === 0) continue;
    if (accuracy > bestAccuracy) {
      bestAccuracy = accuracy;
      bestExpiry = expiry;
    }
  }
  if (bestAccuracy < 0) return null;
  return { bestExpiry, bestAccuracy };
}

/**
 * Настоящая walk-forward оценка (слияние 2026-09-17, заменяет прежнюю
 * реализацию через assignWalkForwardPartitions, которая не аккумулировала
 * предыдущие folds как train — см. header-комментарий horizon-partitioning.ts).
 *
 * Для каждого fold k = 1..folds-1 (fold 0 пропускается — нет предыстории):
 *   train = все occurrences этой группы паттерна из folds < k,
 *           с purge-отступом перед границей fold k (occurrences, чей
 *           expiry мог бы "заехать" за границу, исключены из train);
 *   test  = occurrences fold k;
 *   bestExpiry этого fold выбирается ТОЛЬКО по train этого fold
 *           (см. Фаза 3 промта, п.2 — выбор не должен подглядывать в test);
 *   исход на test для выбранного bestExpiry аккумулируется в общий пул.
 *
 * Итоговый значимый тест считается на АГРЕГИРОВАННОМ по всем оценённым
 * folds пуле (wins/decided) — это и даёт обещанный ~4-кратный прирост
 * эффективной test-выборки по сравнению с одиночным holdout (95% данных
 * участвует как test хотя бы одного fold, а не только последние 20%).
 */
export function computeWalkForwardResult(
  groupOccs: Occurrence[],
  grid: number[],
  foldBoundaries: FoldBoundary[],
  purgeSeconds: number,
  minTrainSamples: number,
): {
  perFold: PatternResult_['perFold'];
  aggregatedWins: number;
  aggregatedDecided: number;
  totalTrainCount: number;
  modalBestExpiry: number | null;
} {
  const perFold: PatternResult_['perFold'] = [];
  let aggregatedWins = 0;
  let aggregatedDecided = 0;
  let totalTrainCount = 0;
  const expiryVotes = new Map<number, number>();

  for (let k = 1; k < foldBoundaries.length; k++) {
    const purgeCutoff = foldBoundaries[k].start - purgeSeconds;
    const trainOccs = groupOccs.filter((o) => o.fold < k && o.time <= purgeCutoff);
    const testOccs = groupOccs.filter((o) => o.fold === k);

    if (trainOccs.length < minTrainSamples || testOccs.length === 0) {
      perFold.push({ fold: k, trainCount: trainOccs.length, bestExpiryBars: null, testDecided: 0, testWins: 0 });
      continue;
    }

    const best = selectBestExpiry(trainOccs, grid);
    if (!best) {
      perFold.push({ fold: k, trainCount: trainOccs.length, bestExpiryBars: null, testDecided: 0, testWins: 0 });
      continue;
    }

    const testRes = accuracyForExpiry(testOccs, best.bestExpiry);
    perFold.push({
      fold: k,
      trainCount: trainOccs.length,
      bestExpiryBars: best.bestExpiry,
      testDecided: testRes.decided,
      testWins: testRes.wins,
    });

    aggregatedWins += testRes.wins;
    aggregatedDecided += testRes.decided;
    totalTrainCount += trainOccs.length;
    expiryVotes.set(best.bestExpiry, (expiryVotes.get(best.bestExpiry) ?? 0) + 1);
  }

  let modalBestExpiry: number | null = null;
  let modalVotes = -1;
  for (const [expiry, votes] of expiryVotes) {
    if (votes > modalVotes) {
      modalVotes = votes;
      modalBestExpiry = expiry;
    }
  }

  return { perFold, aggregatedWins, aggregatedDecided, totalTrainCount, modalBestExpiry };
}

function holmBonferroni(
  results: PatternResult_[],
  alpha: number,
): void {
  const tested = results
    .filter((r) => r.pValue !== null)
    .sort((a, b) => (a.pValue! - b.pValue!));
  const m = tested.length;
  for (let i = 0; i < tested.length; i++) {
    const threshold = alpha / (m - i);
    tested[i].significant = tested[i].pValue! <= threshold;
  }
}

// ─── Report generation ──────────────────────────────────────────────

function generateMarkdown(
  args: CliArgs,
  poolMeta: PoolMeta,
  candles1mTotal: number,
  candlesTotal: number,
  results: PatternResult_[],
  dateRange: { from: string; to: string },
): string {
  const lines: string[] = [];
  const symbolsStr = args.symbols.join(', ');
  lines.push(`# Horizon Audit — ${symbolsStr} ${args.timeframe}`);
  lines.push('');
  lines.push(`> Сгенерировано: ${new Date().toISOString()}`);
  lines.push(`> Период: ${dateRange.from} → ${dateRange.to}`);
  lines.push(`> Инструменты (пул): ${symbolsStr}`);
  lines.push(`> Источник: Deriv WebSocket / Binance (1m candles → resampled to ${args.timeframe})`);
  if (args.split === 'walkforward') {
    lines.push(`> Разбиение: walk-forward, ${args.walkForwardFolds} folds, purge ${args.purgeBars} bars`);
  } else {
    lines.push(`> Разбиение: train 60% / validation 20% / test 20% (хронологическое, глобальное по timestamp)`);
  }
  lines.push(`> Минимальный порог (train+validation): ${args.minSamples} срабатываний`);
  lines.push(`> Минимальный порог для теста значимости (test-выборка): ${MIN_SAMPLES_FOR_SIGNIFICANCE} решённых исходов`);
  lines.push(`> Значимость: точный двусторонний биномиальный тест против baseline=0.5, с поправкой Holm-Bonferroni, α = ${args.significanceAlpha}`);
  lines.push(`> Wilson-критерий: нижняя граница 95% интервала Уилсона ≥ ${(0.5 + args.wilsonMargin).toFixed(3)} (margin=${args.wilsonMargin})`);
  lines.push('');
  lines.push(`**Загружено**: ${candles1mTotal} 1m свечей (суммарно по пулу), ${candlesTotal} ${args.timeframe} свечей после ресэмплинга.`);
  lines.push('');

  // Pool metadata
  lines.push(`## Метаданные пула`);
  lines.push('');
  lines.push(`| Инструмент | 1m свечей | ${args.timeframe} свечей |`);
  lines.push('|---|---|---|');
  for (const p of poolMeta.perSymbolCandleCounts) {
    lines.push(`| ${p.symbolId} | ${p.candles1m} | ${p.candlesResampled} |`);
  }
  lines.push('');
  lines.push(`> **Предупреждение о корреляции**: ${poolMeta.correlationWarning}`);
  lines.push('');

  const significantCount = results.filter((r) => r.significant === true).length;
  const wilsonPassCount = results.filter((r) => r.passesWilsonGate === true).length;
  const insufficientCount = results.filter((r) => r.status === 'insufficient-data').length;
  const noDetectionCount = results.filter((r) => r.status === 'no-detections').length;

  lines.push(`## Сводка`);
  lines.push('');
  lines.push(`- Паттернов в сетке: ${results.length}`);
  lines.push(`- Статистически значимых (после Holm-Bonferroni): **${significantCount}**`);
  lines.push(`- Прошли Wilson-гейт: ${wilsonPassCount}`);
  lines.push(`- Недостаточно данных: ${insufficientCount}`);
  lines.push(`- Нет срабатываний: ${noDetectionCount}`);
  lines.push('');

  const bothPass = results.filter((r) => r.significant === true && r.passesWilsonGate === true).length;
  const sigOnly = results.filter((r) => r.significant === true && r.passesWilsonGate !== true).length;
  const wilsonOnly = results.filter((r) => r.significant !== true && r.passesWilsonGate === true).length;
  if (bothPass + sigOnly + wilsonOnly > 0) {
    lines.push(`### Пересечение критериев`);
    lines.push('');
    lines.push(`- Прошли оба (формальный + Wilson): ${bothPass}`);
    lines.push(`- Только формальный тест: ${sigOnly}`);
    lines.push(`- Только Wilson-гейт: ${wilsonOnly}`);
    lines.push('');
  }

  lines.push(`## Результаты по паттернам`);
  lines.push('');
  lines.push('| Паттерн | Setup | Всего | Train+Val | Test | Лучший expiry | Test acc | p-value | Значим | Wilson LB | Wilson OK | Статус |');
  lines.push('|---|---|---|---|---|---|---|---|---|---|---|---|');

  for (const r of results) {
    const setup = r.setupType ?? '—';
    const total = r.totalOccurrences;
    const tv = r.trainValCount;
    const tc = r.testCount;
    const exp = r.bestExpiryBars ?? '—';
    const acc = r.testAccuracy !== null ? `${(r.testAccuracy * 100).toFixed(1)}%` : '—';
    const pv = r.pValue !== null ? r.pValue.toFixed(4) : '—';
    const sig = r.significant === true ? 'да' : r.significant === false ? 'нет' : '—';
    const wlb = r.wilsonLowerBound !== null ? `${(r.wilsonLowerBound * 100).toFixed(1)}%` : '—';
    const wok = r.passesWilsonGate === true ? 'да' : r.passesWilsonGate === false ? 'нет' : '—';
    const status = r.status === 'ok' ? 'OK' : r.status === 'insufficient-data' ? 'недостаточно данных' : 'нет срабатываний';
    lines.push(`| ${r.patternName} | ${setup} | ${total} | ${tv} | ${tc} | ${exp} | ${acc} | ${pv} | ${sig} | ${wlb} | ${wok} | ${status} |`);
  }

  // Per-symbol breakdown
  lines.push('');
  lines.push(`## Разбивка по инструментам`);
  lines.push('');
  for (const r of results) {
    if (r.perSymbol.length === 0) continue;
    lines.push(`### ${r.patternName}${r.setupType ? ` (${r.setupType})` : ''}`);
    lines.push('');
    lines.push('| Инструмент | Всего | Test | Test decided | Test accuracy |');
    lines.push('|---|---|---|---|---|');
    for (const ps of r.perSymbol) {
      const psAcc = ps.testAccuracy !== null ? `${(ps.testAccuracy * 100).toFixed(1)}%` : '—';
      lines.push(`| ${ps.symbolId} | ${ps.totalOccurrences} | ${ps.testCount} | ${ps.testDecided} | ${psAcc} |`);
    }
    lines.push('');
  }

  lines.push(`## Детализация по горизонтам`);
  lines.push('');

  for (const r of results) {
    if (r.perExpiry.length === 0) continue;
    lines.push(`### ${r.patternName}${r.setupType ? ` (${r.setupType})` : ''}`);
    lines.push('');
    lines.push('| Expiry bars | Train+Val accuracy | Test accuracy | Test decided |');
    lines.push('|---|---|---|---|');
    for (const pe of r.perExpiry) {
      lines.push(`| ${pe.expiryBars} | ${(pe.trainValAccuracy * 100).toFixed(1)}% | ${(pe.testAccuracy * 100).toFixed(1)}% | ${pe.testDecided} |`);
    }
    lines.push('');
  }

  if (args.split === 'walkforward') {
    lines.push(`## Разбивка по folds (walk-forward)`);
    lines.push('');
    lines.push(
      `> Если \`bestExpiryBars\` заметно меняется между folds — это признак нестабильности выбора ` +
      `горизонта для этого паттерна, а не единственное "истинное" число. Итоговый \`bestExpiryBars\` ` +
      `в сводной таблице выше — мода (самый частый выбор) по всем оценённым folds.`,
    );
    lines.push('');
    for (const r of results) {
      if (r.perFold.length === 0) continue;
      lines.push(`### ${r.patternName}${r.setupType ? ` (${r.setupType})` : ''}`);
      lines.push('');
      lines.push('| Fold | Train count | Best expiry | Test decided | Test wins | Fold accuracy |');
      lines.push('|---|---|---|---|---|---|');
      for (const pf of r.perFold) {
        const foldAcc = pf.testDecided > 0 ? `${((pf.testWins / pf.testDecided) * 100).toFixed(1)}%` : '—';
        lines.push(`| ${pf.fold} | ${pf.trainCount} | ${pf.bestExpiryBars ?? 'пропущен (мало train)'} | ${pf.testDecided} | ${pf.testWins} | ${foldAcc} |`);
      }
      lines.push('');
    }
  }

  return lines.join('\n');
}

// ─── Main ───────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const args = parseArgs();

  const tfResult = timeframeSchema.safeParse(args.timeframe);
  if (!tfResult.success) {
    console.error(`Invalid timeframe: ${args.timeframe}. Valid: ${timeframeSchema.options.join(', ')}`);
    process.exit(1);
  }
  const timeframe: Timeframe = tfResult.data;

  const fromMs = new Date(args.from).getTime();
  const toMs = new Date(args.to).getTime();
  if (Number.isNaN(fromMs) || Number.isNaN(toMs)) {
    console.error('Invalid date format. Use YYYY-MM-DD.');
    process.exit(1);
  }
  if (fromMs >= toMs) {
    console.error('--from must be before --to');
    process.exit(1);
  }

  console.log(`\nHorizon Audit: ${args.symbols.join(', ')} ${args.timeframe} ${args.from} → ${args.to}`);
  console.log(`Split mode: ${args.split}${args.split === 'walkforward' ? `, ${args.walkForwardFolds} folds, purge=${args.purgeBars} bars` : ''}`);

  // Load history for each symbol in the pool
  const patternFeatures = ALL_FEATURES.filter(
    (f): f is PatternName =>
      HORIZON_GRIDS[f as string] !== undefined && !EXCLUDED_PATTERNS.has(f as PatternName),
  );

  const config = { ...DEFAULT_INDICATOR_CONFIG };
  const maxExpiry = Math.max(...Object.values(HORIZON_GRIDS).flat());

  const allOccurrences: Occurrence[] = [];
  const perSymbolCandleCounts: PoolMeta['perSymbolCandleCounts'] = [];
  let totalCandles1m = 0;
  let totalCandlesResampled = 0;

  for (const symbolId of args.symbols) {
    console.log(`\nLoading 1m history for ${symbolId}...`);
    const candles1m = await loadHistory({ symbol: symbolId, fromMs, toMs });
    console.log(`  ${symbolId}: ${candles1m.length} 1m candles`);

    if (candles1m.length < 500) {
      console.warn(`  ${symbolId}: skipping — not enough 1m candles (need at least 500)`);
      perSymbolCandleCounts.push({ symbolId, candles1m: candles1m.length, candlesResampled: 0 });
      continue;
    }

    const candles = resample(candles1m, timeframe);
    console.log(`  ${symbolId}: ${candles.length} ${timeframe} candles after resampling`);

    if (candles.length < 200) {
      console.warn(`  ${symbolId}: skipping — not enough resampled candles (need at least 200)`);
      perSymbolCandleCounts.push({ symbolId, candles1m: candles1m.length, candlesResampled: candles.length });
      continue;
    }

    perSymbolCandleCounts.push({ symbolId, candles1m: candles1m.length, candlesResampled: candles.length });
    totalCandles1m += candles1m.length;
    totalCandlesResampled += candles.length;

    console.log(`  ${symbolId}: running detectors on ${candles.length - maxExpiry - args.windowSize} bars...`);
    const occs = buildOccurrences(candles, symbolId, patternFeatures, config, args.windowSize, maxExpiry);
    console.log(`  ${symbolId}: ${occs.length} occurrences`);
    allOccurrences.push(...occs);
  }

  if (allOccurrences.length === 0) {
    console.error('No occurrences detected across any symbol. Exiting.');
    process.exit(1);
  }

  // Partition
  const timeframeSecondsMap: Record<Timeframe, number> = {
    '1m': 60, '5m': 300, '15m': 900, '30m': 1800, '1h': 3600, '4h': 14400, '1d': 86400,
  };
  let foldBoundaries: FoldBoundary[] = [];
  let purgeSeconds = 0;
  if (args.split === 'walkforward') {
    purgeSeconds = args.purgeBars * timeframeSecondsMap[timeframe];
    let minTime = Infinity;
    let maxTime = -Infinity;
    for (const o of allOccurrences) {
      if (o.time < minTime) minTime = o.time;
      if (o.time > maxTime) maxTime = o.time;
    }
    foldBoundaries = computeFoldBoundaries(minTime, maxTime, args.walkForwardFolds);
    assignFoldIndex(allOccurrences, foldBoundaries);
    console.log(`\nWalk-forward: ${args.walkForwardFolds} folds, purge ${args.purgeBars} bars (${purgeSeconds}s)`);
    console.log(`Fold boundaries (unix seconds): ${foldBoundaries.map((b) => `[${b.start.toFixed(0)}, ${b.end.toFixed(0)})`).join(', ')}`);
  } else {
    assignHoldoutPartitions(allOccurrences);
  }

  console.log(`\nTotal occurrences: ${allOccurrences.length}`);
  if (args.split === 'walkforward') {
    const warmup = allOccurrences.filter((o) => o.fold === 0).length;
    const eligible = allOccurrences.length - warmup;
    console.log(`Fold 0 (warm-up, no test): ${warmup}, eligible for test in some fold (fold>=1): ${eligible}`);
  } else {
    const trainVal = allOccurrences.filter((o) => o.partition === 'train' || o.partition === 'validation');
    const test = allOccurrences.filter((o) => o.partition === 'test');
    console.log(`Train+Validation: ${trainVal.length}, Test: ${test.length}`);
  }

  // Group by pattern + setupType
  const groupKey = (o: Occurrence) => `${o.patternName}|${o.setupType ?? ''}`;
  const groups = new Map<string, Occurrence[]>();
  for (const o of allOccurrences) {
    const key = groupKey(o);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(o);
  }

  const results: PatternResult_[] = [];
  for (const [key, groupOccs] of groups) {
    const [patternName, setupTypeStr] = key.split('|');
    const setupType = setupTypeStr || null;
    const grid = HORIZON_GRIDS[patternName];
    if (!grid) continue;

    const isWalkForward = args.split === 'walkforward';

    // Для holdout — привычные tv/tc по o.partition (не изменилось).
    // Для walk-forward — эти переменные используются только для
    // диагностической таблицы perExpiry ниже (fold 0 = "разогревочный"
    // train без собственного test, fold>=1 = пул, который хотя бы раз
    // выступал test каким-то fold'ом). ОСНОВНОЙ результат (bestExpiryBars,
    // testAccuracy, pValue и т.д.) для walk-forward считает
    // computeWalkForwardResult() ниже — эти tv/tc его не подменяют.
    const tv = isWalkForward
      ? groupOccs.filter((o) => o.fold === 0)
      : groupOccs.filter((o) => o.partition !== 'test');
    const tc = isWalkForward
      ? groupOccs.filter((o) => o.fold >= 1)
      : groupOccs.filter((o) => o.partition === 'test');

    // Per-symbol stats
    const symbolMap = new Map<string, Occurrence[]>();
    for (const o of groupOccs) {
      if (!symbolMap.has(o.symbolId)) symbolMap.set(o.symbolId, []);
      symbolMap.get(o.symbolId)!.push(o);
    }
    const perSymbol: PerSymbolStat[] = [];
    for (const [symId, symOccs] of symbolMap) {
      const symTest = isWalkForward
        ? symOccs.filter((o) => o.fold >= 1)
        : symOccs.filter((o) => o.partition === 'test');
      perSymbol.push({
        symbolId: symId,
        totalOccurrences: symOccs.length,
        testCount: symTest.length,
        testDecided: 0,
        testAccuracy: null,
      });
    }
    perSymbol.sort((a, b) => b.totalOccurrences - a.totalOccurrences);

    const result: PatternResult_ = {
      patternName: patternName as PatternName,
      setupType,
      totalOccurrences: groupOccs.length,
      trainValCount: tv.length,
      testCount: tc.length,
      bestExpiryBars: null,
      testAccuracy: null,
      testWinCount: null,
      testDecidedCount: null,
      baselineMean: null,
      baselineStd: null,
      pValue: null,
      significant: null,
      wilsonLowerBound: null,
      passesWilsonGate: null,
      status: 'no-detections',
      perSymbol,
      perExpiry: [],
      perFold: [],
    };

    if (groupOccs.length === 0) {
      results.push(result);
      continue;
    }

    // Дешёвый предфильтр перед дорогим вычислением. Для holdout — как и
    // раньше, по размеру train+val (tv). Для walk-forward tv — это ТОЛЬКО
    // fold 0 (разогрев), а не совокупный train — гейтить по нему было бы
    // некорректно: поздние folds накапливают историю независимо от того,
    // достаточно ли данных в fold 0 самом по себе. Гейтим по общему числу
    // occurrences паттерна — дешёвый sanity-check, а не финальное решение
    // (финальное — внутри computeWalkForwardResult, по каждому fold отдельно).
    const preFilterSize = isWalkForward ? groupOccs.length : tv.length;
    if (preFilterSize < args.minSamples) {
      result.status = 'insufficient-data';
      for (const expiry of grid) {
        const tvAcc = accuracyForExpiry(tv, expiry);
        const tAcc = accuracyForExpiry(tc, expiry);
        result.perExpiry.push({
          expiryBars: expiry,
          trainValAccuracy: tvAcc.accuracy,
          testAccuracy: tAcc.accuracy,
          testDecided: tAcc.decided,
        });
      }
      results.push(result);
      continue;
    }

    for (const expiry of grid) {
      const tvAcc = accuracyForExpiry(tv, expiry);
      const tAcc = accuracyForExpiry(tc, expiry);
      result.perExpiry.push({
        expiryBars: expiry,
        trainValAccuracy: tvAcc.accuracy,
        testAccuracy: tAcc.accuracy,
        testDecided: tAcc.decided,
      });
    }

    if (isWalkForward) {
      const wf = computeWalkForwardResult(groupOccs, grid, foldBoundaries, purgeSeconds, args.minSamples);
      result.perFold = wf.perFold;
      result.trainValCount = wf.totalTrainCount;

      if (wf.modalBestExpiry === null || wf.aggregatedDecided === 0) {
        result.status = 'insufficient-data';
        results.push(result);
        continue;
      }

      result.bestExpiryBars = wf.modalBestExpiry;
      result.testDecidedCount = wf.aggregatedDecided;
      result.testCount = wf.aggregatedDecided;
      result.testWinCount = wf.aggregatedWins;
      result.testAccuracy = wf.aggregatedWins / wf.aggregatedDecided;

      result.wilsonLowerBound = wilsonLowerBound(wf.aggregatedWins, wf.aggregatedDecided);
      result.passesWilsonGate = result.wilsonLowerBound >= 0.5 + args.wilsonMargin;

      // Per-symbol breakdown: приближение через modalBestExpiry (разные
      // folds могли выбрать разный expiry — см. комментарий у perFold в
      // PatternResult_). Это диагностика, не основной результат.
      for (const ps of result.perSymbol) {
        const symFoldTest = symbolMap.get(ps.symbolId)!.filter((o) => o.fold >= 1);
        const symAcc = accuracyForExpiry(symFoldTest, wf.modalBestExpiry);
        ps.testDecided = symAcc.decided;
        ps.testAccuracy = symAcc.decided > 0 ? symAcc.accuracy : null;
      }

      if (wf.aggregatedDecided < MIN_SAMPLES_FOR_SIGNIFICANCE) {
        result.status = 'insufficient-data';
        results.push(result);
        continue;
      }

      const sig = binomialSignificanceTest(wf.aggregatedWins, wf.aggregatedDecided, 0.5, args.significanceAlpha);
      result.baselineMean = sig.baseline;
      result.baselineStd = null;
      result.pValue = sig.pValue;
      result.status = 'ok';
      results.push(result);
      continue;
    }

    const best = selectBestExpiry(tv, grid);
    if (!best) {
      result.status = 'insufficient-data';
      results.push(result);
      continue;
    }

    result.bestExpiryBars = best.bestExpiry;
    const testResult = accuracyForExpiry(tc, best.bestExpiry);
    result.testAccuracy = testResult.accuracy;
    result.testDecidedCount = testResult.decided;
    result.testWinCount = testResult.decided > 0
      ? Math.round(testResult.accuracy * testResult.decided)
      : 0;

    // Wilson lower bound (graduated reliability criterion)
    if (testResult.decided > 0) {
      result.wilsonLowerBound = wilsonLowerBound(result.testWinCount, testResult.decided);
      result.passesWilsonGate = result.wilsonLowerBound >= 0.5 + args.wilsonMargin;
    }

    // Update per-symbol test stats for the best expiry
    for (const ps of result.perSymbol) {
      const symTest = symbolMap.get(ps.symbolId)!.filter((o) => o.partition === 'test');
      const symAcc = accuracyForExpiry(symTest, best.bestExpiry);
      ps.testDecided = symAcc.decided;
      ps.testAccuracy = symAcc.decided > 0 ? symAcc.accuracy : null;
    }

    if (testResult.decided < MIN_SAMPLES_FOR_SIGNIFICANCE) {
      result.status = 'insufficient-data';
      results.push(result);
      continue;
    }

    const sig = binomialSignificanceTest(
      result.testWinCount,
      testResult.decided,
      0.5,
      args.significanceAlpha,
    );
    result.baselineMean = sig.baseline;
    result.baselineStd = null;
    result.pValue = sig.pValue;
    result.status = 'ok';
    results.push(result);
  }

  holmBonferroni(results, args.significanceAlpha);

  results.sort((a, b) => {
    if (a.significant === true && b.significant !== true) return -1;
    if (b.significant === true && a.significant !== true) return 1;
    const aAcc = a.testAccuracy ?? -1;
    const bAcc = b.testAccuracy ?? -1;
    return bAcc - aAcc;
  });

  // Correlation warning
  const correlationWarning = args.symbols.length > 1
    ? `Пул содержит ${args.symbols.length} инструментов. Корреляция между инструментами (особенно forex-парами с общей валютой) может завышать эффективный размер выборки. Для строгого учёта использовать кластерные стандартные ошибки или эффективный размер выборки. Текущая реализация НЕ корректирует p-value на внутрикластерную корреляцию — p-value интерпретируется как per-observation, не per-cluster.`
    : 'Один инструмент — коррекция не требуется.';

  const poolMeta: PoolMeta = {
    symbols: args.symbols,
    split: args.split,
    walkForwardFolds: args.walkForwardFolds,
    purgeBars: args.purgeBars,
    wilsonMargin: args.wilsonMargin,
    correlationWarning,
    perSymbolCandleCounts,
  };

  const md = generateMarkdown(args, poolMeta, totalCandles1m, totalCandlesResampled, results, {
    from: args.from,
    to: args.to,
  });

  const fs = await import('node:fs/promises');
  const path = await import('node:path');
  await fs.mkdir(args.outputDir, { recursive: true });

  const symbolsSlug = args.symbols.join('-');
  const baseName = `horizon-audit-${symbolsSlug}-${args.timeframe}-${args.split}-${args.from}-${args.to}`;
  const mdPath = path.join(args.outputDir, `${baseName}.md`);
  const jsonPath = path.join(args.outputDir, `${baseName}.json`);

  await fs.writeFile(mdPath, md, 'utf-8');
  await fs.writeFile(
    jsonPath,
    JSON.stringify({
      meta: {
        symbols: args.symbols,
        timeframe: args.timeframe,
        from: args.from,
        to: args.to,
        split: args.split,
        walkForwardFolds: args.walkForwardFolds,
        purgeBars: args.purgeBars,
        wilsonMargin: args.wilsonMargin,
        candles1mTotal: totalCandles1m,
        candlesResampledTotal: totalCandlesResampled,
        windowSize: args.windowSize,
        minSamples: args.minSamples,
        minSamplesForSignificance: MIN_SAMPLES_FOR_SIGNIFICANCE,
        alpha: args.significanceAlpha,
        generatedAt: new Date().toISOString(),
      },
      poolMeta,
      results: results.map((r) => ({
        patternName: r.patternName,
        setupType: r.setupType,
        totalOccurrences: r.totalOccurrences,
        trainValCount: r.trainValCount,
        testCount: r.testCount,
        bestExpiryBars: r.bestExpiryBars,
        testAccuracy: r.testAccuracy,
        testWinCount: r.testWinCount,
        testDecidedCount: r.testDecidedCount,
        baselineMean: r.baselineMean,
        baselineStd: r.baselineStd,
        pValue: r.pValue,
        significant: r.significant,
        wilsonLowerBound: r.wilsonLowerBound,
        passesWilsonGate: r.passesWilsonGate,
        status: r.status,
        perSymbol: r.perSymbol,
        perExpiry: r.perExpiry,
        perFold: r.perFold,
      })),
    }, null, 2),
    'utf-8',
  );

  console.log(`\nReport saved: ${mdPath}`);
  console.log(`JSON saved: ${jsonPath}`);

  const sig = results.filter((r) => r.significant === true);
  const wilsonPass = results.filter((r) => r.passesWilsonGate === true);
  const insuf = results.filter((r) => r.status === 'insufficient-data');
  console.log(`\n=== Summary ===`);
  console.log(`Patterns evaluated: ${results.length}`);
  console.log(`Significant (Holm-Bonferroni α=${args.significanceAlpha}): ${sig.length}`);
  console.log(`Wilson gate passed: ${wilsonPass.length}`);
  console.log(`Insufficient data: ${insuf.length}`);
  if (sig.length > 0) {
    console.log(`\nSignificant patterns:`);
    for (const r of sig) {
      console.log(
        `  ${r.patternName}${r.setupType ? ` (${r.setupType})` : ''}: ` +
        `expiry=${r.bestExpiryBars}, accuracy=${((r.testAccuracy ?? 0) * 100).toFixed(1)}%, ` +
        `p=${r.pValue?.toFixed(4)}, wilsonLB=${r.wilsonLowerBound !== null ? (r.wilsonLowerBound * 100).toFixed(1) + '%' : '—'}`,
      );
    }
  }
  if (wilsonPass.length > 0) {
    console.log(`\nWilson gate passed:`);
    for (const r of wilsonPass) {
      console.log(
        `  ${r.patternName}${r.setupType ? ` (${r.setupType})` : ''}: ` +
        `wilsonLB=${r.wilsonLowerBound !== null ? (r.wilsonLowerBound * 100).toFixed(1) + '%' : '—'}, ` +
        `significant=${r.significant}`,
      );
    }
  }
}

// BUGFIX (слияние 2026-09-17): main() раньше вызывался безусловно на
// верхнем уровне модуля — любой `import` из этого файла (например, из
// теста, который хочет переиспользовать exported-функции вроде
// computeWalkForwardResult) запускал бы весь CLI: парсинг process.argv,
// реальные сетевые запросы к Deriv/Binance, возможный process.exit().
// Гвардим тем же паттерном, что и `if (require.main === module)` в
// CommonJS — только для ESM, через сравнение fileURLToPath(import.meta.url)
// с process.argv[1] (путь запущенного скрипта).
const isDirectRun = (() => {
  try {
    return process.argv[1] === fileURLToPath(import.meta.url);
  } catch {
    return false;
  }
})();

if (isDirectRun) {
  main().catch((err: unknown) => {
    console.error('Horizon audit failed:', err instanceof Error ? err.message : String(err));
    if (err instanceof Error && err.stack) {
      console.error(err.stack);
    }
    process.exit(1);
  });
}
