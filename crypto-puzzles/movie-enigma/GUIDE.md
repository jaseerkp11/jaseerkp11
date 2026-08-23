# Hunt 1 — Bitcoin Movie Enigma (full Cursor guide)

The 24-word seed is **not published**. Cursor cannot pull it from the website. It is built as:

```
34 film stills  →  34 titles  →  34 BIP39 words  →  drop 10 IMDb "intruders"  →  24 words in panel order
```

I already ran the drop-10 search on the two public identification lists (Flo’s `films.csv` and GitHub issue #9). **No match.** So at least one of: a wrong film, a wrong word, or a wrong idea of which 10 to drop, is still wrong. The prize address still holds 100,000 sats.

What Cursor **can** do, once your 34 words are right: test every way to drop 10 films in about **20–80 seconds**. That part is finished as code. Your job is the films and the word rule.

## 0. One-time setup (PowerShell)

```powershell
cd C:\Users\DELL\jaseerkp11
git fetch origin
git checkout cursor/crypto-puzzles-rank-9059
git pull origin cursor/crypto-puzzles-rank-9059

cd crypto-puzzles\movie-enigma
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install coincurve mnemonic
```

Confirm the prize is unspent:

```powershell
curl https://mempool.space/api/address/bc1q94ecsn0qk8lap2gefrycnms3ruepy889z969a6
```

`funded_txo_sum` = 100000, `spent_txo_sum` = 0. If spent, stop.

## 1. Identify the 34 stills (browser + a text file)

Open https://bitcoinmovieenigma.com/ (one still per post, #1–#34).

In Cursor, copy `crypto-puzzles/movie-enigma/panels.txt` and put **one IMDb title per line**, line 1 = panel 1.

Rules:

- Use the **exact** theatrical title (Die Hard, not Die Hard 2).
- If two movies share a frame, pick the one that matches **year / set / actors**, not the more famous sequel.
- Flo and the community **disagree on ~9 panels**. Those nine are why the seed is still unknown. Do not copy either list blindly. Reverse-image-search each disputed still yourself (Google Lens).

Disputed panel numbers (Flo vs issue #9): **3, 5, 9, 13, 14, 16, 23, 24, 27**.

## 2. Turn each title into one BIP39 word

Edit `crypto-puzzles/movie-enigma/words34.txt`: 34 lines, **one English BIP39 word per panel**, or the word `DROP` if that title has no BIP39 word.

Working rule that fits most titles: **longest BIP39 substring** of the title (`Die Hard` → `hard`, `Godzilla` → `ill`).

Known exceptions:

| Panel title | Substring? | What people try |
| --- | --- | --- |
| The Goonies | none | leave as `DROP` (likely an intruder) |
| Sharknado | none | `DROP` |
| The Long Goodbye (working #13) | `long` `good` | `long` |
| Léon: The Professional (issue #9 #13) | none | `DROP` |
| The Shining | `shine` is a stem, not a substring | `DROP` (not `shine`) |
| Raiders of the Lost Ark | `soft` only if you delete spaces | `soft` or `DROP` |
| Barry Lyndon | `bar` | `bar` |

If more than 10 lines are `DROP`, the rule is wrong — a title-to-word mapping is missing.

If fewer than 10 are `DROP`, the rest of the 10 intruders come from **IMDb** (step 3) or from the automatic drop-10 search (step 4).

## 3. IMDb table (only if you want to drop by a rule, not by search)

Author: *every extra fact is on each film’s IMDb page*.

Make a spreadsheet (Excel or Google Sheets) with columns: panel, title, year, MPAA, runtime, country, language, Oscars, “based on”.

A valid rule flags **exactly 10** films. Already **failed** (do not reuse): MPAA = R, won an Oscar, adapted from a novel.

If you find a 10-film rule, mark those panels `DROP` in `words34.txt` and you should have **exactly 24 words** — skip brute force and jump to step 5.

## 4. Let Cursor drop the 10 (when you have 24–31 real words)

From `crypto-puzzles/movie-enigma` with the venv on:

```powershell
python search_drop10.py
```

That script already encodes three public guesses. To use **your** list, put 34 tokens in `words34.txt` (`DROP` allowed) and run:

```powershell
python search_drop10.py --file words34.txt
```

- 2–3 `DROP` lines → extra combinations are millions, finishes in **under 2 minutes**.
- 0 `DROP` lines → C(34,10) ≈ 131 million checksums ≈ **15–20 minutes**.
- Output `MATCH` + 24 words + `FOUND.txt` = done.
- Output `no match` = your titles or word rule are still wrong. Change the file, run again. Do not grind random words.

## 5. If MATCH — take the coins

1. Open **Electrum** (install from electrum.org only).
2. Standard wallet → I already have a seed → paste the 24 words → **no extra passphrase**.
3. Native Segwit (p2wpkh / BIP84). First receive address must be  
   `bc1q94ecsn0qk8lap2gefrycnms3ruepy889z969a6`.
4. If it is not, stop. Wrong path or wrong words.
5. Send **all** to a wallet you created **before** this puzzle. Never paste the seed into a website or Telegram bot.

Miner fee will eat a visible slice of 100k sats. That is expected.

## What I already ran (2026-08-23)

| Word list | Forced DROP | Result |
| --- | --- | --- |
| Community issue #9 first words | Goonies, Léon, Sharknado | no match (2.6M combos) |
| Flo titles, longest substring + `soft` + `shine` | Goonies, Sharknado | no match (10.5M combos) |
| Flo titles, first substring + `soft` + `shine` | Goonies, Sharknado | no match (10.5M combos) |

So “open Cursor and extract the seed” is not possible until the **stills are identified correctly**. The missing work is movie-geek work, not more CPU.

## Honest end state

We will solve it **if and only if** the 34 stills and the title→word rule are right; then `search_drop10.py` finishes it. I cannot honestly print a 24-word seed today. Next human step is `NEXT.md` (panel 13 only), not more drop-10 on mixed IDs.
