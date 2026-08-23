# Kitten passphrase puzzle tester

Local CPU tester for Corey Phillips’ public Bitimage kitten challenge (2019).

This is **not** a guaranteed payday. Corey funded a second address with a BIP39 passphrase and wrote that it was **not meant to be solved**. The empty-passphrase address was drained the same day. The passphrase address still holds **0.010019 BTC** as of 23 Aug 2026 (1,001,900 sat, unspent).

```
empty passphrase  bc1q57euh23y3qs2f9d5mtwpax5lqecfvrdkqce82a   (drained)
with passphrase   bc1qcyrndzgy036f6ax370g8zyvlw86ulawgt0246r   (still funded)
path              m/84'/0'/0'/0/0
```

Do **not** paste your own wallet seed into this folder.

## Windows setup (PowerShell)

Python 3.11+ from https://www.python.org/downloads/ — tick **Add python.exe to PATH**.

```powershell
cd C:\Users\DELL\jaseerkp11
git fetch origin cursor/kitten-passphrase-tester-9059
git checkout cursor/kitten-passphrase-tester-9059
git pull origin cursor/kitten-passphrase-tester-9059
cd kitten-puzzle

python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -U pip
pip install -r requirements.txt
```

If scripts are blocked:

```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

## Stages (run these in order)

```powershell
python kitten_puzzle.py verify
python kitten_puzzle.py balance
python kitten_puzzle.py bench
python kitten_puzzle.py search --wordlist candidates\hints.txt
```

| Stage | Command | What it proves |
| --- | --- | --- |
| 1 | `pip install` | Libraries install on your PC |
| 2 | `verify` | Published entropy → 24 words → empty-passphrase address |
| 3 | `bench` | Guesses/sec on the i7-1255U, plus time estimates |
| 4–5 | `search` | Only the candidate file you pass in |
| 6 | Electrum | If `found.json` appears, import WIF offline and confirm the address |
| 7 | Sweep | Only after independent verification. Send to a **new empty** wallet |

`verify` must print `OK`. If it does not, stop. The derivation path is wrong.

`balance` must show unspent satoshis. If the prize is gone, stop.

## What a laptop can actually search

Each guess is BIP39 seed generation: **PBKDF2-HMAC-SHA512, 2048 iterations**, then BIP84. That is CPU work. Intel UHD does not help.

Typical order of magnitude on a 12th-gen i7 (measure with `bench`, do not trust this paragraph):

- tens to a few hundred guesses per second per core
- a few hundred to ~2k/s with all cores

That is enough for a **short wordlist**. It is not enough for a random password.

| Candidate set | Verdict |
| --- | --- |
| `candidates/hints.txt` | Minutes. Run this first. |
| Your own guesses (article quotes, image EXIF, tweet text) | Worth a try |
| `rockyou.txt` (~14M) | Hours–a day. Already partly tried by others. Low odds. |
| 6–8 random letters | Years+. Do not start. |
| Strong unique passphrase | Not searchable |

HomelessPhD already reported no hit on article-themed phrases plus about one third of rockyou.

## Adding guesses

One passphrase per line in a `.txt` file. Blank lines and `#` comments are skipped.

```powershell
notepad candidates\mine.txt
python kitten_puzzle.py search --wordlist candidates\mine.txt
```

## If it matches

The tool writes `found.json` (gitignored) with the passphrase and WIF.

1. Confirm the address in Electrum yourself.
2. Sweep to a wallet whose seed never touched this puzzle.
3. Do not paste WIF into a website or Telegram “helper”.

## Sources

- Article: https://corey-lyle-phillips.medium.com/part-1-3-turn-your-photos-into-bitcoin-private-keys-addresses-57669771cf7a
- Bitimage: https://github.com/coreyphillips/bitimage
- Explorer: https://blockstream.info/address/bc1qcyrndzgy036f6ax370g8zyvlw86ulawgt0246r
