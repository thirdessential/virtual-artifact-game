# Virtual Artifact Hunt

An interactive exhibit game for a digital museum of ancient native communities.
The museum is closed for the night: players take a flashlight into five dim 3D
galleries, search the storerooms for hidden artifacts, restore each one with a
short puzzle, read its real story, and finish each gallery with a curator's
quiz about what they just learned.

Built as plain HTML5 / CSS / JavaScript with **no build step and no network
requests**. The only library is Three.js (r159), copied into `js/vendor/` so the
game still runs offline. Drop the folder on any web server, or open
`index.html` directly from disk.

---

## Running it

Any static server works:

```bash
python -m http.server 8791
```

Then open <http://localhost:8791>. Opening `index.html` from the filesystem
works too. Three.js r159 is deliberately the last release with a classic
(non-module) build, which is what makes `file://` work without a server.

---

## Sharing it with someone (free hosting)

This is a static site with only relative paths, so any free static host works.

- **Netlify**: drag the `artifact-hunt` folder onto <https://app.netlify.com/drop>,
  or connect the GitHub repo. `netlify.toml` tells Netlify there is no build
  command and to publish the repo root.
- **Cloudflare Pages** and **GitHub Pages** work the same way.

### What to tell the client

- Works in any current browser with WebGL (3D graphics): desktop, tablet and phone.
  Browsers without WebGL get a polite message instead of the gallery.
- Progress and each gallery's best score are stored in that browser's
  `localStorage`, so they're per device. A shared leaderboard would need a backend.
- Nothing is tracked and nothing is sent anywhere.

---

## How it plays

1. **Search.** Each gallery is a dark 3D room styled after its region (see
   "The five rooms" below). Drag to look around,
   or hold the big on-screen arrow buttons; the flashlight shines wherever you
   last touched. Pinch or use the +/− buttons to zoom.
2. **Open everything, up close.** Artifacts are shuffled into random hiding
   spots every round: inside chests, drawers, crates and lidded baskets, under
   cloth-covered tables, on cluttered shelves, behind pillars, or in a glass
   case. **Tapping any of these opens it and flies the camera into a close-up**
   looking into it (into the drawer, behind the pillar, along the shelf);
   drag to peek around, tap the artifact to collect it, then **Back to room**.
   Opening one drawer closes the others in that cabinet, so nothing hangs over
   the drawer you're looking into. Most containers are empty or hold junk, and
   the rooms are full of ordinary clutter (vases, books, pots, rugs, paintings)
   that just says what it is when tapped.
3. **Fairness cues.** A faint glint flashes on an unfound artifact, or on
   the container hiding it, but only when it's inside your flashlight beam.
   Three **Hints** per gallery turn you toward an artifact, choosing an angle
   with a clear line of sight, and make its container glow.
4. **Restore.** Each find opens a restoration puzzle, rotating between a
   **jigsaw**, **broken shards**, **sliding tiles** and **dust-off**. The
   puzzle shows the artifact's culture but not its name. Restoring earns a
   bonus; skipping is allowed.
5. **Learn.** The artifact's card shows its photo (or illustration), culture,
   story and use. Found artifacts appear in a strip under the gallery and can
   be tapped to reread their cards before the quiz.
6. **Curator's quiz.** When the gallery is cleared, or time runs out, a
   short quiz asks only about artifacts the player found this round, and
   every answer is on those cards. The quiz mixes the catalog's own trivia,
   "which of these is…?" picture questions, and "which culture made…?"
   questions. **Peek at the card** reveals the text for a 10-point cost, and
   wrong answers show the right one.

The timer only runs while searching; puzzles, cards, the collection and the
quiz pause it. Quick consecutive finds build a streak bonus, and clearing a
gallery adds 2 points per second left.

---

## The five rooms

Each gallery is built in its region's own look: its own architecture,
materials, light colour, wall patterns, furniture finish and clutter. Decor is
*inspired by* each culture's traditions (patterns, building materials,
everyday objects), never a copy of a specific sacred object, so it reads as
set dressing rather than as more artifacts. The hiding-spot furniture keeps the
same shapes in every room, so close-ups work the same way everywhere, but it
is re-skinned and re-labelled per region.

