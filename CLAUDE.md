# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A Pomodoro timer desktop app built with Electron, wrapping a single-page vanilla JS/HTML/CSS app. It also tracks study/work sessions per project+topic and shows stats (Chart.js) and a Notion-style task database. No build step, no bundler, no framework — everything runs directly in the browser/renderer.

## Commands

```bash
npm start          # launch the Electron app (main.js -> loads index.html)
npm run build       # electron-builder --win, produces a Windows NSIS installer in dist/
```

There is no test suite (`npm test` is a stub) and no linter configured.

## Architecture

**Two Electron windows, synced through `localStorage`, not IPC state:**
- `main.js` creates the main `BrowserWindow` (loads `index.html`) and, on the `open-mini-timer` IPC message, a frameless always-on-top `miniTimerWin` (loads `mini-timer-popup.html`). Both windows run with `nodeIntegration: true` / `contextIsolation: false`, so both can use `require('electron')` directly in renderer code.
- The main window and the mini-timer popup do **not** share state via IPC messages back and forth. Instead the main window writes timer state to `localStorage['timerData']` on every tick/action, and the mini popup polls that key to render itself; the popup sends commands back by writing `localStorage['timerCommand']`, which the main window's `script.js` watches for. When touching timer start/pause/reset/skip logic, changes must stay consistent across both write sides (`script.js`) and the read side (`mini-timer-popup.html`).

**`script.js` is the entire application** (~2200 lines, no modules). It's organized into large logical sections in this order — use this as a map when navigating:
1. Timer core: countdown state, `startTimer`/`toggleTimer`/`resetTimer`/`skipTimer`/`switchTimers` (work ↔ break ↔ long-break rotation), circular SVG progress (`updateCircle`/`updateBreakCircle`).
2. Settings popup: duration sliders/inputs, persisted individually to `localStorage` (`numPomodoros`, `workDuration`, `shortBreak`, `longBreak`).
3. Session editing / "Edit Mode": lets the user retroactively adjust the currently running session.
4. Theming: custom colors (`primary-color`, `background-color`, `buttons-action`, `break-color`) written to `localStorage` and applied as CSS custom properties; background "bubble" animation.
5. Mini-timer window toggling (see above).
6. Focus/project picker: `subject-input` / `subtopic-input` with autocomplete dropdowns, backed by `appData.projects`.
7. **`appData`** — the persisted app state, single JSON blob in `localStorage['pomodoroAppData']`, shape `{ projects: { [projectName]: { topics: {...}, tasks: [...] }, ... } }`. Always mutate through `saveAppData()` after changing `appData` so it's flushed to `localStorage`.
8. Stats: `initStats`/`recordSessionTime`/`updateStatsUI`/`drawStatsChart` — session history is stored per-date and aggregated on demand for the Today/7-day/Month/Lifetime filters; chart colors are re-derived from the current theme CSS variables, so any new chart element must read colors dynamically rather than hardcoding them (see `modifiche_29_06.md` for the standing rule that *all* new UI must respond to the color-picker theme, not just this chart).
9. Task database: `renderTasks`/`addNewTask`/`updateTask`/`sortTasks`/priority & macro-subject tag editing — a spreadsheet-like table, not a plain list.

**Dead/legacy files — do not build on these without checking with the user first:** `script_backup.js`, `script_head.js`, `new_stats.js`, `notion_tasks.js`, `notion_styles.css` are not referenced anywhere in `index.html` and are not loaded at runtime. `script.js` is the only JS file actually shipped, alongside `style.css` and `mini-timer-styles.css`. Chart.js is pulled from a CDN (`<script src="https://cdn.jsdelivr.net/npm/chart.js">` in `index.html`), not npm.

**Persistence is entirely `localStorage`-based** (no real database yet). `README.md` and `DATABASE_IMPLEMENTATION_STEPS.md` describe a *planned* migration to a cloud DB (Firebase/Supabase) with Google login for multi-device sync — this is not implemented; current code should keep working standalone against `localStorage`.

## Conventions

- No modules/bundler: everything is global scope in `script.js`. Keep new code consistent with that rather than introducing ES module imports (the Firebase guide's `import` examples describe a future state, not the current one).
- Any new color-related UI element must derive its color from the CSS custom properties / current theme (`var(--primary-color)`, `var(--break-color)`, etc.) and update live when the user changes theme colors in settings — this is an explicit standing requirement, not optional polish.
- Commit messages: short, imperative, capitalized summary (e.g. "Fix media query for 15 and 16 inch macbooks so they use laptop sizes").
