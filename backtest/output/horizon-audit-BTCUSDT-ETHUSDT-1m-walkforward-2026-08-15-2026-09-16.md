# Horizon Audit — BTCUSDT, ETHUSDT 1m

> Сгенерировано: 2026-09-17T09:01:54.952Z
> Период: 2026-08-15 → 2026-09-16
> Инструменты (пул): BTCUSDT, ETHUSDT
> Источник: Deriv WebSocket / Binance (1m candles → resampled to 1m)
> Разбиение: walk-forward, 8 folds, purge 30 bars
> Минимальный порог (train+validation): 30 срабатываний
> Минимальный порог для теста значимости (test-выборка): 200 решённых исходов
> Значимость: точный двусторонний биномиальный тест против baseline=0.5, с поправкой Holm-Bonferroni, α = 0.05
> Wilson-критерий: нижняя граница 95% интервала Уилсона ≥ 0.500 (margin=0)

**Загружено**: 92086 1m свечей (суммарно по пулу), 92086 1m свечей после ресэмплинга.

## Метаданные пула

| Инструмент | 1m свечей | 1m свечей |
|---|---|---|
| BTCUSDT | 46043 | 46043 |
| ETHUSDT | 46043 | 46043 |

> **Предупреждение о корреляции**: Пул содержит 2 инструментов. Корреляция между инструментами (особенно forex-парами с общей валютой) может завышать эффективный размер выборки. Для строгого учёта использовать кластерные стандартные ошибки или эффективный размер выборки. Текущая реализация НЕ корректирует p-value на внутрикластерную корреляцию — p-value интерпретируется как per-observation, не per-cluster.

## Сводка

- Паттернов в сетке: 20
- Статистически значимых (после Holm-Bonferroni): **2**
- Прошли Wilson-гейт: 2
- Недостаточно данных: 15
- Нет срабатываний: 0

### Пересечение критериев

- Прошли оба (формальный + Wilson): 1
- Только формальный тест: 1
- Только Wilson-гейт: 1

## Результаты по паттернам

| Паттерн | Setup | Всего | Train+Val | Test | Лучший expiry | Test acc | p-value | Значим | Wilson LB | Wilson OK | Статус |
|---|---|---|---|---|---|---|---|---|---|---|---|
| harmonic-pattern | — | 783 | 2864 | 670 | 30 | 55.1% | 0.0096 | да | 51.3% | да | OK |
| impulse-breakout | — | 1701 | 6008 | 1437 | 3 | 46.3% | 0.0061 | да | 43.8% | нет | OK |
| order-block-nested | — | 35 | 31 | 4 | 5 | 100.0% | — | — | 51.0% | да | недостаточно данных |
| liquidity-sweep | reversal-at-key-level | 32 | 31 | 1 | 1 | 100.0% | — | — | 20.7% | нет | недостаточно данных |
| fvg-return | — | 56 | 167 | 24 | 20 | 58.3% | — | — | 38.8% | нет | недостаточно данных |
| fvg-nested | — | 92 | 342 | 62 | 10 | 53.2% | — | — | 41.0% | нет | недостаточно данных |
| pin-bar | — | 98 | 305 | 64 | 1 | 53.1% | — | — | 41.1% | нет | недостаточно данных |
| order-block-continuation | — | 1063 | 3697 | 925 | 20 | 51.7% | 0.3239 | нет | 48.5% | нет | OK |
| marubozu-bearish | — | 38 | 34 | 4 | 3 | 50.0% | — | — | 15.0% | нет | недостаточно данных |
| strong-order-block-reaction | — | 3750 | 12616 | 3439 | 5 | 49.9% | 0.9456 | нет | 48.3% | нет | OK |
| inside-bar | — | 7534 | 26386 | 6166 | 1 | 49.9% | 0.8685 | нет | 48.6% | нет | OK |
| marubozu-bullish | — | 41 | 36 | 5 | 3 | 40.0% | — | — | 11.8% | нет | недостаточно данных |
| shooting-star | — | 35 | 65 | 4 | 1 | 25.0% | — | — | 4.6% | нет | недостаточно данных |
| bearish-harami | — | 6 | 0 | 6 | — | — | — | — | — | — | недостаточно данных |
| liquidity-sweep-reaction | reversal-at-key-level | 6 | 0 | 6 | — | — | — | — | — | — | недостаточно данных |
| hanging-man | — | 1 | 0 | 1 | — | — | — | — | — | — | недостаточно данных |
| bullish-harami | — | 7 | 0 | 7 | — | — | — | — | — | — | недостаточно данных |
| inverted-hammer | — | 3 | 0 | 3 | — | — | — | — | — | — | недостаточно данных |
| order-block-breaker | — | 1 | 0 | 1 | — | — | — | — | — | — | недостаточно данных |
| hammer | — | 2 | 0 | 2 | — | — | — | — | — | — | недостаточно данных |

