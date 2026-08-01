# Pomodoro Timer & Study Analytics

A Pomodoro timer built as both a desktop app (Electron) and a static web app, designed to do more than just count down minutes: it also tracks what you worked on, keeps a lightweight task database, and shows analytics about your study/work sessions over time.

## Features

**Timer**
- Classic Pomodoro flow: work → short break → long break, repeating for a configurable number of pomodoros.
- Circular progress indicator, with a secondary indicator for the current break.
- Skip, reset, and edit-in-place for the currently running session.
- Floating **mini-timer** widget that stays on top of other windows/apps — a separate always-on-top window on desktop, a popup window in the browser.

**Focus & Tasks**
- Set a **Macro-Subject** (e.g. a project or exam) and an optional **Subject/topic** to tag what you're working on.
- A Notion-style task table scoped to your current focus: task name, macro-subject, subject, priority, start/end dates, with inline editing, sortable columns, and keyboard navigation.

**Stats**
- Work minutes and completed pomodoros, filterable by Today / 7 Days / 30 Days / Lifetime.
- Bar/line chart (via Chart.js) with an hourly breakdown of when you actually worked.

**Customization**
- Custom color theme (primary, background, buttons, break color), applied live and persisted across restarts.
- Optional animated background bubbles (toggle and count configurable).

## Tech Stack

- Vanilla JavaScript, HTML, and CSS — no framework, no build step.
- [Electron](https://www.electronjs.org/) for the desktop app shell.
- [Chart.js](https://www.chartjs.org/) (via CDN) for the stats chart.
- Data is currently stored locally via `localStorage` — see [Roadmap](#roadmap) for planned cloud sync.

## Getting Started

### Desktop app (Electron)

```bash
npm install
npm start
```

To build a Windows installer:

```bash
npm run build
```

### Web app

The app also runs as a static site with no build step — open `index.html` directly in a browser, or deploy the repository as-is to a static host like GitHub Pages. Electron-only features (like the always-on-top mini-timer window) gracefully fall back to browser equivalents (e.g. a popup window).

## Roadmap

- Restyle the UI/UX to be more minimal and polished.
- Richer subject/topic management (tags, exams, per-project organization).
- Deeper analytics: totals and averages, adherence to planned vs. actual time, more charts.
- Google login and multi-device cloud sync, so settings/subjects/stats follow you across devices.
- An interactive onboarding tutorial for first-time users.
- Make timer-setting changes (durations, breaks, etc.) apply reliably at any point in an active session.

### Cloud sync

Moving persistence from `localStorage` to a cloud database (with Google login) is planned but not yet implemented. A detailed walkthrough of the recommended approach (Firebase Auth + Firestore) and the SQL-vs-NoSQL tradeoffs for this project's analytics needs is in [DATABASE_IMPLEMENTATION_STEPS.md](DATABASE_IMPLEMENTATION_STEPS.md).

## License

Released under the [GNU General Public License v3.0](LICENSE).
