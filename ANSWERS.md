# ANSWERS.md

## 1. How to run

No install required. Open `index.html` directly in a browser:

```bash
open index.html
```

Or serve it locally to avoid any `file://` protocol quirks:

```bash
npx serve .        # visit http://localhost:3000
python3 -m http.server 8080   # visit http://localhost:8080
```

No Node.js, npm, or build tools needed.

---
## 2. Stack & design choices

**Stack:** Vanilla HTML, CSS, and JavaScript — no frameworks, no dependencies, no build step. I chose this because the app's logic (toggle a checkmark, calculate a streak, save to localStorage) doesn't need a component framework. A single `render()` function that rebuilds the grid from state is readable, fast, and means anyone can open the file and immediately understand what's happening. Using React or Vue here would add toolchain complexity with no real gain.

**Visual decision 1 — Amber column wash for today, not just a header highlight.**
The problem: in a grid with 15 habits and 7 columns, the user needs to find "today" instantly. I apply a warm amber background (`#FFF8E6`) across the *entire* today column — every cell, not just the day header. This creates a vertical stripe that the eye finds in under a second regardless of how many rows there are. A border or bold day number would only mark the header; the full column fill marks where the action is. Amber was chosen specifically to be warm and inviting without being alarming like red or cold like blue.

**Visual decision 2 — Circular checkmarks with a spring-bounce animation, not standard checkboxes.**
OS-native checkboxes look inconsistent across platforms and carry default UA styling that's hard to fully reset. I replaced them with a 28px circle that starts as a faint gray ring and fills forest-green with a spring overshoot (`cubic-bezier(0.34, 1.56, 0.64, 1)`) when checked. The bounce is deliberate — checking off a habit is the most emotionally significant moment in the app, and a mechanical snap would undercut it. On hover, the ring scales slightly to signal interactivity without revealing the full checked state (so users don't confuse "about to check" with "already checked").

---

## 3. Responsive & accessibility

**360px phone:** The habit name column collapses to `minmax(90px, 120px)`, check rings shrink to 22px, and row height drops to 44px. The add-habit row stays as a flex row because both the input and button remain usable at narrow widths (the input has `min-width: 0` so it compresses without overflow). Edit/delete icons are always visible on mobile — I removed the hover-only opacity rule at narrow breakpoints since hover doesn't exist on touch screens.

**1440px desktop:** The grid expands to a 960px max-width with a 220px name column and generous cell padding. The sticky header keeps week navigation accessible while scrolling through many habits. The layout feels airy without wasting space.

**Accessibility handled — full keyboard navigation:** Every interactive element is Tab-reachable. Check cells have `tabindex="0"`, `role="cell"`, `aria-pressed`, and a descriptive `aria-label` that reads out the habit name, day, and current state ("Read 30 min on Mon 19 — not done, click to mark done"). Space and Enter toggle them. The rename input focuses automatically on edit mode. The grid uses semantic ARIA roles throughout (`role="table"`, `role="row"`, `role="columnheader"`, `role="rowheader"`, `role="cell"`).

**Accessibility skipped — live region for streak updates:** When you tick a habit and the streak counter increments, a screen reader user gets no announcement unless they navigate back to the streak cell. Adding an `aria-live="polite"` region that announces "Read 30 min — 5 day streak" on each toggle would fix this. I skipped it to avoid noisy announcements when rapidly clicking through cells, but the right fix is a debounced live region.

---

## 4. AI usage

I used Claude to help with some of the boilerplate — the initial HTML skeleton, CSS grid structure, and the localStorage read/write pattern. Here are the places where I changed what it gave me:

**Change 1 — Event delegation instead of per-element listeners.**
The first version attached addEventListener directly to each cell and button inside the render loop. That means every time the UI updates, you're creating and leaking dozens of listeners. I replaced that with a single delegated listener on the #app container that uses e.target.closest('[data-toggle]'), [data-edit], and [data-del] to figure out what was clicked. Cleaner, no leaks, and the data flow becomes obvious: something changes → render() runs → DOM reflects state.

**Change 2 — Streak calculation walks backwards, not forwards.**
What it gave me walked forward from the habit's creation date to count consecutive days — slow for old habits and doesn't handle gaps cleanly. I rewrote it to walk backwards from today: if today is checked, count it and step back one day at a time until there's a gap; if today isn't checked yet, start from yesterday. This way a streak you built over previous days doesn't disappear just because you haven't ticked today's box yet.

**Change 3 — Grid columns use minmax instead of fixed pixel widths.**
It gave me grid-template-columns: 200px repeat(7, 60px) 70px. On a 360px phone that overflows the viewport and causes the whole page to scroll horizontally. I changed the name column to minmax(140px, 220px) and the day columns to 1fr, then tighten the name column further in the mobile media query. The 1fr columns divide whatever space is left equally, so the grid always fits the screen width.

**Change 4 - Hover state on unchecked cells shows a ghost, not a filled circle.**
The original hover filled the circle fully green, which made it look like the habit was already checked. I changed unchecked hover to show the ring at reduced opacity and slightly scaled up — a ghost preview of what clicking will do. Checked cells stay full opacity at full scale. The difference in state is now unambiguous at a glance.

---

## 5. Honest gap

The delete confirmation uses the browser's built-in `confirm()` dialog, which is synchronous, blocks the page, and looks jarring in an otherwise smooth app. On iOS Safari it also sometimes shows the page URL in the dialog, which looks unpolished.

With another day I'd replace it with an inline undo pattern: clicking delete immediately removes the habit with a brief fade-out animation, and a toast appears at the bottom for 5 seconds saying "Habit deleted — Undo." Clicking Undo restores the habit and all its check history. This is more forgiving than a modal confirmation, faster to interact with, and fits the app's visual tone. The undo state would just be a `lastDeleted = { habit, checks }` variable that gets cleared when the toast expires.