## Разбивка по инструментам

### harmonic-pattern

| Инструмент | Всего | Test | Test decided | Test accuracy |
|---|---|---|---|---|
| BTCUSDT | 487 | 414 | 414 | 61.4% |
| ETHUSDT | 296 | 256 | 256 | 50.0% |

### impulse-breakout

| Инструмент | Всего | Test | Test decided | Test accuracy |
|---|---|---|---|---|
| BTCUSDT | 895 | 753 | 753 | 46.2% |
| ETHUSDT | 806 | 689 | 688 | 47.8% |

### order-block-nested

| Инструмент | Всего | Test | Test decided | Test accuracy |
|---|---|---|---|---|
| BTCUSDT | 27 | 23 | 23 | 69.6% |
| ETHUSDT | 8 | 5 | 5 | 40.0% |

### liquidity-sweep (reversal-at-key-level)

| Инструмент | Всего | Test | Test decided | Test accuracy |
|---|---|---|---|---|
| BTCUSDT | 19 | 16 | 16 | 62.5% |
| ETHUSDT | 13 | 13 | 13 | 69.2% |

### fvg-return

| Инструмент | Всего | Test | Test decided | Test accuracy |
|---|---|---|---|---|
| BTCUSDT | 33 | 31 | 31 | 64.5% |
| ETHUSDT | 23 | 16 | 16 | 87.5% |

### fvg-nested

| Инструмент | Всего | Test | Test decided | Test accuracy |
|---|---|---|---|---|
| ETHUSDT | 47 | 36 | 36 | 47.2% |
| BTCUSDT | 45 | 33 | 33 | 57.6% |

### pin-bar

| Инструмент | Всего | Test | Test decided | Test accuracy |
|---|---|---|---|---|
| BTCUSDT | 54 | 50 | 50 | 62.0% |
| ETHUSDT | 44 | 39 | 39 | 56.4% |

### order-block-continuation

| Инструмент | Всего | Test | Test decided | Test accuracy |
|---|---|---|---|---|
| ETHUSDT | 534 | 457 | 457 | 54.5% |
| BTCUSDT | 529 | 468 | 468 | 51.1% |

### marubozu-bearish

| Инструмент | Всего | Test | Test decided | Test accuracy |
|---|---|---|---|---|
| BTCUSDT | 21 | 16 | 16 | 68.8% |
| ETHUSDT | 17 | 17 | 17 | 64.7% |

### strong-order-block-reaction

| Инструмент | Всего | Test | Test decided | Test accuracy |
|---|---|---|---|---|
| ETHUSDT | 1880 | 1707 | 1705 | 50.6% |
| BTCUSDT | 1870 | 1738 | 1738 | 50.6% |

### inside-bar

| Инструмент | Всего | Test | Test decided | Test accuracy |
|---|---|---|---|---|
| ETHUSDT | 3852 | 3125 | 3035 | 49.3% |
| BTCUSDT | 3682 | 3132 | 3131 | 50.5% |

### marubozu-bullish

| Инструмент | Всего | Test | Test decided | Test accuracy |
|---|---|---|---|---|
| BTCUSDT | 30 | 24 | 24 | 33.3% |
| ETHUSDT | 11 | 8 | 8 | 37.5% |

### shooting-star

| Инструмент | Всего | Test | Test decided | Test accuracy |
|---|---|---|---|---|
| ETHUSDT | 25 | 15 | 15 | 46.7% |
| BTCUSDT | 10 | 7 | 7 | 28.6% |

### bearish-harami

| Инструмент | Всего | Test | Test decided | Test accuracy |
|---|---|---|---|---|
| BTCUSDT | 3 | 3 | 0 | — |
| ETHUSDT | 3 | 3 | 0 | — |

