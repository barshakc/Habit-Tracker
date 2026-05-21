# Habit-Tracker

A single-page habit tracker with a weekly grid, streak counters, and full persistence across reloads.

## How to run

No install, no build step — it's a single HTML file.

```bash
# Option 1: open directly in your browser
open index.html

# Option 2: serve locally (avoids any file:// quirks)
npx serve .
# then visit http://localhost:3000

# Option 3: Python
python3 -m http.server 8080
# then visit http://localhost:8080
```

**Requirements:** A modern browser (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+). No Node.js or npm needed.

## Stack

Vanilla HTML, CSS, and JavaScript — no frameworks, no dependencies, no build step. Everything lives in `index.html`. Data persists via `localStorage`.

## Features

1. Add, rename, and delete habits
2. Weekly grid: habits on rows, Mon–Sun across columns
3. Today's column highlighted in amber
4. Consecutive-day streak counter per habit
5. Week navigation: previous, next, "This week" shortcut
6. Past weeks show historical checkmarks; future days are disabled
7. Full keyboard navigation (Tab, Enter, Space, Escape)
8. Responsive from 360px phones to 1440px desktops
9. Empty state with onboarding copy
