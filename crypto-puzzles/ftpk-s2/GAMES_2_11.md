# Screenshots: games 2–6 and 8–11

User stills, 2026-08-23. Page filenames that are 64 hex chars are `sha256(meta-word)` — **not** the seed words.

| Game | Meta filename (`sha256`) | What the still shows |
| ---: | --- | --- |
| 2 | `last` | Red 2×2: slots **7** / BAR BAR, score **♩=120** 4/4 with 12–8–8 and a “2” badge, clock **~1:20:40**, GT-R **SEC** / **999** + lightbar |
| 3 | `game` | Three Kakuro-style sum grids + balloons/skydiver + **SW 1881** |
| 4 | `has` | `simplicity must be rewarded` |
| 5 | `for` | “Find the 13-digit number” + 13 long digit-rows + **Z** |
| 6 | `url` | Fake site `…/28e5ebab….html#accueil`. Logo **Évènementia** → `Simplicity Must Be Rewarded I` (non-hash slug) |
| 8 | `sentence` | Fall Guys art + overlay **A9759** |
| 9 | `that` | **3114** |
| 10 | `is` | Buttons Text 1–4; four texts (dark poem, sea poem, French Braille, substitution poem) |
| 11 | `hashed` | Address `0x50D7e097e61121140c19871F06eA6FeB6d14105b` |

**Still 0/12 locked.** Below: strongest BIP39 *candidates* only.

## Game 2 — four timed/lucky pictures

Shared motifs: **7**, tempo **120** (same as 1:20 on the clock), **2** / **SEC** / second-hand, **999** (UK emergency) + police lights.

| Candidate | Why |
| --- | --- |
| `seven` | Giant 7; “simplicity must be rewarded” |
| `second` | Badge 2, plate SEC, 120 BPM = 2 beats/s, second hand |
| `time` / `clock` | Tempo + analog clock |
| `lucky` / `bar` | Slot 7 + BAR BAR |
| `alert` | 999 + lightbar |

Not locked. Need a clearer rule (one number from each tile, or one rebus).

## Game 3 — Kakuro + SW 1881

The three 4×4 interiors are fully determined by the sums (OCR of the *clues* is internally consistent):

```
20 20  7  8     19 14  5  3      6  4 15 12
20  5  1 17      9 12  7 26     14 17 26 32
 3 12 11  3     10 13  5  8     18 12 25 13
 9 19  4 18     21 17  5  4      7 19  8  9
```

**SW 1881** as 1-based BIP39 index = **`twelve`**. (0-based would be `twenty`.) Balloons/skydiver may be decoy (same author used named decoys on game 1) or a second reading (`air` / `fly` / `jump` / `cloud` / `float`).

Flo’s “visual diagonal” note was for **game 5**, not this page.

## Game 4 — one line

Text is exactly the author’s motto. BIP39: **`simple`** (from *simplicity*) or **`reward`**. Prefer **`simple`**.

## Game 5 — 13-digit filename

Instruction: visit `https://findtheprivatekeys2.vercel.app/<13 digits>.html`.

User confirmed the first batch of URLs **all 404**. Those used a **matrix** diagonal `(row i, column i)`, which Flo already knew 404s, plus a **26-digit row 7** that was a misread.

Correct grid: **13 rows × 25 digits**, then a centered **z**. Row 7 is `9544540031089899912206147` (25 digits).

Flo: the reading that 200s is a **visual** diagonal of the rendered block (corner to corner of the 13×25 rectangle = every **other** column), not the matrix diagonal.

Try in this order (Chrome, on your laptop):

1. **`5509589357423`** — visual NW→SE (top-left to bottom-right)
2. **`2456049338213`** — visual NE→SW (top-right to bottom-left; matches the **z** / southwest hint)
3. **`5922019519604`** — center column (z sits under the middle)
4. **`2203747686583`** — last column (z = last letter)

Do **not** retry `5578704735424` / `2930361455644` / `2203744686583` / the 26-digit splits — those 404’d.

**Hit (user, 2026-08-23):** `https://findtheprivatekeys2.vercel.app/5509589357423.html` is a real page. Next step is another 13-digit URL.

That page: 12 lines × **12 digits**, motto **simplicity must be rewarded C**. EAN-on-diagonal URLs **404’d**. `C` may mean calculate/sum, letter 3, or just the next motto stamp.

Grid (from the still):

