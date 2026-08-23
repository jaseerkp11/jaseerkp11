# Status after panel 13

Panel **13 is locked** as **Léon: The Professional** (1994) from your ID. Issue #9 was right. *The Long Goodbye* is out.

There is **no seed yet**. Do not grind unbounded C(34,10).

## No human still-work left

Unless you disagree with *Spartacus* (#9) or *Close Encounters* (#24), titles are frozen in `titles34.txt`.

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

## What I do next (no extra task for you)

1. Bounded drop-10 on `words34.txt` (4 forced `DROP`s → C(30,6) checksums).
2. Optional second list: `tornado` for Sharknado, `shine` for The Shining, still `DROP` Goonies + Léon.
3. Only if a MATCH appears: write `FOUND.txt` and stop.

If both searches miss, the missing piece is still **how Léon and Goonies become BIP39 words** (or a different title on a non-disputed panel). That is insight, not more CPU.
