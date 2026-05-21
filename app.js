/* ── CONSTANTS ── */

const DAY_NAMES   = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                     'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const HABITS_KEY  = 'streaks_habits_v1';
const CHECKS_KEY  = 'streaks_checks_v1';

/* ── DATE UTILS ── */

function today() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

function toKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function sameDay(a, b) {
  return toKey(a) === toKey(b);
}

// Week starts on Monday
function getWeekStart(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const dow = d.getDay(); // 0 = Sunday
  d.setDate(d.getDate() + (dow === 0 ? -6 : 1 - dow));
  return d;
}

function formatWeekLabel(start) {
  const end = addDays(start, 6);
  const s = `${MONTH_NAMES[start.getMonth()]} ${start.getDate()}`;
  const e = end.getMonth() !== start.getMonth()
    ? `${MONTH_NAMES[end.getMonth()]} ${end.getDate()}`
    : String(end.getDate());
  return `${s} – ${e}, ${end.getFullYear()}`;
}

/* ── STORAGE ── */

function loadHabits() {
  try { return JSON.parse(localStorage.getItem(HABITS_KEY)) || []; }
  catch { return []; }
}

function loadChecks() {
  try { return JSON.parse(localStorage.getItem(CHECKS_KEY)) || {}; }
  catch { return {}; }
}

function saveHabits() {
  localStorage.setItem(HABITS_KEY, JSON.stringify(state.habits));
}

function saveChecks() {
  localStorage.setItem(CHECKS_KEY, JSON.stringify(state.checks));
}

/* ── STATE ── */

const state = {
  habits:     loadHabits(),
  checks:     loadChecks(),
  weekOffset: 0,
  editingId:  null,
};


function calcStreak(habitId) {
  const todayKey     = toKey(today());
  const todayChecked = state.checks[`${habitId}:${todayKey}`];
  let count  = 0;
  let cursor = new Date(today());

  if (todayChecked) {
    count  = 1;
    cursor = addDays(cursor, -1);
  } else {
    cursor = addDays(cursor, -1);
  }

  for (let i = 0; i < 365; i++) {
    if (state.checks[`${habitId}:${toKey(cursor)}`]) {
      count++;
      cursor = addDays(cursor, -1);
    } else {
      break;
    }
  }

  return count;
}

/* ── ESCAPE HELPERS ── */

