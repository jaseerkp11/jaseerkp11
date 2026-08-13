from __future__ import annotations

from xauusd_liquidity.types import Candle


def round_strength(price: float, tolerance: float = 0.15) -> int:
    """How round a price is. Higher = stronger magnet on gold.

    4: $100 (2400, 2500)
    3: $50  (2450)
    2: $10  (2410)
    1: $5   (2405)  — prices ending 0 or 5 in whole dollars
    0: not a round level
    """
    nearest_100 = round(price / 100.0) * 100.0
    if abs(price - nearest_100) <= tolerance:
        return 4
    nearest_50 = round(price / 50.0) * 50.0
    if abs(price - nearest_50) <= tolerance:
        return 3
    nearest_10 = round(price / 10.0) * 10.0
    if abs(price - nearest_10) <= tolerance:
        return 2
    nearest_5 = round(price / 5.0) * 5.0
    if abs(price - nearest_5) <= tolerance:
        return 1
    return 0


def round_grid(low: float, high: float, step: float = 5.0) -> list[float]:
    """Whole-dollar 0/5 grid covering the scanned range, plus $1 padding."""
    start = int(low // step * step) - step
    end = int(high // step * step) + 2 * step
    levels: list[float] = []
    price = start
    while price <= end:
        levels.append(float(price))
        price += step
    return levels


def swings(candles: list[Candle], left: int = 3, right: int = 3) -> tuple[list[tuple[int, float]], list[tuple[int, float]]]:
    """Fractal swing highs and lows. Returns (highs, lows) as (index, price)."""
    highs: list[tuple[int, float]] = []
    lows: list[tuple[int, float]] = []
    n = len(candles)
    for i in range(left, n - right):
        h = candles[i].high
        l = candles[i].low
        if all(h >= candles[i - k].high for k in range(1, left + 1)) and all(
            h > candles[i + k].high for k in range(1, right + 1)
        ):
            highs.append((i, h))
        if all(l <= candles[i - k].low for k in range(1, left + 1)) and all(
            l < candles[i + k].low for k in range(1, right + 1)
        ):
            lows.append((i, l))
    return highs, lows


def cluster_prices(points: list[tuple[int, float]], cluster_atr: float) -> list[tuple[float, int, list[int]]]:
    """Group nearby swing prices. Returns (mean_price, count, indices)."""
    if not points:
        return []
    ordered = sorted(points, key=lambda x: x[1])
    clusters: list[list[tuple[int, float]]] = [[ordered[0]]]
    for item in ordered[1:]:
        if abs(item[1] - clusters[-1][-1][1]) <= cluster_atr:
            clusters[-1].append(item)
        else:
            clusters.append([item])
    out: list[tuple[float, int, list[int]]] = []
    for group in clusters:
        mean = sum(p for _, p in group) / len(group)
        out.append((mean, len(group), [i for i, _ in group]))
    return out