### liquidity-sweep-reaction (reversal-at-key-level)

| Инструмент | Всего | Test | Test decided | Test accuracy |
|---|---|---|---|---|
| BTCUSDT | 3 | 3 | 0 | — |
| ETHUSDT | 3 | 3 | 0 | — |

### hanging-man

| Инструмент | Всего | Test | Test decided | Test accuracy |
|---|---|---|---|---|
| BTCUSDT | 1 | 1 | 0 | — |

### bullish-harami

| Инструмент | Всего | Test | Test decided | Test accuracy |
|---|---|---|---|---|
| ETHUSDT | 5 | 5 | 0 | — |
| BTCUSDT | 2 | 2 | 0 | — |

### inverted-hammer

| Инструмент | Всего | Test | Test decided | Test accuracy |
|---|---|---|---|---|
| ETHUSDT | 3 | 3 | 0 | — |

### order-block-breaker

| Инструмент | Всего | Test | Test decided | Test accuracy |
|---|---|---|---|---|
| ETHUSDT | 1 | 1 | 0 | — |

### hammer

| Инструмент | Всего | Test | Test decided | Test accuracy |
|---|---|---|---|---|
| ETHUSDT | 2 | 2 | 0 | — |

## Детализация по горизонтам

### harmonic-pattern

| Expiry bars | Train+Val accuracy | Test accuracy | Test decided |
|---|---|---|---|
| 10 | 66.7% | 54.5% | 670 |
| 20 | 65.5% | 58.4% | 670 |
| 30 | 66.4% | 57.0% | 670 |

### impulse-breakout

| Expiry bars | Train+Val accuracy | Test accuracy | Test decided |
|---|---|---|---|
| 1 | 46.4% | 46.7% | 1436 |
| 2 | 46.5% | 45.7% | 1441 |
| 3 | 45.3% | 47.0% | 1441 |

### order-block-nested

| Expiry bars | Train+Val accuracy | Test accuracy | Test decided |
|---|---|---|---|
| 5 | 57.1% | 64.3% | 28 |
| 10 | 42.9% | 50.0% | 28 |
| 20 | 14.3% | 32.1% | 28 |
| 30 | 28.6% | 35.7% | 28 |

### liquidity-sweep (reversal-at-key-level)

| Expiry bars | Train+Val accuracy | Test accuracy | Test decided |
|---|---|---|---|
| 1 | 66.7% | 65.5% | 29 |
| 2 | 66.7% | 65.5% | 29 |
| 3 | 66.7% | 62.1% | 29 |

### fvg-return

| Expiry bars | Train+Val accuracy | Test accuracy | Test decided |
|---|---|---|---|
| 1 | 12.5% | 57.4% | 47 |
| 2 | 11.1% | 61.7% | 47 |
| 3 | 33.3% | 53.2% | 47 |
| 5 | 33.3% | 68.1% | 47 |
| 10 | 22.2% | 59.6% | 47 |
| 20 | 22.2% | 72.3% | 47 |
| 30 | 0.0% | 68.1% | 47 |

### fvg-nested

| Expiry bars | Train+Val accuracy | Test accuracy | Test decided |
|---|---|---|---|
| 5 | 56.5% | 47.8% | 69 |
| 10 | 60.9% | 52.2% | 69 |
| 20 | 52.2% | 49.3% | 69 |
| 30 | 34.8% | 47.8% | 69 |

### pin-bar

| Expiry bars | Train+Val accuracy | Test accuracy | Test decided |
|---|---|---|---|
| 1 | 25.0% | 59.6% | 89 |
| 2 | 33.3% | 50.6% | 89 |
| 3 | 44.4% | 48.3% | 89 |
| 5 | 22.2% | 49.4% | 89 |

### order-block-continuation

| Expiry bars | Train+Val accuracy | Test accuracy | Test decided |
|---|---|---|---|
| 5 | 41.3% | 51.0% | 924 |
| 10 | 48.6% | 48.3% | 925 |
| 20 | 44.2% | 52.8% | 925 |
| 30 | 44.9% | 50.3% | 925 |

### marubozu-bearish

| Expiry bars | Train+Val accuracy | Test accuracy | Test decided |
|---|---|---|---|
| 1 | 40.0% | 45.5% | 33 |
| 2 | 60.0% | 54.5% | 33 |
| 3 | 60.0% | 66.7% | 33 |

