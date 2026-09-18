# Horizon Audit — EURUSD, USDJPY 1m

> Сгенерировано: 2026-09-17T08:51:07.756Z
> Период: 2026-08-15 → 2026-09-16
> Инструменты (пул): EURUSD, USDJPY
> Источник: Deriv WebSocket / Binance (1m candles → resampled to 1m)
> Разбиение: walk-forward, 8 folds, purge 30 bars
> Минимальный порог (train+validation): 30 срабатываний
> Минимальный порог для теста значимости (test-выборка): 200 решённых исходов
> Значимость: точный двусторонний биномиальный тест против baseline=0.5, с поправкой Holm-Bonferroni, α = 0.05
> Wilson-критерий: нижняя граница 95% интервала Уилсона ≥ 0.500 (margin=0)

**Загружено**: 61898 1m свечей (суммарно по пулу), 61898 1m свечей после ресэмплинга.

## Метаданные пула

| Инструмент | 1m свечей | 1m свечей |
|---|---|---|
| EURUSD | 30949 | 30949 |
| USDJPY | 30949 | 30949 |

> **Предупреждение о корреляции**: Пул содержит 2 инструментов. Корреляция между инструментами (особенно forex-парами с общей валютой) может завышать эффективный размер выборки. Для строгого учёта использовать кластерные стандартные ошибки или эффективный размер выборки. Текущая реализация НЕ корректирует p-value на внутрикластерную корреляцию — p-value интерпретируется как per-observation, не per-cluster.

## Сводка

- Паттернов в сетке: 18
- Статистически значимых (после Holm-Bonferroni): **0**
- Прошли Wilson-гейт: 0
- Недостаточно данных: 13
- Нет срабатываний: 0

## Результаты по паттернам

| Паттерн | Setup | Всего | Train+Val | Test | Лучший expiry | Test acc | p-value | Значим | Wilson LB | Wilson OK | Статус |
|---|---|---|---|---|---|---|---|---|---|---|---|
| marubozu-bullish | — | 45 | 39 | 6 | 2 | 83.3% | — | — | 43.6% | нет | недостаточно данных |
| fvg-nested | — | 62 | 140 | 22 | 30 | 59.1% | — | — | 38.7% | нет | недостаточно данных |
| order-block-nested | — | 81 | 143 | 41 | 5 | 56.1% | — | — | 41.0% | нет | недостаточно данных |
| shooting-star | — | 130 | 399 | 76 | 2 | 52.6% | — | — | 41.6% | нет | недостаточно данных |
| inside-bar | — | 5098 | 18805 | 3871 | 1 | 48.7% | 0.1080 | нет | 47.1% | нет | OK |
| impulse-breakout | — | 1315 | 4890 | 1030 | 2 | 48.6% | 0.4002 | нет | 45.6% | нет | OK |
| strong-order-block-reaction | — | 2537 | 8662 | 2103 | 30 | 48.5% | 0.1907 | нет | 46.4% | нет | OK |
| order-block-continuation | — | 609 | 2175 | 509 | 10 | 46.6% | 0.1317 | нет | 42.3% | нет | OK |
| pin-bar | — | 107 | 320 | 65 | 5 | 44.6% | — | — | 33.2% | нет | недостаточно данных |
| harmonic-pattern | — | 548 | 2067 | 407 | 20 | 44.0% | 0.0172 | нет | 39.2% | нет | OK |
| marubozu-bearish | — | 36 | 33 | 3 | 1 | 33.3% | — | — | 6.1% | нет | недостаточно данных |
| fvg-return | — | 42 | 70 | 10 | 30 | 20.0% | — | — | 5.7% | нет | недостаточно данных |
| liquidity-sweep | reversal-at-key-level | 24 | 7 | 17 | — | — | — | — | — | — | недостаточно данных |
| bearish-harami | — | 4 | 2 | 2 | — | — | — | — | — | — | недостаточно данных |
| bullish-harami | — | 6 | 2 | 4 | — | — | — | — | — | — | недостаточно данных |
| liquidity-sweep-reaction | reversal-at-key-level | 2 | 0 | 2 | — | — | — | — | — | — | недостаточно данных |
| inverted-hammer | — | 3 | 0 | 3 | — | — | — | — | — | — | недостаточно данных |
| hammer | — | 3 | 0 | 3 | — | — | — | — | — | — | недостаточно данных |