| Gallery | Room | Light | Clutter and props |
|---|---|---|---|
| Asia | Red-lacquer hall with glowing paper screens, a cloud-pattern frieze, a coffered ceiling and hanging lanterns | warm lantern red | floor and stone lanterns, a gong, bamboo pots, tea bowls, scrolls |
| Africa | Earthen room with mud-plaster walls, a painted geometric band, woven wall plates, mud-cloth hangings and a thatched roof on carved posts | fire orange (a brazier) | drum, carved stools, water pots, gourds |
| Europe | Stone hall with flagstones, iron torches, knotwork tapestries, timber rafters and four standing stones | cold blue with torchlight | candle stand, barrels (the crate is a barrel here), a cart wheel, a loom, tartan cloth |
| Oceania | Woven-wall hut with bamboo posts, bark-cloth panels, a thatched roof, a net and a window onto a moonlit lagoon | sand and moonlight | tiki torches, a canoe, coconuts, shells, coral |
| North America | Cedar-plank house with a stepped-fret stone frieze, formline-style panels, carved paddles, log beams and painted house posts | hearth glow | a central hearth, a carved stela, bentwood boxes, pottery |

Light sources flicker gently. Everything is built from primitives and textures
painted in code (`js/rooms.js`), so there are still no model or image files
in the rooms.

---

## The 30 artifacts

| Gallery | Artifacts |
|---|---|
| Asia (7) | Cham Dance Mask, Noh Mask, Barong Mask, Mahakala Ritual Mask, Po Nagar Statue, *Dong Son Bronze Drum*, *Chola Bronze Nataraja* |
| Africa (7) | Nguni Ceremonial Mask, Gelede Mask, Kanaga Mask, White Maiden (Punu) Mask, Golden Stool, *Benin Bronze Plaque*, *Kente Cloth* |
| Europe (5) | Celtic Horned Ritual Mask, Mamuthones Mask, Cernunnos Figure, *Gundestrup Cauldron*, *Lewis Chessmen* |
| Oceania (5) | Tiwi Pukumani Mask, Ancestor Spirit Mask (Asmat), Tiki Figure, *Moai Statue*, *Boomerang* |
| North America (6) | Jade Funeral Mask of King Pakal, Chaac Rain God Statue, Transformation Mask, Hamatsa Mask, *Aztec Sun Stone*, *Diné (Navajo) Woven Blanket* |

The 20 unmarked artifacts come from the client catalog (`Idols.docx`,
`Masks.docx`, `MASKS2.docx`, `QUIZ.pdf`).

### The 10 researched additions (in *italics*): pending client review

These were added to reduce the share of masks (14 of the 20 catalog items).
They are **not from the client catalog**. They were drafted from general
knowledge, fact-checked against museum sources (National Museum of Denmark,
British Museum, the Met, Getty, the Easter Island Statue Project, the National
Museum of Australia and others), and corrected where the sources disagreed.
Each has `draft: true` in `js/artifacts.js` and shows a "Draft entry" note on
its card until the client approves the wording.

Cultural-sensitivity notes for the client:
- **Chola Bronze Nataraja**: consecrated, worshipped images; several have been
  stolen from temples and repatriated (e.g. the National Gallery of Australia in
  2014, and Smithsonian returns). Any photo used later needs clean provenance.
- **Benin Bronze Plaque**: looted by British forces in 1897; repatriation is
  ongoing, and ownership is contested between the Oba of Benin and Nigeria's
  national museums commission. Keep the wording current.
- **Moai**: ancestral and sacred to the Rapa Nui, who have asked the British
  Museum to return Hoa Hakananai'a.
- **Diné blanket**: Spider Woman is mentioned briefly and respectfully; some
  Diné stories are traditionally told only in winter.

### Content notes carried over from the catalog

