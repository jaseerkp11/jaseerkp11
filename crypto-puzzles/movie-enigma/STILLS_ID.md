# Visual IDs from the published stills

Source stills (author site, not stored in the puzzle git tree):

| Panel | URL |
| ---: | --- |
| 3 | https://www.bitcoinmovieenigma.com/blog/03 |
| 5 | https://www.bitcoinmovieenigma.com/blog/05 |
| 9 | https://www.bitcoinmovieenigma.com/blog/09 |
| 13 | https://www.bitcoinmovieenigma.com/blog/13 |
| 14 | https://www.bitcoinmovieenigma.com/blog/14 (not in your list; pulled because it was UNCERTAIN) |
| 16 | https://www.bitcoinmovieenigma.com/blog/16 |
| 23 | https://www.bitcoinmovieenigma.com/blog/23 |
| 24 | https://www.bitcoinmovieenigma.com/blog/24 |
| 27 | https://www.bitcoinmovieenigma.com/blog/27 |

No C(34,10). Puzzle CSVs not edited.

| Panel | Canonical CSV | Issue #9 | What the still shows | Best title | Confidence | Literal BIP39 substrings |
| ---: | --- | --- | --- | --- | --- | --- |
| 3 | Alien | Aliens | M41A pulse rifle on a teal ops desk, block **70**, colony/lab set | **Aliens** (1986) | **CONFIRMED** | `alien` |
| 5 | Star Trek: The Motion Picture | Alien | White quilted Nostromo suit; locker tag **RIPLEY**; Narcissus finale | **Alien** (1979) | **CONFIRMED** | `alien` |
| 9 | Duel in the Sun | Spartacus | Couple kissing on a **green** hillside at dusk, trees, not desert rock | **Spartacus** (1960) | **CONFIRMED** | `art` |
| 13 | Goodfellas | Léon: The Professional | Tight CU of a mustached man by blinds, checking a chronograph | **The Long Goodbye** (1973) | **PROBABLE** | `long` `good` |
| 14 | Eyes Wide Shut | The Man in the Iron Mask | Baroque gold stick-masks, huge blond court wig, red-gold coats | **The Man in the Iron Mask** (1998) | **CONFIRMED** | `iron` `mask` `man` `ask` |
| 16 | The 13th Warrior | The Visitors | Headless knight in armour standing in a flowered meadow (opening gag) | **The Visitors** / *Les Visiteurs* (1993) | **CONFIRMED** | `visit` |
| 23 | Valerian… | Guardians of the Galaxy | Nova Corps gold 3-point badges, white-haired Nova Prime, Xandar hologram | **Guardians of the Galaxy** (2014) | **CONFIRMED** | `galaxy` `guard` |
| 24 | Ordinary People | Close Encounters… | 1970s mansard-roof McDonald’s at night, muscle cars, patio umbrellas | **Close Encounters of the Third Kind** (1977) | **CONFIRMED** | `close` `kind` |
| 27 | The Lost Boys | Terminator 2: Judgment Day | Worm’s-eye biker/engineer boots on wet asphalt at night | **Terminator 2: Judgment Day** (1991) | **CONFIRMED** | `day` `term` |

## Notes per still

**3.** Pulse rifle + underslung launcher is *Aliens*, not 1979 *Alien*. Issue #9 is right.

**5.** “RIPLEY” on the locker and the quilted suit are the *Narcissus* ending of *Alien* (1979), not TMP.

**9.** Green grass, trees, terracotta dress, rustic tunic: the Spartacus / Varinia hillside scene, not *Duel in the Sun*’s desert climax. Treated as **CONFIRMED** unless a human names a better match.

**13.** Not a famous Ray Liotta / Pesci *Goodfellas* composition, and the face is not Jean Reno. Warm 1970s grain, thick mustache, three-register chronograph, bright window/blinds: better fit for **Terry Lennox** in Altman’s *The Long Goodbye* (1973) than *Léon*. Issue #9 still says *Léon* (which has **no** BIP39 substring). Keep **PROBABLE** until a human yes/no.

**14.** Court masquerade with handled gold masks and a Louis XIV wig is *The Man in the Iron Mask*, not Kubrick’s *Eyes Wide Shut* mansion.

**16.** Opening of *Les Visiteurs*: Godefroy beheads the giant English knight; the body stays standing. That is not *The 13th Warrior*.

**23.** Nova Corps briefing on Xandar. Not *Valerian*.

**24.** Period McDonald’s night exterior (mansard roof, neon, patio umbrellas, muscle-car tail lights) is the Muncie stretch of *Close Encounters*. *Ordinary People* has no such shot. Treated as **CONFIRMED** unless a human names a better 1970s McDonald’s film.

**27.** T-800 biker-bar boots, not *The Lost Boys*.

## Unresolved

- **13** — PROBABLE *The Long Goodbye* vs issue #9 *Léon*. Human glance: `/blog/13`.

## Accept vs inspect

**Accept from the still:** 3 *Aliens*, 5 *Alien*, 9 *Spartacus*, 14 *The Man in the Iron Mask*, 16 *The Visitors*, 23 *Guardians of the Galaxy*, 24 *Close Encounters of the Third Kind*, 27 *Terminator 2: Judgment Day*.

**Still worth a second look:** 13 only. See `NEXT.md`.