## Разбивка по инструментам

### marubozu-bullish

| Инструмент | Всего | Test | Test decided | Test accuracy |
|---|---|---|---|---|
| USDJPY | 27 | 22 | 22 | 72.7% |
| EURUSD | 18 | 15 | 15 | 66.7% |

### fvg-nested

| Инструмент | Всего | Test | Test decided | Test accuracy |
|---|---|---|---|---|
| USDJPY | 35 | 30 | 30 | 53.3% |
| EURUSD | 27 | 25 | 25 | 52.0% |

### order-block-nested

| Инструмент | Всего | Test | Test decided | Test accuracy |
|---|---|---|---|---|
| EURUSD | 51 | 48 | 47 | 59.6% |
| USDJPY | 30 | 30 | 29 | 48.3% |

### shooting-star

| Инструмент | Всего | Test | Test decided | Test accuracy |
|---|---|---|---|---|
| EURUSD | 81 | 72 | 67 | 56.7% |
| USDJPY | 49 | 42 | 38 | 57.9% |

### inside-bar

| Инструмент | Всего | Test | Test decided | Test accuracy |
|---|---|---|---|---|
| EURUSD | 2655 | 2228 | 1977 | 48.0% |
| USDJPY | 2443 | 2006 | 1880 | 50.4% |

### impulse-breakout

| Инструмент | Всего | Test | Test decided | Test accuracy |
|---|---|---|---|---|
| USDJPY | 700 | 567 | 551 | 49.0% |
| EURUSD | 615 | 499 | 478 | 49.0% |

### strong-order-block-reaction

| Инструмент | Всего | Test | Test decided | Test accuracy |
|---|---|---|---|---|
| USDJPY | 1273 | 1074 | 1059 | 48.1% |
| EURUSD | 1264 | 1072 | 1055 | 50.0% |

### order-block-continuation

| Инструмент | Всего | Test | Test decided | Test accuracy |
|---|---|---|---|---|
| USDJPY | 317 | 279 | 277 | 48.7% |
| EURUSD | 292 | 233 | 231 | 52.4% |

### pin-bar

| Инструмент | Всего | Test | Test decided | Test accuracy |
|---|---|---|---|---|
| EURUSD | 59 | 48 | 48 | 45.8% |
| USDJPY | 48 | 38 | 36 | 47.2% |

### harmonic-pattern

| Инструмент | Всего | Test | Test decided | Test accuracy |
|---|---|---|---|---|
| USDJPY | 323 | 216 | 215 | 36.7% |
| EURUSD | 225 | 194 | 192 | 54.7% |

### marubozu-bearish

| Инструмент | Всего | Test | Test decided | Test accuracy |
|---|---|---|---|---|
| USDJPY | 23 | 16 | 15 | 33.3% |
| EURUSD | 13 | 7 | 5 | 80.0% |

### fvg-return

| Инструмент | Всего | Test | Test decided | Test accuracy |
|---|---|---|---|---|
| USDJPY | 26 | 21 | 21 | 57.1% |
| EURUSD | 16 | 16 | 16 | 43.8% |

### liquidity-sweep (reversal-at-key-level)

| Инструмент | Всего | Test | Test decided | Test accuracy |
|---|---|---|---|---|
| EURUSD | 12 | 8 | 0 | — |
| USDJPY | 12 | 9 | 0 | — |

### bearish-harami

