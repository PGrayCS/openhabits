## OpenHabits Architecture (Draft)

Layers (current lightweight prototype)
1. UI (vanilla JS / DOM) – planned migration to SvelteKit.
2. Domain Models (`src/models.js`) – habits, gamification, scheduling.
3. Rewards Engine (`src/rewards.js`) – XP & achievements.
4. Persistence (`src/storage.js`) – localStorage now; future IndexedDB.
5. PWA Shell (`service-worker.js` + `manifest.webmanifest`).
6. Templates (`src/templates.js`) – onboarding friction reduction.

Planned Enhancements
* IndexedDB with versioned migrations.
* Optional E2E encrypted sync (user-provided backend or plugin provider).
* Routine chains & health-based streak resilience.
* Weekly brief generator (rule-based natural language summary).
* Plugin API (import/export, panels, sync providers, themes).

Performance Budget
* Core bundle target <50KB brotli (pre-framework).
* Lazy load optional features (charts, sounds, encryption) in <20KB chunks.

Accessibility
* Semantic HTML first, ARIA minimal.
* Prefers-reduced-motion gates animations.
* Color contrast AA (APCA review later).

Scheduling Types
* daysOfWeek – explicit weekdays list.
* timesPerWeek – quota-based; appears in Daily Quests until quota met.

Data Shape (indicative)
```
Habit { id, name, description, scheduleType, days[], timesPerWeek, target, history{date: units}, streak, bestStreak }
```
