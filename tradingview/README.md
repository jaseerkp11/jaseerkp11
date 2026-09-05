# XAUUSD High Probability Structure (TradingView)

Pine Script **v6** for the **15-minute** XAUUSD chart. Paste into Pine Editor → Add to chart.

## What makes an arrow “high probability”

An arrow only prints on a **confirmed 15m close** when all of this is true:

1. **Daily not against** the trade, and **4H + 1H** same bias  
2. **London 07–10 or New York 12–16 UTC** (killzone; can turn off)  
3. **Real sweep** (wick through a 15m swing, close back, not a runaway break)  
4. **Displacement** (strong body, close through prior bar, close in the right third of the candle)  
5. **Confluence score ≥ 7 / 12** (default): HTF, daily, killzone, equal swings, FVG, demand/supply, premium/discount, Asia sweep, ADX, not stretched  
6. **15m FVG** in trade direction and a nearby **demand** (buy) or **supply** (sell) zone  
7. Buys only in the **discount** half of the last 8 hours; sells only in **premium**

Fake sweeps (close back through the level before confirmation) are cancelled.

## Table

Score, Daily, 4H/1H, killzone, PD array, pending, **Enter**, **Stop / TP1**, FVG/SD, ADX, Asia range.

On a signal the chart gets **SL / TP1 / TP2** lines (defaults 1.5R and 2.5R) and a label with prices.

## If you get no arrows

That is intended. Loosen **Min confluence score**, turn off killzone, FVG, or Asia in **Filters / probability**.

This is a confluence tool, not a guaranteed trade.