### strong-order-block-reaction

| Expiry bars | Train+Val accuracy | Test accuracy | Test decided |
|---|---|---|---|
| 1 | 47.5% | 48.4% | 3421 |
| 2 | 46.8% | 47.4% | 3432 |
| 3 | 46.5% | 48.8% | 3439 |
| 5 | 41.7% | 50.6% | 3443 |
| 10 | 46.1% | 49.0% | 3440 |
| 20 | 45.4% | 47.3% | 3445 |
| 30 | 46.2% | 47.9% | 3444 |

### inside-bar

| Expiry bars | Train+Val accuracy | Test accuracy | Test decided |
|---|---|---|---|
| 1 | 51.8% | 49.9% | 6166 |
| 2 | 48.1% | 48.7% | 6224 |
| 3 | 47.7% | 48.9% | 6237 |
| 5 | 48.6% | 48.2% | 6253 |

### marubozu-bullish

| Expiry bars | Train+Val accuracy | Test accuracy | Test decided |
|---|---|---|---|
| 1 | 55.6% | 37.5% | 32 |
| 2 | 66.7% | 28.1% | 32 |
| 3 | 66.7% | 34.4% | 32 |

### shooting-star

| Expiry bars | Train+Val accuracy | Test accuracy | Test decided |
|---|---|---|---|
| 1 | 69.2% | 40.9% | 22 |
| 2 | 61.5% | 31.8% | 22 |
| 3 | 58.3% | 45.5% | 22 |
| 5 | 46.2% | 31.8% | 22 |

### bearish-harami

| Expiry bars | Train+Val accuracy | Test accuracy | Test decided |
|---|---|---|---|
| 2 | 0.0% | 50.0% | 6 |
| 3 | 0.0% | 66.7% | 6 |
| 5 | 0.0% | 66.7% | 6 |
| 10 | 0.0% | 50.0% | 6 |

### liquidity-sweep-reaction (reversal-at-key-level)

| Expiry bars | Train+Val accuracy | Test accuracy | Test decided |
|---|---|---|---|
| 1 | 0.0% | 33.3% | 6 |
| 2 | 0.0% | 33.3% | 6 |
| 3 | 0.0% | 33.3% | 6 |

### hanging-man

| Expiry bars | Train+Val accuracy | Test accuracy | Test decided |
|---|---|---|---|
| 1 | 0.0% | 0.0% | 1 |
| 2 | 0.0% | 0.0% | 1 |
| 3 | 0.0% | 0.0% | 1 |
| 5 | 0.0% | 0.0% | 1 |

### bullish-harami

| Expiry bars | Train+Val accuracy | Test accuracy | Test decided |
|---|---|---|---|
| 2 | 0.0% | 71.4% | 7 |
| 3 | 0.0% | 71.4% | 7 |
| 5 | 0.0% | 71.4% | 7 |
| 10 | 0.0% | 57.1% | 7 |

### inverted-hammer

| Expiry bars | Train+Val accuracy | Test accuracy | Test decided |
|---|---|---|---|
| 1 | 0.0% | 66.7% | 3 |
| 2 | 0.0% | 66.7% | 3 |
| 3 | 0.0% | 66.7% | 3 |
| 5 | 0.0% | 66.7% | 3 |

### order-block-breaker

| Expiry bars | Train+Val accuracy | Test accuracy | Test decided |
|---|---|---|---|
| 5 | 0.0% | 100.0% | 1 |
| 10 | 0.0% | 100.0% | 1 |
| 20 | 0.0% | 100.0% | 1 |
| 30 | 0.0% | 100.0% | 1 |

### hammer

| Expiry bars | Train+Val accuracy | Test accuracy | Test decided |
|---|---|---|---|
| 1 | 0.0% | 50.0% | 2 |
| 2 | 0.0% | 50.0% | 2 |
| 3 | 0.0% | 50.0% | 2 |
| 5 | 0.0% | 50.0% | 2 |

## Разбивка по folds (walk-forward)

> Если `bestExpiryBars` заметно меняется между folds — это признак нестабильности выбора горизонта для этого паттерна, а не единственное "истинное" число. Итоговый `bestExpiryBars` в сводной таблице выше — мода (самый частый выбор) по всем оценённым folds.

