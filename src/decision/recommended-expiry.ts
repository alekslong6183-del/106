import type { Timeframe, PatternName } from '@/types/domain';
import { TIMEFRAME_SECONDS } from '@/data/symbols';
import { PATTERN_HORIZON_TABLE } from './pattern-horizon-table';

// Фаза B (слияние 2026-09-17): recommendedExpiry теперь принимает PatternName
// первым аргументом и консультирует сгенерированную таблицу горизонтов
// (pattern-horizon-table.ts). Если таблица содержит валидную запись
// (significant + Wilson pass) — используется table expiryBars, конвертированный
// в секунды. Если записи нет (insufficient-data / отсутствует) — fallback без
// штрафа. Если запись отвергнута — signal-builder.ts подавляет сигнал целиком
// (см. isPatternHorizonRejected ниже).
//
// BUGFIX (аудит 2026-09-06, п.7 "экспирация слишком жёсткая для чопа"):
// раньше экспирация зависела только от volatilityPct (ATR/цена) и никогда —
// от regime/ADX. В range-режиме со слабым/угасающим трендом 3 бара почти
// не оставляют права на ошибку. Для сигналов, прошедших regime-гейт
// только с мягким штрафом (ADX в [20,30)), экспирация увеличивается на
// один бар относительно того, что дала бы чистая волатильность.
export function recommendedExpiry(
  pattern: PatternName | null,
  timeframe: Timeframe,
  atr: number,
  entryPrice: number,
  isRangeWithWeakTrend: boolean = false,
): number {
  if (pattern) {
    const record = PATTERN_HORIZON_TABLE[pattern];
    if (record && record.status === 'valid' && record.entry) {
      return TIMEFRAME_SECONDS[timeframe] * record.entry.expiryBars;
    }
  }

  return fallbackExpiry(timeframe, atr, entryPrice, isRangeWithWeakTrend);
}

export function fallbackExpiry(
  timeframe: Timeframe,
  atr: number,
  entryPrice: number,
  isRangeWithWeakTrend: boolean = false,
): number {
  if (atr <= 0 || entryPrice <= 0) return TIMEFRAME_SECONDS[timeframe];
  const volatilityPct = atr / entryPrice;
  const baseBars = volatilityPct < 0.005 ? 3 : volatilityPct < 0.01 ? 2 : 1;
  const bars = isRangeWithWeakTrend ? baseBars + 1 : baseBars;
  return Math.round(TIMEFRAME_SECONDS[timeframe] * bars);
}

// Проверка: был ли паттерн явно протестирован и отвергнут (significant=false
// или Wilson fail). Используется signal-builder.ts для подавления сигнала.
export function isPatternHorizonRejected(pattern: PatternName | null): boolean {
  if (!pattern) return false;
  const record = PATTERN_HORIZON_TABLE[pattern];
  if (!record) return false;
  return record.status === 'rejected';
}
