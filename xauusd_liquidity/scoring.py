from __future__ import annotations

from xauusd_liquidity.types import LiquidityZone, SweepOutcome


def expected_reaction_text(zone: LiquidityZone) -> str:
    grabs = [s for s in zone.sweeps if s.outcome == SweepOutcome.GRAB_AND_REVERSE]
    continues = [s for s in zone.sweeps if s.outcome in (SweepOutcome.GRAB_AND_CONTINUE, SweepOutcome.BREAK_HOLD)]
    if grabs and not continues:
        return (
            "High probability of a stop-hunt then reversal: wick through the pool, "
            "close back, then displace away. Best used as a confirmation entry after the reclaim, "
            "not a blind limit at the round number."
        )
    if grabs and continues:
        return (
            "Mixed history: this pool has both reversals and run-throughs. "
            "Treat the first tap as a magnet. Only fade if a sweep reclaims AND "
            "the next 3–6 candles displace at least ~0.8 ATR."
        )
    if continues and not grabs:
        return (
            "This level behaves like a breakout magnet. Price often runs stops and continues. "
            "Do not fade the first sweep; wait for a later retest after displacement."
        )
    if zone.reactions:
        return (
            "Clean reaction zone without deep sweeps. Price tends to stall or reverse on a tap. "
            "Weaker than a swept equal-high/low pool, but useful confluence."
        )
    return "Untested or thinly tested this week. Mark it, do not trade it until it is interacted with."


def score_zone(zone: LiquidityZone) -> float:
    """0–100 power score. Tuned for 1-week XAUUSD maps, not a holy grail."""
    reaction_avg = 0.0
    if zone.reactions:
        reaction_avg = min(3.0, sum(r.bounce_atr for r in zone.reactions) / len(zone.reactions))
    reaction_score = min(25.0, 8.0 * len(zone.reactions) + 4.0 * reaction_avg)

    grab_rev = sum(1 for s in zone.sweeps if s.outcome == SweepOutcome.GRAB_AND_REVERSE)
    grab_mid = sum(1 for s in zone.sweeps if s.outcome == SweepOutcome.TOUCH_REJECT)
    failed = sum(
        1
        for s in zone.sweeps
        if s.outcome in (SweepOutcome.GRAB_AND_CONTINUE, SweepOutcome.BREAK_HOLD)
    )
    disp = 0.0
    if zone.sweeps:
        disp = min(3.0, sum(s.displacement_atr for s in zone.sweeps) / len(zone.sweeps))
    sweep_score = min(30.0, 12.0 * grab_rev + 5.0 * grab_mid + 4.0 * disp - 6.0 * failed)
    sweep_score = max(0.0, sweep_score)

    round_score = {0: 0.0, 1: 8.0, 2: 12.0, 3: 18.0, 4: 22.0}[zone.round_strength]
    equal_score = min(15.0, 5.0 * max(0, zone.equal_count - 1))
    session_score = min(10.0, 4.0 * len(set(zone.session_hits)))
    touch_score = min(8.0, 1.5 * zone.touches)

    power = reaction_score + sweep_score + round_score + equal_score + session_score + touch_score
    return round(min(100.0, power), 1)
