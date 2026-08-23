#!/usr/bin/env python3
"""Local tester for Corey Phillips' public Bitimage kitten passphrase puzzle.

Public facts only:
  entropy  = SHA256(base64 of the published kitten JPEG)
  path     = BIP84 m/84'/0'/0'/0/0  (native segwit)
  empty passphrase address is known
  funded target address is known

Do not paste any personal wallet seed into this tool.
"""

from __future__ import annotations

import argparse
import hashlib
import hmac
import json
import os
import struct
import sys
import time
import unicodedata
from multiprocessing import Pool, cpu_count
from pathlib import Path

from coincurve import PrivateKey
from mnemonic import Mnemonic

# Published SHA256 of the kitten image Base64 payload (Corey's article).
ENTROPY_HEX = "1808d35318ac7cb98b69ff9779b699d6a631f15e0b353ac89b7c4020774832ed"

# Empty-passphrase address from the same mnemonic. Drained in 2019.
VERIFY_ADDRESS = "bc1q57euh23y3qs2f9d5mtwpax5lqecfvrdkqce82a"

# Passphrase-protected address. Check the explorer before spending time.
TARGET_ADDRESS = "bc1qcyrndzgy036f6ax370g8zyvlw86ulawgt0246r"

DERIVATION = "m/84'/0'/0'/0/0"
HARDENED = 0x80000000
N = 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141

CHARSET = "qpzry9x8gf2tvdw0s3jn54khce6mua7l"

_WORKER_MNEMONIC = ""


def mnemonic_from_entropy() -> str:
    entropy = bytes.fromhex(ENTROPY_HEX)
    return Mnemonic("english").to_mnemonic(entropy)


def hash160(data: bytes) -> bytes:
    sha = hashlib.sha256(data).digest()
    try:
        return hashlib.new("ripemd160", sha).digest()
    except ValueError:
        from Crypto.Hash import RIPEMD160  # type: ignore

        return RIPEMD160.new(sha).digest()


def _polymod(values: list[int]) -> int:
    gen = (0x3B6A57B2, 0x26508E6D, 0x1EA119FA, 0x3D4233DD, 0x2A1462B3)
    chk = 1
    for value in values:
        b = chk >> 25
        chk = ((chk & 0x1FFFFFF) << 5) ^ value
        for i in range(5):
            chk ^= gen[i] if ((b >> i) & 1) else 0
    return chk


def _hrp_expand(hrp: str) -> list[int]:
    return [ord(x) >> 5 for x in hrp] + [0] + [ord(x) & 31 for x in hrp]


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


def p2wpkh(pubkey: bytes) -> str:
    witprog = hash160(pubkey)
    data = [0] + _convertbits(witprog, 8, 5)
    hrp = "bc"
    values = _hrp_expand(hrp) + data
    polymod = _polymod(values + [0, 0, 0, 0, 0, 0]) ^ 1
    checksum = [(polymod >> 5 * (5 - i)) & 31 for i in range(6)]
    combined = data + checksum
    return hrp + "1" + "".join(CHARSET[d] for d in combined)


def _ser32(i: int) -> bytes:
    return struct.pack(">I", i)


def _ckd_priv(k: bytes, c: bytes, index: int) -> tuple[bytes, bytes]:
    if index & HARDENED:
        data = b"\x00" + k + _ser32(index)
    else:
        data = PrivateKey(k).public_key.format(compressed=True) + _ser32(index)
    i = hmac.new(c, data, hashlib.sha512).digest()
    il, ir = i[:32], i[32:]
    child = (int.from_bytes(il, "big") + int.from_bytes(k, "big")) % N
    if int.from_bytes(il, "big") >= N or child == 0:
        raise ValueError("invalid BIP32 child")
    return child.to_bytes(32, "big"), ir


def seed_from_mnemonic(mnemonic: str, passphrase: str) -> bytes:
    mnemonic_nfkd = unicodedata.normalize("NFKD", mnemonic)
    passphrase_nfkd = unicodedata.normalize("NFKD", passphrase)
    return hashlib.pbkdf2_hmac(
        "sha512",
        mnemonic_nfkd.encode("utf-8"),
        ("mnemonic" + passphrase_nfkd).encode("utf-8"),
        2048,
        dklen=64,
    )