| Инструмент | Всего | Test | Test decided | Test accuracy |
|---|---|---|---|---|
| EURUSD | 3 | 2 | 0 | — |
| USDJPY | 1 | 0 | 0 | — |

### bullish-harami

| Инструмент | Всего | Test | Test decided | Test accuracy |
|---|---|---|---|---|
| EURUSD | 3 | 1 | 0 | — |
| USDJPY | 3 | 3 | 0 | — |

### liquidity-sweep-reaction (reversal-at-key-level)

| Инструмент | Всего | Test | Test decided | Test accuracy |
|---|---|---|---|---|
| EURUSD | 1 | 1 | 0 | — |
| USDJPY | 1 | 1 | 0 | — |

### inverted-hammer

| Инструмент | Всего | Test | Test decided | Test accuracy |
|---|---|---|---|---|
| EURUSD | 3 | 3 | 0 | — |

### hammer

| Инструмент | Всего | Test | Test decided | Test accuracy |
|---|---|---|---|---|
| EURUSD | 3 | 3 | 0 | — |

## Детализация по горизонтам

### marubozu-bullish

| Expiry bars | Train+Val accuracy | Test accuracy | Test decided |
|---|---|---|---|
| 1 | 62.5% | 55.6% | 36 |
| 2 | 57.1% | 70.3% | 37 |
| 3 | 71.4% | 62.2% | 37 |

### fvg-nested

| Expiry bars | Train+Val accuracy | Test accuracy | Test decided |
|---|---|---|---|
| 5 | 85.7% | 27.8% | 54 |
| 10 | 85.7% | 28.3% | 53 |
| 20 | 100.0% | 29.1% | 55 |
| 30 | 100.0% | 52.7% | 55 |

### order-block-nested

| Expiry bars | Train+Val accuracy | Test accuracy | Test decided |
|---|---|---|---|
| 5 | 33.3% | 55.3% | 76 |
| 10 | 33.3% | 46.8% | 77 |
| 20 | 33.3% | 41.6% | 77 |
| 30 | 33.3% | 52.6% | 78 |

### shooting-star

| Expiry bars | Train+Val accuracy | Test accuracy | Test decided |
|---|---|---|---|
| 1 | 56.3% | 50.5% | 97 |
| 2 | 50.0% | 57.1% | 105 |
| 3 | 53.3% | 50.5% | 105 |
| 5 | 43.8% | 52.3% | 109 |

### inside-bar

| Expiry bars | Train+Val accuracy | Test accuracy | Test decided |
|---|---|---|---|
| 1 | 55.1% | 49.2% | 3857 |
| 2 | 55.1% | 48.4% | 4030 |
| 3 | 53.0% | 48.3% | 4057 |
| 5 | 53.4% | 48.2% | 4096 |

### impulse-breakout

| Expiry bars | Train+Val accuracy | Test accuracy | Test decided |
|---|---|---|---|
| 1 | 46.8% | 46.5% | 999 |
| 2 | 49.2% | 49.0% | 1029 |
| 3 | 50.0% | 46.7% | 1027 |

### strong-order-block-reaction

| Expiry bars | Train+Val accuracy | Test accuracy | Test decided |
|---|---|---|---|
| 1 | 53.5% | 49.2% | 2002 |
| 2 | 56.6% | 49.0% | 2040 |
| 3 | 54.0% | 50.2% | 2077 |
| 5 | 53.2% | 50.7% | 2074 |
| 10 | 51.8% | 51.2% | 2107 |
| 20 | 53.1% | 49.5% | 2119 |
| 30 | 57.0% | 49.1% | 2114 |

### order-block-continuation

| Expiry bars | Train+Val accuracy | Test accuracy | Test decided |
|---|---|---|---|
| 5 | 41.2% | 49.5% | 491 |
| 10 | 48.4% | 50.4% | 508 |
| 20 | 54.2% | 44.2% | 505 |
| 30 | 63.5% | 42.7% | 510 |

