from __future__ import annotations

from dataclasses import dataclass, field
from enum import Enum


class ZoneKind(str, Enum):
    ROUND_NUMBER = "round_number"
    EQUAL_HIGHS = "equal_highs"
    EQUAL_LOWS = "equal_lows"
    SESSION_HIGH = "session_high"
    SESSION_LOW = "session_low"
    SWING_HIGH = "swing_high"
    SWING_LOW = "swing_low"


class Side(str, Enum):
    ABOVE = "sell_side"  # liquidity resting above price (buy stops)
    BELOW = "buy_side"  # liquidity resting below price (sell stops)


class SweepOutcome(str, Enum):
    GRAB_AND_REVERSE = "grab_and_reverse"
    GRAB_AND_CONTINUE = "grab_and_continue"
    TOUCH_REJECT = "touch_reject"
    BREAK_HOLD = "break_hold"


@dataclass(frozen=True)
class Candle:
    time: object
    open: float
    high: float
    low: float
    close: float
    volume: float = 0.0


@dataclass
class SweepEvent:
    time: object
    price: float
    side: Side
    pierce_depth: float
    reclaim: bool
    displacement_atr: float
    outcome: SweepOutcome


@dataclass
class ReactionEvent:
    time: object
    price: float
    bounce_atr: float
    bars_held: int


@dataclass
class LiquidityZone:
    price: float
    kind: ZoneKind
    side: Side
    round_strength: int  # 0 none, 1=$5, 2=$10, 3=$50, 4=$100
    touches: int = 0
    reactions: list[ReactionEvent] = field(default_factory=list)
    sweeps: list[SweepEvent] = field(default_factory=list)
    session_hits: list[str] = field(default_factory=list)
    equal_count: int = 1
    power: float = 0.0
    expected_reaction: str = ""
    notes: str = ""
