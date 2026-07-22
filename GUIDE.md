# Author's Guide — Interactive Story Cards

This guide is for authors and editors who want to publish the story-cards
widget inside a CMS article, edit the story text, or tweak how the cards look.
You do **not** need to touch the React app in `src/` — the whole widget lives
in a single self-contained file: **`public/story-cards.html`**.

---

## 1. Embed the widget in a CMS article (raw HTML/JS block)

The widget is one file with three parts:

1. A `<style>…</style>` block (the CSS)
2. A `<main>…</main>` block (the container the script renders into)
3. A `<script>…</script>` block (the story data + engine)

### Steps

1. Open `public/story-cards.html`.
2. In your CMS article, insert a **Custom HTML** / **Raw HTML** / **HTML embed**
   block (the exact name varies by CMS — WordPress calls it "Custom HTML",
   Ghost calls it "HTML card", Webflow calls it "Embed", etc.).
3. Copy **all three blocks** (`<style>`, `<main>`, `<script>`) from
   `story-cards.html` and paste them into the embed block, in that order.
4. Save/preview the article. You should see the prompt with a fan of cards.

### Notes and gotchas

- **Self-contained.** No external CSS, JS, or fonts are required.
- **One widget per article** is the safe default. If you want two widgets on
  the same page, give each a unique `id` in the `STORY` constant (see §2),
  otherwise they'll share the same saved-progress key in `localStorage`
  (`story:<id>`).
- **If nothing renders**, your CMS probably stripped the `<script>` or
  `<style>` tag. Switch to an "unfiltered HTML" block, or ask your CMS admin
  to allow raw HTML for this article.
- **If styles from the article bleed into the widget**, wrap all three blocks
  in a single `<div class="story-widget">…</div>` and prefix the selectors,
  or host `story-cards.html` somewhere and embed via
  `<iframe src="…" style="width:100%;height:640px;border:0"></iframe>`
  instead.

---

## 2. Edit the story text (the `STORY` object)

Near the top of the `<script>` block you'll find:

```js
const STORY = {
  id: "sample",
  start: "s1",
  vars: { mood: 0 },
  scenes: { … },
};
```

This is the whole story. Edit only the strings and numbers — keep the shape.

### Anatomy

| Field | What it does |
| --- | --- |
| `id` | Unique name for this story. Controls the `localStorage` save key. Change it whenever you want to reset saved progress for readers. |
| `start` | The scene id to show first. |
| `vars` | Starting variables. Used by conditional cards (see `if` below). |
| `scenes` | Object of scene id → scene. |

A **scene** is one of two shapes:

```js
// Choice scene
s1: {
  prompt: "Text/question shown above the cards.",
  cards: [ /* card objects */ ],
}

// Ending scene
end: {
  final: "Text shown as the final message.",
}
```

A **card** has these fields:

| Field | Required | What it does |
| --- | --- | --- |
| `label` | yes | Text on the front of the card. |
| `reveal` | yes | Text shown after the card flips. |
| `next` | yes | The scene id to show after this card is chosen. |
| `set` | no | Variables to merge in when this card is chosen, e.g. `{ mood: 1 }`. |
| `if` | no | Condition string; the card is only shown when this evaluates to true, e.g. `"mood >= 1"`. |

### Annotated example

```js
const STORY = {
  id: "haunted-inn",          // change this whenever you want to reset saves
  start: "s1",
  vars: { courage: 0 },       // starting variables
  scenes: {
    s1: {
      prompt: "You reach the inn at midnight. What do you do?",
      cards: [
        {
          label: "Knock on the door",
          reveal: "The door swings open before your knuckles touch the wood.",
          next: "s2",
          set: { courage: 1 },   // this choice raises courage
        },
        {
          label: "Peek through the window",
          reveal: "A single candle burns on an empty table.",
          next: "s2",
        },
      ],
    },
    s2: {
      prompt: "Someone calls your name from inside.",
      cards: [
        { label: "Answer", reveal: "You answer. The house answers back.", next: "end" },
        { label: "Run",    reveal: "You turn and run into the dark.",     next: "end" },
        {
          label: "Step inside without a word",
          reveal: "The door closes behind you, gentle as a held breath.",
          next: "end",
          if: "courage >= 1",     // only shown if the reader gained courage
        },
      ],
    },
    end: {
      final: "The story remembers the shape you gave it.",
    },
  },
};
```

### Rules of thumb

