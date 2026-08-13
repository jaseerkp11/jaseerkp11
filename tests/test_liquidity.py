from datetime import datetime, timedelta, timezone

import pandas as pd
import pytest

from xauusd_liquidity.levels import round_grid, round_strength
from xauusd_liquidity.scanner import scan_frame
from xauusd_liquidity.scoring import score_zone
from xauusd_liquidity.sweeps import classify_sweep
from xauusd_liquidity.types import LiquidityZone, Side, SweepEvent, SweepOutcome, ZoneKind


def test_round_strength_gold_magnets():
    assert round_strength(2400.02) == 4
    assert round_strength(2450.00) == 3
    assert round_strength(2410.00) == 2
    assert round_strength(2405.00) == 1
    assert round_strength(2407.30) == 0


def test_round_grid_ends_with_zero_or_five():
    grid = round_grid(2398, 2412, step=5)
    assert 2400.0 in grid
    assert 2405.0 in grid
    assert 2410.0 in grid
    assert all(p % 5 == 0 for p in grid)


def test_classify_sweep_grab_and_reverse():
    outcome = classify_sweep(pierce_depth=1.2, reclaim=True, displacement_atr=1.1, atr_value=1.0)
    assert outcome == SweepOutcome.GRAB_AND_REVERSE


def test_classify_sweep_break_hold():
    outcome = classify_sweep(pierce_depth=2.0, reclaim=False, displacement_atr=1.5, atr_value=1.0)
    assert outcome == SweepOutcome.BREAK_HOLD


def test_score_prefers_swept_equal_highs_on_round_number():
    weak = LiquidityZone(price=2407, kind=ZoneKind.ROUND_NUMBER, side=Side.ABOVE, round_strength=0, touches=1)
    strong = LiquidityZone(
        price=2400,
        kind=ZoneKind.EQUAL_HIGHS,
        side=Side.ABOVE,
        round_strength=4,
        touches=4,
        equal_count=3,
        session_hits=["asia", "london"],
        sweeps=[
            SweepEvent(
                time=None,
                price=2400,
                side=Side.ABOVE,
                pierce_depth=1.0,
                reclaim=True,
                displacement_atr=1.2,
                outcome=SweepOutcome.GRAB_AND_REVERSE,
            )
        ],
    )
    assert score_zone(strong) > score_zone(weak)
    assert score_zone(strong) >= 40


def _synthetic_week() -> pd.DataFrame:
    """M15-like path that taps 2500 equal highs, sweeps, then reverses."""
    start = datetime(2026, 8, 3, 0, 0, tzinfo=timezone.utc)
    rows = []
    price = 2488.0
    for i in range(220):
        ts = start + timedelta(minutes=15 * i)
        # Drift up into 2500, print equal highs, sweep 2501.4, reverse.
        if i < 80:
            price += 0.12
            high, low, close = price + 0.4, price - 0.5, price + 0.1
        elif i in (90, 110, 130):
            high, low, close = 2500.15, 2496.0, 2498.2
            price = close
        elif i == 150:
            high, low, close = 2501.45, 2494.8, 2495.2  # sweep then reclaim
            price = close
        elif i > 150:
            price -= 0.18
            high, low, close = price + 0.35, price - 0.55, price - 0.15
        else:
            high, low, close = price + 0.35, price - 0.4, price
        open_ = price
        rows.append(
            {
                "Datetime": ts,
                "Open": open_,
                "High": high,
                "Low": low,
                "Close": close,
                "Volume": 1000,
            }
        )
    df = pd.DataFrame(rows).set_index("Datetime")
    return df


def test_scan_ranks_2500_liquidity():
    zones = scan_frame(_synthetic_week())
    assert zones
    top_prices = [z.price for z in zones[:8]]
    assert any(abs(p - 2500) <= 1.5 for p in top_prices)
    best_near_2500 = min((z for z in zones if abs(z.price - 2500) <= 2), key=lambda z: abs(z.price - 2500))
    assert best_near_2500.power > 20
    assert best_near_2500.touches >= 1
