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

I used Claude to generate the initial structure — the full HTML skeleton, CSS grid layout, date utility functions, and localStorage persistence pattern. Here are the specific changes I made to the AI output:

**Change 1 — Switched from innerHTML string concat with template literals to a centralized `render()` function with event delegation.**
The AI's first version attached `addEventListener` directly to every cell and button during render, which meant re-attaching dozens of listeners on every state change. I refactored to a single `render()` that rebuilds innerHTML, with one delegated listener on the `#app` container that checks `e.target.closest('[data-toggle]')`, `[data-edit]`, and `[data-del]`. This is cleaner, avoids memory leaks from stale listeners, and makes the data flow obvious: state change → `render()` → DOM reflects state.

**Change 2 — Rewrote the streak calculation direction.**
Claude's first implementation walked forward from the habit's creation date to count consecutive days. This is O(total history length) and breaks down for habits created months ago. I rewrote it to walk *backwards* from today: if today is checked, count it and step back; otherwise start from yesterday. This is O(streak length), handles mid-day "not yet checked" correctly, and never penalizes users who haven't ticked today's box yet.

**Change 3 — Replaced fixed grid column widths with `minmax`.**
The AI used `grid-template-columns: 200px repeat(7, 60px) 70px` with fixed pixel widths. On a 360px phone, this overflows the viewport and creates horizontal scroll on the whole page. I changed the name column to `minmax(140px, 220px)` and day columns to `1fr`, then override the name column to `minmax(90px, 120px)` at narrow breakpoints. The `1fr` columns divide available space equally, so the grid always fits the viewport width.

---

## 5. Honest gap

The delete confirmation uses the browser's built-in `confirm()` dialog, which is synchronous, blocks the page, and looks jarring in an otherwise smooth app. On iOS Safari it also sometimes shows the page URL in the dialog, which looks unpolished.

With another day I'd replace it with an inline undo pattern: clicking delete immediately removes the habit with a brief fade-out animation, and a toast appears at the bottom for 5 seconds saying "Habit deleted — Undo." Clicking Undo restores the habit and all its check history. This is more forgiving than a modal confirmation, faster to interact with, and fits the app's visual tone. The undo state would just be a `lastDeleted = { habit, checks }` variable that gets cleared when the toast expires.