### harmonic-pattern

| Fold | Train count | Best expiry | Test decided | Test wins | Fold accuracy |
|---|---|---|---|---|---|
| 1 | 113 | 10 | 93 | 49 | 52.7% |
| 2 | 206 | 30 | 133 | 80 | 60.2% |
| 3 | 339 | 10 | 82 | 47 | 57.3% |
| 4 | 421 | 30 | 95 | 50 | 52.6% |
| 5 | 516 | 30 | 57 | 26 | 45.6% |
| 6 | 573 | 30 | 123 | 66 | 53.7% |
| 7 | 696 | 20 | 87 | 51 | 58.6% |

### impulse-breakout

| Fold | Train count | Best expiry | Test decided | Test wins | Fold accuracy |
|---|---|---|---|---|---|
| 1 | 258 | 2 | 210 | 110 | 52.4% |
| 2 | 469 | 3 | 178 | 85 | 47.8% |
| 3 | 646 | 3 | 170 | 85 | 50.0% |
| 4 | 817 | 3 | 239 | 103 | 43.1% |
| 5 | 1056 | 1 | 183 | 89 | 48.6% |
| 6 | 1242 | 1 | 277 | 125 | 45.1% |
| 7 | 1520 | 1 | 180 | 69 | 38.3% |

### order-block-nested

| Fold | Train count | Best expiry | Test decided | Test wins | Fold accuracy |
|---|---|---|---|---|---|
| 1 | 7 | пропущен (мало train) | 0 | 0 | — |
| 2 | 10 | пропущен (мало train) | 0 | 0 | — |
| 3 | 12 | пропущен (мало train) | 0 | 0 | — |
| 4 | 14 | пропущен (мало train) | 0 | 0 | — |
| 5 | 24 | пропущен (мало train) | 0 | 0 | — |
| 6 | 26 | пропущен (мало train) | 0 | 0 | — |
| 7 | 31 | 5 | 4 | 4 | 100.0% |

### liquidity-sweep (reversal-at-key-level)

| Fold | Train count | Best expiry | Test decided | Test wins | Fold accuracy |
|---|---|---|---|---|---|
| 1 | 3 | пропущен (мало train) | 0 | 0 | — |
| 2 | 12 | пропущен (мало train) | 0 | 0 | — |
| 3 | 20 | пропущен (мало train) | 0 | 0 | — |
| 4 | 23 | пропущен (мало train) | 0 | 0 | — |
| 5 | 25 | пропущен (мало train) | 0 | 0 | — |
| 6 | 28 | пропущен (мало train) | 0 | 0 | — |
| 7 | 31 | 1 | 1 | 1 | 100.0% |

### fvg-return

| Fold | Train count | Best expiry | Test decided | Test wins | Fold accuracy |
|---|---|---|---|---|---|
| 1 | 9 | пропущен (мало train) | 0 | 0 | — |
| 2 | 12 | пропущен (мало train) | 0 | 0 | — |
| 3 | 26 | пропущен (мало train) | 0 | 0 | — |
| 4 | 32 | 5 | 7 | 3 | 42.9% |
| 5 | 39 | 20 | 4 | 4 | 100.0% |
| 6 | 43 | 20 | 10 | 4 | 40.0% |
| 7 | 53 | 20 | 3 | 3 | 100.0% |

### fvg-nested

| Fold | Train count | Best expiry | Test decided | Test wins | Fold accuracy |
|---|---|---|---|---|---|
| 1 | 23 | пропущен (мало train) | 0 | 0 | — |
| 2 | 30 | 10 | 12 | 7 | 58.3% |
| 3 | 42 | 10 | 10 | 6 | 60.0% |
| 4 | 52 | 10 | 12 | 5 | 41.7% |
| 5 | 64 | 10 | 4 | 4 | 100.0% |
| 6 | 68 | 10 | 18 | 7 | 38.9% |
| 7 | 86 | 10 | 6 | 4 | 66.7% |

### pin-bar