```
123456789013
453219876540
950110148630
084002017891
370123456789
002345678912
606015100003
072345678907
060123456781
303005007292
046000001126
978030456783
```

**404 family (do not retry):** EAN-on-diagonal `1500251762232`, ISBN `9780304567836`, NE–SW+EAN `3467565413497`, sum `4048777668667`, keep-reading `1234567890134`, sequential `1234567890123`, diag+C `1500251762233`, 12-digit diag `150025176223`, column C `330402620368`, `150025176223C.html`, UPC→EAN `0084002017891` / `0606015100003`.

Page 1’s **z** sat under the **middle** of a 13×25 block (center-column candidate). Page 2’s **C** sits **bottom-left**, so the same grammar is “left column + C=3”, not “barcode the diagonal”.

Only two of the twelve lines are valid UPC-A (`084002017891`, `606015100003`); treating those as the answer already 404’d.

Try in this order (Chrome). Skip anything already 404:

1. **`1490306003093`** — first column `149030600309` + footer **C=3** (z-under-grid analogue)
2. **`1234567890135`** — first line + EAN-13 check (“simplicity”)
3. **`3943141747843`** — **C** then NE from bottom-left along the anti-diagonal
4. **`3487471413493`** — anti-diagonal `348747141349` + **C=3**
5. **`5150025176223`** — stack page-1 slug `5509589357423` as an extra 13th row (left-pad the 12-digit lines) and take the visual diagonal
6. **`3150025176223`** — pad a 13×13 of **3**s at top/left, visual diagonal

Still not the seed word until a page 200s.

## Game 6 — Évènementia

`#accueil` fake events agency. `événement` ≈ event/party. **`event` is not BIP39.** Closest: **`party`**, **`festival`**, **`host`**, **`gather`**, **`invite`**. Logo hop to “Simplicity Must Be Rewarded **I**” may be a gimmick (`one` / `first`) or a pointer back to game 4’s motto.

## Game 8 — Fall Guys + A9759

Simple readings: **`fall`** (title) or **`bean`** (jellybean bodies). `win` / `jump` / `funny` / `pink` weaker. **A9759** may be a next slug (`A9759.html`) rather than the word; 9759 mod 2048 = 1567 → `sense` / `sentence` (meta, ignore).

## Game 9 — 3114

A1Z26 with grouping **3, 1, 14** → C A N → **`can`**. Other splits (3-11-4, 31-14) are not letters. Index 3114 is outside 1…2048.

## Game 10 — four texts

Flo: line acrostics on the two poems **do not** spell a word. Extra two texts:

1. Dark / “bro” poem — BIP39 hits include `whisper`, `silent`, `shadow`, `magic`, `night`, `mirror`.
2. Sea poem, punchlines `i feel good` / `still alone at sea` — `ocean`, `wave`, `still`, `good`, `whisper`.
3. Braille French: *le ciel est le miroir de l’âme… le silence ici n’est pas une absence…* → **`mirror`**, **`silent`**, `soul`, `fog`, `world`.
4. Cryptogram (QHO=THE, etc.) plaintext:

```
IN THE LAND WHERE RIVERS GENTLY MEET,
A CITY STANDS, BOTH GRAND AND DISCREET.
MARBLE PILLARS RISE TO TOUCH THE SKY,
WHERE ECHOES OF THE PAST STILL LIE.

BENEATH THE WATCHFUL EAGLE'S GATE,
A SILENT SENTINEL THROUGH ENDLESS DAYS.
THE AIR IS FILLED WITH WHISPERED LORE,
OF BATTLES FOUGHT, OF FREEDOM'S CORE.
```

Shared across texts: **`where`** (noise), **`silent`** (1+3+4), **`whisper`** (1+2+4), **`mirror`** (1+3), **`still`** (2+4). Best single-word guesses: **`silent`**, then **`whisper`** / **`mirror`**.

## Game 11 — the address

`0x50D7e097e61121140c19871F06eA6FeB6d14105b` is **exactly** the author’s Game 11 worked example in `tools/oracle.py` (`claim cycle staff clump domain judge boy session razor tiny shoulder coconut`). The page is the tutorial, not the escrow. Contest word is still separate: simplest labels **`example`** or **`address`**. Do **not** import that 12-word example as the prize seed.

## Do not brute yet

Game 7 stays last. No full 12-word list until more of these are confirmed (game 5 needs a 200 URL; 2/3/6/8/10 still multi-candidate).
