#!/usr/bin/env python3
"""List official BIP39 English substrings for each Movie Enigma title.

Does not search drop-10. Does not talk to the oracle.
"""
from __future__ import annotations

import argparse
import hashlib
import re
import unicodedata
from pathlib import Path

HERE = Path(__file__).resolve().parent
DEFAULT_TITLES = HERE / "titles34.txt"
DEFAULT_WORDLIST = HERE / "bip39-english.txt"
WORDLIST_URL = "https://raw.githubusercontent.com/bitcoin/bips/master/bip-0039/english.txt"


def load_wordlist(path: Path) -> list[str]:
    if not path.exists():
        import urllib.request

        path.write_bytes(urllib.request.urlopen(WORDLIST_URL, timeout=30).read())
    return [w.strip() for w in path.read_text(encoding="utf-8").splitlines() if w.strip()]


def load_titles(path: Path) -> list[tuple[int, str, str]]:
    rows = []
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        parts = line.split("\t")
        rows.append((int(parts[0]), parts[1], parts[2] if len(parts) > 2 else ""))
    if len(rows) != 34:
        raise SystemExit(f"{path} must have 34 titles, got {len(rows)}")
    return rows


def norm(s: str, strip_spaces: bool) -> str:
    s = unicodedata.normalize("NFKD", s)
    s = "".join(c for c in s if not unicodedata.combining(c))
    s = s.lower()
    s = re.sub(r"[^a-z0-9 ]", " ", s)
    s = re.sub(r"\s+", " ", s).strip()
    if strip_spaces:
        s = s.replace(" ", "")
    return s


def all_matches(text: str, wordset: set[str]) -> list[str]:
    found: list[str] = []
    seen: set[str] = set()
    n = len(text)
    for i in range(n):
        for j in range(i + 3, n + 1):
            w = text[i:j]
            if w in wordset and w not in seen:
                seen.add(w)
                found.append(w)
    return found


def greedy_left(text: str, wordset: set[str]) -> list[str]:
    i = 0
    out: list[str] = []
    n = len(text)
    while i < n:
        best = None
        bl = 0
        for length in range(min(8, n - i), 2, -1):
            w = text[i : i + length]
            if w in wordset:
                best, bl = w, length
                break
        if best:
            out.append(best)
            i += bl
        else:
            i += 1
    return out


def checksum_ok(words: list[str], wordlist: list[str]) -> bool:
    if len(words) != 24:
        return False
    index = {w: i for i, w in enumerate(wordlist)}
    try:
        idx = [index[w] for w in words]
    except KeyError:
        return False
    bits = "".join(f"{i:011b}" for i in idx)
    ent, cs = bits[:256], bits[256:]
    digest = hashlib.sha256(int(ent, 2).to_bytes(32, "big")).digest()
    return bin(digest[0])[2:].zfill(8)[:8] == cs


def main() -> None:
    p = argparse.ArgumentParser()
    p.add_argument("--titles", type=Path, default=DEFAULT_TITLES)
    p.add_argument("--wordlist", type=Path, default=DEFAULT_WORDLIST)
    args = p.parse_args()

    wordlist = load_wordlist(args.wordlist)
    wordset = set(wordlist)
    films = load_titles(args.titles)

    print(f"{'#':>2}  {'title':<38} longest     greedy     all")
    print("-" * 110)
    longest_line: list[str] = []
    greedy_line: list[str] = []
    empty: list[int] = []
    for n, title, _conf in films:
        nospace = norm(title, True)
        hits = all_matches(nospace, wordset)
        greed = greedy_left(nospace, wordset)
        long = max(hits, key=len) if hits else "DROP"
        g0 = greed[0] if greed else "DROP"
        longest_line.append(long)
        greedy_line.append(g0)
        if not hits:
            empty.append(n)
        print(f"{n:2d}  {title[:38]:<38} {long:<10} {g0:<10} {','.join(hits)}")

    print()
    print("titles with no official BIP39 substring (spaces deleted):", empty)
    print("longest-per-title (DROP = none):")
    print(" ".join(longest_line))
    print("greedy-left first word:")
    print(" ".join(greedy_line))
    print()
    print("This script does not drop 10 films and does not check the escrow.")


if __name__ == "__main__":
    main()
