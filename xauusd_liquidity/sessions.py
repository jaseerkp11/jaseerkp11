from __future__ import annotations

from collections import defaultdict
from datetime import datetime, timezone

from xauusd_liquidity.types import Candle


# Simplified FX-session windows in UTC. Gold follows London/NY volume.
SESSION_WINDOWS = {
    "asia": (0, 7),
    "london": (7, 12),
    "newyork": (12, 21),
}


def _hour_utc(ts: object) -> int | None:
    if isinstance(ts, datetime):
        if ts.tzinfo is None:
            ts = ts.replace(tzinfo=timezone.utc)
        return ts.astimezone(timezone.utc).hour
    if hasattr(ts, "hour"):
        return int(ts.hour)
    return None


def _day_key(ts: object) -> str:
    if isinstance(ts, datetime):
        if ts.tzinfo is None:
            ts = ts.replace(tzinfo=timezone.utc)
        return ts.astimezone(timezone.utc).strftime("%Y-%m-%d")
    return str(ts)[:10]


def session_extremes(candles: list[Candle]) -> list[tuple[str, str, float, float]]:
    """Per-day session high/low. Tuple: (day, session, high, low)."""
    buckets: dict[tuple[str, str], list[Candle]] = defaultdict(list)
    for c in candles:
        hour = _hour_utc(c.time)
        if hour is None:
            continue
        day = _day_key(c.time)
        for name, (start, end) in SESSION_WINDOWS.items():
            if start <= hour < end:
                buckets[(day, name)].append(c)
    out: list[tuple[str, str, float, float]] = []
    for (day, name), group in sorted(buckets.items()):
        if not group:
            continue
        out.append((day, name, max(x.high for x in group), min(x.low for x in group)))
    return out
