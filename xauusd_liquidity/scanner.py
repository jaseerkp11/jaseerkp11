from __future__ import annotations

from xauusd_liquidity.data import atr, candles_from_frame
from xauusd_liquidity.levels import cluster_prices, round_grid, round_strength, swings
from xauusd_liquidity.scoring import expected_reaction_text, score_zone
from xauusd_liquidity.sessions import session_extremes
from xauusd_liquidity.sweeps import detect_level_events
from xauusd_liquidity.types import LiquidityZone, Side, ZoneKind

import pandas as pd


def _merge_zone(existing: dict[float, LiquidityZone], zone: LiquidityZone, bucket: float) -> None:
    key = round(zone.price / bucket) * bucket
    if key not in existing:
        existing[key] = zone
        return
    cur = existing[key]
    cur.touches = max(cur.touches, zone.touches)
    if len(zone.reactions) > len(cur.reactions):
        cur.reactions = zone.reactions
    if len(zone.sweeps) > len(cur.sweeps):
        cur.sweeps = zone.sweeps
    cur.equal_count = max(cur.equal_count, zone.equal_count)
    for s in zone.session_hits:
        if s not in cur.session_hits:
            cur.session_hits.append(s)
    cur.round_strength = max(cur.round_strength, zone.round_strength)
    # Prefer more specific liquidity labels over generic round numbers.
    rank = {
        ZoneKind.ROUND_NUMBER: 0,
        ZoneKind.SWING_HIGH: 1,
        ZoneKind.SWING_LOW: 1,
        ZoneKind.SESSION_HIGH: 2,
        ZoneKind.SESSION_LOW: 2,
        ZoneKind.EQUAL_HIGHS: 3,
        ZoneKind.EQUAL_LOWS: 3,
    }
    if rank[zone.kind] > rank[cur.kind]:
        cur.kind = zone.kind
        cur.side = zone.side
        cur.price = zone.price


def scan_frame(
    df: pd.DataFrame,
    swing_left: int = 3,
    swing_right: int = 3,
    round_step: float = 5.0,
    merge_bucket: float = 1.0,
) -> list[LiquidityZone]:
    candles = candles_from_frame(df)
    if len(candles) < 30:
        raise ValueError("Need at least 30 candles to map liquidity.")
    atrs = atr(candles)
    median_atr = sorted(atrs)[len(atrs) // 2]
    cluster_dist = max(0.8, 0.45 * median_atr)

    lo = min(c.low for c in candles)
    hi = max(c.high for c in candles)
    merged: dict[float, LiquidityZone] = {}

    def analyze(price: float, kind: ZoneKind, side: Side, equal_count: int = 1, sessions: list[str] | None = None) -> None:
        touches, reactions, sweeps = detect_level_events(candles, atrs, price, side)
        zone = LiquidityZone(
            price=round(price, 2),
            kind=kind,
            side=side,
            round_strength=round_strength(price),
            touches=touches,
            reactions=reactions,
            sweeps=sweeps,
            session_hits=list(sessions or []),
            equal_count=equal_count,
        )
        _merge_zone(merged, zone, merge_bucket)

    for level in round_grid(lo, hi, step=round_step):
        # Round numbers attract both sides; classify by location vs mid-range.
        mid = (lo + hi) / 2
        side = Side.ABOVE if level >= mid else Side.BELOW
        analyze(level, ZoneKind.ROUND_NUMBER, side)

    swing_h, swing_l = swings(candles, left=swing_left, right=swing_right)
    for mean, count, _ in cluster_prices(swing_h, cluster_dist):
        kind = ZoneKind.EQUAL_HIGHS if count >= 2 else ZoneKind.SWING_HIGH
        analyze(mean, kind, Side.ABOVE, equal_count=count)
    for mean, count, _ in cluster_prices(swing_l, cluster_dist):
        kind = ZoneKind.EQUAL_LOWS if count >= 2 else ZoneKind.SWING_LOW
        analyze(mean, kind, Side.BELOW, equal_count=count)

    for _day, session, s_hi, s_lo in session_extremes(candles):
        analyze(s_hi, ZoneKind.SESSION_HIGH, Side.ABOVE, sessions=[session])
        analyze(s_lo, ZoneKind.SESSION_LOW, Side.BELOW, sessions=[session])

    zones = list(merged.values())
    for z in zones:
        z.power = score_zone(z)
        z.expected_reaction = expected_reaction_text(z)
        bits = []
        if z.round_strength:
            bits.append(f"round x{z.round_strength}")
        if z.equal_count >= 2:
            bits.append(f"{z.equal_count} equal swings")
        if z.session_hits:
            bits.append("sessions: " + ",".join(sorted(set(z.session_hits))))
        if z.sweeps:
            bits.append(f"{len(z.sweeps)} sweeps")
        if z.reactions:
            bits.append(f"{len(z.reactions)} reactions")
        z.notes = "; ".join(bits)
    zones.sort(key=lambda z: (-z.power, z.price))
    return zones


def scan_liquidity(df: pd.DataFrame | None = None, interval: str = "15m", days: int = 7) -> list[LiquidityZone]:
    if df is None:
        from xauusd_liquidity.data import fetch_xauusd_week

        df = fetch_xauusd_week(interval=interval, days=days)
    return scan_frame(df)
