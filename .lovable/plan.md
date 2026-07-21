# Interactive Storytelling Template — Card Flip Flow

A reusable branching-story template where each choice is a **card**. Cards fan out below a prompt; clicking one flips it to reveal the next passage; then the next set of cards appears. Delivered as both a standalone HTML file and a live demo in this app.

## Interaction flow

Three stages, driven by a JSON story graph:

1. **Stage 1 — Prompt + 5 cards.** A line of text (question/prompt) appears at the top. Below it, 5 face-down cards fan out. User clicks one.
2. **Card flip reveal.** The chosen card flips (3D CSS transform) to show a longer passage of text on its back. Non-chosen cards fade out. The revealed card expands/centers so its text is comfortably readable.
3. **Stage 2 — 3 cards.** A new prompt line appears above 3 fresh face-down cards. User clicks one.
4. **Final message.** The chosen card flips, other two fade out, and a final closing message is shown (styled distinctly — no further cards).

Back / Restart controls stay available throughout. Progress auto-saves.

## Story JSON schema

The engine is generic (any number of stages, any card count per stage). The demo story uses 5 → 3 → end to match the requested flow.

```text
{
  "id": "sample",
  "start": "s1",
  "vars": { "mood": 0 },
  "scenes": {
    "s1": {
      "prompt": "You stand at a crossroads. What draws your eye?",
      "cards": [
        { "label": "The lantern",  "reveal": "You lift the lantern...", "next": "s2", "set": { "mood": 1 } },
        { "label": "The letter",   "reveal": "The ink is still wet...", "next": "s2" },
        { "label": "The key",      "reveal": "Cold iron, heavy...",     "next": "s2" },
        { "label": "The mirror",   "reveal": "Your reflection blinks late...", "next": "s2" },
        { "label": "The silence",  "reveal": "You listen. Something listens back.", "next": "s2" }
      ]
    },
    "s2": {
      "prompt": "A door appears. How do you approach it?",
      "cards": [
        { "label": "Knock",  "reveal": "The door opens on its own.", "next": "end" },
        { "label": "Listen", "reveal": "Footsteps, then quiet.",     "next": "end" },
        { "label": "Enter",  "reveal": "You step through.",          "next": "end", "if": "mood >= 1" }
      ]
    },
    "end": {
      "final": "The story remembers you. Thank you for playing."
    }
  }
}
```

- Scene has either `cards[]` (interactive) or `final` (ending).
- Each card: `label` (front), `reveal` (back text), `next` (scene id), optional `set` / `if` for variables and conditional visibility.
- Any card count per stage works — the layout adapts (fan for 5, arc for 3, etc.).

## Visual + motion (minimal / neutral)

- Single centered column on desktop; cards fan slightly with small rotation; on mobile they stack vertically.
- Cards: rounded rectangles, subtle border + shadow, front shows label centered with a small ornamental mark, back shows reveal text.
- Flip: `transform: rotateY(180deg)` with `transform-style: preserve-3d`, ~600ms ease.
- Non-chosen cards fade + slide out (200ms) while chosen card scales up and centers.
- Prompt line and new card set fade in using the existing `animate-fade-in` utility.
- System serif for prose, clean sans for UI; light + dark via `prefers-color-scheme`; semantic tokens in the React version.

## Features

- Save/restore: current scene id, vars, and history in `localStorage` (per `story.id`); resume on reload.
- Back button (pops history, unflips) and Restart (clears state).
- Variables & conditions: `set` updates vars when a card is chosen; `if` hides cards whose condition is false.
- Safe condition evaluator: hand-rolled parser for `name`, `name op value`, and `&&` / `||` / `!` — no `eval` / `new Function`.

## Deliverables

### 1. Standalone template — `public/story-cards.html`
- One self-contained file: `<style>`, `<script>`, inline `STORY` JSON constant preloaded with the 5 → 3 → end sample.
- No dependencies, no build. Open in any browser. Edit the JSON to author a new story.
- Download link surfaced on the demo page.

### 2. Live demo route
- `src/routes/index.tsx` — replaces the placeholder; renders the demo with the sample story and a "Download template" link to the standalone file.
- `src/lib/story-engine.ts` — pure TS: `createStory(data)`, `choose(cardIndex)`, `back()`, `restart()`, save/load, safe condition + assignment evaluator.
- `src/components/StoryPlayer.tsx` — orchestrates prompt, card grid, flip animation, reveal, transitions, final message, Back/Restart.
- `src/components/StoryCard.tsx` — single flippable card (front/back, 3D transform, click handler, disabled state).
- `src/stories/sample-story.ts` — the 5 → 3 → end sample above.
- Head metadata: title "Interactive Story Cards", matching description + og/twitter.

## Technical notes

- The standalone HTML re-implements the same logic inline (kept intentionally decoupled so the file stays truly portable); the React version wraps the same behavior with components.
- Card layout uses CSS grid on small screens and a flex row with per-card `rotate()` on wider screens for the fan effect.
- Flip uses `perspective` on the container and `backface-visibility: hidden` on both faces.
- Styling uses existing semantic tokens (`bg-background`, `text-foreground`, `text-muted-foreground`, `border`) so it respects the design system.
- Accessibility: cards are `<button>` elements with `aria-label`, keyboard-focusable, Enter/Space activates; reduced-motion disables the flip and uses fade instead.
