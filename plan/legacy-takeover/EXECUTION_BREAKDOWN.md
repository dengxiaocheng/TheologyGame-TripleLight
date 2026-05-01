# Execution Breakdown — Worker Packets

**Date:** 2026-05-01
**Constraint:** Max 4 files modified, ~500 net lines total

---

## Packet A: Project hygiene + test runner

**Bugs fixed:** BUG-4, BUG-5
**Read scope:** `package.json` (absent), `.gitignore`, all uncommitted files
**Write scope:** `package.json` (new), git commit

### Tasks
1. Create `package.json`:
   ```json
   {
     "name": "triple-light",
     "private": true,
     "scripts": { "test": "node test.mjs" },
     "devDependencies": { "playwright": "^1.40.0" }
   }
   ```
2. Stage and commit all 7 dirty files + `REPORT.md` + `package.json`
3. Commit message: `fix: commit orchestrator Phase 1-2 changes + add test runner`

### Acceptance
- `git status` clean
- `node test.mjs` runs (may need `npx playwright install chromium` once)
- All 34 tests pass

### Delta: +15 lines, 1 new file, 1 commit

---

## Packet B: Fix phase detection (P1)

**Bug fixed:** BUG-1
**Read scope:** `js/rhythm-engine.js` (lines 311, 427, 686, 742, 1475–1490), `js/level-data.js` (getLevel, getCurrentPhase)
**Write scope:** `js/rhythm-engine.js`

### Tasks
1. In `getCurrentPhaseIndex()` (line ~1475), replace:
   ```js
   var phase = LevelData.getCurrentPhase(currentLevelId, currentTime);
   ```
   with:
   ```js
   var levelInfo = LevelData.getLevel(currentLevelId);
   var duration = levelInfo ? (levelInfo.duration || 60) : 60;
   var progress = Math.min(currentTime / (duration * 1000), 1.0);
   var phase = LevelData.getCurrentPhase(currentLevelId, progress);
   ```

### Acceptance
- `RhythmEngine.getCurrentPhase()` returns correct phase index when `currentTime` is 0ms, 9000ms (level 1), 27000ms
- Phase-dependent beat generation produces different patterns at different times
- All 34 tests pass

### Delta: +4 lines

---

## Packet C: Implement mechanic rules + fix phase indicator

**Bugs fixed:** BUG-2, BUG-3
**Read scope:** `js/rhythm-engine.js` (beat generation, exports), `js/ui.js` (line 816), `js/main.js` (line 592)
**Write scope:** `js/rhythm-engine.js`, `js/ui.js`

### Tasks

#### BUG-2: Add `setActiveMechanicRules` to rhythm-engine.js
1. Add internal state near top of IIFE:
   ```js
   var activeMechanicRules = null;
   ```
2. Add function:
   ```js
   function setActiveMechanicRules(rules) {
     activeMechanicRules = rules;
   }
   ```
3. In beat generation (around line 427), check `activeMechanicRules` for `speedMultiplier` and `densityMultiplier` and apply them.
4. Add to exports: `setActiveMechanicRules: setActiveMechanicRules`

#### BUG-3: Fix getPhaseCount call in ui.js
1. At line 816, change:
   ```js
   var phaseCount = LevelData.getPhaseCount();
   ```
   to:
   ```js
   var phaseCount = LevelData.getPhaseCount(currentLevelId);
   ```
   (Ensure `currentLevelId` is accessible — it's passed as parameter to the render function or available from game state.)

### Acceptance
- `typeof RhythmEngine.setActiveMechanicRules === 'function'` returns true
- `LevelData.getActiveMechanicRules()` results are stored and used
- Phase indicator dots render correctly (count matches level phases)
- All 34 tests pass

### Delta: +20 lines in rhythm-engine.js, +1 line in ui.js

---

## Packet D: Wire visual effects

**Bug fixed:** BUG-6
**Read scope:** `js/main.js` (lines 474–598 content triggers, 604–606 render calls), `js/animation.js` (triggerAurora, addLightBeam exports)
**Write scope:** `js/main.js`

### Tasks
1. In phase transition trigger block (~line 510), after showing phase announcement, add:
   ```js
   if (typeof Animation !== 'undefined' && Animation.triggerAurora) {
     Animation.triggerAurora(transition.type || 'fade');
   }
   ```
2. In the scoring/judgment processing area, after a Perfect judgment is recorded, add:
   ```js
   if (typeof Animation !== 'undefined' && Animation.addLightBeam) {
     Animation.addLightBeam(lane);
   }
   ```

### Acceptance
- Phase transitions trigger aurora visual
- Perfect judgments trigger light beams on the correct lane
- No JS errors
- All 34 tests pass

### Delta: +6 lines

---

## Totals

| Packet | Files | Lines added | Lines removed |
|--------|-------|-------------|---------------|
| A | 1 new (package.json) + git | 15 | 0 |
| B | rhythm-engine.js | 4 | 1 |
| C | rhythm-engine.js, ui.js | 21 | 1 |
| D | main.js | 6 | 0 |
| **Total** | **4 files** | **~46** | **~2** |

**Well within budget:** 4 files modified, ~44 net lines.

### Execution order
Packets must run sequentially: A → B → C → D (each depends on the previous commit being clean).
