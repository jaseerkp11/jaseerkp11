from __future__ import annotations

from datetime import datetime, timedelta, timezone

import pandas as pd

from xauusd_liquidity.types import Candle


def candles_from_frame(df: pd.DataFrame) -> list[Candle]:
    if df.empty:
        return []
    frame = df.copy()
    frame.columns = [str(c).title() for c in frame.columns]
    required = {"Open", "High", "Low", "Close"}
    missing = required - set(frame.columns)
    if missing:
        raise ValueError(f"OHLC frame missing columns: {sorted(missing)}")
    if "Volume" not in frame.columns:
        frame["Volume"] = 0.0
    out: list[Candle] = []
    for ts, row in frame.iterrows():
        out.append(
            Candle(
                time=ts.to_pydatetime() if hasattr(ts, "to_pydatetime") else ts,
                open=float(row["Open"]),
                high=float(row["High"]),
                low=float(row["Low"]),
                close=float(row["Close"]),
                volume=float(row["Volume"] or 0.0),
            )
        )
    return out


def fetch_xauusd_week(interval: str = "15m", days: int = 7) -> pd.DataFrame:
    """Download ~1 week of gold OHLC.

    Tries spot XAUUSD first, then COMEX gold futures (GC=F).
    """
    import yfinance as yf

    end = datetime.now(timezone.utc)
    start = end - timedelta(days=days + 1)
    last_error: Exception | None = None
    for symbol in ("GC=F", "XAU=X", "XAUUSD=X"):
        try:
            df = yf.download(
                symbol,
                start=start.strftime("%Y-%m-%d"),
                end=end.strftime("%Y-%m-%d"),
                interval=interval,
                auto_adjust=False,
                progress=False,
            )
        except Exception as exc:  # network / Yahoo outages
            last_error = exc
            continue
        if df is None or df.empty:
            continue
        if isinstance(df.columns, pd.MultiIndex):
            df.columns = [c[0] for c in df.columns]
        df = df.dropna(subset=["Open", "High", "Low", "Close"])
        if not df.empty:
            df.attrs["symbol"] = symbol
            return df
    raise RuntimeError(
        "Could not download XAUUSD or GC=F from Yahoo Finance. "
        f"Last error: {last_error}"
    )


def atr(candles: list[Candle], period: int = 14) -> list[float]:
    if not candles:
        return []
    trs: list[float] = []
    for i, c in enumerate(candles):
        if i == 0:
            trs.append(c.high - c.low)
            continue
        prev_close = candles[i - 1].close
        tr = max(c.high - c.low, abs(c.high - prev_close), abs(c.low - prev_close))
        trs.append(tr)
    out: list[float] = []
    running = 0.0
    for i, tr in enumerate(trs):
        if i < period:
            running += tr
            out.append(running / (i + 1))
        else:
            out.append((out[-1] * (period - 1) + tr) / period)
    return out
