# What you do next (one small look)

I already: locked a working 34-title file from the stills, extracted every official BIP39 substring, proved year-splits cannot fill 24 words under a substring rule, and checked the prize is still **100,000 sats unspent**.

There is **no seed yet**. Do not grind C(34,10).

## Your only job (2 minutes)

Open panel **13** and say which movie it is:

https://www.bitcoinmovieenigma.com/blog/13

Reply with one of:

1. **The Long Goodbye** (1973) — mustache, chronograph, blinds, 1970s grain (current working guess)
2. **Léon: The Professional** (1994) — issue #9
3. **something else** (name it)

Panels **9** (*Spartacus* hillside kiss) and **24** (*Close Encounters* 1970s McDonald’s at night) are treated as locked unless you disagree.

## What I will do after that

- Freeze the 34 titles
- Keep using one word rule (longest official substring, `DROP` if none)
- Only then look for an IMDb field that marks **exactly 10** films
- Only then run **one** 24-word oracle check (or a bounded drop-10 if all 34 words exist)

## Files

| File | What it is |
| --- | --- |
| `titles34.txt` | Working 34 titles, panel order |
| `extract_bip39.py` | Lists official BIP39 substrings |
| `words34.txt` | Longest substring per title (`DROP` = none) |

## Substring holes (this is the remaining insight)

Official English BIP39, spaces deleted, **no** match:

- 8 The Goonies
- 26 Sharknado
- 33 The Shining (`shine` is **not** inside `shining`)

`soft` in *Raiders of the Lost Ark* only appears if you glue words together (`raiders`**oft**`he`). That is a weak word.

Year &lt; 1980 and year ≥ 2000 each look like “exactly 10” on older lists. They **break** if panel 13 is *The Long Goodbye* (1973). They also cannot produce 24 words while Goonies / Sharknado / Shining have no substring. Those year rules are **not** the solve.
