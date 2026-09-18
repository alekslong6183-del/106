// АВТОГЕНЕРИРОВАНО — не редактировать руками,
// см. backtest/generate-pattern-horizon-table.ts
import type { PatternName } from '@/types/domain';

export interface PatternHorizonEntry {
  expiryBars: number;
  accuracy: number;
  significant: boolean;
  passesWilsonGate: boolean;
  sourceRun: string;
}

export type PatternHorizonStatus = 'valid' | 'rejected' | 'insufficient-data';

export interface PatternHorizonRecord {
  entry: PatternHorizonEntry | null;
  status: PatternHorizonStatus;
}

export const PATTERN_HORIZON_TABLE: Partial<Record<PatternName, PatternHorizonRecord>> = {
  'harmonic-pattern': {
    entry: {
      expiryBars: 30,
      accuracy: 0.5507462686567164,
      significant: true,
      passesWilsonGate: true,
      sourceRun: 'BTCUSDT-ETHUSDT-1m-walkforward-2026-08-15-2026-09-16',
    },
    status: 'valid',
  },
  'impulse-breakout': {
    entry: {
      expiryBars: 3,
      accuracy: 0.46346555323590816,
      significant: true,
      passesWilsonGate: false,
      sourceRun: 'BTCUSDT-ETHUSDT-1m-walkforward-2026-08-15-2026-09-16',
    },
    status: 'rejected',
  },
};
