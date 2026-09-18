import { describe, it, expect } from 'vitest';
import { recommendedExpiry, fallbackExpiry, isPatternHorizonRejected } from './recommended-expiry';

describe('recommendedExpiry', () => {
  it('returns at least 1 timeframe for low volatility', () => {
    const expiry = recommendedExpiry(null, '15m', 0.001, 100);
    expect(expiry).toBeGreaterThanOrEqual(900);
  });

  it('returns more bars for lower volatility', () => {
    const lowVol = recommendedExpiry(null, '15m', 0.001, 100);
    const highVol = recommendedExpiry(null, '15m', 2, 100);
    expect(lowVol).toBeGreaterThan(highVol);
  });

  it('returns 3x timeframe for very low volatility (< 0.5%)', () => {
    const expiry = recommendedExpiry(null, '15m', 0.4, 100);
    expect(expiry).toBe(900 * 3);
  });

  it('returns 2x timeframe for medium volatility (0.5%-1%)', () => {
    const expiry = recommendedExpiry(null, '15m', 0.7, 100);
    expect(expiry).toBe(900 * 2);
  });

  it('returns 1x timeframe for high volatility (> 1%)', () => {
    const expiry = recommendedExpiry(null, '15m', 2, 100);
    expect(expiry).toBe(900);
  });

  it('returns timeframe seconds when atr is zero', () => {
    expect(recommendedExpiry(null, '5m', 0, 100)).toBe(300);
  });

  it('returns timeframe seconds when entryPrice is zero', () => {
    expect(recommendedExpiry(null, '5m', 1, 0)).toBe(300);
  });

  it('returns timeframe seconds when both atr and entryPrice are zero', () => {
    expect(recommendedExpiry(null, '1m', 0, 0)).toBe(60);
  });

  it('works correctly for different timeframes', () => {
    expect(recommendedExpiry(null, '1m', 2, 100)).toBe(60);
    expect(recommendedExpiry(null, '1h', 2, 100)).toBe(3600);
    expect(recommendedExpiry(null, '1d', 2, 100)).toBe(86400);
  });

  it('handles boundary at exactly 0.5% volatility', () => {
    const expiry = recommendedExpiry(null, '15m', 0.5, 100);
    expect(expiry).toBe(900 * 2);
  });

  it('handles boundary at exactly 1% volatility', () => {
    const expiry = recommendedExpiry(null, '15m', 1, 100);
    expect(expiry).toBe(900);
  });

  it('uses horizon table for valid pattern (harmonic-pattern → 30 bars)', () => {
    const expiry = recommendedExpiry('harmonic-pattern', '1m', 2, 100);
    expect(expiry).toBe(60 * 30);
  });

  it('falls back when pattern is rejected (impulse-breakout)', () => {
    const expiry = recommendedExpiry('impulse-breakout', '1m', 2, 100);
    expect(expiry).toBe(60);
  });

  it('falls back for unknown pattern', () => {
    const expiry = recommendedExpiry('hammer', '1m', 2, 100);
    expect(expiry).toBe(60);
  });
});

describe('fallbackExpiry', () => {
  it('returns 3x for very low volatility', () => {
    expect(fallbackExpiry('15m', 0.4, 100)).toBe(900 * 3);
  });

  it('adds 1 bar for range with weak trend', () => {
    const normal = fallbackExpiry('15m', 2, 100, false);
    const weak = fallbackExpiry('15m', 2, 100, true);
    expect(weak).toBe(normal + 900);
  });
});

describe('isPatternHorizonRejected', () => {
  it('returns true for impulse-breakout (significant but Wilson fail)', () => {
    expect(isPatternHorizonRejected('impulse-breakout')).toBe(true);
  });

  it('returns false for harmonic-pattern (valid)', () => {
    expect(isPatternHorizonRejected('harmonic-pattern')).toBe(false);
  });

  it('returns false for unknown pattern', () => {
    expect(isPatternHorizonRejected('hammer')).toBe(false);
  });

  it('returns false for null', () => {
    expect(isPatternHorizonRejected(null)).toBe(false);
  });
});
