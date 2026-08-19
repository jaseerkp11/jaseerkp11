# XAUUSD Buy Sell Structure (TradingView)

Pine Script **v6** overlay for the **15-minute** chart. Copy `xauusd-buy-sell-structure.pine` into TradingView → Pine Editor → Add to chart.

## What changed vs the previous script

- **15m FVG boxes (both directions):** bullish and bearish 3-candle imbalances are drawn on 15m. The 4H-only FVG filter is **off** by default so you see both sides. Boxes stay until filled, then delete.
- **Auto S/R zones:** confirmed swing pools on **4H**, **1H**, and **15m** are drawn as shaded boxes and extend forward. Broken zones are removed.
- **Arrows only when aligned:** BUY/SELL arrows need 4H+1H bias, London/NY session, a real sweep + displacement, overlapping 15m FVG, and a nearby S/R zone (each extra filter can be turned off in settings).
- **Entry table:** top-right panel now shows **Enter** (price / wait instruction), **Stop** (sweep invalidation), and current **FVG / S/R** touches.

## Use

1. Open **XAUUSD** (or XAU) on **15m**.
2. Paste the indicator and keep the chart timeframe at 15m (HTF data is pulled internally).
3. Tune groups: Price action, Filters, Display, Fair value gaps, Support / resistance.

This is a confluence tool, not a guaranteed entry.