| Fold | Train count | Best expiry | Test decided | Test wins | Fold accuracy |
|---|---|---|---|---|---|
| 1 | 9 | пропущен (мало train) | 0 | 0 | — |
| 2 | 20 | пропущен (мало train) | 0 | 0 | — |
| 3 | 34 | 1 | 13 | 7 | 53.8% |
| 4 | 47 | 2 | 14 | 6 | 42.9% |
| 5 | 61 | 1 | 11 | 5 | 45.5% |
| 6 | 72 | 1 | 19 | 11 | 57.9% |
| 7 | 91 | 1 | 7 | 5 | 71.4% |

### order-block-continuation

| Fold | Train count | Best expiry | Test decided | Test wins | Fold accuracy |
|---|---|---|---|---|---|
| 1 | 138 | 10 | 135 | 65 | 48.1% |
| 2 | 273 | 20 | 142 | 77 | 54.2% |
| 3 | 415 | 30 | 115 | 49 | 42.6% |
| 4 | 530 | 20 | 110 | 56 | 50.9% |
| 5 | 640 | 20 | 152 | 89 | 58.6% |
| 6 | 792 | 20 | 119 | 67 | 56.3% |
| 7 | 909 | 20 | 152 | 75 | 49.3% |

### marubozu-bearish

| Fold | Train count | Best expiry | Test decided | Test wins | Fold accuracy |
|---|---|---|---|---|---|
| 1 | 5 | пропущен (мало train) | 0 | 0 | — |
| 2 | 6 | пропущен (мало train) | 0 | 0 | — |
| 3 | 12 | пропущен (мало train) | 0 | 0 | — |
| 4 | 15 | пропущен (мало train) | 0 | 0 | — |
| 5 | 19 | пропущен (мало train) | 0 | 0 | — |
| 6 | 25 | пропущен (мало train) | 0 | 0 | — |
| 7 | 34 | 3 | 4 | 2 | 50.0% |

### strong-order-block-reaction

| Fold | Train count | Best expiry | Test decided | Test wins | Fold accuracy |
|---|---|---|---|---|---|
| 1 | 299 | 1 | 489 | 236 | 48.3% |
| 2 | 792 | 3 | 519 | 272 | 52.4% |
| 3 | 1317 | 5 | 474 | 238 | 50.2% |
| 4 | 1778 | 5 | 528 | 282 | 53.4% |
| 5 | 2313 | 5 | 477 | 222 | 46.5% |
| 6 | 2794 | 5 | 533 | 270 | 50.7% |
| 7 | 3323 | 5 | 419 | 197 | 47.0% |

### inside-bar

| Fold | Train count | Best expiry | Test decided | Test wins | Fold accuracy |
|---|---|---|---|---|---|
| 1 | 1273 | 1 | 774 | 396 | 51.2% |
| 2 | 2049 | 1 | 703 | 379 | 53.9% |
| 3 | 2755 | 1 | 945 | 467 | 49.4% |
| 4 | 3729 | 1 | 815 | 424 | 52.0% |
| 5 | 4548 | 1 | 1039 | 492 | 47.4% |
| 6 | 5610 | 1 | 808 | 384 | 47.5% |
| 7 | 6422 | 1 | 1082 | 534 | 49.4% |

### marubozu-bullish

| Fold | Train count | Best expiry | Test decided | Test wins | Fold accuracy |
|---|---|---|---|---|---|
| 1 | 9 | пропущен (мало train) | 0 | 0 | — |
| 2 | 17 | пропущен (мало train) | 0 | 0 | — |
| 3 | 19 | пропущен (мало train) | 0 | 0 | — |
| 4 | 19 | пропущен (мало train) | 0 | 0 | — |
| 5 | 27 | пропущен (мало train) | 0 | 0 | — |
| 6 | 29 | пропущен (мало train) | 0 | 0 | — |
| 7 | 36 | 3 | 5 | 2 | 40.0% |

### shooting-star

| Fold | Train count | Best expiry | Test decided | Test wins | Fold accuracy |
|---|---|---|---|---|---|
| 1 | 13 | пропущен (мало train) | 0 | 0 | — |
| 2 | 23 | пропущен (мало train) | 0 | 0 | — |
| 3 | 24 | пропущен (мало train) | 0 | 0 | — |
| 4 | 24 | пропущен (мало train) | 0 | 0 | — |
| 5 | 28 | пропущен (мало train) | 0 | 0 | — |
| 6 | 31 | 1 | 3 | 1 | 33.3% |
| 7 | 34 | 1 | 1 | 0 | 0.0% |
