# [🌟 Try the Live Demo!](https://pgraycs.github.io/openhabits/)
# OpenHabits

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Status](https://img.shields.io/badge/status-alpha-blue.svg)]()
[![Contributions welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg)](CONTRIBUTING.md)

OpenHabits is a free, open‑source, offline‑first, fully client‑side habit tracker that turns building routines into a little RPG. No sign‑ups. No ads. Your data stays local (export anytime).

## Features (alpha)
- Offline‑first PWA (installable, works with no connection)
- Create habits with weekly schedules & per‑day targets
- Daily Quests view: only today’s due habits
- Streak tracking (current + best)
- XP curve + Levels + Achievements + Confetti celebration
- Achievement examples: first completion, streak 3/7/30, early bird, 5 quests/day, 100 total completions
- Import / Export JSON backups
- Auto‑save & resilient local storage
- Zero external dependencies (vanilla JS / CSS)

## Quick Start
Clone or download then just open `index.html` in a modern browser.

Optional local dev server:
```bash
python3 -m http.server 8080
# Visit http://localhost:8080
```

Install as a PWA (Add to Home Screen) for a native feel.

## Data & Privacy
All data lives in your browser `localStorage` under a single key. Use Export for backups; Import will overwrite current state.

## Roadmap Ideas
- Light theme & theming system
- More achievement sets & seasonal events
- Habit tags, filters, search
- Heatmap calendar & analytics (consistency %, longest gap)
- Local notifications / reminders
- Optional pet/avatar that evolves with level
- Encrypted backup option

## Contributing
PRs welcome—please keep it lightweight & dependency‑free. See CONTRIBUTING.md.

## License
MIT. See LICENSE.

---
Level up your real life. 🌱
