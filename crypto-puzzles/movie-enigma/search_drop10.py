#!/usr/bin/env python3
"""Drop-10 search for Bitcoin Movie Enigma.

Keeps panel order. Drops 10 of 34 words (some forced). Checks BIP39 checksum,
then BIP84/49/44 first addresses against the known escrow.
"""
from __future__ import annotations

import argparse
import hashlib
import hmac
import itertools
import struct
import sys
import time
from pathlib import Path

from coincurve import PrivateKey
from mnemonic import Mnemonic

ESCROW = "bc1q94ecsn0qk8lap2gefrycnms3ruepy889z969a6"
HARDENED = 0x80000000
N = 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141
CHARSET = "qpzry9x8gf2tvdw0s3jn54khce6mua7l"
MNEM = Mnemonic("english")
WL = MNEM.wordlist
INDEX = {w: i for i, w in enumerate(WL)}


def hash160(data: bytes) -> bytes:
    sha = hashlib.sha256(data).digest()
    return hashlib.new("ripemd160", sha).digest()


def _polymod(values: list[int]) -> int:
    gen = (0x3B6A57B2, 0x26508E6D, 0x1EA119FA, 0x3D4233DD, 0x2A1462B3)
    chk = 1
    for value in values:
        b = chk >> 25
        chk = ((chk & 0x1FFFFFF) << 5) ^ value
        for i in range(5):
            chk ^= gen[i] if ((b >> i) & 1) else 0
    return chk


def p2wpkh(pubkey: bytes) -> str:
    hrp = "bc"
    data = [0] + _convertbits(hash160(pubkey), 8, 5)
    values = [ord(x) >> 5 for x in hrp] + [0] + [ord(x) & 31 for x in hrp] + data
    polymod = _polymod(values + [0, 0, 0, 0, 0, 0]) ^ 1
    checksum = [(polymod >> 5 * (5 - i)) & 31 for i in range(6)]
    return hrp + "1" + "".join(CHARSET[d] for d in data + checksum)


def _convertbits(data: bytes, frombits: int, tobits: int, pad: bool = True) -> list[int]:
    acc = 0
    bits = 0
    ret: list[int] = []
    maxv = (1 << tobits) - 1
    max_acc = (1 << (frombits + tobits - 1)) - 1
    for value in data:
        acc = ((acc << frombits) | value) & max_acc
        bits += frombits
        while bits >= tobits:
            bits -= tobits
            ret.append((acc >> bits) & maxv)
    if pad and bits:
        ret.append((acc << (tobits - bits)) & maxv)
    return ret


def ckd(k: bytes, c: bytes, index: int) -> tuple[bytes, bytes]:
    if index & HARDENED:
        data = b"\x00" + k + struct.pack(">I", index)
    else:
        data = PrivateKey(k).public_key.format(compressed=True) + struct.pack(">I", index)
    i = hmac.new(c, data, hashlib.sha512).digest()
    il, ir = i[:32], i[32:]
    child = (int.from_bytes(il, "big") + int.from_bytes(k, "big")) % N
    return child.to_bytes(32, "big"), ir


def seed_from_mnemonic(words: str) -> bytes:
    return hashlib.pbkdf2_hmac(
        "sha512",
        words.encode("utf-8"),
        b"mnemonic",
        2048,
        dklen=64,
    )


def addr_bip84(seed: bytes) -> str:
    i = hmac.new(b"Bitcoin seed", seed, hashlib.sha512).digest()
    k, c = i[:32], i[32:]
    for index in (84 | HARDENED, 0 | HARDENED, 0 | HARDENED, 0, 0):
        k, c = ckd(k, c, index)
    return p2wpkh(PrivateKey(k).public_key.format(compressed=True))


def checksum_ok(words: list[str]) -> bool:
    bits = 0
    for w in words:
        bits = (bits << 11) | INDEX[w]
    # 24 words = 264 bits = 256 entropy + 8 checksum
    total = bits
    entropy = (total >> 8).to_bytes(32, "big")
    cs = total & 0xFF
    return hashlib.sha256(entropy).digest()[0] == cs


