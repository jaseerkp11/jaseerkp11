# Ranking from floflo777/open-crypto-puzzles

Source: [floflo777/open-crypto-puzzles](https://github.com/floflo777/open-crypto-puzzles) (snapshot in that README: 2026-08-16).

That repo is a catalogue, not a list of “easy money.” Flo’s own rule: **if a run would take hours, you do not have the constraint yet.** His CUDA engines need an NVIDIA GPU. Your laptop is an **i7-1255U + Intel UHD**. Do not start GSMG, hash-collision bounties, or kitten-scale passphrase grinding.

Checked here on 2026-08-23: Movie Enigma escrow still holds **100,000 sats** unspent.

## Rank for your machine (easiest real work first)

| Rank | Puzzle | Prize (snapshot) | Why this rank | Do this? |
| --- | --- | --- | --- | --- |
| 1 | **Bitcoin Movie Enigma** | 100,000 sats | All 34 panels now have IDs (some disputed). Remaining work is a **title→BIP39 word rule** and an **IMDb “intruder” field**. Oracle exists. No GPU. | **Start here** |
| 2 | **FTPK Season 2** | ~306 USDT | 12 independent web mini-games → 12 BIP39 words. Author said game 7 is the weakest. Laptop is enough. | Second hunt |
| 3 | **Keysa: Crack the Seed** | 369,369 sats | 12 of 70 printed words. Mechanical readings already failed. Needs a **short spoken rule**, not 70-choose-12 brute force. | Only after 1–2 |
| 4 | **School of Bitcoin image** | 1,000,000 sats | Word 1 is `abstract`. Rest is stego / a pulled KeePass file. | If you like image puzzles |
| 5 | **Crypto Puzzles 2018 #2** | 0.05 ETH | Same series as a solved sibling. Glyphs in two YouTube videos. Part 1 hex prefix known; part 2 unread. | Slow video work |
| 6 | **Keir Finlow-Bates book lots** | 600,000 sats (3 lots) | Transform is known (`SHA256` three times). Ebook is exhausted. Likely **print-only**. | Only if you buy the 2020–21 print book |
| 7 | **Kitten passphrase** | 0.010019 BTC | Seed is public. Passphrase is not. Flo already tested **~1.16 billion** candidates. Author: not meant to be solved. | Do **not** brute this first |
| — | Exitonly #14 | 30,000 sats | 5 missing BIP39 words. Search cost ≫ prize. | Skip |
| — | GSMG.io | ~5 BTC | Multi-stage; last gate is sealed AES. Needs insight and often GPU. | Skip for this laptop |
| — | Ballet / Bobby Lee | 2 BTC | Physical card halves never photographed. | Skip |
| — | Peter Todd hash collisions | ~0.59 BTC | Needs a new attack on a hash function. | Skip |

Flo’s “twelve to look at first” mixes **large prizes** with **clean write-ups**. Large ≠ solvable on an i7.

## Hunt 1 — Movie Enigma (do this now)

Rules: [bitcoinmovieenigma.com/rules](https://bitcoinmovieenigma.com/rules)

1. Guess 34 movie titles from stills.
2. Turn each title into **one English BIP39 word**.
3. Drop **10 intruders** using each film’s **IMDb** page.
4. Restore the remaining **24 words in panel order**.

Escrow (verify yourself): `bc1q94ecsn0qk8lap2gefrycnms3ruepy889z969a6`

### Windows (PowerShell)

```powershell
cd C:\Users\DELL
git clone https://github.com/floflo777/open-crypto-puzzles.git
cd open-crypto-puzzles\3-small-prizes\bitcoin-movie-enigma-100ksats

python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -U pip
pip install bip-utils

python tools\oracle.py --selftest
```

You want `SELFTEST OK`.

Check the prize is still there:

```powershell
curl https://mempool.space/api/address/bc1q94ecsn0qk8lap2gefrycnms3ruepy889z969a6
```

`funded_txo_sum` should be `100000` and `spent_txo_sum` `0`. If spent, stop.

### What you actually do

Human glance left: **panel 13 only**. See `crypto-puzzles/movie-enigma/NEXT.md`.

Working 34 titles: `crypto-puzzles/movie-enigma/titles34.txt` (not Flo’s CSV).

1. Open [the stills](https://bitcoinmovieenigma.com/) (author site; do not copy film frames into git).
2. Open `data\films.csv` in the cloned repo only as background. Community list in `data\films_community_issue9.csv` **disagrees on ~9 panels**. Most of those nine are now settled from stills; **13** is the leftover.
3. For each agreed title, pick the BIP39 word (often a literal substring: Die Hard → `hard`). Official-substring holes on the working list: The Goonies, Sharknado, The Shining. Either they are intruders, or the word rule is not “substring.”
4. On IMDb, find **one field** that marks exactly **10** films as out. MPAA R, Oscars, “based on a novel,” etc. are already refuted in `analysis\tested.md`. Do not re-run those.
5. Keep panel order. Drop the 10. You now have 24 words.
6. Test:

```powershell
python tools\oracle.py "word1 word2 ... word24"
```

`MATCH ...` means you have the wallet. `NO MATCH` means wrong films, wrong words, wrong drops, or a non-default derivation (the oracle already tries BIP84/49/44).

### If MATCH

1. Use Electrum (or Sparrow) on **your** PC.
2. Standard wallet → restore 24 words → **no passphrase**.
3. Confirm the receive address equals the escrow.
4. Send **all** coins to a **new empty** wallet you created earlier. Never paste the seed into a website.

Prize is 100,000 sats. After miner fees you keep less. That is still the cheapest **honest** on-chain hunt in the catalogue.

## Hunt 2 — FTPK Season 2 (~306 USDT)

Site hub: `findtheprivatekeys.vercel.app` → season 2.

Twelve games, one BIP39 word each, Ethereum path `m/44'/60'/0'/0/0`. Oracle: `2-mid-prizes\ftpk-season-2-300usdt\tools\oracle.py`.

Play the games. Do not brute 12 unknown words. One weak word (author: game 7) is at most 2048 tries **after** the other 11 are known.

## What not to do

- Do not grind the kitten passphrase hoping the i7 “is fast enough.” PBKDF2 is slow; the space is the author’s secret sentence.
- Do not rent GPU time until a puzzle’s remaining space is **tiny and proven**.
- Do not import puzzle seeds into the same wallet you use for salary or savings.

Local kitten **verify/bench** code (not a solver) lives on branch `cursor/kitten-passphrase-tester-9059` under `kitten-puzzle\`.