function escapeHTML(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escapeAttr(str) {
  return String(str)
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/* ── SVG CHECKMARK ── */

const CHECK_SVG = `
  <svg viewBox="0 0 13 13" fill="none"
       stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"
       aria-hidden="true">
    <polyline points="2,6.5 5.5,10 11,3"/>
  </svg>`;

/* ── RENDER ── */

function render() {
  const todayDate   = today();
  const weekBase    = getWeekStart(addDays(todayDate, state.weekOffset * 7));
  const weekDays    = Array.from({ length: 7 }, (_, i) => addDays(weekBase, i));
  const isThisWeek  = state.weekOffset === 0;

  // Update header
  document.getElementById('weekLabel').innerHTML =
    `<strong>${formatWeekLabel(weekBase)}</strong>${isThisWeek ? ' · this week' : ''}`;

  document.getElementById('btnToday').style.display = isThisWeek ? 'none' : '';
  document.getElementById('btnNext').disabled = state.weekOffset >= 0;

  // Render body
  const app = document.getElementById('app');

  if (state.habits.length === 0) {
    app.innerHTML = renderEmptyState();
    return;
  }

  app.innerHTML = renderGrid(weekDays, todayDate);

  // Focus rename input if a habit is being edited
  if (state.editingId) {
    const inp = app.querySelector(`[data-rename="${state.editingId}"]`);
    if (inp) { inp.focus(); inp.select(); }
  }
}

function renderEmptyState() {
  return `
    <div class="empty" role="region" aria-label="No habits yet">
      <div class="empty-glyph" aria-hidden="true">☀</div>
      <h2 class="empty-title">No habits yet</h2>
      <p class="empty-body">
        Type your first habit above and press Enter —
        like "Read 30 min" or "Exercise".
        Your streak starts the moment you check off a day.
      </p>
    </div>`;
}

function renderGrid(weekDays, todayDate) {
  return `
    <div class="grid-wrap" role="table" aria-label="Weekly habit grid">
      ${renderHeaderRow(weekDays, todayDate)}
      ${state.habits.map(h => renderHabitRow(h, weekDays, todayDate)).join('')}
    </div>`;
}

function renderHeaderRow(weekDays, todayDate) {
  const dayCells = weekDays.map((day, i) => {
    const isToday  = sameDay(day, todayDate);
    const isFuture = day > todayDate;
    const cls = `gh-day${isToday ? ' is-today' : ''}${isFuture ? ' is-future' : ''}`;
    const label = `${DAY_NAMES[i]} ${day.getDate()}${isToday ? ', today' : ''}`;
    return `
      <div class="${cls}" role="columnheader" aria-label="${label}">
        <span class="gh-day-name">${DAY_NAMES[i]}</span>
        <span class="gh-day-num">${day.getDate()}</span>
      </div>`;
  }).join('');

  return `
    <div class="grid-row grid-header-row" role="row">
      <div class="gh-label" role="columnheader">Habit</div>
      ${dayCells}
      <div class="gh-streak" role="columnheader">🔥</div>
    </div>`;
}

function renderHabitRow(habit, weekDays, todayDate) {
  const streak    = calcStreak(habit.id);
  const isEditing = state.editingId === habit.id;

  const nameCell = isEditing
    ? `<input class="habit-name-input"
              data-rename="${habit.id}"
              value="${escapeAttr(habit.name)}"
              aria-label="Rename habit"
              maxlength="80" />`
    : `<span class="habit-name-text"
             data-edit="${habit.id}"
             tabindex="0"
             role="button"
             title="${escapeAttr(habit.name)}"
             aria-label="Click to rename ${escapeAttr(habit.name)}">
         ${escapeHTML(habit.name)}
       </span>`;

  const actions = `
    <div class="habit-actions">
      <button class="icon-btn edit" data-edit="${habit.id}"
              aria-label="Rename ${escapeAttr(habit.name)}" title="Rename">✎</button>
      <button class="icon-btn del"  data-del="${habit.id}"
              aria-label="Delete ${escapeAttr(habit.name)}" title="Delete">✕</button>
    </div>`;

  const checkCells = weekDays.map((day, i) => {
    const ck       = `${habit.id}:${toKey(day)}`;
    const checked  = !!state.checks[ck];
    const isToday  = sameDay(day, todayDate);
    const isFuture = day > todayDate;

    const cls = ['check-cell',
      isToday  ? 'today-col'  : '',
      isFuture ? 'future-col' : '',
      checked  ? 'checked'    : '',
    ].filter(Boolean).join(' ');

    const stateLabel = checked   ? 'done, click to undo'
                     : isFuture  ? 'future day'
                     : 'not done, click to mark done';
    const label = `${habit.name} on ${DAY_NAMES[i]} ${day.getDate()} — ${stateLabel}`;

    const interactive = !isFuture
      ? `data-toggle="${ck}" tabindex="0" aria-pressed="${checked}" aria-label="${escapeAttr(label)}"`
      : `aria-label="${escapeAttr(label)}"`;

    return `
      <div class="${cls}" role="cell" ${interactive}>
        <div class="check-ring">${CHECK_SVG}</div>
      </div>`;
  }).join('');

  const streakLabel = `Streak: ${streak} day${streak === 1 ? '' : 's'}`;
  const streakBadge = streak === 0 ? '—' : `${streak}🔥`;

  return `
    <div class="grid-row" role="row" data-id="${habit.id}">
      <div class="habit-name-cell" role="rowheader">
        ${nameCell}
        ${actions}
      </div>
      ${checkCells}
      <div class="streak-cell${streak === 0 ? ' zero' : ''}"
           role="cell" aria-label="${streakLabel}">
        ${streakBadge}
      </div>
    </div>`;
}

/* ── EVENT DELEGATION ── */

document.getElementById('app').addEventListener('click', handleClick);
document.getElementById('app').addEventListener('keydown', handleKeydown);
document.getElementById('app').addEventListener('focusout', handleFocusOut);

function handleClick(e) {
  const toggle  = e.target.closest('[data-toggle]');
  if (toggle)  { toggleCheck(toggle.dataset.toggle); return; }

  const editBtn = e.target.closest('button[data-edit]');
  if (editBtn) { startEdit(editBtn.dataset.edit); return; }

  const editSpan = e.target.closest('span[data-edit]');
  if (editSpan) { startEdit(editSpan.dataset.edit); return; }

  const delBtn  = e.target.closest('[data-del]');
  if (delBtn)  { deleteHabit(delBtn.dataset.del); return; }
}

function handleKeydown(e) {
  // Toggle check cell with Space or Enter
  const toggle = e.target.closest('[data-toggle]');
  if (toggle && (e.key === 'Enter' || e.key === ' ')) {
    e.preventDefault();
    toggleCheck(toggle.dataset.toggle);
    return;
  }

  // Activate edit span with Enter or Space
  const editSpan = e.target.closest('span[data-edit]');
  if (editSpan && (e.key === 'Enter' || e.key === ' ')) {
    e.preventDefault();
    startEdit(editSpan.dataset.edit);
    return;
  }

  // Rename input: commit on Enter, cancel on Escape
  const renameInput = e.target.closest('[data-rename]');
  if (renameInput) {
    if (e.key === 'Enter')  { commitEdit(renameInput); return; }
    if (e.key === 'Escape') { state.editingId = null; render(); return; }
  }
}

function handleFocusOut(e) {
  const inp = e.target.closest('[data-rename]');
  if (inp) commitEdit(inp);
}


/* ── ACTIONS ── */

function toggleCheck(ck) {
  if (state.checks[ck]) delete state.checks[ck];
  else state.checks[ck] = true;
  saveChecks();
  render();
}

function startEdit(id) {
  state.editingId = id;
  render();
}

function commitEdit(inp) {
  if (!state.editingId) return;
  const name = inp.value.trim();
  if (name) {
    state.habits = state.habits.map(h =>
      h.id === state.editingId ? { ...h, name } : h
    );
    saveHabits();
  }
  state.editingId = null;
  render();
}

function deleteHabit(id) {
  const habit = state.habits.find(h => h.id === id);
  if (!habit) return;
  if (!confirm(`Delete "${habit.name}" and all its history?`)) return;

  state.habits = state.habits.filter(h => h.id !== id);

  // Remove all checks for this habit
  const clean = {};
  for (const k in state.checks) {
    if (!k.startsWith(id + ':')) clean[k] = state.checks[k];
  }
  state.checks = clean;

  saveHabits();
  saveChecks();
  render();
}

function addHabit() {
  const inp  = document.getElementById('habitInput');
  const name = inp.value.trim();
  if (!name) return;

  const id = `h_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  state.habits.push({ id, name, createdAt: Date.now() });
  saveHabits();

  inp.value = '';
  inp.focus();
  render();
}

/* ── HEADER BUTTON LISTENERS ── */

document.getElementById('addBtn').addEventListener('click', addHabit);

document.getElementById('habitInput').addEventListener('keydown', e => {
  if (e.key === 'Enter') addHabit();
});

document.getElementById('btnPrev').addEventListener('click', () => {
  state.weekOffset--;
  render();
});

document.getElementById('btnNext').addEventListener('click', () => {
  if (state.weekOffset < 0) {
    state.weekOffset++;
    render();
  }
});

document.getElementById('btnToday').addEventListener('click', () => {
  state.weekOffset = 0;
  render();
});

/* ── INIT ── */
render();