### pin-bar

| Expiry bars | Train+Val accuracy | Test accuracy | Test decided |
|---|---|---|---|
| 1 | 42.9% | 56.8% | 81 |
| 2 | 45.0% | 56.8% | 81 |
| 3 | 52.4% | 54.3% | 81 |
| 5 | 66.7% | 46.4% | 84 |

### harmonic-pattern

| Expiry bars | Train+Val accuracy | Test accuracy | Test decided |
|---|---|---|---|
| 10 | 44.9% | 52.4% | 403 |
| 20 | 59.6% | 45.2% | 407 |
| 30 | 62.8% | 43.2% | 407 |

### marubozu-bearish

| Expiry bars | Train+Val accuracy | Test accuracy | Test decided |
|---|---|---|---|
| 1 | 38.5% | 45.0% | 20 |
| 2 | 53.8% | 39.1% | 23 |
| 3 | 61.5% | 33.3% | 21 |

### fvg-return

| Expiry bars | Train+Val accuracy | Test accuracy | Test decided |
|---|---|---|---|
| 1 | 75.0% | 34.4% | 32 |
| 2 | 80.0% | 34.3% | 35 |
| 3 | 80.0% | 36.1% | 36 |
| 5 | 60.0% | 42.9% | 35 |
| 10 | 60.0% | 22.9% | 35 |
| 20 | 80.0% | 37.1% | 35 |
| 30 | 80.0% | 51.4% | 37 |

### liquidity-sweep (reversal-at-key-level)

| Expiry bars | Train+Val accuracy | Test accuracy | Test decided |
|---|---|---|---|
| 1 | 57.1% | 18.8% | 16 |
| 2 | 33.3% | 35.3% | 17 |
| 3 | 57.1% | 47.1% | 17 |

### bearish-harami

| Expiry bars | Train+Val accuracy | Test accuracy | Test decided |
|---|---|---|---|
| 2 | 50.0% | 50.0% | 2 |
| 3 | 50.0% | 50.0% | 2 |
| 5 | 0.0% | 50.0% | 2 |
| 10 | 0.0% | 50.0% | 2 |

### bullish-harami

| Expiry bars | Train+Val accuracy | Test accuracy | Test decided |
|---|---|---|---|
| 2 | 50.0% | 33.3% | 3 |
| 3 | 50.0% | 25.0% | 4 |
| 5 | 0.0% | 25.0% | 4 |
| 10 | 50.0% | 75.0% | 4 |

### liquidity-sweep-reaction (reversal-at-key-level)

| Expiry bars | Train+Val accuracy | Test accuracy | Test decided |
|---|---|---|---|
| 1 | 0.0% | 50.0% | 2 |
| 2 | 0.0% | 50.0% | 2 |
| 3 | 0.0% | 100.0% | 2 |

### inverted-hammer

| Expiry bars | Train+Val accuracy | Test accuracy | Test decided |
|---|---|---|---|
| 1 | 0.0% | 33.3% | 3 |
| 2 | 0.0% | 66.7% | 3 |
| 3 | 0.0% | 33.3% | 3 |
| 5 | 0.0% | 33.3% | 3 |

### hammer

| Expiry bars | Train+Val accuracy | Test accuracy | Test decided |
|---|---|---|---|
| 1 | 0.0% | 33.3% | 3 |
| 2 | 0.0% | 66.7% | 3 |
| 3 | 0.0% | 33.3% | 3 |
| 5 | 0.0% | 33.3% | 3 |

## Разбивка по folds (walk-forward)

> Если `bestExpiryBars` заметно меняется между folds — это признак нестабильности выбора горизонта для этого паттерна, а не единственное "истинное" число. Итоговый `bestExpiryBars` в сводной таблице выше — мода (самый частый выбор) по всем оценённым folds.

### marubozu-bullish

