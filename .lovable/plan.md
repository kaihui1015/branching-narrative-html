## Goal

Add a `GUIDE.md` at the project root that walks a non-developer author through (a) embedding the story widget as a raw HTML/JS block in a CMS article, and (b) customizing the three things they asked about.

The guide targets **`public/story-cards.html`** — the self-contained standalone template. The React version (`src/**`) is left untouched; it's just the live demo.

## GUIDE.md outline

**1. Embedding in your CMS (raw HTML/JS block)**
- Open `public/story-cards.html`, copy everything from `<style>…</style>` and `<main>…</main>` and `<script>…</script>` (the three blocks).
- In your CMS article, insert an "HTML embed" / "Custom HTML" / "Raw HTML" block and paste all three blocks into it.
- Notes: the widget is self-contained (no external CSS/JS, no fonts). One widget per article — `localStorage` key is `story:<STORY.id>`, so if you embed two, give each a unique `id` in the `STORY` constant to keep their saved progress separate.
- Sanity check: the block should render a prompt + fan of cards. If the CMS strips `<style>` or `<script>`, switch to an "unfiltered HTML" block or ask the CMS admin.

**2. Editing the story text (JSON-shaped `STORY` constant)**
- Locate the `const STORY = { … }` block inside `<script>`.
- Anatomy, with a small annotated example:
  - `id`: unique string, controls the save key.
  - `start`: which scene shows first.
  - `vars`: starting variables (e.g. `mood: 0`) used by conditional cards.
  - `scenes`: object keyed by scene id. Each scene is either:
    - `{ prompt, cards: [ … ] }` — a choice screen, or
    - `{ final: "…" }` — the ending screen.
  - Each card: `{ label, reveal, next, if?, set? }`
    - `label` — front of the card
    - `reveal` — text shown after flip
    - `next` — id of the next scene
    - `if` — optional condition (e.g. `"mood >= 1"`) to show the card
    - `set` — optional variable updates when this card is chosen (e.g. `{ mood: 1 }`)
- Rules of thumb: keep commas between items, wrap text in double quotes, escape inner quotes with `\"`, keep every `next` pointing at a real scene id, and end with a scene that has `final`.

**3. Restyling the flipped (revealed) card**
- All look-and-feel lives in the `<style>` block. Pointers to the exact selectors:
  - `.card-wrap.chosen` — size of the enlarged card (`width`, `min-height`).
  - `.card-wrap.chosen .face` — inner padding of the flipped card.
  - `.card-wrap.chosen .reveal` — font size / line height of the revealed text.
  - `.face` — background, border, border-radius, shadow of every card face (front and back share this).
  - `.back` — extra rules that apply only to the flipped side (e.g. alignment, scroll).
  - `.reveal` — base typography of the revealed paragraph; the class `serif` on that element switches it to the serif font stack.
  - `:root` custom properties (`--bg`, `--fg`, `--card`, `--border`, `--accent`, `--muted`) — change these to recolor the whole widget in one place; dark-mode overrides live in the `@media (prefers-color-scheme: dark)` block just below.
- Include 2 copy-paste recipes: "bigger reveal card" (bump `.card-wrap.chosen` width + `.reveal` font-size) and "warmer palette" (swap `--bg`, `--card`, `--accent`).

**4. Card size and position (front-of-card layout)**
- Size of every idle card: `.card-wrap` — `width` and `height` (defaults 160×240). Mobile override lives in `@media (max-width: 640px) .card-wrap`.
- Fan spread + tilt: in the `<script>`, inside `render()`, the line
  `cw.style.transform = \`translate(${offset*8}px, ${Math.abs(offset)*6}px) rotate(${offset*4}deg)\`;`
  controls horizontal spacing (`*8`), vertical arc (`*6`), and rotation per card (`*4`). Increase for a wider fan, set the rotation multiplier to `0` for a flat row.
- Row vs. stack vs. wrap: `.grid` uses `display: flex; flex-wrap: wrap; justify-content: center; gap: 1rem`. Change `gap` for spacing, `justify-content` for alignment, or set `flex-direction: column` for a vertical stack.
- Front-of-card padding and text sizes: `.face` (padding), `.label` (front label size), `.badge` (the "Card N" label), `.hint` ("Tap to reveal").
- Overall column width of the widget: `main { max-width: 720px }`.

**5. Troubleshooting cheatsheet**
- Cards don't flip: CMS stripped the `<script>` block — use a raw/unfiltered HTML block.
- Styles look wrong / clash with article CSS: wrap the three blocks in a single `<div class="story-widget">…</div>` and prefix rules, or use the iframe approach instead (mentioned as an alternative but not the primary path).
- Progress from a previous test won't clear: click Restart, or change `STORY.id` to a new string.
- Card disappears unexpectedly: it has an `if:` condition that isn't met — check the `set:` values on earlier cards.

## Out of scope

- No code changes to `public/story-cards.html`, the React demo, styles, or routes.
- No new /guide route (per your answer, markdown only).

## Deliverable

- `GUIDE.md` at the project root, ~150–220 lines, with the sections above and short copy-paste snippets. Linked from `README.md` with a one-line pointer.