def bip84_account0_addr0(seed: bytes) -> tuple[str, bytes]:
    i = hmac.new(b"Bitcoin seed", seed, hashlib.sha512).digest()
    k, c = i[:32], i[32:]
    for index in (84 | HARDENED, 0 | HARDENED, 0 | HARDENED, 0, 0):
        k, c = _ckd_priv(k, c, index)
    pubkey = PrivateKey(k).public_key.format(compressed=True)
    return p2wpkh(pubkey), k


def wif_from_priv(priv: bytes) -> str:
    payload = b"\x80" + priv + b"\x01"
    checksum = hashlib.sha256(hashlib.sha256(payload).digest()).digest()[:4]
    alphabet = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"
    n = int.from_bytes(payload + checksum, "big")
    chars = []
    while n > 0:
        n, r = divmod(n, 58)
        chars.append(alphabet[r])
    pad = 0
    for b in payload + checksum:
        if b == 0:
            pad += 1
        else:
            break
    return "1" * pad + "".join(reversed(chars))


def address_for_passphrase(mnemonic: str, passphrase: str) -> str:
    seed = seed_from_mnemonic(mnemonic, passphrase)
    addr, _ = bip84_account0_addr0(seed)
    return addr


def wif_for_passphrase(mnemonic: str, passphrase: str) -> str:
    seed = seed_from_mnemonic(mnemonic, passphrase)
    _, priv = bip84_account0_addr0(seed)
    return wif_from_priv(priv)


def cmd_verify() -> int:
    mnemonic = mnemonic_from_entropy()
    words = mnemonic.split()
    print(f"entropy     {ENTROPY_HEX}")
    print(f"word count  {len(words)}")
    print(f"mnemonic    {mnemonic}")
    print(f"path        {DERIVATION}")
    got = address_for_passphrase(mnemonic, "")
    print(f"empty pass  {got}")
    if got != VERIFY_ADDRESS:
        print("FAIL: empty-passphrase address does not match the published puzzle.")
        print(f"expected    {VERIFY_ADDRESS}")
        return 1
    print("OK: empty-passphrase address matches the published puzzle.")
    print(f"target      {TARGET_ADDRESS}")
    print("Next: python kitten_puzzle.py bench")
    return 0


def cmd_bench(seconds: float, workers: int) -> int:
    mnemonic = mnemonic_from_entropy()
    address_for_passphrase(mnemonic, "warmup")

    n = 0
    t0 = time.perf_counter()
    while time.perf_counter() - t0 < seconds:
        address_for_passphrase(mnemonic, f"bench-{n}")
        n += 1
    elapsed = time.perf_counter() - t0
    single = n / elapsed if elapsed else 0.0
    est_mp = single * workers

    print(f"single core   {n} guesses in {elapsed:.2f}s  ({single:.1f}/s)")
    print(f"workers       {workers}  (logical processors available: {cpu_count()})")
    print(f"est. parallel ~{est_mp:.0f}/s  (rough; PBKDF2 is CPU-bound)")
    print()
    print("Time estimates if every guess is unique:")
    for label, size in (
        ("hints.txt (~50)", 50),
        ("10,000 guesses", 10_000),
        ("rockyou 14M", 14_000_000),
        ("6 lowercase letters", 26**6),
        ("8 lowercase letters", 26**8),
    ):
        secs = size / est_mp if est_mp else float("inf")
        print(f"  {label:<22} {human_time(secs)}")
    print()
    print("A random strong passphrase is not searchable on a laptop.")
    print("Only run search on a list you actually believe is plausible.")
    return 0


def human_time(seconds: float) -> str:
    if seconds < 1:
        return f"{seconds * 1000:.0f} ms"
    if seconds < 90:
        return f"{seconds:.1f} s"
    minutes = seconds / 60
    if minutes < 90:
        return f"{minutes:.1f} min"
    hours = minutes / 60
    if hours < 48:
        return f"{hours:.1f} h"
    days = hours / 24
    if days < 400:
        return f"{days:.1f} days"
    years = days / 365.25
    return f"{years:.1f} years"


def load_candidates(path: Path) -> list[str]:
    lines: list[str] = []
    seen: set[str] = set()
    for raw in path.read_text(encoding="utf-8", errors="replace").splitlines():
        line = raw.rstrip("\n\r")
        if not line.strip() or line.lstrip().startswith("#"):
            continue
        if line not in seen:
            seen.add(line)
            lines.append(line)
    return lines


