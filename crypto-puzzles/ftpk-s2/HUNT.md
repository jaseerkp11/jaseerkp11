# Hunt: FTPK Season 2 (“Never-Ending”)

**This is the hunt we are on.** Movie Enigma is parked.

## Honest call (nothing is “for sure”)

Flo’s catalogue is **31 funded puzzles**, not 31 solvable ones. Nobody can promise we cash a prize. The pick is the puzzle where **your laptop can do the work**, the **oracle is certified**, the **coins are still there**, and we are **not repeating a dead Movie Enigma grind**.

Checked 2026-08-23 via Blockscout: escrow `0xb5fe4f1b6cb2bbe6a327f8c68f370da7df18b2dc` still holds **USDT** (on-chain token balance still funded). 0 outgoing ETH. Still unspent.

## Why this one, not the others

| Puzzle | Why not now |
| --- | --- |
| Movie Enigma (100k sats) | Stills locked; word rule missing; AKA/`treasure`/`storm` invalid; 3-as-intruders drop-10 empty |
| GSMG / Ballet / Shamir / Todd collisions | Last gate is AES, physical halves, or a new hash attack |
| Kitten passphrase | Author: not meant to be solved; ~1e9 already tried |
| Keysa 70-word card | Mechanical readings exhausted; needs a spoken 12-of-70 rule |
| Keir book lots | Remaining lots look **print-only** |
| School of Bitcoin / 2018 glyphs | Stego / video; slower, not “next” |
| FTPK Season 4 | **Already cashed** (reader, 2026-08-20) — proof this author’s grammar *can* pay |

Season 2 is 12 **independent** mini-games → 12 BIP39 words → Ethereum `m/44'/60'/0'/0/0`. Author publicly said **game 7 is the weakest** (brute last, not first). Same naming trick hid a 12th game. Season 4 of the same series paid out.

## How we cash if MATCH

1. `python tools/oracle.py "12 words"` → `MATCH 0xb5fe…`
2. On **your** PC: MetaMask / Rabby, import 12-word seed, Ethereum mainnet, account 0.
3. Confirm address equals the escrow.
4. Send **USDT then leftover ETH for gas** to a wallet you already control. Never paste the seed into a website.

Prize is ~$300 USDT. Gas will take a slice.

## What I do next (no extra task for you unless a game is visual)

1. Mirror the 12 game pages (site is Cloudflare-protected from this agent).
2. Solve games that are text/cipher/audio using Flo’s notes (Game 1 Vigenère + Cicada-style key; Game 12 notes-as-digits like Season 1).
3. Hold 2048-word brute **only** for game 7 after the other 11 exist.

Your optional help: open https://findtheprivatekeys2.vercel.app/ on the laptop if a still/image game needs a human pair of eyes, and send a screenshot.

Flo write-up: https://github.com/floflo777/open-crypto-puzzles/tree/main/2-mid-prizes/ftpk-season-2-300usdt
Hub: https://findtheprivatekeys.vercel.app/
