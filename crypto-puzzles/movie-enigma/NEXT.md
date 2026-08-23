# Status after panel 13

Panel **13 is locked** as **Léon: The Professional** (1994) from your ID. Issue #9 was right. *The Long Goodbye* is out.

There is **no seed yet**. Do not grind unbounded C(34,10).

## No human still-work left

Titles are frozen in `titles34.txt`. Panel **8 is *The Goonies*** (your confirm: Perkins/Troy, rain, Walsh house). Panel **13 is *Léon***.

## Remaining hole (this is the puzzle)

Official English BIP39, spaces deleted, **no** match:

| Panel | Title | Notes |
| ---: | --- | --- |
| 8 | The Goonies | no substring |
| 13 | Léon: The Professional | no substring |
| 26 | Sharknado | no substring (`tornado` is a portmanteau, not a substring) |
| 33 | The Shining | `shine` is **not** inside `shining` |

That is **4** wordless titles. The author drops **10** IMDb “intruders”. If the word rule is strict substring, those 4 are likely among the 10, and 6 more must come from IMDb.

`soft` in *Raiders of the Lost Ark* only appears if you glue words (`raiders`**oft**`he`). Weak.

Year &lt; 1980 is again exactly 10 films on this list (Léon is 1994, so it does not join that set). Year ≥ 2000 is also 10. **Neither** can produce 24 words while Goonies / Léon / Sharknado / Shining stay wordless, because those four are not all inside one year bucket.

## Search results (already ran)

| List | Forced DROP | Result |
| --- | --- | --- |
| `words34.txt` longest substring | 8, 13, 26, 33 | no match (593,775 / 4.4s) |
| `words34_loose.txt` + tornado/shine | 8, 13 | no match (10,518,300 / 78s) |

No `FOUND.txt`. Prize still unspent.

The missing piece is **how Léon and Goonies become BIP39 words** (or one wrong remaining title). That is insight, not more CPU. No further still glance is required.

## Extra searches 2026-08-23 (still no seed)

Unique 4-letter prefix, first token hit (`prefix_first.txt`): Goonies / Godzilla / Raiders = DROP. Then drop 7 more: **no match** (2,629,575).

Same with last token (`prefix_last.txt`): **no match**.

Prefix + substring fallback (`ill` / `soft`, Goonies still DROP): **no match** (38,567,100, 4.9 min).

Wikidata: **year ≥ 2000** is exactly 10 films. Those 10 keepers still include Goonies (1985) with no word, so that split cannot be checked.

Still no `FOUND.txt`. Prize unspent.

## Rejected 2026-08-23: unique 4-letter prefix + IMDb votes < 250k

See `REJECT_PREFIX_RATINGS.md`. Unique BIP-39 prefixes do **not** send Goonies→`good`, Léon→`legal`/`lesson`, Sharknado→`shark`, Shining→`shiver`. Live IMDb votes `< 250k` mark **16** films, not 10. No oracle, no seed.

## ChatGPT AKA pass (rejected) + 3-as-intruders (already empty)

Do **not** use `treasure` / `perfect` / `storm`. `treasure` and `storm` are **not** BIP39 English words. Localized AKAs are unbounded (any language can mint a word). ChatGPT’s own follow-up was right to unlock those.

The useful branch was: community 3 wordless titles (**Goonies, Léon, Sharknado**) are 3 of the 10 intruders; Shining → `shine`; longest substring elsewhere. That search (`words34_3drop.txt`) is **no match** (2,629,575 / 19.6s). Flo also reports timothy-barus already emptied ~1.23e9 checksum-valid seeds on metadata rules with two wildcards.

**Honest stop on Movie Enigma:** stills are locked, AKA is a dead rule, 3-as-intruders is empty, unique prefix is empty. Next hunt is FTPK Season 2, not more Movie Enigma CPU.
