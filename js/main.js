/**
 * Main Game Controller — 历史中的三重光
 * State machine, game loop, UI wiring, localStorage persistence.
 * Phase 2: Event cards, bias system, intro state, communion results.
 * Phase 3B: Tutorial hints, milestone notifications, combo fire, screen shake, stars.
 */
var Game = (function () {
    var STATES = {
        title: 'title',
        levelSelect: 'levelSelect',
        intro: 'intro',
        playing: 'playing',
        paused: 'paused',
        results: 'results'
    };
    var state = STATES.title;

    var canvas, ctx;
    var dpr = 1;
    var canvasW = 0, canvasH = 0;

    var currentLevelId = 0;
    var currentLevelName = '';
    var lastTime = 0;
    var rafId = null;

    var STORAGE_KEY = 'triplelight_save';

    // --- Phase 3B: Tutorial state ---
    var tutorialState = {
        firstPlay: false,
        firstCombo: false,
        firstBias: false,
        firstCard: false,
        firstPerfect: false
    };

    // --- Phase 3B: Milestone tracking ---
    var prevMilestone = 0;

    // --- Save/Load ---
    function loadSave() {
        try {
            var raw = localStorage.getItem(STORAGE_KEY);
            return raw ? JSON.parse(raw) : {};
        } catch (e) {
            return {};
        }
    }

    function writeSave(data) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch (e) { /* ignore */ }
    }

    function isLevelUnlocked(levelId) {
        var save = loadSave();
        if (levelId === 1) return true;
        var level = LevelData.getLevel(levelId);
        if (!level || !level.unlockCondition) return true;
        // Check if previous level has a best score
        return !!save['best_' + level.unlockCondition];
    }

    function getBestScore(levelId) {
        var save = loadSave();
        return save['best_' + levelId] || 0;
    }

    function saveBestScore(levelId, score) {
        var save = loadSave();
        var key = 'best_' + levelId;
        if (!save[key] || score > save[key]) {
            save[key] = score;
            writeSave(save);
        }
    }

    // --- Init ---
    function init() {
        canvas = document.getElementById('gameCanvas');
        if (!canvas) return;
        ctx = canvas.getContext('2d');

        dpr = window.devicePixelRatio || 1;
        resize();

        InputSystem.init();
        BeatSystem.clearCache();

        // UI buttons
        wireButton('btn-start', function () { showScreen(STATES.levelSelect); });
        wireButton('btn-back-title', function () { showScreen(STATES.title); });
        wireButton('btn-resume', function () { resumeGame(); });
        wireButton('btn-quit', function () { quitGame(); });
        wireButton('btn-results-back', function () { showScreen(STATES.levelSelect); });

        // Build level list
        buildLevelList();

        // Start game loop
        lastTime = performance.now();
        gameLoop(lastTime);
    }

    function resize() {
        canvasW = window.innerWidth * dpr;
        canvasH = window.innerHeight * dpr;
        canvas.width = canvasW;
        canvas.height = canvasH;
        canvas.style.width = window.innerWidth + 'px';
        canvas.style.height = window.innerHeight + 'px';
    }

    function wireButton(id, handler) {
        var btn = document.getElementById(id);
        if (btn) {
            btn.addEventListener('click', handler);
            btn.addEventListener('touchend', function (e) {
                e.preventDefault();
                handler();
            });
        }
    }

    function buildLevelList() {
        var container = document.getElementById('level-list');
        if (!container) return;
        container.innerHTML = '';

        var levels = LevelData.getAllLevels();
        for (var i = 0; i < levels.length; i++) {
            (function (level) {
                var item = document.createElement('div');
                item.className = 'level-item';
                var unlocked = isLevelUnlocked(level.id);

                if (!unlocked) {
                    item.classList.add('locked');
                }

                var best = getBestScore(level.id);
                item.innerHTML =
                    '<div>' +
                    '<div class="level-name">' + level.name + '</div>' +
                    '<div class="level-subtitle">' + level.subtitle + '</div>' +
                    '</div>' +
                    '<div class="level-bpm">' + (unlocked ? (best > 0 ? best : level.bpm + ' BPM') : '\uD83D\uDD12') + '</div>';

                if (unlocked) {
                    item.addEventListener('click', function () { startLevel(level.id); });
                    item.addEventListener('touchend', function (e) {
                        e.preventDefault();
                        startLevel(level.id);
                    });
                }

                container.appendChild(item);
            })(levels[i]);
        }
    }

    function showScreen(newState) {
        state = newState;
        // Toggle HTML overlay screens
        var screens = ['title-screen', 'level-select-screen', 'pause-screen', 'results-screen'];
        for (var i = 0; i < screens.length; i++) {
            var el = document.getElementById(screens[i]);
            if (el) el.classList.add('hidden');
        }

        switch (state) {
            case STATES.title:
                toggleScreen('title-screen', false);
                break;
            case STATES.levelSelect:
                buildLevelList();
                toggleScreen('level-select-screen', false);
                break;
            case STATES.paused:
                toggleScreen('pause-screen', false);
                break;
            case STATES.results:
                toggleScreen('results-screen', false);
                break;
            case STATES.intro:
            case STATES.playing:
                // All screens hidden
                break;
        }
    }

    function toggleScreen(id, hidden) {
        var el = document.getElementById(id);
        if (el) {
            if (hidden) el.classList.add('hidden');
            else el.classList.remove('hidden');
        }
    }

    // --- Game flow ---
    function startLevel(levelId) {
        currentLevelId = levelId;
        var level = LevelData.getLevel(levelId);
        if (!level) return;
        currentLevelName = level.name;

        Scoring.reset();
        LightBalance.reset();
        Animation.reset();
        BeatSystem.clearCache();
        BiasSystem.reset();
        EventCards.init();
        InputSystem.resetStats();

        // Phase 3B: Reset tutorial and milestone state
        tutorialState = {
            firstPlay: false,
            firstCombo: false,
            firstBias: false,
            firstCard: false,
            firstPerfect: false
        };
        prevMilestone = 0;

        RhythmEngine.init(levelId, canvasW, canvasH, dpr);
        EventCards.loadEvents(LevelData.getLevelEvents(levelId));
        BiasSystem.setLevelConfig(level);

        // Show intro text
        var introText = LevelData.getIntroText(levelId);
        if (introText) {
            state = STATES.intro;
            showScreen(STATES.intro);
            UI.showIntro(introText);
        } else {
            state = STATES.playing;
            showScreen(STATES.playing);
        }

        lastTime = performance.now();
    }

    function dismissIntro() {
        if (state !== STATES.intro) return;
        UI.fadeIntro();
        // Transition to playing after fade starts
        setTimeout(function () {
            state = STATES.playing;
            showScreen(STATES.playing);
            lastTime = performance.now();
        }, 100);
    }

    function resumeGame() {
        state = STATES.playing;
        showScreen(STATES.playing);
        // Reset lastTime to prevent a large dt spike after unpause
        lastTime = 0;
    }

    function togglePause() {
        if (state === STATES.playing) {
            state = STATES.paused;
            showScreen(STATES.paused);
        } else if (state === STATES.paused) {
            resumeGame();
        }
    }

    function quitGame() {
        RhythmEngine.reset();
        state = STATES.levelSelect;
        showScreen(STATES.levelSelect);
    }

    function endLevel() {
        state = STATES.results;
        var score = Scoring.getScore();
        var passed = Scoring.isLevelPassed(currentLevelId);

        // Only save best score if level is passed
        if (passed) {
            saveBestScore(currentLevelId, score);
        }

        // Update results screen content
        var content = document.getElementById('results-content');
        if (content) {
            var jdgs = Scoring.getJudgments();
            var communionResult = Scoring.getCommunionResult(currentLevelId);
            content.innerHTML =
                '<div class="result-grade">' + Scoring.getGrade() + '</div>' +
                '<div class="result-status" style="color:' + (passed ? '#81C784' : '#EF5350') + '">' +
                (passed ? '通关 Passed' : '未通过 Not Passed') + '</div>' +
                '<div class="result-row"><span class="result-label">Score</span><span class="result-value">' + score + '</span></div>' +
                '<div class="result-row"><span class="result-label">Accuracy</span><span class="result-value">' + Scoring.getAccuracy() + '%</span></div>' +
                '<div class="result-row"><span class="result-label">Max Combo</span><span class="result-value">' + Scoring.getMaxCombo() + '</span></div>' +
                '<div class="result-row"><span class="result-label">Perfect</span><span class="result-value" style="color:#FFD54F">' + jdgs.perfect + '</span></div>' +
                '<div class="result-row"><span class="result-label">Great</span><span class="result-value" style="color:#4FC3F7">' + jdgs.great + '</span></div>' +
                '<div class="result-row"><span class="result-label">Good</span><span class="result-value" style="color:#81C784">' + jdgs.good + '</span></div>' +
                '<div class="result-row"><span class="result-label">Miss</span><span class="result-value" style="color:#EF5350">' + jdgs.miss + '</span></div>' +
                '<div class="result-row"><span class="result-label">Communion</span><span class="result-value" style="color:' + (communionResult.passed ? '#CE93D8' : '#EF5350') + '">' +
                communionResult.score + ' / ' + communionResult.required + '</span></div>';
        }

        var title = document.getElementById('results-title');
        if (title) title.textContent = currentLevelName;

        showScreen(STATES.results);
    }

    // --- Input handlers ---
    function handleKeyDown(action) {
        if (state === STATES.intro) {
            if (action.indexOf('lane_') === 0 || action === 'confirm' || action === 'escape') {
                dismissIntro();
            }
        } else if (state === STATES.playing) {
            if (action.indexOf('lane_') === 0) {
                var lane = parseInt(action.split('_')[1], 10);
                RhythmEngine.handleLaneHit(lane);
            } else if (action === 'escape') {
                togglePause();
            }
        } else if (state === STATES.paused) {
            if (action === 'escape' || action === 'confirm') {
                resumeGame();
            }
        } else if (state === STATES.results) {
            if (action === 'confirm' || action === 'escape') {
                showScreen(STATES.levelSelect);
            }
        }
    }

    function handleKeyUp(action) {
        if (state === STATES.playing) {
            if (action && action.indexOf && action.indexOf('lane_') === 0) {
                var lane = parseInt(action.split('_')[1], 10);
                RhythmEngine.handleLaneRelease(lane);
            }
        }
    }

    // --- Game loop ---
    function gameLoop(timestamp) {
        rafId = requestAnimationFrame(gameLoop);

        var dt = 0;
        if (lastTime === 0) {
            // First frame after resume/init — use nominal dt, no spike
            dt = 0.016;
        } else {
            dt = (timestamp - lastTime) / 1000;
            if (dt > 0.1) dt = 0.016; // cap delta for tab-switch
        }
        lastTime = timestamp;

        if (state === STATES.intro) {
            UI.updateIntro(dt);
        } else if (state === STATES.playing) {
            update(dt);
        }

        render();
    }

    function update(dt) {
        InputSystem.update(dt);
        RhythmEngine.update(dt);
        LightBalance.update(dt);
        Animation.update(dt);

        // Extended animation system update
        if (typeof Animation !== 'undefined' && Animation.updateAll) {
            Animation.updateAll(dt);
        }

        var currentTime = RhythmEngine.getCurrentTime();
        EventCards.update(dt, currentTime);
        BiasSystem.update();

        // --- Phase 3B: Combo fire ---
        Animation.updateComboFire(Scoring.getCombo(), dt);

        // Phase 8: Pulse ring on perfect hit
        if (typeof Animation !== 'undefined' && Animation.updatePulseRings) {
            Animation.updatePulseRings(dt);
        }

        // --- Phase 3B: Tutorial hint triggers ---
        if (!tutorialState.firstPlay) {
            tutorialState.firstPlay = true;
            UI.showTutorialHint('firstPlay');
        }

        var combo = Scoring.getCombo();
        if (!tutorialState.firstCombo && combo >= 10) {
            tutorialState.firstCombo = true;
            UI.showTutorialHint('firstCombo');
        }

        if (!tutorialState.firstBias && BiasSystem.getActiveBias()) {
            tutorialState.firstBias = true;
            UI.showTutorialHint('firstBias');
        }

        if (!tutorialState.firstCard && typeof EventCards !== 'undefined' && EventCards.getActiveCard()) {
            tutorialState.firstCard = true;
            UI.showTutorialHint('firstCard');
        }

        var jdgs = Scoring.getJudgments();
        if (!tutorialState.firstPerfect && jdgs.perfect > 0) {
            tutorialState.firstPerfect = true;
            UI.showTutorialHint('firstPerfect');
        }

        // --- Phase 3B: Tutorial hint timer ---
        UI.updateTutorialHint(dt);

        // --- Phase 3B: Milestone notifications ---
        if (typeof LightBalance !== 'undefined') {
            var milestone = LightBalance.getLastMilestone();
            if (milestone > prevMilestone && milestone > 0) {
                prevMilestone = milestone;
                Animation.showAchievement('平衡里程碑 ' + milestone + '秒', 'Balance Milestone');
            }
        }

        if (RhythmEngine.isFinished()) {
            endLevel();
        }
    }

    function render() {
        ctx.clearRect(0, 0, canvasW, canvasH);

        // --- Phase 3B: Background stars ---
        if (state === STATES.playing || state === STATES.paused || state === STATES.intro) {
            Animation.renderStars(ctx, canvasW, canvasH);
        }

        // --- Phase 3B: Screen shake ---
        var shake = Animation.getShakeOffset();

        if (state === STATES.intro) {
            ctx.save();
            ctx.translate(shake.x, shake.y);
            RhythmEngine.render(ctx);
            UI.renderIntro(ctx, canvasW, canvasH, dpr);
            ctx.restore();
        } else if (state === STATES.playing || state === STATES.paused) {
            ctx.save();
            ctx.translate(shake.x, shake.y);
            RhythmEngine.render(ctx);
            InputSystem.renderLaneFlash(ctx, canvasW, canvasH, dpr);
            UI.renderHUD(ctx, canvasW, canvasH, dpr, currentLevelName);
            UI.renderEventCard(ctx, canvasW, canvasH, dpr);
            BiasSystem.render(ctx, canvasW, canvasH, dpr);
            Animation.render(ctx);
            // Extended animation system render
            if (typeof Animation !== 'undefined' && Animation.renderAll) {
                Animation.renderAll(ctx, canvasW, canvasH, dpr);
            }
            if (typeof Animation !== 'undefined' && Animation.renderPulseRings) {
                Animation.renderPulseRings(ctx);
            }
            ctx.restore();
        }
    }

    // Expose for input system
    window.Game = {
        handleKeyDown: handleKeyDown,
        handleKeyUp: handleKeyUp
    };

    // Init on load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Handle resize
    window.addEventListener('resize', function () {
        if (canvas) {
            dpr = window.devicePixelRatio || 1;
            resize();
        }
    });

    return {
        init: init,
        handleKeyDown: handleKeyDown,
        handleKeyUp: handleKeyUp
    };
})();
