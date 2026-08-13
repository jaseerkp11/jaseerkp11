# XAUUSD liquidity zones

Scan about **one week** of XAUUSD history and rank **where price actually reacted**: round numbers that end in 0 or 5, equal highs/lows (stop pools), session extremes, and **liquidity sweeps**.

## Bot, indicator, or something else?

**Build an indicator + scanner first. Do not start with a trading bot.**

| Tool | Role |
| --- | --- |
| **Python scanner** (`scan.py`) | Best for a 1-week forensic map: scores every candidate, prints how it swept/reacted, dumps JSON. This is the research brain. |
| **TradingView indicator** (`pine/XAUUSD_LiquidityZones.pine`) | Best for live eyes: round-number grid, equal-high/low boxes, sweep triangles. Humans still decide. |
| **Alert bot (later)** | Notify when price is within ~0.3 ATR of a high-power zone, or when a sweep reclaims. No orders. |
| **Execution bot** | Last, and only after you paper-trade the map. Liquidity is a *location*, not a signal. Blind entries at 2400.00 will get run over. |

A bot that “trades liquidity” without a scored map will chase every wick. Gold is a magnet market: round numbers attract price, then either **grab and reverse** or **grab and continue**. The job of this project is to tell those two apart from last week’s tape, not to auto-click buy.

## What “liquidity” means on XAUUSD

Resting orders cluster where traders put stops:

- **Sell-side liquidity** sits **above** swing highs and round numbers (buy stops of shorts + breakout buys).
- **Buy-side liquidity** sits **below** swing lows and round numbers (sell stops of longs + breakdown sells).

Price is often pulled into those pools. A **high-powered** zone is a pool that is (1) obvious to the crowd, (2) stacked with confluence, and (3) already proven by a sweep-and-displace, not just a pretty line.

### Round numbers (0 and 5)

On gold, whole-dollar prices ending in **0 or 5** are the working grid: `2405`, `2410`, `2450`, `2500`. Strength ladder used here:

1. **$5** — minor magnet (ending 5 or 0)
2. **$10** — stronger
3. **$50** — institutional round
4. **$100** — major magnet (`2400`, `2500`, `2600`)

They are **destinations**, not automatic reversals. First touch is often a wick through the print, then a decision.

### High-powered zone recipe (best method)

Rank a level only when several of these stack:

1. **Equal highs / equal lows** — two or more swings within ~0.45 ATR. That is a visible stop shelf.
2. **Session extreme** — Asia high/low is the classic draw during London; London high/low during New York.
3. **Round-number confluence** — the shelf sits on `$x0` / `$x5` / `$x00`.
4. **Sweep quality** — wick **through** the pool, **close back**, then **displacement** (≥ ~0.8 ATR in 3–6 candles). That is the institutional footprint.
5. **Reaction size** — bounce measured in ATR, not “it touched once”.
6. **Repeat behavior** — the same level grabbed and reversed more than it ran through.

If the wick takes the pool and **does not reclaim**, treat it as **break and continue**. Fading that is how accounts die on gold.

### How a high-powered zone usually reacts

- **Untested round number**: magnet. Wait.
- **First sweep + reclaim + displacement**: highest-quality reversal *after* the reclaim candle, not at the exact round print.
- **Sweep with no displacement**: weak. Often comes back to finish the run.
- **Second tap after a valid sweep**: can be a cleaner entry (retest of the pool).
- **Session high taken in London/NY with a large-bodied reclaim**: typical “raid then go the other way” pattern on XAUUSD.

## Run the scanner

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python scan.py --interval 15m --days 7 --top 15 --json-out output/zones.json
```

Yahoo Finance is used for `XAUUSD=X`, falling back to `GC=F`. You can also pass your own broker CSV:

```bash
python scan.py --csv path/to/xauusd_m15.csv --top 15
```

CSV needs `Open,High,Low,Close` and a `Date` or `Datetime` column (UTC preferred).

### TradingView

Copy `pine/XAUUSD_LiquidityZones.pine` into TradingView → Pine Editor → Save → Add to chart on XAUUSD (M15 or M5). Pine v6. It draws a **stable** $10 / $50 / $100 grid (not a moving $5 mesh), a few equal-high/low boxes, and only strong sweep triangles. Hide your other drawings if the chart still looks busy.

## Tests

```bash
pytest -q
```

## What this will not do

It will not guarantee the next reaction at `2650`. It maps **where liquidity was paid this week** and **how it paid**. Use that as a map, then wait for the sweep + reclaim + displacement before you even think about automation.
