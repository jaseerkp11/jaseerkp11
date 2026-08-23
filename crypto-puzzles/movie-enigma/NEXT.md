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

## Search results (already ran)

| List | Forced DROP | Result |
| --- | --- | --- |
| `words34.txt` longest substring | 8, 13, 26, 33 | no match (593,775 / 4.4s) |
| `words34_loose.txt` + tornado/shine | 8, 13 | no match (10,518,300 / 78s) |

No `FOUND.txt`. Prize still unspent.

If you want a tiny optional look: panel **8** is still only PROBABLE *The Goonies*. A different title there could supply a real BIP39 word. Not required.

The missing piece is **how Léon and Goonies become BIP39 words** (or one wrong non-disputed title). That is insight, not more CPU.