def search(words34: list[str | None], label: str) -> None:
    if len(words34) != 34:
        raise SystemExit(f"{label}: need 34 slots, got {len(words34)}")
    forced = [i for i, w in enumerate(words34) if w is None]
    optional = [i for i, w in enumerate(words34) if w is not None]
    need_more = 10 - len(forced)
    if need_more < 0:
        raise SystemExit(f"{label}: too many forced drops")
    print(f"\n== {label} ==", flush=True)
    print(f"forced drops (0-based): {forced}", flush=True)
    print(f"extra drops: {need_more} from {len(optional)}  C={_ncr(len(optional), need_more)}", flush=True)
    t0 = time.time()
    checked = 0
    valid = 0
    for extra in itertools.combinations(optional, need_more):
        drop = set(forced)
        drop.update(extra)
        cand = [words34[i] for i in range(34) if i not in drop]
        checked += 1
        if not checksum_ok(cand):
            continue
        valid += 1
        phrase = " ".join(cand)
        seed = seed_from_mnemonic(phrase)
        addr = addr_bip84(seed)
        if addr == ESCROW:
            elapsed = time.time() - t0
            print("MATCH", phrase, flush=True)
            print("address", addr, flush=True)
            print(f"time {elapsed:.1f}s  checksum-valid {valid}  scanned {checked}", flush=True)
            Path("FOUND.txt").write_text(phrase + "\n", encoding="utf-8")
            return
        if valid % 200 == 0:
            rate = checked / max(time.time() - t0, 1e-6)
            print(f"  scanned {checked:,}  valid {valid}  {rate:,.0f} combos/s", flush=True)
    elapsed = time.time() - t0
    print(f"no match  scanned {checked:,}  valid {valid}  {elapsed:.1f}s", flush=True)


def _ncr(n: int, r: int) -> int:
    if r < 0 or r > n:
        return 0
    r = min(r, n - r)
    num = 1
    for i in range(r):
        num = num * (n - i) // (i + 1)
    return num


# Community issue #9, first listed word; None = no BIP39 mapping.
COMMUNITY = [
    "hard", "glory", "alien", "mad", "alien", "now", "escape", None,
    "art", "miss", "ill", "life", None, "iron", "river", "visit",
    "clock", "hope", "gravity", "first", "solar", "blade", "galaxy", "close",
    "bar", None, "day", "cream", "matrix", "story", "ghost", "soft",
    "shine", "human",
]

# Flo canonical films, longest substring; None = no substring even concatenated.
FLO_LONGEST = [
    "hard", "glory", "alien", "mad", "picture", "now", "escape", None,
    "sun", "possible", "ill", "life", "good", "wide", "river", "warrior",
    "orange", "hope", "gravity", "first", "solar", "blade", "planet", "ordinary",
    "bar", None, "boy", "cream", "matrix", "story", "ghost", "soft",
    "shine", "human",
]

# Flo but first-occurring substring (leftmost, then longest at that start).
FLO_FIRST = [
    "hard", "path", "alien", "mad", "motion", "now", "escape", None,
    "sun", "miss", "ill", "life", "good", "eye", "river", "warrior",
    "clock", "hope", "gravity", "first", "solar", "blade", "city", "ordinary",
    "bar", None, "boy", "cream", "matrix", "toy", "ghost", "soft",
    "shine", "human",
]


def load_file(path: Path) -> list[str | None]:
    lines = [ln.strip() for ln in path.read_text(encoding="utf-8").splitlines()]
    lines = [ln for ln in lines if ln and not ln.startswith("#")]
    if len(lines) != 34:
        raise SystemExit(f"{path}: need 34 tokens, got {len(lines)}")
    out: list[str | None] = []
    for i, tok in enumerate(lines, 1):
        low = tok.lower()
        if low in {"drop", "none", "-"}:
            out.append(None)
            continue
        if low not in INDEX:
            raise SystemExit(f"line {i}: {tok!r} is not a BIP39 English word")
        out.append(low)
    return out


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--file", type=Path, help="34 lines: BIP39 word or DROP")
    args = parser.parse_args()
    if not checksum_ok(["abandon"] * 23 + ["art"]):
        print("checksum selftest failed", file=sys.stderr)
        return 1
    if args.file:
        search(load_file(args.file), str(args.file))
        return 0
    for label, vec in (
        ("community-first", COMMUNITY),
        ("flo-longest+soft+shine", FLO_LONGEST),
        ("flo-first+soft+shine", FLO_FIRST),
    ):
        search(vec, label)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
