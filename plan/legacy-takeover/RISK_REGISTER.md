# Risk Register — Legacy Takeover

**Date:** 2026-05-01

---

## RISK-1: `levelDuration` source ambiguity

| Field | Detail |
|-------|--------|
| **Severity** | Medium |
| **Description** | BUG-1 fix requires level duration to normalize `currentTime` to 0–1 progress. `LevelData.getLevel(id).duration` exists but its value (e.g., 60 seconds) is only defined in the level config — there's no runtime guarantee that `RhythmEngine` actually plays for exactly that duration. If the engine's `isFinished()` logic uses a different duration source, the normalization could be wrong at the edges. |
| **Mitigation** | Verify that `rhythm-engine.js` `isFinished()` uses the same `duration` from `LevelData`. Check the condition at the end of the level. If they diverge, use `Math.min(progress, 1.0)` as a clamp. |
| **Decision needed?** | No — the `Math.min` clamp is sufficient. |

## RISK-2: Playwright not installed in CI

| Field | Detail |
|-------|--------|
| **Severity** | Medium |
| **Description** | Adding `package.json` with `playwright` as devDependency is straightforward, but `npx playwright install chromium` must run once before tests. If the execution environment doesn't have Chromium, tests will fail. The orchestrator logs show tests were run successfully, so Chromium likely exists. |
| **Mitigation** | Document the one-time install step in the test.mjs header comment (already partially there: `Run: node test-game5.mjs [game-dir]`). |
| **Decision needed?** | No — the worker can detect and run `npx playwright install chromium` if needed. |

## RISK-3: Uncommitted changes could be lost

| Field | Detail |
|-------|--------|
| **Severity** | High |
| **Description** | 504 lines across 7 files are uncommitted. Any `git checkout`, `git stash`, or branch switch will lose them. The orchestrator created these in auto-run2 but never committed. |
| **Mitigation** | Packet A commits everything as the first step. This is the highest-priority action. |
| **Decision needed?** | No — commit immediately. |

## RISK-4: Scope creep into level-data.js

| Field | Detail |
|-------|--------|
| **Severity** | Low |
| **Description** | level-data.js (1,508 lines) has no bugs and no uncommitted changes. However, the fix for BUG-1 requires reading `duration` from it. A careless worker might be tempted to "improve" the API while in there. |
| **Mitigation** | The execution breakdown explicitly marks level-data.js as read-only. Workers must not write to it. |
| **Decision needed?** | No. |

## RISK-5: `currentLevelId` scope in ui.js

| Field | Detail |
|-------|--------|
| **Severity** | Low |
| **Description** | BUG-3 fix requires passing `currentLevelId` to `getPhaseCount()` at ui.js:816. The variable may not be in scope — it depends on how the render function receives game state. Need to verify the render function's parameter list or closure access. |
| **Mitigation** | Worker must read the surrounding context before editing. The `renderHUD` function likely receives or has access to level state. If not, the fix is to add it as a parameter to the render call. |
| **Decision needed?** | No — straightforward investigation. |

---

## Escalation criteria

Execution should **stop** and escalate if:
1. Any fix introduces a new JS error (test regression)
2. Total line delta exceeds 500 net lines
3. More than 4 files need modification
4. A bug turns out to be a design flaw requiring architectural change (e.g., if phase detection requires refactoring the entire beat generation pipeline)