| Fold | Train count | Best expiry | Test decided | Test wins | Fold accuracy |
|---|---|---|---|---|---|
| 1 | 8 | пропущен (мало train) | 0 | 0 | — |
| 2 | 12 | пропущен (мало train) | 0 | 0 | — |
| 3 | 17 | пропущен (мало train) | 0 | 0 | — |
| 4 | 17 | пропущен (мало train) | 0 | 0 | — |
| 5 | 26 | пропущен (мало train) | 0 | 0 | — |
| 6 | 28 | пропущен (мало train) | 0 | 0 | — |
| 7 | 39 | 2 | 6 | 5 | 83.3% |

### fvg-nested

| Fold | Train count | Best expiry | Test decided | Test wins | Fold accuracy |
|---|---|---|---|---|---|
| 1 | 7 | пропущен (мало train) | 0 | 0 | — |
| 2 | 7 | пропущен (мало train) | 0 | 0 | — |
| 3 | 20 | пропущен (мало train) | 0 | 0 | — |
| 4 | 24 | пропущен (мало train) | 0 | 0 | — |
| 5 | 40 | 30 | 2 | 1 | 50.0% |
| 6 | 42 | 30 | 16 | 10 | 62.5% |
| 7 | 58 | 30 | 4 | 2 | 50.0% |

### order-block-nested

| Fold | Train count | Best expiry | Test decided | Test wins | Fold accuracy |
|---|---|---|---|---|---|
| 1 | 3 | пропущен (мало train) | 0 | 0 | — |
| 2 | 9 | пропущен (мало train) | 0 | 0 | — |
| 3 | 14 | пропущен (мало train) | 0 | 0 | — |
| 4 | 16 | пропущен (мало train) | 0 | 0 | — |
| 5 | 38 | 5 | 7 | 4 | 57.1% |
| 6 | 45 | 5 | 14 | 7 | 50.0% |
| 7 | 60 | 5 | 20 | 12 | 60.0% |

### shooting-star

| Fold | Train count | Best expiry | Test decided | Test wins | Fold accuracy |
|---|---|---|---|---|---|
| 1 | 16 | пропущен (мало train) | 0 | 0 | — |
| 2 | 20 | пропущен (мало train) | 0 | 0 | — |
| 3 | 46 | 2 | 10 | 3 | 30.0% |
| 4 | 57 | 3 | 20 | 8 | 40.0% |
| 5 | 79 | 2 | 16 | 11 | 68.8% |
| 6 | 98 | 2 | 20 | 12 | 60.0% |
| 7 | 119 | 2 | 10 | 6 | 60.0% |

### inside-bar

| Fold | Train count | Best expiry | Test decided | Test wins | Fold accuracy |
|---|---|---|---|---|---|
| 1 | 860 | 2 | 360 | 177 | 49.2% |
| 2 | 1229 | 1 | 851 | 413 | 48.5% |
| 3 | 2190 | 1 | 356 | 193 | 54.2% |
| 4 | 2580 | 1 | 812 | 398 | 49.0% |
| 5 | 3459 | 1 | 366 | 172 | 47.0% |
| 6 | 3858 | 1 | 704 | 326 | 46.3% |
| 7 | 4629 | 1 | 422 | 206 | 48.8% |

### impulse-breakout

| Fold | Train count | Best expiry | Test decided | Test wins | Fold accuracy |
|---|---|---|---|---|---|
| 1 | 249 | 3 | 98 | 45 | 45.9% |
| 2 | 347 | 2 | 207 | 89 | 43.0% |
| 3 | 565 | 2 | 86 | 50 | 58.1% |
| 4 | 659 | 2 | 224 | 103 | 46.0% |
| 5 | 886 | 2 | 98 | 43 | 43.9% |
| 6 | 985 | 2 | 207 | 105 | 50.7% |
| 7 | 1199 | 2 | 110 | 66 | 60.0% |

### strong-order-block-reaction

