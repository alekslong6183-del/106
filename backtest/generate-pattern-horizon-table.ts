#!/usr/bin/env tsx
/**
 * Генератор runtime-таблицы горизонтов из JSON-отчётов horizon-audit.
 *
 * Читает все JSON-файлы из backtest/output/, отбирает результаты с
 * status === 'ok' (достаточно данных для формального теста значимости),
 * и генерирует src/decision/pattern-horizon-table.ts.
 *
 * Правила отбора:
 *  - significant === true && passesWilsonGate === true → status: 'valid'
 *  - significant === true && passesWilsonGate === false → status: 'rejected'
 *  - significant === false → status: 'rejected'
 *  - significant === null (insufficient-data) → не включается в таблицу
 *
 * Использование:
 *   npx tsx --tsconfig backtest/tsconfig.json backtest/generate-pattern-horizon-table.ts
 */
import { readFile, writeFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';

interface PatternResultJson {
  patternName: string;
  setupType: string | null;
  bestExpiryBars: number | null;
  testAccuracy: number | null;
  significant: boolean | null;
  passesWilsonGate: boolean | null;
  status: string;
}

interface AuditJson {
  meta: { symbols: string[]; timeframe: string; from: string; to: string; split: string; generatedAt: string };
  results: PatternResultJson[];
}

type PatternHorizonStatus = 'valid' | 'rejected' | 'insufficient-data';

interface PatternHorizonEntry {
  expiryBars: number;
  accuracy: number;
  significant: boolean;
  passesWilsonGate: boolean;
  sourceRun: string;
}

interface PatternHorizonRecord {
  entry: PatternHorizonEntry | null;
  status: PatternHorizonStatus;
}

function classifyResult(r: PatternResultJson, sourceRun: string): PatternHorizonRecord | null {
  if (r.status !== 'ok') return null;
  if (r.bestExpiryBars === null || r.testAccuracy === null) return null;
  if (r.significant === null) return null;

  if (r.significant === true && r.passesWilsonGate === true) {
    return {
      entry: { expiryBars: r.bestExpiryBars, accuracy: r.testAccuracy, significant: true, passesWilsonGate: true, sourceRun },
      status: 'valid',
    };
  }

  return {
    entry: { expiryBars: r.bestExpiryBars, accuracy: r.testAccuracy, significant: r.significant, passesWilsonGate: r.passesWilsonGate ?? false, sourceRun },
    status: 'rejected',
  };
}

async function main(): Promise<void> {
  const outputDir = 'backtest/output';
  const files = await readdir(outputDir);
  const jsonFiles = files.filter((f) => f.endsWith('.json') && f.startsWith('horizon-audit-'));

  if (jsonFiles.length === 0) {
    console.error('No horizon-audit JSON files found in', outputDir);
    process.exit(1);
  }

  const table: Record<string, PatternHorizonRecord> = {};

  for (const file of jsonFiles) {
    const raw = await readFile(join(outputDir, file), 'utf-8');
    const data: AuditJson = JSON.parse(raw);
    const sourceRun = file.replace(/^horizon-audit-/, '').replace(/\.json$/, '');

    for (const r of data.results) {
      const record = classifyResult(r, sourceRun);
      if (!record) continue;

      const existing = table[r.patternName];
      if (!existing) { table[r.patternName] = record; continue; }
      if (record.status === 'valid' && existing.status !== 'valid') { table[r.patternName] = record; }
      else if (record.status === 'rejected' && existing.status === 'rejected') {
        if (record.entry && existing.entry && record.entry.accuracy > existing.entry.accuracy) {
          table[r.patternName] = record;
        }
      }
    }
  }

  const lines: string[] = [
    '// АВТОГЕНЕРИРОВАНО — не редактировать руками,',
    '// см. backtest/generate-pattern-horizon-table.ts',
    "import type { PatternName } from '@/types/domain';",
    '',
    'export interface PatternHorizonEntry {',
    '  expiryBars: number;',
    '  accuracy: number;',
    '  significant: boolean;',
    '  passesWilsonGate: boolean;',
    '  sourceRun: string;',
    '}',
    '',
    "export type PatternHorizonStatus = 'valid' | 'rejected' | 'insufficient-data';",
    '',
    'export interface PatternHorizonRecord {',
    '  entry: PatternHorizonEntry | null;',
    '  status: PatternHorizonStatus;',
    '}',
    '',
    'export const PATTERN_HORIZON_TABLE: Partial<Record<PatternName, PatternHorizonRecord>> = {',
  ];

  for (const key of Object.keys(table).sort()) {
    const rec = table[key];
    lines.push(`  '${key}': {`);
    if (rec.entry) {
      lines.push(`    entry: {`);
      lines.push(`      expiryBars: ${rec.entry.expiryBars},`);
      lines.push(`      accuracy: ${rec.entry.accuracy},`);
      lines.push(`      significant: ${rec.entry.significant},`);
      lines.push(`      passesWilsonGate: ${rec.entry.passesWilsonGate},`);
      lines.push(`      sourceRun: '${rec.entry.sourceRun}',`);
      lines.push(`    },`);
    } else {
      lines.push(`    entry: null,`);
    }
    lines.push(`    status: '${rec.status}',`);
    lines.push(`  },`);
  }

  lines.push('};');

  const outPath = 'src/decision/pattern-horizon-table.ts';
  await writeFile(outPath, lines.join('\n') + '\n', 'utf-8');
  console.log(`Generated ${outPath} with ${Object.keys(table).length} entries`);
}

main().catch((err: unknown) => {
  console.error('Generation failed:', err instanceof Error ? err.message : String(err));
  process.exit(1);
});
