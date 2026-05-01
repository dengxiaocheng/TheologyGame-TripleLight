# Legacy Fix Plan — 历史中的三重光

**Date:** 2026-05-01
**Budget:** 4 files max, ~500 net lines, 6 bugs

---

## Strategy

Fix bugs in dependency order: data layer first, then consumers. Each fix is atomic and testable independently.

### Fix order

| Step | Bug | What | File(s) | Delta |
|------|-----|------|---------|-------|
| 1 | BUG-4+5 | Commit dirty state + add package.json with test runner | root + git | +15 lines |
| 2 | BUG-1 | Normalize progress in `getCurrentPhaseIndex()` | rhythm-engine.js | +5 lines |
| 3 | BUG-2 | Implement `setActiveMechanicRules` in RhythmEngine | rhythm-engine.js | +15 lines |
| 4 | BUG-3 | Pass `levelId` to `getPhaseCount()` | ui.js | +1 line |
| 5 | BUG-6 | Wire aurora/light beam triggers | main.js | +3 lines |

### Stop conditions

1. All 34 existing tests pass (`node test.mjs`)
2. No JS errors in Playwright mobile session
3. Manual verification: Level 1 phase transitions fire correctly (narrative text, character dialogue)
4. Git clean (all changes committed)

### What NOT to do

- Do not refactor module patterns (IIFE is consistent)
- Do not add new tests (budget constraint)
- Do not modify level-data.js (committed, no bugs)
- Do not touch event-cards.js, beat-system.js, light-balance.js, bias-system.js, scoring.js, input-system.js
