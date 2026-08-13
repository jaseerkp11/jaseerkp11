#!/usr/bin/env python3
"""Scan ~1 week of XAUUSD and print ranked liquidity zones."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

import pandas as pd

from xauusd_liquidity.report import format_report
from xauusd_liquidity.scanner import scan_liquidity
from xauusd_liquidity.types import LiquidityZone


def _zone_dict(z: LiquidityZone) -> dict:
    return {
        "price": z.price,
        "kind": z.kind.value,
        "side": z.side.value,
        "round_strength": z.round_strength,
        "touches": z.touches,
        "reactions": len(z.reactions),
        "sweeps": len(z.sweeps),
        "equal_count": z.equal_count,
        "sessions": z.session_hits,
        "power": z.power,
        "expected_reaction": z.expected_reaction,
        "notes": z.notes,
    }


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="XAUUSD 1-week liquidity zone scanner")
    parser.add_argument("--csv", type=Path, help="Optional OHLC CSV with Datetime index or Date column")
    parser.add_argument("--interval", default="15m", help="Yahoo interval if downloading (default 15m)")
    parser.add_argument("--days", type=int, default=7)
    parser.add_argument("--top", type=int, default=15)
    parser.add_argument("--json-out", type=Path, help="Write ranked zones as JSON")
    args = parser.parse_args(argv)

    df = None
    if args.csv:
        df = pd.read_csv(args.csv)
        if "Date" in df.columns:
            df["Date"] = pd.to_datetime(df["Date"], utc=True)
            df = df.set_index("Date")
        elif "Datetime" in df.columns:
            df["Datetime"] = pd.to_datetime(df["Datetime"], utc=True)
            df = df.set_index("Datetime")
    try:
        zones = scan_liquidity(df, interval=args.interval, days=args.days)
    except Exception as exc:
        print(f"Scan failed: {exc}", file=sys.stderr)
        return 1
    print(format_report(zones, top_n=args.top))
    if args.json_out:
        args.json_out.parent.mkdir(parents=True, exist_ok=True)
        payload = [_zone_dict(z) for z in zones]
        args.json_out.write_text(json.dumps(payload, indent=2), encoding="utf-8")
        print(f"Wrote {len(payload)} zones to {args.json_out}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
