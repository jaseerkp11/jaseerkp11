from __future__ import annotations

from xauusd_liquidity.types import LiquidityZone, SweepOutcome


def format_report(zones: list[LiquidityZone], top_n: int = 15) -> str:
    lines = [
        "XAUUSD high-powered liquidity map (past ~1 week)",
        "================================================",
        "",
        "Power is a 0–100 confluence score: sweep quality, reaction size,",
        "round-number magnet ($5 / $10 / $50 / $100), equal highs/lows, and session extremes.",
        "",
    ]
    if not zones:
        lines.append("No zones found.")
        return "\n".join(lines)
    high_power = [z for z in zones if z.power >= 40][:top_n]
    if not high_power:
        high_power = zones[:top_n]
    lines.append(f"Showing {len(high_power)} zones (ranked).")
    lines.append("")
    for i, z in enumerate(high_power, 1):
        lines.append(f"{i:2d}. {z.price:8.2f}  power={z.power:5.1f}  {z.kind.value:13s}  {z.side.value}")
        lines.append(f"    {z.notes}")
        lines.append(f"    How it should be used: {z.expected_reaction}")
        if z.sweeps:
            last = z.sweeps[-1]
            lines.append(
                f"    Last sweep: {last.outcome.value} pierce={last.pierce_depth:.2f} "
                f"disp={last.displacement_atr:.2f} ATR reclaim={last.reclaim}"
            )
        lines.append("")
    grabs = sum(
        1
        for z in zones
        for s in z.sweeps
        if s.outcome == SweepOutcome.GRAB_AND_REVERSE
    )
    lines.append(f"Week sweep-and-reverse events across all mapped levels: {grabs}")
    return "\n".join(lines)
