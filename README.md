# Virtual Artifact Hunt

An interactive exhibit game for a digital museum of ancient native communities.
Players explore five illustrated regional galleries, click on hidden artifacts
before time runs out, and read the real story behind each one — with a bonus
trivia question on many of them.

Built as plain HTML5 / CSS / JavaScript — **no dependencies, no build step, no
network requests**. Drop the folder on any web server, or open `index.html`
directly from disk.

---

## Running it

Any static server works:

```bash
python -m http.server 8791
```

Then open <http://localhost:8791>. Opening `index.html` from the filesystem
works too — nothing is fetched at runtime.

---

## Sharing it with someone (free hosting)

This is a static site with only relative paths, so any free static host works.

- **Netlify Drop** — go to <https://app.netlify.com/drop> and drag the whole
  `artifact-hunt` folder onto the page. Free tier, no card, instant public URL.
- **Cloudflare Pages** (<https://pages.cloudflare.com>) works the same way.
- **GitHub Pages** — `git init`, commit, push, then enable Pages on the repo
  (`Settings → Pages → Source: Deploy from a branch`).

### What to tell the client

- Works in any current browser, on desktop, tablet and phone.
- Progress (which artifacts have been found) and each region's best score are
  stored in that browser's `localStorage` — per-device, not shared across
  visitors. A shared leaderboard would need a backend.
- Nothing is tracked and nothing is sent anywhere.

---

## The five galleries

| Region | Scene | Artifacts |
|---|---|---|
| Asia | Temple courtyard at dusk | Cham Dance Mask, Noh Mask, Barong Mask, Mahakala Ritual Mask, Po Nagar Statue |
| Africa | Savanna at golden hour | Nguni Ceremonial Mask, Gelede Mask, Kanaga Mask, White Maiden (Punu) Mask, Golden Stool |
| Europe | Standing stones in the highlands | Celtic Horned Ritual Mask, Mamuthones Mask, Cernunnos Figure |
| Oceania | Volcanic island lagoon | Tiwi Pukumani Mask, Ancestor Spirit Mask (Asmat), Tiki Figure |
| North America | Maya ruins & Pacific coast | Jade Funeral Mask of King Pakal, Chaac Rain God Statue, Transformation Mask, Hamatsa Mask |

20 real artifacts in total, each with its own community/culture attribution,
description and use, drawn from the client-provided catalog
(`Idols.docx`, `Masks.docx`, `MASKS2.docx`, `QUIZ.pdf`). Eight of them carry a
bonus trivia question sourced from the same catalog.

### Content notes carried over from the source material

- **Po Nagar Statue** — `Idols.docx` gives the temple's date range as
  "8th–12th centuries CE"; `QUIZ.pdf` gives "8th–13th centuries CE" for the
  same fact. The wider, quiz-confirmed range is used here.
- **Jade Funeral Mask of King Pakal** — this is the one artifact in the
  catalog with no description or use written for it (every other entry has
  both). The card's description was written to fill that gap rather than
  drawn from client text, and says so on the card itself. Separately,
  `Masks.docx`'s own table mislabels the find as Guatemala; `QUIZ.pdf`'s quiz
  question gives the correct country as Mexico (Palenque, Chiapas) — Mexico is
  what's used, and the discrepancy is called out on the card and worth
  flagging back to the client.

### Why the artifacts are illustrated, not photographed

The source `.docx` files have real photos embedded for 18 of the 20
artifacts, but checking them turned up several with visible commercial
watermarks — a Dreamstime stock photo, a product photo from exoticindia.com,
a reseller's own watermark on a resin figurine — and the rest are of
unverified, likely similarly non-free, origin. None of that is safe to ship
in a game meant to be hosted publicly, so none of those images are used here.
Every artifact and scene is original inline-SVG artwork instead. If real
photography is wanted later, it would need to be sourced and license-checked
per artifact (e.g. verified public-domain museum photography), which is a
separate task from this build.

---

## How it plays

- A four-slide **tutorial** walks new players through the whole loop the
  first time they open the game. It's also available anytime from the **How
  to Play** button in the header.
- Pick a region from the gallery menu. **Each gallery is a wide, scrollable
  canvas — roughly 1.8–2.1× a screen's width — not a single fixed view.**
  Scroll, drag, or use the on-screen ←/→ buttons to explore it; a scroll hint
  appears the first time you enter a region, and the native scrollbar stays
  visible as a constant "there's more here" cue.
- Artifacts are **camouflaged into the scene** at natural size and color —
  no glowing beacons — so actually spotting one takes real looking. A brief,
  subtle glint sweeps across one not-yet-found, currently-on-screen artifact
  every several seconds as a fairness cue for players who are actively
  scanning. Three free **Hints** per region will scroll to and strongly
  highlight the next unfound artifact if one is proving too well hidden.
- Click or tap an artifact to open its card: name, culture, real-world
  description and use, and — where the catalog provided one — a multiple
  choice trivia question worth a 50-point bonus.
- The Haida Transformation Mask's card art is itself clickable: tap it to see
  it open, revealing the human face inside.
- Finding artifacts quickly in succession (within ~11 seconds of each other)
  builds a **streak multiplier**, shown in the HUD, worth an extra 20 points
  per step (capped at +100).
- Every find and correct quiz answer triggers a small confetti burst and a
  synthesized sound cue (Web Audio, no audio files); completing a region sets
  off a bigger burst and a fanfare. All sound can be muted from the speaker
  icon in the header — the preference is remembered between visits.
- Find every artifact in a region before the clock runs out for a completion
  bonus (2 points per second remaining); the scene's border pulses red in
  the last 20 seconds as a warning.
- A completed region gets a green "Complete" badge on the home screen, and
  the **Field Notebook** (top bar, and previewed on the home screen) tracks
  which of the 20 artifacts you've identified across all five regions, kept
  in `localStorage` between visits.

---

## Files

```
index.html          markup and screen structure
css/style.css        the whole theme (bright folk-art palette) + animations
js/artifacts.js      all 20 artifacts' text content and quiz data
js/icons.js           every artifact drawn as an inline SVG glyph
js/scenes.js          the five illustrated region backdrops + hotspot layout
js/sound.js            synthesized Web Audio sound effects (no audio files)
js/game.js            game loop, tutorial, timer, streaks, scoring, persistence
```

### Why there are no image files

Every scene backdrop and every artifact icon is generated as inline SVG in
`scenes.js` and `icons.js` — flat-color folk-art illustration, not museum
photography. That keeps the whole game free of licensing exposure and
deployable anywhere for free.

---

## Adding or editing content

Everything about an artifact lives in `js/artifacts.js` — name, culture,
description, use, point value, and an optional `quiz` block:

```js
{
  id: 'noh-mask', region: 'asia', icon: 'nohMask',
  name: 'Noh Mask', culture: 'Japanese',
  desc: '…',
  use: '…',
  points: 100,
  quiz: { q: '…', options: ['correct first', '…', '…', '…'], answer: 0 },
}
```

`icon` must match a key exported from `ICONS` in `js/icons.js`. To place a new
artifact on its region's scene, add a matching entry to that region's
`hotspots` array in `js/scenes.js` (`{ id, x, y, r }`, in that region's own
`width`×900 coordinate space — each region defines its own canvas `width`
since they're no longer a uniform 1600px).

A note for local development: `index.html` loads every stylesheet/script with
a `?v=N` query string specifically so editing a file and reloading always
gets the fresh version — browsers can be surprisingly aggressive about
caching plain `http.server` responses otherwise. Bump the version number(s)
after editing `css/style.css` or any `js/*.js` file if changes don't seem to
show up.

---

## Accessibility and kiosk notes

- Hotspots are focusable and operable with Enter/Space, not just click; each
  announces as "Hidden artifact N of M" until found, then its real name.
- The gallery canvas scrolls with mouse wheel, click-drag, touch swipe, the
  on-screen arrow buttons, or (for the same effect) the Hint button.
- The scene scales responsively; the HUD wraps below ~720px.
- `prefers-reduced-motion` disables the hotspot glint/hint animations.
- Nothing is fetched, so it runs on an offline gallery machine.
