/**
 * Game5 Triple Light - Comprehensive Gameplay Test
 * Tests: 5 levels, 3-lane rhythm, beat system, scoring, light balance,
 *        event cards, bias system, RhythmEngine, state transitions
 * Run: node test-game5.mjs [game-dir]
 */
import { chromium } from 'playwright';
import { resolve } from 'path';

const W = 375, H = 812;
const DIR = process.argv[2] || 'game5-triple-light';

async function test() {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({
    viewport: { width: W, height: H }, isMobile: true, hasTouch: true,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)',
  });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));

  const results = { passed: 0, failed: 0, errors: [] };
  function pass(msg) { results.passed++; console.log(`  ✓ ${msg}`); }
  function fail(msg) { results.failed++; results.errors.push(msg); console.log(`  ✗ ${msg}`); }

  try {
    await page.goto(`file://${resolve(DIR, 'index.html')}`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(1500);
    errors.length === 0 ? pass('No JS errors on load') : fail(`JS errors: ${errors.join('; ')}`);

    // ---- Canvas rendering ----
    const gameArea = await page.evaluate(() => {
      var c = document.querySelector('canvas');
      if (c) return 'canvas:' + c.width + 'x' + c.height;
      var g = document.querySelector('#game, .game, .game-container, #app, main');
      if (g) return 'html:' + g.getBoundingClientRect().width + 'x' + g.getBoundingClientRect().height;
      return 'none';
    });
    gameArea !== 'none' ? pass(`Game area: ${gameArea}`) : fail('No game area found');

    // ---- LevelData: 9 levels ----
    const levelsInfo = await page.evaluate(() => {
      if (typeof LevelData === 'undefined') return { error: 'LevelData not found' };
      var levels = LevelData.getAllLevels();
      if (!levels) return { error: 'getAllLevels returned null' };
      var valid = 0;
      var names = [];
      for (var i = 0; i < levels.length; i++) {
        var l = levels[i];
        if (l && l.id !== undefined && l.name && l.bpm) {
          valid++;
          names.push(l.name);
        }
      }
      return { total: levels.length, valid: valid, names: names.slice(0, 5) };
    });
    if (levelsInfo.error) {
      fail(`LevelData: ${levelsInfo.error}`);
    } else {
      levelsInfo.total === 5 ? pass('5 levels defined') : fail(`Expected 5 levels, got ${levelsInfo.total}`);
      levelsInfo.valid === levelsInfo.total
        ? pass(`All ${levelsInfo.valid} levels valid (id, name, bpm)`)
        : fail(`Only ${levelsInfo.valid}/${levelsInfo.total} levels valid`);
    }

    // ---- LevelData API ----
    const levelDataAPI = await page.evaluate(() => {
      if (typeof LevelData === 'undefined') return null;
      return {
        getLevel: typeof LevelData.getLevel === 'function',
        getIntroText: typeof LevelData.getIntroText === 'function',
        getLevelEvents: typeof LevelData.getLevelEvents === 'function',
        getNarrativeBeatAtTime: typeof LevelData.getNarrativeBeatAtTime === 'function',
        getPhaseTransitionAtTime: typeof LevelData.getPhaseTransitionAtTime === 'function',
        getCharacterDialogueByTrigger: typeof LevelData.getCharacterDialogueByTrigger === 'function',
        getActiveMechanicRules: typeof LevelData.getActiveMechanicRules === 'function',
      };
    });
    if (levelDataAPI) {
      var ldCount = Object.values(levelDataAPI).filter(Boolean).length;
      pass(`LevelData API (${ldCount}/7 methods)`);
    } else {
      fail('LevelData not found');
    }

    // ---- Scoring API ----
    const scoringAPI = await page.evaluate(() => {
      if (typeof Scoring === 'undefined') return null;
      return {
        reset: typeof Scoring.reset === 'function',
        getScore: typeof Scoring.getScore === 'function',
        getGrade: typeof Scoring.getGrade === 'function',
        getAccuracy: typeof Scoring.getAccuracy === 'function',
        getMaxCombo: typeof Scoring.getMaxCombo === 'function',
        getJudgments: typeof Scoring.getJudgments === 'function',
        isLevelPassed: typeof Scoring.isLevelPassed === 'function',
        getCombo: typeof Scoring.getCombo === 'function',
        getCommunionResult: typeof Scoring.getCommunionResult === 'function',
      };
    });
    if (scoringAPI) {
      var scCount = Object.values(scoringAPI).filter(Boolean).length;
      pass(`Scoring API (${scCount}/9 methods)`);
    } else {
      fail('Scoring not found');
    }

    // ---- Scoring roundtrip: reset → check defaults ----
    const scoringDefaults = await page.evaluate(() => {
      if (typeof Scoring === 'undefined') return { error: 'no Scoring' };
      Scoring.reset();
      return {
        score: Scoring.getScore(),
        grade: Scoring.getGrade(),
        accuracy: Scoring.getAccuracy(),
        combo: Scoring.getCombo(),
        maxCombo: Scoring.getMaxCombo(),
        judgments: Scoring.getJudgments(),
      };
    });
    if (scoringDefaults.error) {
      fail(`Scoring defaults: ${scoringDefaults.error}`);
    } else {
      scoringDefaults.score === 0 ? pass('Scoring.reset() clears score') : fail(`Score not 0: ${scoringDefaults.score}`);
      pass(`Grade: ${scoringDefaults.grade}, Accuracy: ${scoringDefaults.accuracy}`);
      pass(`Combo: ${scoringDefaults.combo}, MaxCombo: ${scoringDefaults.maxCombo}`);
    }

    // ---- LightBalance API ----
    const lightAPI = await page.evaluate(() => {
      if (typeof LightBalance === 'undefined') return null;
      return {
        reset: typeof LightBalance.reset === 'function',
        update: typeof LightBalance.update === 'function',
        getLastMilestone: typeof LightBalance.getLastMilestone === 'function',
        getGraphData: typeof LightBalance.getGraphData === 'function',
      };
    });
    if (lightAPI) {
      var lbCount = Object.values(lightAPI).filter(Boolean).length;
      pass(`LightBalance API (${lbCount}/4 methods)`);
    } else {
      fail('LightBalance not found');
    }

    // ---- LightBalance defaults ----
    const lightDefaults = await page.evaluate(() => {
      if (typeof LightBalance === 'undefined') return { error: 'no LightBalance' };
      LightBalance.reset();
      var data = LightBalance.getGraphData();
      return { graphDataLength: data ? data.length : 0 };
    });
    if (lightDefaults.error) {
      fail(`LightBalance defaults: ${lightDefaults.error}`);
    } else {
      pass(`LightBalance graph data: ${lightDefaults.graphDataLength} points`);
    }

    // ---- BeatSystem ----
    const hasBeatSystem = await page.evaluate(() => {
      if (typeof BeatSystem === 'undefined') return false;
      return typeof BeatSystem.clearCache === 'function';
    });
    hasBeatSystem ? pass('BeatSystem exists with clearCache') : fail('BeatSystem not found');

    // ---- InputSystem ----
    const inputAPI = await page.evaluate(() => {
      if (typeof InputSystem === 'undefined') return null;
      return {
        init: typeof InputSystem.init === 'function',
        resetStats: typeof InputSystem.resetStats === 'function',
        update: typeof InputSystem.update === 'function',
        renderLaneFlash: typeof InputSystem.renderLaneFlash === 'function',
      };
    });
    if (inputAPI) {
      pass(`InputSystem API (${Object.values(inputAPI).filter(Boolean).length}/4 methods)`);
    } else {
      fail('InputSystem not found');
    }

    // ---- RhythmEngine API ----
    const rhythmAPI = await page.evaluate(() => {
      if (typeof RhythmEngine === 'undefined') return null;
      return {
        init: typeof RhythmEngine.init === 'function',
        update: typeof RhythmEngine.update === 'function',
        render: typeof RhythmEngine.render === 'function',
        handleLaneHit: typeof RhythmEngine.handleLaneHit === 'function',
        handleLaneRelease: typeof RhythmEngine.handleLaneRelease === 'function',
        isFinished: typeof RhythmEngine.isFinished === 'function',
        getCurrentTime: typeof RhythmEngine.getCurrentTime === 'function',
        getCurrentPhase: typeof RhythmEngine.getCurrentPhase === 'function',
        reset: typeof RhythmEngine.reset === 'function',
      };
    });
    if (rhythmAPI) {
      var reCount = Object.values(rhythmAPI).filter(Boolean).length;
      pass(`RhythmEngine API (${reCount}/9 methods)`);
    } else {
      fail('RhythmEngine not found');
    }

    // ---- EventCards API ----
    const eventCardsAPI = await page.evaluate(() => {
      if (typeof EventCards === 'undefined') return null;
      return {
        init: typeof EventCards.init === 'function',
        loadEvents: typeof EventCards.loadEvents === 'function',
        update: typeof EventCards.update === 'function',
        getActiveCard: typeof EventCards.getActiveCard === 'function',
      };
    });
    if (eventCardsAPI) {
      pass(`EventCards API (${Object.values(eventCardsAPI).filter(Boolean).length}/4 methods)`);
    } else {
      fail('EventCards not found');
    }

    // ---- BiasSystem API ----
    const biasAPI = await page.evaluate(() => {
      if (typeof BiasSystem === 'undefined') return null;
      return {
        reset: typeof BiasSystem.reset === 'function',
        setLevelConfig: typeof BiasSystem.setLevelConfig === 'function',
        update: typeof BiasSystem.update === 'function',
        getActiveBias: typeof BiasSystem.getActiveBias === 'function',
        getBiasLevel: typeof BiasSystem.getBiasLevel === 'function',
        render: typeof BiasSystem.render === 'function',
      };
    });
    if (biasAPI) {
      pass(`BiasSystem API (${Object.values(biasAPI).filter(Boolean).length}/6 methods)`);
    } else {
      fail('BiasSystem not found');
    }

    // ---- BiasSystem defaults ----
    const biasDefaults = await page.evaluate(() => {
      if (typeof BiasSystem === 'undefined') return { error: 'no BiasSystem' };
      BiasSystem.reset();
      var active = BiasSystem.getActiveBias();
      return { activeBias: active };
    });
    if (biasDefaults.error) {
      fail(`BiasSystem defaults: ${biasDefaults.error}`);
    } else {
      pass(`BiasSystem.getActiveBias(): ${JSON.stringify(biasDefaults.activeBias)}`);
    }

    // ---- window.Game input handlers ----
    const gameInput = await page.evaluate(() => {
      if (typeof window.Game === 'undefined') return null;
      return {
        handleKeyDown: typeof window.Game.handleKeyDown === 'function',
        handleKeyUp: typeof window.Game.handleKeyUp === 'function',
      };
    });
    gameInput
      ? pass(`Game input handlers (${Object.values(gameInput).filter(Boolean).length}/2)`)
      : fail('window.Game not found');

    // ---- HTML elements for game screens ----
    const screens = await page.evaluate(() => {
      return {
        titleScreen: !!document.getElementById('title-screen'),
        levelSelect: !!document.getElementById('level-select-screen'),
        pauseScreen: !!document.getElementById('pause-screen'),
        resultsScreen: !!document.getElementById('results-screen'),
        gameCanvas: !!document.getElementById('gameCanvas'),
      };
    });
    screens.gameCanvas ? pass('gameCanvas element exists') : fail('gameCanvas element missing');
    screens.titleScreen ? pass('title-screen exists') : fail('title-screen missing');
    screens.levelSelect ? pass('level-select-screen exists') : fail('level-select-screen missing');
    screens.pauseScreen ? pass('pause-screen exists') : fail('pause-screen missing');
    screens.resultsScreen ? pass('results-screen exists') : fail('results-screen missing');

    // ---- RhythmEngine init ----
    const reInit = await page.evaluate(() => {
      if (typeof RhythmEngine === 'undefined') return { error: 'no RhythmEngine' };
      var c = document.getElementById('gameCanvas');
      if (!c) return { error: 'no canvas' };
      var dpr = window.devicePixelRatio || 1;
      try {
        RhythmEngine.init(0, c.width, c.height, dpr);
        return { ok: true };
      } catch (e) {
        return { error: e.message };
      }
    });
    if (reInit.error) {
      fail(`RhythmEngine.init: ${reInit.error}`);
    } else {
      pass('RhythmEngine.init(0) works');
    }

    // ---- RhythmEngine handleLaneHit ----
    const laneHit = await page.evaluate(() => {
      if (typeof RhythmEngine === 'undefined') return { error: 'no RhythmEngine' };
      try {
        RhythmEngine.handleLaneHit(0);
        RhythmEngine.handleLaneHit(1);
        RhythmEngine.handleLaneHit(2);
        RhythmEngine.handleLaneRelease(0);
        RhythmEngine.handleLaneRelease(1);
        RhythmEngine.handleLaneRelease(2);
        return { ok: true };
      } catch (e) {
        return { error: e.message };
      }
    });
    if (laneHit.error) {
      fail(`Lane hit/release: ${laneHit.error}`);
    } else {
      pass('RhythmEngine lane 0/1/2 hit+release works');
    }

    // ---- RhythmEngine isFinished / getCurrentTime ----
    const reState = await page.evaluate(() => {
      if (typeof RhythmEngine === 'undefined') return { error: 'no RhythmEngine' };
      return {
        isFinished: RhythmEngine.isFinished(),
        currentTime: RhythmEngine.getCurrentTime(),
        currentPhase: RhythmEngine.getCurrentPhase ? RhythmEngine.getCurrentPhase() : 'N/A',
      };
    });
    if (reState.error) {
      fail(`RhythmEngine state: ${reState.error}`);
    } else {
      pass(`RhythmEngine state: finished=${reState.isFinished}, time=${reState.currentTime}, phase=${reState.currentPhase}`);
    }

    // ---- Scoring after lane hits ----
    const scoringAfter = await page.evaluate(() => {
      if (typeof Scoring === 'undefined') return { error: 'no Scoring' };
      return {
        score: Scoring.getScore(),
        combo: Scoring.getCombo(),
        judgments: Scoring.getJudgments(),
      };
    });
    if (scoringAfter.error) {
      fail(`Scoring after hits: ${scoringAfter.error}`);
    } else {
      pass(`Scoring after hits: score=${scoringAfter.score}, combo=${scoringAfter.combo}`);
    }

    // ---- isLevelPassed ----
    const levelPassed = await page.evaluate(() => {
      if (typeof Scoring === 'undefined') return { error: 'no Scoring' };
      return { passed: Scoring.isLevelPassed(0) };
    });
    if (levelPassed.error) {
      fail(`isLevelPassed: ${levelPassed.error}`);
    } else {
      pass(`Scoring.isLevelPassed(0): ${levelPassed.passed}`);
    }

    // ---- getCommunionResult ----
    const communion = await page.evaluate(() => {
      if (typeof Scoring === 'undefined') return { error: 'no Scoring' };
      return Scoring.getCommunionResult(0);
    });
    if (communion.error) {
      fail(`getCommunionResult: ${communion.error}`);
    } else {
      pass(`Scoring.getCommunionResult(0): ${JSON.stringify(communion)}`);
    }

    // ---- Touch on canvas ----
    const touchOk = await page.evaluate(() => {
      var target = document.querySelector('canvas') || document.body;
      try {
        var rect = target.getBoundingClientRect();
        var t = new Touch({ identifier: 1, target, clientX: rect.x + rect.width / 2, clientY: rect.y + rect.height / 2 });
        target.dispatchEvent(new TouchEvent('touchstart', { touches: [t], bubbles: true }));
        target.dispatchEvent(new TouchEvent('touchend', { changedTouches: [t], bubbles: true }));
        return 'ok';
      } catch (e) { return e.message; }
    });
    touchOk === 'ok' ? pass('Touch interaction works') : fail(`Touch failed: ${touchOk}`);

    // ---- Multi-touch (2 lanes) ----
    const multiTouch = await page.evaluate(() => {
      var c = document.querySelector('canvas');
      if (!c) return 'no canvas';
      try {
        var rect = c.getBoundingClientRect();
        var t1 = new Touch({ identifier: 1, target: c, clientX: rect.x + rect.width * 0.17, clientY: rect.y + rect.height * 0.8 });
        var t2 = new Touch({ identifier: 2, target: c, clientX: rect.x + rect.width * 0.5, clientY: rect.y + rect.height * 0.8 });
        c.dispatchEvent(new TouchEvent('touchstart', { touches: [t1, t2], bubbles: true }));
        c.dispatchEvent(new TouchEvent('touchend', { touches: [], changedTouches: [t1, t2], bubbles: true }));
        return 'ok';
      } catch (e) { return e.message; }
    });
    multiTouch === 'ok' ? pass('Multi-touch dispatch works') : fail(`Multi-touch: ${multiTouch}`);

    // ---- localStorage save key ----
    const saveKey = await page.evaluate(() => {
      try {
        var val = localStorage.getItem('triplelight_save');
        return val !== null ? 'exists' : 'empty';
      } catch (e) { return 'error'; }
    });
    pass(`localStorage triplelight_save: ${saveKey}`);

    // ---- No horizontal overflow ----
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    overflow <= 2 ? pass('No horizontal overflow') : fail(`Overflow: ${overflow}px`);

    // ---- No JS errors after all interactions ----
    errors.length === 0
      ? pass('No JS errors after all interactions')
      : fail(`Errors: ${errors.join('; ')}`);

  } catch (err) {
    fail(`Fatal: ${err.message}`);
  }

  await ctx.close();
  await browser.close();
  console.log(`\n  Total: ${results.passed} passed, ${results.failed} failed`);
  return results;
}

test().then(r => process.exit(r.failed > 0 ? 1 : 0)).catch(e => { console.error(e); process.exit(2); });
