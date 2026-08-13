# XAUUSD liquidity zones

Scan about **one week** of XAUUSD history and rank **where price actually reacted**: round numbers that end in 0 or 5, equal highs/lows (stop pools), session extremes, and **liquidity sweeps**.

## Bot, indicator, or something else?

**Build an indicator + scanner first. Do not start with a trading bot.**

| Tool | Role |
| --- | --- |
| **Python scanner** (`scan.py`) | Optional 1-week forensic map of round numbers and pools. Not needed to trade. |
| **TradingView signal** (`pine/XAUUSD_BuySell_Structure.pine`) | **Use this on the 15m chart.** BUY/SELL from 4H+1H bias, real liquidity sweeps, 1H S/R, and displacement. |
| **Old overlay** (`pine/XAUUSD_LiquidityZones.pine`) | Left in the repo. Do not add it if you want a clean chart. |

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

### TradingView — BUY / SELL (use this)

1. Open **XAUUSD** on **15 minutes**.
2. Remove the old “XAUUSD Liquidity Zones” indicator from the chart.
3. Pine Editor → paste `pine/XAUUSD_BuySell_Structure.pine` → Save → Add to chart.

Green triangle under the bar = BUY. Red triangle above the bar = SELL. Valid **15m FVG** boxes: green = bullish imbalance, red = bearish. Boxes vanish when the gap is fully filled. Only impulse gaps in the **4H direction** are drawn (tiny gaps are ignored).

- **4H and 1H bias agree** (both bull or both bear). If either is chop, no trade.
- **BUY** only in that bullish bias after a **real buy-side sweep**: wick under a 15m swing low, close back above, then the next bar displaces up. A close that stays below the low is a break, not a sweep.
- **SELL** only in bearish bias after a **real sell-side sweep**: wick above a 15m swing high, close back under, then displacement down.
- If the next bars fail to displace and close back through the level, the sweep is treated as **fake** and cancelled.
- Extra confluence: 1H support/resistance, a $10 round number, or equal highs/lows.
- Default session filter: London + New York (UTC 07:00–21:00).

The table (top right) shows 4H bias, 1H bias, aligned YES/NO, session, and whether a sweep is waiting for displacement. Dashed lines are the last 1H resistance (red) and support (green).

Create alerts from the indicator: “XAUUSD BUY” / “XAUUSD SELL”.

No indicator is a guaranteed win. Paper-trade it before using size.

### Old overlay (do not use for entries)

`pine/XAUUSD_LiquidityZones.pine` is the noisy round-number map. Leave it off the trade chart.

## Tests

```bash
pytest -q
```

## What this will not do

It will not guarantee the next reaction at `2650`. It maps **where liquidity was paid this week** and **how it paid**. Use that as a map, then wait for the sweep + reclaim + displacement before you even think about automation.
