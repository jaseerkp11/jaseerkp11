#!/usr/bin/env python3
"""Unique 4-letter BIP39 prefix map for Movie Enigma titles.

BIP-39 English words are uniquely identified by their first 4 letters.
This script applies that as a *consistent* title rule (not ad-hoc holes).

Does not talk to the escrow.
"""
from __future__ import annotations

import re
import unicodedata
from pathlib import Path

HERE = Path(__file__).resolve().parent
WORDS = [w.strip() for w in (HERE / "bip39-english.txt").read_text().splitlines() if w.strip()]
PREF = {w[:4]: w for w in WORDS}
STOP = {"the", "a", "an", "of", "from", "in", "and", "to", "on", "for", "with"}


def tokens(title: str) -> list[str]:
    s = unicodedata.normalize("NFKD", title)
    s = "".join(c for c in s if not unicodedata.combining(c)).lower()
    s = re.sub(r"[^a-z0-9 ]", " ", s)
    out = []
    for t in s.split():
        if t in STOP or t.isdigit() or t in {"ii", "iv", "2", "2049"}:
            continue
        out.append(t)
    return out


def prefix_word(tok: str) -> str | None:
    if len(tok) >= 4 and tok[:4] in PREF:
        return PREF[tok[:4]]
    if len(tok) == 3 and tok in {w for w in WORDS if len(w) == 3}:
        return tok
    return None


def load_titles() -> list[tuple[int, str]]:
    rows = []
    for line in (HERE / "titles34.txt").read_text().splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        parts = line.split("\t")
        rows.append((int(parts[0]), parts[1]))
    return rows


def main() -> None:
    films = load_titles()
    print(f"{'#':>2}  {'first':<10} {'last':<10} {'longest-tok':<10}  tokens")
    firsts, lasts, longs = [], [], []
    for n, title in films:
        toks = tokens(title)
        hits = [(t, prefix_word(t)) for t in toks]
        hits = [(t, w) for t, w in hits if w]
        first = hits[0][1] if hits else "DROP"
        last = hits[-1][1] if hits else "DROP"
        if toks:
            lt = max(toks, key=len)
            longw = prefix_word(lt) or "DROP"
        else:
            longw = "DROP"
        firsts.append(first)
        lasts.append(last)
        longs.append(longw)
        print(f"{n:2d}  {first:<10} {last:<10} {longw:<10}  {hits}")
    for name, seq in ("prefix_first.txt", firsts), ("prefix_last.txt", lasts), ("prefix_longest.txt", longs):
        path = HERE / name
        path.write_text("# unique 4-letter BIP39 prefix; DROP = no hit\n" + "\n".join(seq) + "\n")
        drops = [i + 1 for i, w in enumerate(seq) if w == "DROP"]
        print(f"wrote {path.name}  DROPs panels {drops}  count {len(drops)}")


if __name__ == "__main__":
    main()
