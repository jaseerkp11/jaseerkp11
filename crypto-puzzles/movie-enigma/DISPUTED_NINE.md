# Disputed panels 3, 5, 9, 13, 14, 16, 23, 24, 27

**Later pass:** author-site stills were viewed; panel 13 is **Léon: The Professional** (human). Working titles live in `titles34.txt` and `STILLS_ID.md`. This page is the older CSV-vs-issue-#9 ledger and is **not** the working list.

Puzzle data files were **not** changed. No C(34,10) search. No keys. Oracle not re-run.

**Visuals:** this folder’s `images/` contains only `02-panel-grid-identification.svg` (confidence colours). The 34 stills are **not** stored here (third-party frames). Identifications below use `data/films.csv`, `data/films_community_issue9.csv`, `analysis/leads.md`, and [GitHub issue #9](https://github.com/floflo777/open-crypto-puzzles/issues/9) (garrou, deviceio121, SmallCakekoo frame-match links). This agent did **not** see the puzzle JPEGs.

BIP39 column = **literal contiguous** substrings of the exact title string (case-insensitive). Stem / join / accent tricks are **not** included. The substring rule is **not** treated as proven.

| Panel | Canonical CSV | Issue #9 CSV | Visual identification | Best title | Confidence | BIP39 substring candidates | Evidence |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 3 | Alien | Aliens | Still not in repo. Community: Colonial Marines hardware, not the 1979 *Nostromo* look. | **Aliens** (1986) | **PROBABLE** | `alien` (same for *Alien*) | Canonical is the 1979 film. Issue #9 opener did not list #3; deviceio121 = Aliens; SmallCakekoo: [same frame on a Colonial Marines / *Aliens* post](https://johnkennethmuir.wordpress.com/2012/02/10/sci-tech-4-colonial-marines-edition/). Flo left this among the nine to reconcile. *Alien* stays possible until the still is viewed. |
| 5 | Star Trek: The Motion Picture | Alien | Still not in repo. Watcher: last scene leaving the ship. | **Alien** (1979) | **PROBABLE** | Canonical title: `motion`; `picture`. Community title: `alien` | garrou: “Alien 1979 (last scene when leave the ship)”. deviceio121 + SmallCakekoo (Zhihu still). TMP is the still-only ID (spaceship corridor). Two independent watchers beat a still-only pass, but this agent did not see the frame. |
| 9 | Duel in the Sun | Spartacus | Still not in repo. YouTube match claimed for *Spartacus*. | **Spartacus** (1960) | **PROBABLE** | Canonical: `sun`. Community: `art` (inside “Spartacus”; `part` also sits in that string) | garrou linked a Short; SmallCakekoo: [YouTube](https://www.youtube.com/watch?v=AsBLdj7OyXc). Canonical *Duel in the Sun* is western/sunset-like. No second independent write-up of the *puzzle* frame itself. |
| 13 | Goodfellas | Léon: The Professional | Still not in repo. Watcher: apartment scene. | **Léon: The Professional** (1994) | **PROBABLE** | Canonical *Goodfellas*: `good`. *Léon: The Professional* / *Leon: The Professional*: **none** | garrou: “Leon (apartment scene)”. SmallCakekoo: [IMDb still](https://www.imdb.com/es/title/tt0110413/mediaviewer/rm1161681665/). Stronger than a generic crime-interior still-ID. Accented vs unaccented title does not add a BIP39 substring. |
| 14 | Eyes Wide Shut | The Man in the Iron Mask | Still not in repo. Weakest frame source (Instagram Reel). | Both remain plausible: **The Man in the Iron Mask** (1998) *or* **Eyes Wide Shut** (1999) | **UNCERTAIN** | *Eyes Wide Shut*: `eye`; `wide`. *The Man in the Iron Mask*: `iron`; `mask`; `man`; `ask` | deviceio121 + SmallCakekoo (Reel; they flag low confidence; ~1:22:00 king dancing). Period costume vs Kubrick party can collide in a single still. Needs a pause on the actual panel. |
| 16 | The 13th Warrior | The Visitors | Still not in repo. Watcher: first five minutes. | **The Visitors** (*Les Visiteurs*, 1993) | **PROBABLE** | Canonical: `warrior`. Community: `visit` | garrou: “The visitors (first 5 mins)”. SmallCakekoo: [Schnittberichte](https://www.schnittberichte.com/schnittbericht.php?ID=27067). Medieval/knight stills overlap *13th Warrior*; the time-code note is the discriminator, unseen here. |
| 23 | Valerian and the City of a Thousand Planets | Guardians of the Galaxy | Still not in repo. Claimed Nova Corps / Knowhere-type match. | **Guardians of the Galaxy** (2014) | **PROBABLE** | Canonical: `city`; `planet`; `sand` (`net` inside “planet”). Community: `galaxy`; `guard` | garrou + deviceio121 + SmallCakekoo ([Naver](https://blog.naver.com/blackmun/222292818542), Nova Corps wiki). *Valerian* is the still-only sci-fi-city ID. Unseen frame. |
| 24 | Ordinary People | Close Encounters of the Third Kind | Still not in repo. Claimed McDonald’s-in-the-film still. | **Close Encounters of the Third Kind** (1977) | **PROBABLE** | Canonical: `ordinary`; `people`. Community: `close`; `kind` | garrou + SmallCakekoo ([thisiscrowd McDonald’s-at-the-movies](https://thisiscrowd.com/news/mcdonalds-at-the-movies/)). Suburban drama vs UFO-suburb stills can look alike. Unseen frame. |
| 27 | The Lost Boys | Terminator 2: Judgment Day | Still not in repo. Watcher: biker bar. | **Terminator 2: Judgment Day** (1991) | **PROBABLE** | Canonical: `boy`. Community: `day`; `term` | Canonical confidence already `uncertain`. garrou: “bar scene with bikers”. SmallCakekoo: [Reddit T2 still](https://www.reddit.com/r/MoviesTelugu/comments/1k3elz9/terminator_2_judgment_day/). *Lost Boys* also has biker/vampire-bar imagery — reason to look at the panel — but two watchers specify T2. |

---

# Unresolved Panels

Evidence is insufficient to **CONFIRMED** any of the nine without looking at the still.

Treat as **unresolved until a human opens the panel JPEG**:

- **14** — only **UNCERTAIN**; keep both titles.
- **3, 5, 9, 13, 16, 23, 24, 27** — **PROBABLE** community titles, not confirmed in this environment (no stills in `images/`).

---

# What to accept vs inspect

**Do not write these into `data/films.csv` from this pass.**

| Recommend treating as the working title (after you glance at the still) | Why |
| --- | --- |
| 3 *Aliens* | Colonial Marines frame match, not 1979 *Alien* |
| 5 *Alien* (1979) | Named ship-exit scene; TMP is still-only |
| 13 *Léon: The Professional* | Named apartment + IMDb still |
| 27 *Terminator 2: Judgment Day* | Named biker-bar; canonical already uncertain |

| Still requires you to look at the still | Why |
| --- | --- |
| **14** | Instagram-only; two costumes/periods plausible |
| **9** | YouTube match, no second still write-up |
| **16** | Knight/medieval overlap with *13th Warrior* |
| **23** | Two colourful sci-fi city films |
| **24** | Two suburban-American interiors |

Wordless under the community titles (literal substring): **Léon: The Professional**. That is identification-dependent, not an excuse to brute-force.