def _init_worker(mnemonic: str) -> None:
    global _WORKER_MNEMONIC
    _WORKER_MNEMONIC = mnemonic


def _try_one(passphrase: str) -> tuple[str, str] | None:
    addr = address_for_passphrase(_WORKER_MNEMONIC, passphrase)
    if addr == TARGET_ADDRESS:
        return passphrase, addr
    return None


def cmd_search(wordlist: Path, workers: int) -> int:
    if not wordlist.is_file():
        print(f"missing wordlist: {wordlist}", file=sys.stderr)
        return 1

    mnemonic = mnemonic_from_entropy()
    candidates = load_candidates(wordlist)
    print(f"candidates  {len(candidates)} from {wordlist}")
    print(f"workers     {workers}")
    print(f"target      {TARGET_ADDRESS}")

    t0 = time.perf_counter()
    found = None
    checked = 0
    with Pool(processes=workers, initializer=_init_worker, initargs=(mnemonic,)) as pool:
        for result in pool.imap_unordered(_try_one, candidates, chunksize=8):
            checked += 1
            if result is not None:
                found = result
                pool.terminate()
                break
            if checked % 100 == 0:
                rate = checked / (time.perf_counter() - t0)
                print(f"  checked {checked}/{len(candidates)}  ({rate:.1f}/s)", flush=True)

    elapsed = time.perf_counter() - t0
    rate = checked / (time.perf_counter() - t0) if elapsed else 0.0
    print(f"checked     {checked} in {elapsed:.2f}s  ({rate:.1f}/s)")

    if not found:
        print("no match in this list")
        return 2

    passphrase, addr = found
    out = Path("found.json")
    payload = {
        "passphrase": passphrase,
        "address": addr,
        "path": DERIVATION,
        "warning": "Import the WIF only into a wallet you control. Sweep. Do not reuse this mnemonic.",
        "wif": wif_for_passphrase(mnemonic, passphrase),
    }
    out.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")
    print("MATCH")
    print(f"passphrase  {passphrase!r}")
    print(f"address     {addr}")
    print(f"wrote       {out.resolve()}")
    print("Verify independently in Electrum: import WIF, confirm the address, then sweep.")
    print("Do not paste the WIF into a website.")
    return 0


def cmd_balance() -> int:
    import urllib.request

    url = f"https://blockstream.info/api/address/{TARGET_ADDRESS}"
    with urllib.request.urlopen(url, timeout=20) as resp:
        data = json.loads(resp.read().decode("utf-8"))
    funded = data["chain_stats"]["funded_txo_sum"]
    spent = data["chain_stats"]["spent_txo_sum"]
    unspent = funded - spent
    print(f"address     {TARGET_ADDRESS}")
    print(f"funded      {funded} sat  ({funded / 1e8:.8f} BTC)")
    print(f"spent       {spent} sat")
    print(f"unspent     {unspent} sat  ({unspent / 1e8:.8f} BTC)")
    if unspent <= 0:
        print("This prize address is empty. Do not search it.")
        return 1
    return 0


def default_workers() -> int:
    n = cpu_count() or 2
    return max(1, n - 1)


def main() -> int:
    parser = argparse.ArgumentParser(description="Kitten passphrase puzzle local tester")
    sub = parser.add_subparsers(dest="cmd", required=True)

    sub.add_parser("verify", help="derive mnemonic and reproduce the empty-passphrase address")
    sub.add_parser("balance", help="check the prize address on blockstream.info")

    p_bench = sub.add_parser("bench", help="time guesses/sec on this CPU")
    p_bench.add_argument("--seconds", type=float, default=8.0)
    p_bench.add_argument("--workers", type=int, default=default_workers())

    p_search = sub.add_parser("search", help="try passphrases from a text file")
    p_search.add_argument(
        "--wordlist",
        type=Path,
        default=Path(__file__).with_name("candidates") / "hints.txt",
    )
    p_search.add_argument("--workers", type=int, default=default_workers())

    args = parser.parse_args()
    os.chdir(Path(__file__).resolve().parent)

    if args.cmd == "verify":
        return cmd_verify()
    if args.cmd == "balance":
        return cmd_balance()
    if args.cmd == "bench":
        return cmd_bench(args.seconds, args.workers)
    if args.cmd == "search":
        return cmd_search(args.wordlist, args.workers)
    return 1


if __name__ == "__main__":
    from multiprocessing import freeze_support

    freeze_support()
    raise SystemExit(main())
