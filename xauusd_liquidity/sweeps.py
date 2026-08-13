from __future__ import annotations

from xauusd_liquidity.types import Candle, Side, SweepEvent, SweepOutcome


def classify_sweep(
    pierce_depth: float,
    reclaim: bool,
    displacement_atr: float,
    atr_value: float,
) -> SweepOutcome:
    if not reclaim:
        return SweepOutcome.BREAK_HOLD
    if displacement_atr >= 0.8:
        return SweepOutcome.GRAB_AND_REVERSE
    if pierce_depth < 0.15 * atr_value:
        return SweepOutcome.TOUCH_REJECT
    return SweepOutcome.GRAB_AND_CONTINUE


def displacement_after(candles: list[Candle], start: int, atr_value: float, look: int = 6) -> float:
    if atr_value <= 0 or start >= len(candles) - 1:
        return 0.0
    end = min(len(candles) - 1, start + look)
    move = abs(candles[end].close - candles[start].close)
    return move / atr_value


def detect_level_events(
    candles: list[Candle],
    atrs: list[float],
    level: float,
    side: Side,
    touch_atr: float = 0.35,
    look: int = 6,
) -> tuple[int, list, list[SweepEvent]]:
    """Walk candles vs one level. Count touches, reactions, and liquidity sweeps."""
    from xauusd_liquidity.types import ReactionEvent

    touches = 0
    reactions: list[ReactionEvent] = []
    sweeps: list[SweepEvent] = []
    i = 1
    while i < len(candles):
        c = candles[i]
        atr_value = max(atrs[i], 0.2)
        band = touch_atr * atr_value
        near = abs(c.high - level) <= band or abs(c.low - level) <= band or (
            c.low <= level <= c.high
        )
        if not near:
            i += 1
            continue
        touches += 1
        pierce = 0.0
        reclaim = False
        if side == Side.ABOVE:
            pierce = max(0.0, c.high - level)
            reclaim = c.close < level
        else:
            pierce = max(0.0, level - c.low)
            reclaim = c.close > level
        bounce = 0.0
        if i + 1 < len(candles):
            window = candles[i + 1 : i + 1 + look]
            if side == Side.ABOVE:
                bounce = (level - min(x.low for x in window)) / atr_value if window else 0.0
            else:
                bounce = (max(x.high for x in window) - level) / atr_value if window else 0.0
        disp = displacement_after(candles, i, atr_value, look)
        if pierce > 0.05 * atr_value:
            outcome = classify_sweep(pierce, reclaim, disp, atr_value)
            sweeps.append(
                SweepEvent(
                    time=c.time,
                    price=level,
                    side=side,
                    pierce_depth=pierce,
                    reclaim=reclaim,
                    displacement_atr=disp,
                    outcome=outcome,
                )
            )
        if bounce >= 0.4 and (reclaim or pierce == 0):
            reactions.append(
                ReactionEvent(
                    time=c.time,
                    price=level,
                    bounce_atr=bounce,
                    bars_held=look,
                )
            )
        i += look  # skip the reaction window to avoid double-counting
    return touches, reactions, sweeps
