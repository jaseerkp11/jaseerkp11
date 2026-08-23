# Bitcoin Movie Enigma — current state

Inspected the published research folder  
`3-small-prizes/bitcoin-movie-enigma-100ksats/`  
(from [floflo777/open-crypto-puzzles](https://github.com/floflo777/open-crypto-puzzles)).

On-disk files (README names in parentheses when they differ):

| Path | Role |
| --- | --- |
| `README.md` | Narrative; some lead text is stale vs CSV |
| `puzzle.json` | Machine index; leads slightly stale |
| `data/films.csv` | Canonical 34 IDs + BIP39 substring guesses |
| `data/films_community_issue9.csv` | Alternate 34 IDs (issue #9) |
| `analysis/tested.md` | Negatives ledger |
| `analysis/leads.md` | Ranked leads + community reconciliation |
| `clues/author-posts.md` | Author quotes |
| `tools/oracle.py` | 24-word verifier (`--selftest`) |
| `tools/fig_panel_grid.py` | Grid SVG generator |
| `images/02-panel-grid-identification.svg` | Confidence grid |

No drop-10 search, no private-key search, no broadcast. Oracle **self-test only**.

**Status: OPEN.** Escrow `bc1q94ecsn0qk8lap2gefrycnms3ruepy889z969a6` was recorded funded and unspent (100,000 sats) on 2026-08-16. There is **no solved 24-word seed** in this folder.

**Important:** the orange tiles on the 34-panel grid are **not** the 10 intruders. They are films whose *identification* is probable, uncertain, or disputed. The 10 IMDb intruders are **unknown**.

Internal inconsistency in the write-up: `README.md` / `puzzle.json` still say panel 11 is unidentified and panel 34 is unresolved; `data/films.csv` and the later section of `analysis/leads.md` say both were closed by community reports in August 2026. The tables below follow **`data/films.csv`** as the canonical ID file, and **`data/films_community_issue9.csv`** as the alternate list.

---

# Confirmed 34 Films

**File:** `data/films.csv` (canonical, Flo’s 2026-08-04 pass + community closes for 11, 30, 34). On disk the same table is `data/films.csv`.

| Panel | Title (canonical) | Confidence | Notes |
| ---: | --- | --- | --- |
| 1 | Die Hard | confirmed | |
| 2 | Paths of Glory | confirmed | |
| 3 | Alien | confirmed | Community: *Aliens* (1986) |
| 4 | Mad Max | confirmed | |
| 5 | Star Trek: The Motion Picture | probable | Community: *Alien* (1979) |
| 6 | Apocalypse Now | confirmed | |
| 7 | Escape from Alcatraz | confirmed | |
| 8 | The Goonies | confirmed | Human: Perkins/Troy rain scene at Walsh house |
| 9 | Duel in the Sun | confirmed | Community: *Spartacus* |
| 10 | Mission: Impossible | confirmed | |
| 11 | Godzilla | confirmed-community | README lead #1 is stale (still describes buried tuna boxes) |
| 12 | Life of Pi | confirmed | |
| 13 | Goodfellas | confirmed | Community: *Léon: The Professional* |
| 14 | Eyes Wide Shut | confirmed | Community: *The Man in the Iron Mask* |
| 15 | The Crimson Rivers | confirmed | |
| 16 | The 13th Warrior | probable | Community: *The Visitors* |
| 17 | A Clockwork Orange | confirmed | |
| 18 | Star Wars: A New Hope | confirmed | |
| 19 | Gravity | confirmed | |
| 20 | First Man | probable | |
| 21 | Solaris | probable | |
| 22 | Blade Runner 2049 | confirmed | |
| 23 | Valerian and the City of a Thousand Planets | confirmed | Community: *Guardians of the Galaxy* |
| 24 | Ordinary People | probable | Community: *Close Encounters of the Third Kind* |
| 25 | Barry Lyndon | confirmed | |
| 26 | Sharknado | probable | |
| 27 | The Lost Boys | uncertain | Community: *Terminator 2: Judgment Day* |
| 28 | Scream 2 | confirmed | |
| 29 | The Matrix Reloaded | probable | |
| 30 | Toy Story 2 | confirmed-community | |
| 31 | Ghostbusters II | confirmed | |
| 32 | Raiders of the Lost Ark | confirmed | |
| 33 | The Shining | confirmed | |
| 34 | The Human Centipede (First Sequence) | confirmed-community | Settles Dead Ringers vs Centipede in this CSV |

Nine panels still disagree with `data/films_community_issue9.csv` (file: `data/films_community_issue9.csv`): **3, 5, 9, 13, 14, 16, 23, 24, 27**.

Grid colours (`images/02-panel-grid-identification.svg`, legend in README): blue = confirmed, orange = probable / uncertain / disputed, grey = unidentified. That figure is **older** than the CSV (README still talks about grey panel 11).

---

# Candidate BIP39 Words

Working hypothesis in this folder (not proven): take English BIP-0039 words that appear as a **literal substring** of the title. Several titles have **more than one** hit; four canonical titles have **none**.

## Canonical (`data/films.csv`)

| Panel | Title | Candidate word(s) |
| ---: | --- | --- |
| 1 | Die Hard | hard |
| 2 | Paths of Glory | glory; path |
| 3 | Alien | alien |
| 4 | Mad Max | mad |
| 5 | Star Trek: The Motion Picture | motion; picture |
| 6 | Apocalypse Now | now |
| 7 | Escape from Alcatraz | escape |
| 8 | The Goonies | **none** |
| 9 | Duel in the Sun | sun |
| 10 | Mission: Impossible | miss; possible |
| 11 | Godzilla | ill |
| 12 | Life of Pi | life |
| 13 | Goodfellas | good |
| 14 | Eyes Wide Shut | eye; wide |
| 15 | The Crimson Rivers | river |
| 16 | The 13th Warrior | warrior |
| 17 | A Clockwork Orange | clock; orange; range; work |
| 18 | Star Wars: A New Hope | hope |
| 19 | Gravity | gravity |
| 20 | First Man | first; man |
| 21 | Solaris | solar |
| 22 | Blade Runner 2049 | blade |
| 23 | Valerian and the City of a Thousand Planets | city; planet; sand |
| 24 | Ordinary People | ordinary; people |
| 25 | Barry Lyndon | **none** |
| 26 | Sharknado | **none** |
| 27 | The Lost Boys | boy |
| 28 | Scream 2 | cream |
| 29 | The Matrix Reloaded | matrix |
| 30 | Toy Story 2 | story; toy |
| 31 | Ghostbusters II | ghost |
| 32 | Raiders of the Lost Ark | **none** |
| 33 | The Shining | shine |
| 34 | The Human Centipede (First Sequence) | human; man; tip |

## Community (`data/films_community_issue9.csv`)

Permissive reading (substring, prefix, stem, or joining tokens). Differences that matter:

| Panel | Community title | Community words |
| ---: | --- | --- |
| 3 | Aliens | alien |
| 5 | Alien | alien |
| 8 | The Goonies | **none** |
| 9 | Spartacus | art |
| 13 | Léon: The Professional | **none** |
| 14 | The Man in the Iron Mask | iron; mask; man; ask |
| 16 | The Visitors | visit |
| 23 | Guardians of the Galaxy | galaxy; guard |
| 24 | Close Encounters of the Third Kind | close; kind |
| 25 | Barry Lyndon | bar |
| 26 | Sharknado | **none** |
| 27 | Terminator 2: Judgment Day | day; term |
| 32 | Raiders of the Lost Ark | soft (from concatenated “raiders**oft**he…”) |
| 34 | The Human Centipede (First Sequence) | human; first |

Community titles with **no** word even under that permissive reading: **The Goonies, Léon: The Professional, Sharknado**.

---

# 10 Intruders

**Not known.** The author only said: after you have 34 words, 10 films are “intruders,” and the extra facts are on each film’s **IMDb** page.

Nothing in `data/` or `analysis/` names a final set of 10.

Do not treat the 10 orange grid tiles as the intruders. Those tiles (in the README figure) are identification confidence: panels 5, 8, 9, 16, 20, 21, 24, 26, 27, 29 in the screenshot — a different question from “which 10 words to drop.”

Tried IMDb-style splits (see Previous Research) never yielded a stable exact 24-vs-10 cut once all IDs were in.

---

# Remaining 24 Words

**Not known.** You only get 24 words after:

1. one correct title per panel,
2. one BIP39 word per title,
3. dropping the 10 IMDb intruders **in panel order** (not reshuffling).

Until (1)–(3) are solved, there is no 24-word candidate to treat as the seed.

---

# Transformation Rules

From the author’s rules page (`clues/author-posts.md`), verbatim mechanism:

1. Guess all **34** titles from the frames (panel order is the sequence).
2. Transform **“somehow”** each title into **one English BIP-0039 word**.
3. The list is then 34 words long; **10 movies are intruders**. Extra facts for detecting them are on **IMDb** (author writes “IMBD”). He suggests an Excel table.
4. After dropping those 10, restore the wallet with the remaining **24 words** in the same order. No passphrase is stated. Escrow is P2WPKH (`bc1q…`), so BIP84 `m/84'/0'/0'/0/i` is the main guess; the oracle also tries BIP49, BIP44, and three raw paths.

What this folder has **not** proven:

- which substring to keep when a title has several BIP39 hits,
- how to map titles with **none**,
- whether `shine` from *The Shining* (stem, not a raw substring of “shining”) is intended,
- which IMDb field marks the 10 intruders.

---

# Previous Research

From `analysis/tested.md` and the README table:

| What was tested | Result |
| --- | --- |
| Individual stills vs the single “alternative release” image (MD5) | Identical 34/34. Combined image adds nothing. (2026-08-03) |
| Intruders = MPAA R | Looked like 10/18 early; broke at 16–18/34. **Refuted.** |
| Intruders = won ≥1 Oscar | Looked like 10/21; broke at 11/34 when *Ordinary People* was counted. **Refuted.** |
| Intruders = adapted from a novel | Looked like 10/31; broke at 12/34. **Refuted.** |
| ~25 further IMDb / binary fields (country, decade, runtime band, B&W vs colour, single-word title, etc.) | None gave an exact 24/10 split. (2026-08-04) |
| Literal-substring base rate | 29/33 then-identified titles contain ≥1 BIP39 substring; 4 contain none (*Goonies, Barry Lyndon, Sharknado, Raiders*). Rules out “exactly one obvious word in every title.” |

Community follow-up (`analysis/leads.md`): timothy-barus reported three metadata-rule escrow sweeps (share-a-year, year ≥ 2000, ten shortest runtimes) with two-position wildcards, ~1.23e9 checksum-valid seeds, **all empty**. Those runs are **not reproduced** in this folder.

Method note in `tested.md`: three different IMDb rules each looked right on an **incomplete** film list and died when the next ID landed. Do not lock a 10-film rule before the 34 titles are trusted.

---

# Remaining Leads

Ranked as the folder now stands (later half of `analysis/leads.md` overrides the stale “identify panel 11” README lead):

1. **Reconcile the nine disputed panels against the actual stills** (3, 5, 9, 13, 14, 16, 23, 24, 27). Wrong title ⇒ wrong word ⇒ seed unreachable. Scene-specific viewer notes in issues #9 / #3 are treated as stronger than still-only ID.
2. **Title → word for the leftover wordless titles.** Under the community list that is *Goonies*, *Léon*, *Sharknado*. Under the canonical list that is *Goonies*, *Barry Lyndon*, *Sharknado*, *Raiders* (unless you accept `bar` / `soft`).
3. **IMDb field for the 10 intruders** — only after the 34 titles are stable. Do not grind more binary fields on a mixed ID table.
4. **Stale README leads** (panel 11 tuna boxes; Dead Ringers vs Centipede) are **closed in `data/films.csv`** (Godzilla; Human Centipede). Do not spend time there unless you reject the community closes.

`puzzle.json` still lists old lead ranks 1–4 (panel 11, panel 34, four wordless titles, IMDb field) and `tested_total.candidates: 0`. Treat JSON as slightly behind `leads.md`.

---

# Oracle / Verification

**File:** `tools/oracle.py`  
**Target:** `bc1q94ecsn0qk8lap2gefrycnms3ruepy889z969a6`

It is a **verifier**, not a searcher. It does **not** enumerate C(34,10).

Given one 24-word string it:

1. Requires exactly 24 tokens and a valid BIP39 checksum (`Bip39MnemonicValidator`). Invalid checksum → `NO MATCH`.
2. Turns mnemonic (+ empty passphrase) into a seed.
3. Derives addresses for BIP84, BIP49, BIP44, accounts 0–1, indices 0–2, plus raw `m/0/0`, `m/0'/0'`, `m/44'/0'/0'/0/0` encoded as P2WPKH.
4. Compares each to the escrow. Hit → `MATCH <address> via <path>` (exit 0). Else `NO MATCH` (exit 1).

CLI: `python3 tools/oracle.py --selftest` · `python3 tools/oracle.py "w1 … w24"` · `--stdin` for one candidate per line.

The docstring says: once all 34 words are known, generating every 24-word reduction yourself and piping them in is ~512k checksum-valid candidates, ~85 minutes with this Python oracle. **That search was not run in this inspection.**

### Self-test (this session)

Command: `python3 tools/oracle.py --selftest`

```
public BIP84 test vector (12 words) -> bc1qcr8te4kr609gcawutmrza0j4xv80jy8z306fyu: OK
24-word chain derives a non-empty address: OK
checksum filter rejects a 1-word-off variant: OK
negative control (public vector vs escrow) -> no match: OK
SELFTEST OK
```

Vectors used: 12× `abandon`+`about` → published BIP84 address; 24× `abandon`+`art` checksum-valid and derives *some* address; `abandon`×23+`about` rejected; public 24-word vector does **not** hit the puzzle escrow.

No other oracle calls. No C(34,10). No keys generated. No transaction.

---

# Recommended Next Step

Do **not** run unbounded C(34,10). Bounded drop-10 on the frozen list already missed.

Working files in this repo (not Flo’s CSV): `titles34.txt`, `words34.txt`, `extract_bip39.py`, `NEXT.md`.

1. Panels 8 and 13 are human-confirmed (**The Goonies**, **Léon: The Professional**). Titles are frozen unless a remaining still is wrong.
2. Title → word is still the hole: Goonies, Léon, Sharknado, and The Shining have **no** official BIP39 substring. `shine` is not inside `shining`.
3. Year&lt;1980 and year≥2000 are each 10 films again (Léon is 1994). They still cannot fill 24 words while four titles are wordless.
4. Bounded drop-10 on `words34.txt` (4 forced DROPs, C(30,6)): **no match**. Loose list with `tornado`/`shine`: **no match**. Not a full C(34,10).

Highest-value leftover: **how Léon and The Goonies become BIP39 words**, not more CPU.