- Strings go in double quotes: `"like this"`. To include a `"` inside, escape it: `\"`.
- Keep the commas between items. A missing or extra comma will break the widget.
- Every `next` must point at a real scene id in `scenes`.
- Every path should eventually reach a scene with a `final`.
- Conditions in `if` support `==` `!=` `>` `<` `>=` `<=` `&&` `||` `!` and parentheses, over the variables in `vars`.

---

## 3. Restyle the flipped (revealed) card

All the widget's look-and-feel lives in the `<style>` block. Here's where to
find each thing:

| I want to change… | Edit this selector |
| --- | --- |
| Size of the enlarged card after it flips | `.card-wrap.chosen` (`width`, `min-height`) |
| Padding inside the flipped card | `.card-wrap.chosen .face` |
| Font size / line height of the revealed text | `.card-wrap.chosen .reveal` |
| Background / border / shadow of every card | `.face` |
| Rules that apply only to the flipped side | `.back` |
| Base typography of the revealed paragraph | `.reveal` (the `serif` class on the element enables the serif font stack) |
| Whole-widget colors | The custom properties on `:root` |
| Dark-mode colors | The `@media (prefers-color-scheme: dark)` block below `:root` |

### Recipe A — bigger, roomier reveal

```css
.card-wrap.chosen { width: min(680px, 94vw); min-height: 420px; }
.card-wrap.chosen .face { padding: 2.25rem; }
.card-wrap.chosen .reveal { font-size: 1.2rem; line-height: 1.75; }
```

### Recipe B — warmer palette

Replace the values on `:root`:

```css
:root {
  --bg:     #fdf6ec;   /* page background */
  --fg:     #2b1d12;   /* text */
  --muted:  #8a7561;   /* secondary text */
  --card:   #fffaf1;   /* card face */
  --border: #e8d9c2;   /* card border */
  --accent: #f2e3c9;   /* hover background */
}
```

Because every card, button, and background pulls from these variables, one
edit here reskins the whole widget.

---

## 4. Change card size and position (front of the card)

### Size of each idle card

```css
.card-wrap { width: 160px; height: 240px; }              /* default */
@media (max-width: 640px) {
  .card-wrap { width: min(320px, 85vw); height: 140px; } /* mobile */
}
```

Change `width`/`height` for larger or smaller cards. The mobile block
overrides the desktop values on narrow screens.

### Fan spread and tilt

In the `<script>` block, inside the `render()` function, there is this line:

```js
cw.style.transform =
  `translate(${offset*8}px, ${Math.abs(offset)*6}px) rotate(${offset*4}deg)`;
```

- `offset * 8` — horizontal spacing between cards. Larger = wider fan.
- `Math.abs(offset) * 6` — vertical arc (outer cards drop lower). `0` = flat row.
- `offset * 4` — rotation per card in degrees. `0` = no tilt.

Examples:

- Flat row, no tilt: `translate(${offset*20}px, 0) rotate(0deg)`
- Tight neat stack: `translate(${offset*4}px, 0) rotate(${offset*2}deg)`

### Row vs. wrap vs. stack

The container is `.grid`:

```css
.grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1rem;
}
```

- Change `gap` to space cards further apart.
- Change `justify-content` (`flex-start`, `space-between`, etc.) to align them.
- Set `flex-direction: column` for a vertical stack (the mobile block already
  does this for narrow screens).

### Front-of-card details

| Selector | Controls |
| --- | --- |
| `.face` | Padding, background, border, radius, shadow of every face |
| `.label` | Font size/weight of the card's front label |
| `.badge` | The small "Card N" tag at the top |
| `.hint` | The "Tap to reveal" hint at the bottom |

### Overall column width

```css
main { max-width: 720px; }
```

Increase this if you want the widget to occupy a wider column in your
article.

---

## 5. Troubleshooting

| Symptom | Likely cause / fix |
| --- | --- |
| Cards render but don't flip | CMS stripped the `<script>` — use an unfiltered HTML block. |
| Widget looks unstyled | CMS stripped the `<style>` — same fix, or move CSS into a `<style>` tag the CMS allows. |
| Article CSS bleeds in and breaks the look | Wrap the embed in `<div class="story-widget">…</div>` and prefix selectors, or embed via `<iframe>` instead. |
| Reader keeps landing back on an old scene | They have saved progress. Click **Restart**, or change `STORY.id` to a new string to reset every reader. |
| A card I expected is missing | It has an `if:` condition that isn't met — check the `set:` on earlier cards. |
| Two widgets on one page share progress | Give each a unique `STORY.id`. |

---

Happy authoring. Keep `public/story-cards.html` as your source of truth —
edit it, paste it into the CMS, and repeat.