| Fold | Train count | Best expiry | Test decided | Test wins | Fold accuracy |
|---|---|---|---|---|---|
| 1 | 384 | 2 | 200 | 99 | 49.5% |
| 2 | 593 | 30 | 364 | 170 | 46.7% |
| 3 | 964 | 30 | 165 | 89 | 53.9% |
| 4 | 1133 | 30 | 416 | 176 | 42.3% |
| 5 | 1550 | 20 | 213 | 96 | 45.1% |
| 6 | 1766 | 5 | 484 | 239 | 49.4% |
| 7 | 2272 | 10 | 261 | 152 | 58.2% |

### order-block-continuation

| Fold | Train count | Best expiry | Test decided | Test wins | Fold accuracy |
|---|---|---|---|---|---|
| 1 | 96 | 30 | 44 | 19 | 43.2% |
| 2 | 141 | 30 | 107 | 42 | 39.3% |
| 3 | 247 | 10 | 45 | 25 | 55.6% |
| 4 | 294 | 5 | 96 | 42 | 43.8% |
| 5 | 391 | 10 | 48 | 23 | 47.9% |
| 6 | 439 | 10 | 127 | 64 | 50.4% |
| 7 | 567 | 10 | 42 | 22 | 52.4% |

### pin-bar

| Fold | Train count | Best expiry | Test decided | Test wins | Fold accuracy |
|---|---|---|---|---|---|
| 1 | 21 | пропущен (мало train) | 0 | 0 | — |
| 2 | 25 | пропущен (мало train) | 0 | 0 | — |
| 3 | 39 | 5 | 6 | 3 | 50.0% |
| 4 | 45 | 5 | 21 | 8 | 38.1% |
| 5 | 68 | 3 | 7 | 2 | 28.6% |
| 6 | 75 | 3 | 18 | 8 | 44.4% |
| 7 | 93 | 2 | 13 | 8 | 61.5% |

### harmonic-pattern

| Fold | Train count | Best expiry | Test decided | Test wins | Fold accuracy |
|---|---|---|---|---|---|
| 1 | 138 | 30 | 41 | 20 | 48.8% |
| 2 | 179 | 20 | 45 | 11 | 24.4% |
| 3 | 225 | 20 | 35 | 23 | 65.7% |
| 4 | 260 | 20 | 76 | 27 | 35.5% |
| 5 | 336 | 10 | 60 | 26 | 43.3% |
| 6 | 397 | 10 | 134 | 67 | 50.0% |
| 7 | 532 | 10 | 16 | 5 | 31.3% |

### marubozu-bearish

| Fold | Train count | Best expiry | Test decided | Test wins | Fold accuracy |
|---|---|---|---|---|---|
| 1 | 13 | пропущен (мало train) | 0 | 0 | — |
| 2 | 13 | пропущен (мало train) | 0 | 0 | — |
| 3 | 14 | пропущен (мало train) | 0 | 0 | — |
| 4 | 18 | пропущен (мало train) | 0 | 0 | — |
| 5 | 25 | пропущен (мало train) | 0 | 0 | — |
| 6 | 26 | пропущен (мало train) | 0 | 0 | — |
| 7 | 33 | 1 | 3 | 1 | 33.3% |

### fvg-return

| Fold | Train count | Best expiry | Test decided | Test wins | Fold accuracy |
|---|---|---|---|---|---|
| 1 | 5 | пропущен (мало train) | 0 | 0 | — |
| 2 | 6 | пропущен (мало train) | 0 | 0 | — |
| 3 | 16 | пропущен (мало train) | 0 | 0 | — |
| 4 | 19 | пропущен (мало train) | 0 | 0 | — |
| 5 | 25 | пропущен (мало train) | 0 | 0 | — |
| 6 | 31 | 30 | 7 | 2 | 28.6% |
| 7 | 39 | 30 | 3 | 0 | 0.0% |
