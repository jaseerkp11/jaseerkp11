# Rejected: 4-letter prefix + IMDb votes < 250k

Tested 2026-08-23 against official BIP-39 English (2048 unique 4-letter prefixes) and IMDb `title.ratings.tsv` (datasets.imdbws.com).

No oracle run. No seed. No C(34,10).

## Claimed hole words vs unique prefix

BIP-39 is uniquely keyed by the first 4 letters. That part of the claim is real. The four hole mappings are **not** that function:

| Title | First 4 of core token | Unique BIP-39 word for that prefix | Claimed | Result |
| --- | --- | --- | --- | --- |
| The Goonies | `goon` | **none** | `good` | Fail (`good` is prefix `good`) |
| Léon | `leon` | **none** | `legal` or `lesson` | Fail (two words, neither is `leon`) |
| Sharknado | `shar` | `share` | `shark` | Fail (`shark` is prefix `shar`? `shar` → `share`, next is `sharp`; `shark` is `shar`+k but uniqueness already assigned `share`) |
| The Shining | `shin` | `shine` | `shiver` or `shine` | `shine` is the unique prefix; `shiver` is `shiv` |

Two-option holes (`legal`/`lesson`, `shine`/`shiver`) are the opposite of “zero ambiguity.”

A consistent unique-prefix pass over **all 34** titles also fails uniqueness: several titles have two hits (`path`/`glory`, `miss`/`impose`, `man`/`iron`/`mask`, `guard`/`galaxy`, …). Spartacus → `spare`, Sharknado → `share`, Scream → `screen`, Star → `start`. That is a different 34-word line than longest substring, and Goonies / Godzilla / Raiders still have **no** 4-letter hit.

## Claimed intruder filter: IMDb votes < 250,000

Correct tt IDs (Ghostbusters II is `tt0097428`, Crimson Rivers is `tt0228786`):

**16** of 34 films are under 250k votes, not 10.

Nearby cutoffs on the same dump: `< 200k` = **9**, `< 150k` = **6**. Nothing lands on 10.

Vote counts move daily. A puzzle from 2024 cannot depend on a 2026 live threshold anyway.

## Order

Author rules: drop 10 from the **34-panel sequence**, keep remaining order. Sorting by release year is a second, extra rule. “Panel order **or** year order” is again two answers.

## What was not run

No 24-word check of `good` / `legal` / `shark` / `shiver` mixes. That would be guessing, not the unique prefix map.
