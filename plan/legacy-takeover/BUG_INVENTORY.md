# Bug Inventory — 历史中的三重光 (Triple Light)

**Auditor:** game5-triple-light-legacy-planner
**Date:** 2026-05-01
**Codebase:** 9,813 lines across 11 JS files + HTML/CSS
**Test suite:** 34/34 Playwright tests passing (but coverage gaps exist)

---

## P1 — Critical (Breaks core gameplay)

### BUG-1: Phase detection progress unit mismatch

| Field | Detail |
|-------|--------|
| **File** | `js/rhythm-engine.js` |
| **Lines** | 1475–1490 (`getCurrentPhaseIndex`) |
| **Symptom** | `getCurrentPhaseIndex()` passes `currentTime` (milliseconds, e.g. 30000) to `LevelData.getCurrentPhase(levelId, progress)` which expects a 0–1 progress fraction. Phase detection breaks after t>0ms — the engine always resolves to the last phase or returns 0. |
| **Root cause** | `currentTime += dt * 1000` (line 311) stores milliseconds. Phases use `startPercent: 0.15` etc. No normalization before the call. |
| **Internal callers** | `rhythm-engine.js` lines 427, 686, 742 — phase-dependent beat generation, visual effects, difficulty scaling all broken. |
| **External callers** | `ui.js` line 816 — phase indicator dots always wrong. `main.js` lines 474–598 — phase-enter dialogue triggers never fire correctly. |
| **Reproducibility** | 100% — any level with >1 phase is affected. |
| **Test gap** | Tests call `RhythmEngine.getCurrentPhase()` but don't assert specific phase values at specific times. Bug hides behind `N/A` fallback. |
| **Fix** | Normalize `currentTime / levelDuration` before passing to `getCurrentPhase()`. Requires fetching level duration from `LevelData.getLevel(levelId).duration`. |
| **Delta estimate** | +5 lines, ~0 removed |

---

## P2 — High (Feature broken or code integrity issue)

### BUG-2: `setActiveMechanicRules` not implemented

| Field | Detail |
|-------|--------|
| **File** | `js/main.js` line 592 |
| **Symptom** | `main.js` calls `RhythmEngine.setActiveMechanicRules(rules)` guarded by `typeof`. The function does not exist in `rhythm-engine.js`. Special mechanic rules from `LevelData.getActiveMechanicRules()` are fetched but silently discarded. |
| **Root cause** | Phase 2 orchestrator worker added the call but never added the receiver. `rhythm-engine.js` has no `setActiveMechanicRules` function or export. |
| **Reproducibility** | 100% — guarded by typeof so no runtime crash, but feature is dead. |
| **Test gap** | No test asserts mechanic rules are applied. |
| **Fix** | Add `setActiveMechanicRules` to rhythm-engine.js that stores rules and applies speedMultiplier/densityMultiplier during beat generation. Export it. |
| **Delta estimate** | +15 lines in rhythm-engine.js |

### BUG-3: `getPhaseCount()` called without required argument

| Field | Detail |
|-------|--------|
| **File** | `js/ui.js` line 816 |
| **Symptom** | `LevelData.getPhaseCount()` called without `levelId` argument. `getPhaseCount` requires `levelId` to look up phases. Returns 0 or undefined, so phase indicator dots never render. |
| **Root cause** | Missing argument in the call site. |
| **Reproducibility** | 100% — phase progress dots always show 0 phases. |
| **Fix** | Pass `currentLevelId` (available from game state) to `getPhaseCount(currentLevelId)`. |
| **Delta estimate** | +1 line change |

### BUG-4: 504 lines of uncommitted changes across 7 files

| Field | Detail |
|-------|--------|
| **Files** | `js/animation.js`, `js/event-cards.js`, `js/input-system.js`, `js/main.js`, `js/rhythm-engine.js`, `js/ui.js`, `style.css` |
| **Symptom** | Git dirty state includes all Phase 1–2 orchestrator changes plus some Phase 7–9 edits. No package.json or test runner command — `npm test` does not exist. |
| **Risk** | Any `git checkout` or `git stash` loses these changes. No way to reproduce build from clean clone. |
| **Fix** | Commit all changes. Add a `package.json` with `playwright` devDependency and a test script. |
| **Delta estimate** | +10 lines (package.json), +1 commit |

### BUG-5: No test runner command

| Field | Detail |
|-------|--------|
| **Symptom** | `test.mjs` uses `playwright` but there is no `package.json`, no `node_modules`, no documented run command. The orchestrator logs show tests were run but the mechanism is unclear. |
| **Fix** | Add `package.json` with `"test": "node test.mjs"` and `playwright` as devDependency. Document in a comment in test.mjs header. |
| **Delta estimate** | +15 lines (package.json) |

---

## P3 — Medium (Dead code, cosmetic)

### BUG-6: Aurora and light beam effects never triggered

| Field | Detail |
|-------|--------|
| **File** | `js/animation.js` (lines added for aurora + light beams) |
| **Symptom** | `triggerAurora()` and `addLightBeam()` are defined and exported but never called. `main.js` lines 604–606 call `updateAurora`/`renderAurora`/`updateLightBeams`/`renderLightBeams` each frame, but with nothing ever added, they are no-ops. |
| **Root cause** | Phase 9 worker added the effects but no trigger was wired to phase transitions or scoring events. |
| **Fix** | Call `triggerAurora()` on phase transitions and `addLightBeam()` on Perfect judgments. |
| **Delta estimate** | +3 lines in main.js |
| **Owner** | Can defer to post-fix polish. |

---

## Summary

| ID | Severity | File(s) | Status |
|----|----------|---------|--------|
| BUG-1 | P1 Critical | rhythm-engine.js | Phase detection broken — affects all multi-phase levels |
| BUG-2 | P2 High | main.js + rhythm-engine.js | Mechanic rules silently ignored |
| BUG-3 | P2 High | ui.js | Phase indicator dots missing |
| BUG-4 | P2 High | 7 files | Uncommitted work at risk |
| BUG-5 | P2 High | project root | No test runner |
| BUG-6 | P3 Medium | animation.js + main.js | Dead effect code |

**Fix scope:** 4 files modified max, ~40 net lines added.
**Stop condition:** All 6 bugs resolved, 34/34 tests still pass.