- **Po Nagar Statue**: the catalog gives both "8th–12th" and "8th–13th
  centuries CE"; the card uses both, for the statue and for the temple complex.
- **Jade Funeral Mask of King Pakal**: the catalog has no description or use
  for it, so the card's text was written to fill the gap and says so. The
  catalog also labels it Guatemala in one place and Mexico (Palenque, Chiapas)
  in its own quiz; Mexico is used.
- **Noh Mask**: the catalog's quiz asks how a fixed mask shows emotion (angle
  and light), but its description never said so, so a "Did you know?" line
  with that fact from `QUIZ.pdf` was added to the card.

### About the photos

Card photos for 18 catalog artifacts are the images embedded in the client's
`.docx` files, used as **placeholders at the client's request**. Several carry
visible commercial watermarks (a Dreamstime stock photo, an exoticindia.com
product photo, a reseller's mark), and the rest are of unverified origin, so
**they need replacing with licensed images before public release**. The page
footer says so. The 2 catalog artifacts without a photo, and all 10 researched
additions, use the code-drawn illustrations. Gallery thumbnails and the 3D
rooms are drawn entirely in code.

---

## Files

```
index.html             markup, overlays (puzzle, card, quiz, collection, tutorial)
css/style.css          theme, 3D viewport, puzzle and quiz styles
js/vendor/three.min.js Three.js r159 classic build (MIT); deprecation warning stripped
js/artifacts.js        all 30 artifacts: text, culture, quiz, photo path, draft flag
js/icons.js            every artifact drawn as an inline SVG illustration
js/scenes.js           flat illustrated backdrops used as gallery thumbnails
js/rooms.js            the five region rooms: architecture, painted textures, lights,
                       furniture skins, props and clutter, hiding spots
js/world.js            the 3D engine: camera, flashlight, close-ups, picking,
                       containers, hints, glints (built from primitives, no models)
js/puzzles.js          the four restoration puzzles
js/sound.js            synthesized Web Audio sound effects (no audio files)
js/game.js             game flow, timer, scoring, curator's quiz, tutorial, persistence
assets/artifacts/      placeholder card photos (see "About the photos")
netlify.toml           no build command; publish the repo root
```

---

## Adding or editing content

Everything about an artifact lives in `js/artifacts.js`:

```js
{
  id: 'noh-mask', region: 'asia', icon: 'nohMask', photo: 'assets/artifacts/noh-mask.jpg',
  name: 'Noh Mask', culture: 'Japanese',
  desc: '…', use: '…', points: 100,
  quiz: { q: '…', options: ['…', '…', '…', '…'], answer: 0 },   // optional
}
```

`icon` must match a key in `ICONS` (`js/icons.js`); it's used in the 3D room
and wherever there's no `photo`. Hiding spots are assigned at random each
round, so new artifacts need no placement data. Every answer to a `quiz`
must appear in that artifact's `desc` or `use`, because the quiz promises
players exactly that.

For local development, `index.html` loads every file with a `?v=N` query
string so a reload always picks up changes. Bump the number after editing a
file if changes don't show.

---

## Tablet, accessibility and kiosk notes

- **Designed for large tablets** (tested at 1280×800 landscape and 768×1024
  portrait). While playing, the page is a fixed full-height layout with no
  scrolling: the gallery takes all the space left after the header and HUD.
  On-screen turn and zoom buttons are 64px, other buttons at least 48px, the
  found-artifact tiles 60px, and puzzle boards grow up to 460px.
- The 3D view is keyboard-operable: focus it, use the arrow keys to look,
  `+`/`-` to zoom, Enter or Space to search what the flashlight points at, and
  Escape to leave a close-up.
- Puzzles work with mouse, touch or pen; sliding tiles are buttons and can
  be operated by keyboard. Any puzzle can be skipped.
- The help text under the gallery is shortened on phones and fades after the
  first interaction.
- `prefers-reduced-motion` reduces the interface animations.
- Nothing is fetched, so it runs on an offline gallery machine.
