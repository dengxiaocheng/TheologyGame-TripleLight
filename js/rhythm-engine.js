/**
 * Rhythm Engine — 历史中的三重光
 * Beat rendering, hit detection, 3-lane rhythm gameplay.
 * Phase 2: Hold note support, simultaneous judgment, lane release handling.
 * Phase 3A: recordLaneHit integration, lane glow, approach warning, combo display.
 * Phase 3C: renderBackground, countdown, beat trails, phase-aware density,
 *           judgment text animation, beat connection lines, fever mode, rhythm pulse.
 */
var RhythmEngine = (function () {
    var APPROACH_TIME = 2000; // ms for beats to fall from top to judgment line
    var JUDGMENT_WINDOWS = {
        perfect: 50,
        great: 100,
        good: 150
    };

    var LANE_COLORS = ['#4FC3F7', '#FFD54F', '#CE93D8'];
    var BEAT_RADIUS = 16;

    var BEAT_NORMAL = 0;
    var BEAT_HOLD = 1;
    var BEAT_SIMULTANEOUS = 2;
    var BEAT_GOLDEN = 3;
    var BEAT_SHADOW = 4;

    var beats = [];
    var currentTime = 0;
    var started = false;
    var levelDuration = 0;
    var canvasW = 0;
    var canvasH = 0;
    var dpr = 1;
    var currentLevelId = 0;
    var currentBPM = 120;

    // Track which lanes are currently held down
    var lanesHeld = {};

    // --- Phase 3A: Lane glow based on light balance ---
    var laneGlowIntensity = [0, 0, 0];
    var LANE_GLOW_DECAY = 2.0;

    // --- Phase 3A: Approach warning pulse ---
    var approachWarningAlpha = 0;
    var APPROACH_WARN_TIME = 500; // ms before beat arrives

    // --- Phase 3A: Combo display ---
    var comboDisplayAlpha = 0;
    var comboDisplayTimer = 0;
    var COMBO_DISPLAY_DURATION = 1.5; // seconds
    var lastComboMilestone = 0;

    // --- Phase 3C: Countdown system ---
    var COUNTDOWN_DURATION = 3000; // 3 seconds (3-2-1)
    var GO_DURATION = 500; // "GO!" display time
    var countdownActive = false;
    var countdownElapsed = 0;
    var countdownPhase = ''; // '3', '2', '1', 'GO', ''

    // --- Phase 3C: Beat approach trails ---
    var TRAIL_LENGTH = 5;
    var trailHistory = {}; // beatIndex -> [{x, y, time}]

    // --- Phase 3C: Judgment text animation ---
    var judgmentAnims = []; // [{text, x, y, life, maxLife, color, scale}]

    // --- Phase 3C: Fever mode ---
    var FEVER_THRESHOLD = 50;
    var feverActive = false;
    var feverIntensity = 0;
    var feverPulsePhase = 0;
    var FEVER_DECAY = 1.5;

    // --- Phase 3C: Rhythm pulse ---
    var rhythmPulseAlpha = 0;
    var lastBeatTime = 0;
    var beatInterval = 500; // ms between beats at current BPM

    // --- Phase 3C: Background rendering ---
    var bgGradientOffset = 0;
    var BG_GRADIENT_SPEED = 0.02;

    // --- Phase 3C: Phase-aware density ---
    var currentPhaseDensity = 1.0;
    var phaseDensityTarget = 1.0;

    // --- Narrative renderer state ---
    var narrativeState = { active: false, queue: [], currentNarrative: null, timer: 0 };

    // --- Phase transition visual effect state ---
    var phaseVisualEffect = { active: false, type: 'none', timer: 0, duration: 0 };

    // --- Background variant state ---
    var backgroundVariants = {
        standard: { topColor: '#0a0a2e', bottomColor: '#1a1a4e', starDensity: 0.3 },
        intense: { topColor: '#1a0a0a', bottomColor: '#3a1a1a', starDensity: 0.5 },
        meditative: { topColor: '#0a1a2e', bottomColor: '#1a2a3e', starDensity: 0.15 },
        climactic: { topColor: '#1a1a0a', bottomColor: '#3a3a1a', starDensity: 0.6 },
        celestial: { topColor: '#0a0a3e', bottomColor: '#2a1a4e', starDensity: 0.4 }
    };
    var currentBgVariant = 'standard';
    var lastPhaseName = '';

    function init(levelId, cw, ch, d) {
        canvasW = cw;
        canvasH = ch;
        dpr = d;
        currentLevelId = levelId;

        var level = LevelData.getLevel(levelId);
        currentBPM = level ? level.bpm : 120;
        beatInterval = 60000 / currentBPM;

        beats = BeatSystem.getBeatsForLevel(levelId).map(function (b) {
            return {
                time: b.time,
                lane: b.lane,
                type: b.type,
                duration: b.duration,
                hit: false,
                missed: false,
                judgment: null,
                holdStarted: false,
                holdProgress: 0,
                holdReleased: false,
                special: b.special || 0
            };
        });
        levelDuration = level ? level.duration * 1000 : 60000;
        currentTime = 0;
        started = true;
        lanesHeld = {};
        laneGlowIntensity = [0, 0, 0];
        approachWarningAlpha = 0;
        comboDisplayAlpha = 0;
        comboDisplayTimer = 0;
        lastComboMilestone = 0;

        // Phase 3C resets
        countdownActive = true;
        countdownElapsed = 0;
        countdownPhase = '3';
        trailHistory = {};
        judgmentAnims = [];
        feverActive = false;
        feverIntensity = 0;
        feverPulsePhase = 0;
        rhythmPulseAlpha = 0;
        lastBeatTime = 0;
        bgGradientOffset = 0;
        currentPhaseDensity = 1.0;
        phaseDensityTarget = 1.0;
    }

    function getJudgmentLineY() {
        return canvasH - 90 * dpr;
    }

    function getLaneX(lane) {
        var laneWidth = canvasW / 3;
        return laneWidth * lane + laneWidth / 2;
    }

    function getLaneWidth() {
        return canvasW / 3;
    }

    function handleLaneHit(lane) {
        if (!started) return;

        // Ignore hits during countdown
        if (countdownActive) return;

        // Track held state for hold notes
        lanesHeld[lane] = true;

        // Find simultaneous group if the best beat is simultaneous
        var bestBeat = null;
        var bestDiff = Infinity;

        for (var i = 0; i < beats.length; i++) {
            var b = beats[i];
            if (b.hit || b.missed || b.lane !== lane) continue;
            var diff = Math.abs(b.time - currentTime);
            if (diff < bestDiff) {
                bestDiff = diff;
                bestBeat = b;
            }
        }

        if (!bestBeat || bestDiff > JUDGMENT_WINDOWS.good) return;

        var judgment = 'good';
        if (bestDiff <= JUDGMENT_WINDOWS.perfect) judgment = 'perfect';
        else if (bestDiff <= JUDGMENT_WINDOWS.great) judgment = 'great';

        // Calculate score multiplier for special beats
        var specialMultiplier = 1;
        if (typeof BeatSystem !== 'undefined' && typeof BeatSystem.getSpecialBeatMultiplier === 'function') {
            specialMultiplier = BeatSystem.getSpecialBeatMultiplier(bestBeat.special);
        }

        if (bestBeat.type === BEAT_HOLD) {
            bestBeat.holdStarted = true;
            bestBeat.judgment = judgment;
            Scoring.recordJudgment(judgment);
            Scoring.recordLaneHit(lane, judgment);
            LightBalance.recordHit(lane, judgment);

            // Lane glow on hit
            laneGlowIntensity[lane] = 1.0;

            var jy = getJudgmentLineY();
            var jx = getLaneX(lane);
            Animation.hitEffect(jx, jy, lane, judgment);

            // Phase 3C: Judgment animation
            spawnJudgmentAnim(judgment, jx, jy, lane);
        } else {
            bestBeat.hit = true;
            bestBeat.judgment = judgment;

            var bonus = (typeof EventCards !== 'undefined') ? EventCards.getLaneBonus(lane) : 0;
            bonus += (specialMultiplier - 1); // Golden beat bonus
            Scoring.recordJudgment(judgment, bonus);
            Scoring.recordLaneHit(lane, judgment);
            LightBalance.recordHit(lane, judgment);

            // Lane glow on hit
            laneGlowIntensity[lane] = 1.0;

            var jy = getJudgmentLineY();
            var jx = getLaneX(lane);
            Animation.hitEffect(jx, jy, lane, judgment);

            // Phase 3C: Judgment animation
            spawnJudgmentAnim(judgment, jx, jy, lane);

            // Phase 3C: Extra effects for golden beats
            if (bestBeat.special === BEAT_GOLDEN) {
                spawnJudgmentAnim('golden', jx, jy - 30 * dpr, lane);
                if (typeof Animation !== 'undefined') {
                    Animation.triggerShake(3.0);
                }
            }

            // If simultaneous, also judge other simultaneous beats at the same time
            if (bestBeat.type === BEAT_SIMULTANEOUS) {
                for (var si = 0; si < beats.length; si++) {
                    var sb = beats[si];
                    if (sb === bestBeat || sb.hit || sb.missed) continue;
                    if (sb.type === BEAT_SIMULTANEOUS && Math.abs(sb.time - bestBeat.time) < 10) {
                        sb.hit = true;
                        sb.judgment = judgment;
                        Scoring.recordJudgment(judgment);
                        Scoring.recordLaneHit(sb.lane, judgment);
                        LightBalance.recordHit(sb.lane, judgment);
                        laneGlowIntensity[sb.lane] = 1.0;
                        var sx = getLaneX(sb.lane);
                        Animation.hitEffect(sx, jy, sb.lane, judgment);
                        spawnJudgmentAnim(judgment, sx, jy, sb.lane);
                    }
                }
            }
        }

        // Check combo milestone for display
        checkComboMilestone();
    }

    function handleLaneRelease(lane) {
        if (!started) return;
        delete lanesHeld[lane];

        for (var i = 0; i < beats.length; i++) {
            var b = beats[i];
            if (b.type !== BEAT_HOLD || b.lane !== lane || !b.holdStarted || b.holdReleased || b.hit || b.missed) continue;

            var holdEnd = b.time + b.duration;
            if (currentTime >= holdEnd) {
                b.hit = true;
            } else {
                b.hit = true;
                if (b.judgment === 'perfect' || b.judgment === 'great') {
                    b.judgment = 'good';
                }
            }
            b.holdReleased = true;
        }
    }

    function update(dt) {
        if (!started) return;

        // --- Phase 3C: Countdown ---
        if (countdownActive) {
            countdownElapsed += dt * 1000;
            if (countdownElapsed >= COUNTDOWN_DURATION + GO_DURATION) {
                countdownActive = false;
                countdownPhase = '';
            } else if (countdownElapsed >= COUNTDOWN_DURATION) {
                countdownPhase = 'GO';
            } else {
                var phaseIndex = Math.floor(countdownElapsed / 1000);
                countdownPhase = '' + (3 - phaseIndex);
            }
            // During countdown, don't advance gameplay time but still render
            return;
        }

        currentTime += dt * 1000;

        // --- Phase 3C: Rhythm pulse ---
        updateRhythmPulse();

        // --- Phase 3C: Background gradient animation ---
        bgGradientOffset += BG_GRADIENT_SPEED * dt;
        if (bgGradientOffset > 1.0) bgGradientOffset -= 1.0;

        // --- Phase 3C: Phase-aware density ---
        updatePhaseDensity();

        // --- Narrative renderer update ---
        updateNarrativeState(dt);

        // --- Phase transition visual update ---
        updatePhaseVisual(dt);

        // --- Check for phase transitions (auto-trigger visuals) ---
        checkPhaseTransition();

        // --- Phase 3C: Fever mode ---
        updateFeverMode(dt);

        // --- Phase 3A: Lane glow decay ---
        for (var gi = 0; gi < 3; gi++) {
            if (laneGlowIntensity[gi] > 0) {
                laneGlowIntensity[gi] = Math.max(0, laneGlowIntensity[gi] - LANE_GLOW_DECAY * dt);
            }
        }

        // --- Phase 3A: Approach warning pulse ---
        updateApproachWarning();

        // --- Phase 3A: Combo display timer ---
        if (comboDisplayTimer > 0) {
            comboDisplayTimer -= dt;
            comboDisplayAlpha = Math.max(0, comboDisplayTimer / COMBO_DISPLAY_DURATION);
        } else {
            comboDisplayAlpha = 0;
        }

        // --- Phase 3C: Update judgment animations ---
        updateJudgmentAnims(dt);

        // --- Phase 3C: Update beat trails ---
        updateBeatTrails();

        // Check for missed beats
        for (var i = 0; i < beats.length; i++) {
            var b = beats[i];
            if (b.hit || b.missed) continue;

            if (b.type === BEAT_HOLD) {
                if (!b.holdStarted && (currentTime - b.time) > JUDGMENT_WINDOWS.good) {
                    b.missed = true;
                    b.judgment = 'miss';
                    Scoring.recordJudgment('miss');
                    Scoring.recordLaneHit(b.lane, 'miss');
                    LightBalance.recordHit(b.lane, 'miss');

                    var jy = getJudgmentLineY();
                    var jx = getLaneX(b.lane);
                    Animation.missEffect(jx, jy, b.lane);
                    spawnJudgmentAnim('miss', jx, jy, b.lane);
                }
                if (b.holdStarted && !b.holdReleased && !b.hit) {
                    var holdEnd = b.time + b.duration;
                    b.holdProgress = Math.min(1, (currentTime - b.time) / b.duration);

                    if (currentTime >= holdEnd) {
                        if (lanesHeld[b.lane]) {
                            b.hit = true;
                            b.holdReleased = true;
                        } else if (!b.holdReleased) {
                            b.hit = true;
                            b.holdReleased = true;
                        }
                    }
                }
            } else {
                if ((currentTime - b.time) > JUDGMENT_WINDOWS.good) {
                    b.missed = true;
                    b.judgment = 'miss';
                    Scoring.recordJudgment('miss');
                    Scoring.recordLaneHit(b.lane, 'miss');
                    LightBalance.recordHit(b.lane, 'miss');

                    var jy = getJudgmentLineY();
                    var jx = getLaneX(b.lane);
                    Animation.missEffect(jx, jy, b.lane);
                    spawnJudgmentAnim('miss', jx, jy, b.lane);

                    // Phase 3C: Shadow beat penalty
                    if (b.special === BEAT_SHADOW && typeof Scoring !== 'undefined') {
                        Scoring.recordJudgment('miss');
                    }
                }
            }
        }
    }

    // --- Phase 3C: Rhythm pulse ---
    function updateRhythmPulse() {
        var timeSinceLastBeat = currentTime % beatInterval;
        if (timeSinceLastBeat < 50) {
            // On the beat
            rhythmPulseAlpha = 0.08;
            lastBeatTime = currentTime;
        } else {
            rhythmPulseAlpha = Math.max(0, rhythmPulseAlpha - 0.001);
        }
    }

    // --- Phase 3C: Phase-aware density ---
    function updatePhaseDensity() {
        if (typeof LevelData !== 'undefined' && typeof LevelData.getCurrentPhase === 'function') {
            var phase = LevelData.getCurrentPhase(currentLevelId, currentTime);
            if (phase && typeof phase.beatDensity === 'number') {
                phaseDensityTarget = phase.beatDensity;
            }
        }
        // Smooth interpolation toward target
        currentPhaseDensity += (phaseDensityTarget - currentPhaseDensity) * 0.05;
    }

    // --- Phase 3C: Fever mode ---
    function updateFeverMode(dt) {
        var combo = typeof Scoring !== 'undefined' ? Scoring.getCombo() : 0;
        var wasFever = feverActive;

        if (combo >= FEVER_THRESHOLD) {
            feverActive = true;
            feverIntensity = Math.min(1.0, feverIntensity + dt * FEVER_DECAY);
        } else {
            feverActive = false;
            feverIntensity = Math.max(0, feverIntensity - dt * FEVER_DECAY);
        }

        if (feverActive) {
            feverPulsePhase += dt * 6;
        }

        // Trigger shake on fever activation
        if (feverActive && !wasFever) {
            if (typeof Animation !== 'undefined') {
                Animation.showAchievement('Fever Mode!', '连击 × ' + FEVER_THRESHOLD + '+');
                Animation.triggerShake(5.0);
            }
        }
    }

    // --- Phase 3C: Judgment animation spawning ---
    function spawnJudgmentAnim(judgment, x, y, lane) {
        var color = '#fff';
        var text = judgment;
        var scale = 1.0;

        switch (judgment) {
            case 'perfect':
                color = '#FFD54F';
                text = 'Perfect';
                scale = 1.3;
                break;
            case 'great':
                color = '#4FC3F7';
                text = 'Great';
                scale = 1.1;
                break;
            case 'good':
                color = '#81C784';
                text = 'Good';
                scale = 1.0;
                break;
            case 'miss':
                color = '#EF5350';
                text = 'Miss';
                scale = 0.9;
                break;
            case 'golden':
                color = '#FFD700';
                text = 'Golden!';
                scale = 1.5;
                break;
        }

        judgmentAnims.push({
            text: text,
            x: x,
            y: y,
            life: 1.0,
            maxLife: 1.0,
            color: color,
            scale: scale,
            vy: -80 * dpr
        });
    }

    // --- Phase 3C: Judgment animation update ---
    function updateJudgmentAnims(dt) {
        for (var i = judgmentAnims.length - 1; i >= 0; i--) {
            var ja = judgmentAnims[i];
            ja.y += ja.vy * dt;
            ja.vy *= 0.95;
            ja.life -= dt * 1.5;
            if (ja.life <= 0) {
                judgmentAnims.splice(i, 1);
            }
        }
    }

    // --- Phase 3C: Beat trail update ---
    function updateBeatTrails() {
        for (var i = 0; i < beats.length; i++) {
            var b = beats[i];
            if (b.hit || b.missed) {
                delete trailHistory[i];
                continue;
            }

            var progress = (currentTime - b.time + APPROACH_TIME) / APPROACH_TIME;
            var beatY = progress * getJudgmentLineY();
            var beatX = getLaneX(b.lane);

            if (!trailHistory[i]) {
                trailHistory[i] = [];
            }

            trailHistory[i].push({ x: beatX, y: beatY, time: currentTime });

            // Keep only last TRAIL_LENGTH positions
            while (trailHistory[i].length > TRAIL_LENGTH) {
                trailHistory[i].shift();
            }

            // Clean up beats that have passed far beyond screen
            if (beatY > canvasH + BEAT_RADIUS * 4) {
                delete trailHistory[i];
            }
        }
    }

    // --- Phase 3A: Approach warning ---
    function updateApproachWarning() {
        // Check if any beat is within APPROACH_WARN_TIME of current time
        var hasWarning = false;
        for (var i = 0; i < beats.length; i++) {
            var b = beats[i];
            if (b.hit || b.missed) continue;
            var timeToBeat = b.time - currentTime;
            if (timeToBeat > 0 && timeToBeat < APPROACH_WARN_TIME) {
                hasWarning = true;
                break;
            }
        }
        // Pulse alpha
        if (hasWarning) {
            approachWarningAlpha = 0.15 + 0.1 * Math.sin(currentTime / 80);
        } else {
            approachWarningAlpha = Math.max(0, approachWarningAlpha - 0.02);
        }
    }

    // --- Phase 3A: Combo milestone check ---
    function checkComboMilestone() {
        var combo = Scoring.getCombo();
        var milestones = [10, 25, 50, 100, 200, 500];
        for (var i = 0; i < milestones.length; i++) {
            if (combo === milestones[i] && lastComboMilestone < milestones[i]) {
                lastComboMilestone = milestones[i];
                comboDisplayTimer = COMBO_DISPLAY_DURATION;
                comboDisplayAlpha = 1.0;
                break;
            }
        }
    }

    // --- Narrative renderer ---
    function queueNarrative(text, duration, priority) {
        narrativeState.queue.push({text: text, duration: duration || 4, priority: priority || 0});
        narrativeState.queue.sort(function(a, b) { return b.priority - a.priority; });
    }

    function updateNarrativeState(dt) {
        if (!narrativeState.currentNarrative && narrativeState.queue.length > 0) {
            narrativeState.currentNarrative = narrativeState.queue.shift();
            narrativeState.timer = narrativeState.currentNarrative.duration;
            if (typeof window.ui !== 'undefined' && window.ui.showNarrative) {
                window.ui.showNarrative(narrativeState.currentNarrative.text, narrativeState.currentNarrative.duration);
            }
        }
        if (narrativeState.currentNarrative) {
            narrativeState.timer -= dt;
            if (narrativeState.timer <= 0) {
                narrativeState.currentNarrative = null;
            }
        }
    }

    function isNarrativeActive() {
        return narrativeState.currentNarrative !== null;
    }

    function clearNarrativeQueue() {
        narrativeState.queue = [];
        narrativeState.currentNarrative = null;
        narrativeState.timer = 0;
    }

    function getNarrativeState() {
        return narrativeState;
    }

    // --- Phase transition visual effects ---
    function triggerPhaseVisual(type, duration) {
        phaseVisualEffect.active = true;
        phaseVisualEffect.type = type || 'fade';
        phaseVisualEffect.duration = duration || 1.0;
        phaseVisualEffect.timer = phaseVisualEffect.duration;
    }

    function updatePhaseVisual(dt) {
        if (!phaseVisualEffect.active) return;
        phaseVisualEffect.timer -= dt;
        if (phaseVisualEffect.timer <= 0) {
            phaseVisualEffect.active = false;
        }
    }

    function getPhaseVisualAlpha() {
        if (!phaseVisualEffect.active) return 0;
        var progress = 1 - (phaseVisualEffect.timer / phaseVisualEffect.duration);
        switch (phaseVisualEffect.type) {
            case 'flash': return progress < 0.5 ? progress * 2 : (1 - progress) * 2;
            case 'fade': return 1 - progress;
            case 'pulse': return Math.sin(progress * Math.PI * 3) * 0.5 + 0.5;
            case 'shatter': return Math.max(0, 1 - progress * 2);
            default: return 0;
        }
    }

    function getPhaseVisualType() {
        return phaseVisualEffect.type;
    }

    function isPhaseVisualActive() {
        return phaseVisualEffect.active;
    }

    // --- Background variant system ---
    function setBackgroundVariant(variant) {
        if (backgroundVariants[variant]) {
            currentBgVariant = variant;
        }
    }

    function getBackgroundVariant() {
        return backgroundVariants[currentBgVariant];
    }

    function getCurrentBgName() {
        return currentBgVariant;
    }

    function getBackgroundAtProgress(progress) {
        var current = backgroundVariants[currentBgVariant];
        return {
            topColor: current.topColor,
            bottomColor: current.bottomColor,
            starDensity: current.starDensity * (1 + progress * 0.3)
        };
    }

    // Auto-trigger phase visuals on level-data phase transitions
    function checkPhaseTransition() {
        if (typeof LevelData === 'undefined' || typeof LevelData.getCurrentPhase !== 'function') return;
        var phase = LevelData.getCurrentPhase(currentLevelId, currentTime);
        if (!phase) return;

        var phaseName = phase.name || phase.id || '';
        if (phaseName && phaseName !== lastPhaseName) {
            lastPhaseName = phaseName;

            // Determine visual type based on phase properties
            var visualType = 'fade';
            var visualDuration = 1.0;
            var bgVariant = 'standard';

            if (phase.dominantLane === 0) {
                bgVariant = 'meditative';
            } else if (phase.dominantLane === 1) {
                bgVariant = 'climactic';
            } else if (phase.dominantLane === 2) {
                bgVariant = 'celestial';
            }

            if (typeof phase.beatDensity === 'number') {
                if (phase.beatDensity >= 1.5) {
                    visualType = 'flash';
                    visualDuration = 0.8;
                    bgVariant = 'intense';
                } else if (phase.beatDensity <= 0.5) {
                    visualType = 'pulse';
                    visualDuration = 1.5;
                    bgVariant = 'meditative';
                }
            }

            if (phase.isClimactic) {
                visualType = 'shatter';
                visualDuration = 1.2;
                bgVariant = 'climactic';
            }

            triggerPhaseVisual(visualType, visualDuration);
            setBackgroundVariant(bgVariant);

            // Queue a narrative if the phase has narrative text
            if (phase.narrative) {
                queueNarrative(phase.narrative, 5, 1);
            }
        }
    }

    // --- Phase 3C: Render background ---
    function renderBackground(ctx) {
        // Gradient background based on level phase and time
        var phaseColor1 = '#0a0a2e';
        var phaseColor2 = '#1a0a3e';

        // Use LevelData phases for color shifts
        if (typeof LevelData !== 'undefined' && typeof LevelData.getCurrentPhase === 'function') {
            var phase = LevelData.getCurrentPhase(currentLevelId, currentTime);
            if (phase) {
                var phaseProgress = 0;
                if (phase.startPercent !== undefined && phase.endPercent !== undefined) {
                    var levelProg = currentTime / levelDuration;
                    phaseProgress = (levelProg - phase.startPercent) / (phase.endPercent - phase.startPercent);
                    phaseProgress = Math.max(0, Math.min(1, phaseProgress));
                }

                // Shift colors based on which lane is dominant in this phase
                if (phase.dominantLane === 0) {
                    phaseColor1 = '#0a1a3e';
                    phaseColor2 = '#0a2a4e';
                } else if (phase.dominantLane === 1) {
                    phaseColor1 = '#1a1a0a';
                    phaseColor2 = '#2a2a0a';
                } else if (phase.dominantLane === 2) {
                    phaseColor1 = '#1a0a2e';
                    phaseColor2 = '#2a0a3e';
                } else {
                    // Balanced — use shifting gradient
                    var shift = Math.sin(bgGradientOffset * Math.PI * 2) * 0.5 + 0.5;
                    var r1 = Math.round(10 + shift * 15);
                    var g1 = Math.round(10 + (1 - shift) * 15);
                    var b1 = Math.round(30 + shift * 20);
                    phaseColor1 = 'rgb(' + r1 + ',' + g1 + ',' + b1 + ')';
                    phaseColor2 = 'rgb(' + (r1 + 10) + ',' + (g1 + 5) + ',' + (b1 + 10) + ')';
                }
            }
        }

        var gradient = ctx.createLinearGradient(0, 0, 0, canvasH);
        gradient.addColorStop(0, phaseColor1);
        gradient.addColorStop(1, phaseColor2);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvasW, canvasH);

        // Phase 3C: Rhythm pulse overlay
        if (rhythmPulseAlpha > 0) {
            ctx.globalAlpha = rhythmPulseAlpha;
            ctx.fillStyle = '#fff';
            ctx.fillRect(0, 0, canvasW, canvasH);
            ctx.globalAlpha = 1;
        }

        // Phase 3C: Fever mode overlay
        if (feverIntensity > 0) {
            var feverAlpha = feverIntensity * 0.06 * (0.5 + 0.5 * Math.sin(feverPulsePhase));
            ctx.globalAlpha = feverAlpha;
            var feverGrad = ctx.createRadialGradient(
                canvasW / 2, canvasH / 2, 0,
                canvasW / 2, canvasH / 2, canvasW * 0.7
            );
            feverGrad.addColorStop(0, '#FFD54F');
            feverGrad.addColorStop(0.5, '#CE93D8');
            feverGrad.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = feverGrad;
            ctx.fillRect(0, 0, canvasW, canvasH);
            ctx.globalAlpha = 1;
        }
    }

    // --- Phase 3C: Render countdown ---
    function renderCountdown(ctx) {
        if (!countdownActive || !countdownPhase) return;

        var text = countdownPhase;
        var fontSize = Math.round(72 * dpr);
        var color = '#fff';

        if (countdownPhase === 'GO') {
            fontSize = Math.round(56 * dpr);
            color = '#FFD54F';
        }

        // Calculate countdown phase progress for animation
        var phaseProgress = 0;
        if (countdownPhase === 'GO') {
            phaseProgress = (countdownElapsed - COUNTDOWN_DURATION) / GO_DURATION;
        } else {
            var phaseNum = parseInt(countdownPhase, 10);
            if (!isNaN(phaseNum)) {
                var phaseStart = (3 - phaseNum) * 1000;
                phaseProgress = (countdownElapsed - phaseStart) / 1000;
            }
        }
        phaseProgress = Math.max(0, Math.min(1, phaseProgress));

        // Scale animation: starts big, shrinks
        var scale = 1.5 - phaseProgress * 0.5;
        var alpha = 1 - phaseProgress * 0.3;

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.translate(canvasW / 2, canvasH * 0.4);
        ctx.scale(scale, scale);

        ctx.fillStyle = color;
        ctx.font = 'bold ' + fontSize + 'px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Shadow glow
        ctx.shadowColor = color;
        ctx.shadowBlur = 20 * dpr;
        ctx.fillText(text, 0, 0);
        ctx.shadowBlur = 0;

        ctx.restore();

        // Sub-text during countdown
        if (countdownPhase !== 'GO') {
            ctx.save();
            ctx.globalAlpha = 0.4;
            ctx.fillStyle = '#fff';
            ctx.font = Math.round(12 * dpr) + 'px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('准备… / Get ready…', canvasW / 2, canvasH * 0.4 + 60 * dpr);
            ctx.restore();
        }
    }

    // --- Phase 3C: Render beat trails ---
    function renderBeatTrails(ctx) {
        for (var key in trailHistory) {
            if (!trailHistory.hasOwnProperty(key)) continue;
            var trail = trailHistory[key];
            if (trail.length < 2) continue;

            var beatIdx = parseInt(key, 10);
            var b = beats[beatIdx];
            if (!b || b.hit || b.missed) continue;

            var color = LANE_COLORS[b.lane] || '#fff';

            ctx.save();
            for (var t = 0; t < trail.length - 1; t++) {
                var trailAlpha = (t / trail.length) * 0.3;
                ctx.globalAlpha = trailAlpha;
                ctx.fillStyle = color;
                var dotSize = 2 * dpr * (t / trail.length);
                ctx.beginPath();
                ctx.arc(trail[t].x, trail[t].y, dotSize, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();
        }
    }

    // --- Phase 3C: Render judgment animations ---
    function renderJudgmentAnims(ctx) {
        for (var i = 0; i < judgmentAnims.length; i++) {
            var ja = judgmentAnims[i];
            var alpha = Math.max(0, ja.life / ja.maxLife);
            var currentScale = ja.scale * (1 + (1 - alpha) * 0.3);

            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.translate(ja.x, ja.y);
            ctx.scale(currentScale, currentScale);

            ctx.fillStyle = ja.color;
            ctx.font = 'bold ' + Math.round(16 * dpr) + 'px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            ctx.shadowColor = ja.color;
            ctx.shadowBlur = 10 * dpr;
            ctx.fillText(ja.text, 0, 0);
            ctx.shadowBlur = 0;

            ctx.restore();
        }
    }

    // --- Phase 3C: Render beat connection lines ---
    function renderBeatConnectionLines(ctx) {
        // Find simultaneous beat pairs at similar times and draw lines between them
        var activeSimBeats = [];

        for (var i = 0; i < beats.length; i++) {
            var b = beats[i];
            if (b.hit || b.missed) continue;
            if (b.type !== BEAT_SIMULTANEOUS) continue;

            var progress = (currentTime - b.time + APPROACH_TIME) / APPROACH_TIME;
            var beatY = progress * getJudgmentLineY();

            if (beatY < -BEAT_RADIUS * 2 || beatY > canvasH + BEAT_RADIUS * 2) continue;

            activeSimBeats.push({
                x: getLaneX(b.lane),
                y: beatY,
                lane: b.lane,
                time: b.time
            });
        }

        // Connect simultaneous beats that share the same time
        for (var a = 0; a < activeSimBeats.length; a++) {
            for (var bb = a + 1; bb < activeSimBeats.length; bb++) {
                if (Math.abs(activeSimBeats[a].time - activeSimBeats[bb].time) < 10) {
                    var beatA = activeSimBeats[a];
                    var beatB = activeSimBeats[bb];

                    ctx.save();
                    ctx.globalAlpha = 0.3;
                    ctx.strokeStyle = '#fff';
                    ctx.lineWidth = 2 * dpr;
                    ctx.setLineDash([4 * dpr, 4 * dpr]);
                    ctx.beginPath();
                    ctx.moveTo(beatA.x, beatA.y);
                    ctx.lineTo(beatB.x, beatB.y);
                    ctx.stroke();
                    ctx.setLineDash([]);
                    ctx.restore();
                }
            }
        }
    }

    // --- Phase 3C: Render fever effects ---
    function renderFeverEffects(ctx) {
        if (feverIntensity <= 0) return;

        // Fever border glow
        var borderGlow = feverIntensity * 0.3 * (0.5 + 0.5 * Math.sin(feverPulsePhase));
        ctx.save();
        ctx.globalAlpha = borderGlow;

        // Top and bottom glow bars
        var grad = ctx.createLinearGradient(0, 0, canvasW, 0);
        grad.addColorStop(0, '#4FC3F7');
        grad.addColorStop(0.5, '#FFD54F');
        grad.addColorStop(1, '#CE93D8');

        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvasW, 4 * dpr);
        ctx.fillRect(0, canvasH - 4 * dpr - 90 * dpr, canvasW, 4 * dpr);

        ctx.restore();
    }

    // --- Phase 3C: Render rhythm pulse beat markers ---
    function renderRhythmPulseMarkers(ctx) {
        // Show subtle beat markers on the judgment line
        var jy = getJudgmentLineY();
        var timeSinceLastBeat = currentTime % beatInterval;
        var nextBeatDelta = beatInterval - timeSinceLastBeat;

        if (nextBeatDelta < 100) {
            var pulseAlpha = (100 - nextBeatDelta) / 100 * 0.15;
            ctx.save();
            ctx.globalAlpha = pulseAlpha;
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2 * dpr;
            ctx.beginPath();
            ctx.moveTo(0, jy);
            ctx.lineTo(canvasW, jy);
            ctx.stroke();
            ctx.restore();
        }
    }

    function render(ctx) {
        if (!started) return;
        var jy = getJudgmentLineY();
        var laneW = getLaneWidth();

        // --- Phase 3C: Render background ---
        renderBackground(ctx);

        // --- Phase 3A: Lane glow (based on light balance) ---
        renderLaneGlow(ctx, laneW);

        // --- Phase 3A: Approach warning pulse ---
        renderApproachWarning(ctx);

        // Lane separators
        ctx.strokeStyle = 'rgba(255,255,255,0.1)';
        ctx.lineWidth = 1;
        for (var s = 1; s < 3; s++) {
            ctx.beginPath();
            ctx.moveTo(laneW * s, 0);
            ctx.lineTo(laneW * s, canvasH);
            ctx.stroke();
        }

        // Judgment line glow
        ctx.strokeStyle = 'rgba(255,255,255,0.5)';
        ctx.lineWidth = 2;
        ctx.shadowColor = '#fff';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.moveTo(0, jy);
        ctx.lineTo(canvasW, jy);
        ctx.stroke();
        ctx.shadowBlur = 0;

        // --- Phase 3C: Rhythm pulse markers ---
        renderRhythmPulseMarkers(ctx);

        // --- Phase 3C: Beat connection lines (render before beats) ---
        renderBeatConnectionLines(ctx);

        // --- Phase 3C: Beat trails (render before beats) ---
        renderBeatTrails(ctx);

        // Render beats
        var beatRadius = BEAT_RADIUS * (dpr > 1 ? dpr * 0.5 : 1);
        for (var i = 0; i < beats.length; i++) {
            var b = beats[i];
            if (b.hit) continue;

            var progress = (currentTime - b.time + APPROACH_TIME) / APPROACH_TIME;
            var beatY = progress * jy;

            if (beatY < -BEAT_RADIUS * 2 || beatY > canvasH + BEAT_RADIUS * 2) continue;

            var beatX = getLaneX(b.lane);
            var color = LANE_COLORS[b.lane] || '#fff';

            if (b.missed) {
                ctx.globalAlpha = 0.3;
            } else {
                ctx.globalAlpha = 1;
            }

            // Phase 3C: Golden beat rendering
            if (b.special === BEAT_GOLDEN && !b.missed) {
                // Golden glow
                ctx.save();
                ctx.globalAlpha = 0.3 + 0.2 * Math.sin(currentTime / 200);
                ctx.fillStyle = '#FFD700';
                ctx.shadowColor = '#FFD700';
                ctx.shadowBlur = 20 * dpr;
                ctx.beginPath();
                ctx.arc(beatX, beatY, beatRadius * 2.0, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
                ctx.restore();
                ctx.globalAlpha = 1;
            }

            // Phase 3C: Shadow beat rendering
            if (b.special === BEAT_SHADOW && !b.missed) {
                ctx.save();
                ctx.globalAlpha = 0.4 + 0.2 * Math.sin(currentTime / 300);
                ctx.fillStyle = '#333';
                ctx.shadowColor = '#EF5350';
                ctx.shadowBlur = 12 * dpr;
                ctx.beginPath();
                ctx.arc(beatX, beatY, beatRadius * 1.3, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
                ctx.restore();
                ctx.globalAlpha = 1;
            }

            if (b.type === BEAT_HOLD) {
                var holdEndProgress = (currentTime - (b.time + b.duration) + APPROACH_TIME) / APPROACH_TIME;
                var holdEndY = holdEndProgress * jy;
                var holdHeight = Math.abs(beatY - holdEndY);
                var holdTop = Math.min(beatY, holdEndY);
                var barWidth = beatRadius * 1.5;

                ctx.fillStyle = color;
                ctx.globalAlpha = b.missed ? 0.2 : (b.holdStarted ? 0.6 : 0.4);
                ctx.fillRect(beatX - barWidth / 2, holdTop, barWidth, holdHeight);

                ctx.globalAlpha = b.missed ? 0.3 : 1;
                ctx.fillStyle = color;
                ctx.beginPath();
                ctx.arc(beatX, beatY, beatRadius * 0.8, 0, Math.PI * 2);
                ctx.fill();

                ctx.beginPath();
                ctx.arc(beatX, holdEndY, beatRadius * 0.6, 0, Math.PI * 2);
                ctx.fill();

                if (!b.missed) {
                    ctx.shadowColor = color;
                    ctx.shadowBlur = 12;
                    ctx.beginPath();
                    ctx.arc(beatX, beatY, beatRadius * 0.5, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.shadowBlur = 0;
                }

                if (b.holdStarted && !b.holdReleased && b.holdProgress > 0) {
                    ctx.globalAlpha = 0.8;
                    ctx.fillStyle = '#fff';
                    var progY = holdTop + holdHeight * b.holdProgress;
                    ctx.beginPath();
                    ctx.arc(beatX, progY, beatRadius * 0.4, 0, Math.PI * 2);
                    ctx.fill();
                }
            } else {
                ctx.fillStyle = color;
                ctx.beginPath();
                ctx.arc(beatX, beatY, beatRadius, 0, Math.PI * 2);
                ctx.fill();

                ctx.shadowColor = color;
                ctx.shadowBlur = 12;
                ctx.beginPath();
                ctx.arc(beatX, beatY, beatRadius * 0.6, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;

                if (b.type === BEAT_SIMULTANEOUS) {
                    ctx.strokeStyle = color;
                    ctx.lineWidth = 2;
                    ctx.globalAlpha = b.missed ? 0.2 : 0.6;
                    ctx.beginPath();
                    ctx.arc(beatX, beatY, beatRadius * 1.5, 0, Math.PI * 2);
                    ctx.stroke();
                }

                // Phase 3C: Inner ring for golden beats
                if (b.special === BEAT_GOLDEN && !b.missed) {
                    ctx.strokeStyle = '#FFD700';
                    ctx.lineWidth = 2 * dpr;
                    ctx.globalAlpha = 0.7 + 0.3 * Math.sin(currentTime / 150);
                    ctx.beginPath();
                    ctx.arc(beatX, beatY, beatRadius * 1.8, 0, Math.PI * 2);
                    ctx.stroke();
                }
            }

            ctx.globalAlpha = 1;
        }

        // --- Phase 3C: Render judgment animations ---
        renderJudgmentAnims(ctx);

        // --- Phase 3C: Render fever effects ---
        renderFeverEffects(ctx);

        // --- Phase 3A: Combo display ---
        renderComboDisplay(ctx);

        // --- Phase 3C: Render countdown (on top of everything) ---
        renderCountdown(ctx);
    }

    // --- Phase 3A: Lane glow rendering ---
    function renderLaneGlow(ctx, laneW) {
        var balanceValues = null;
        if (typeof LightBalance !== 'undefined') {
            balanceValues = LightBalance.getValues();
        }

        for (var i = 0; i < 3; i++) {
            // Combine hit glow with balance intensity
            var balanceIntensity = balanceValues ? (balanceValues[i] - 50) / 100 : 0;
            var glow = laneGlowIntensity[i] + Math.max(0, balanceIntensity) * 0.3;
            if (glow <= 0) continue;

            ctx.save();
            ctx.globalAlpha = Math.min(0.25, glow * 0.3);
            var gradient = ctx.createLinearGradient(i * laneW, canvasH, i * laneW, canvasH * 0.3);
            gradient.addColorStop(0, LANE_COLORS[i]);
            gradient.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = gradient;
            ctx.fillRect(i * laneW, 0, laneW, canvasH);
            ctx.restore();
        }
    }

    // --- Phase 3A: Approach warning rendering ---
    function renderApproachWarning(ctx) {
        if (approachWarningAlpha <= 0) return;

        ctx.save();
        ctx.globalAlpha = approachWarningAlpha;
        // Subtle pulse at judgment line
        var jy = getJudgmentLineY();
        var gradient = ctx.createLinearGradient(0, jy - 20 * dpr, 0, jy + 20 * dpr);
        gradient.addColorStop(0, 'rgba(255,255,255,0)');
        gradient.addColorStop(0.5, 'rgba(255,255,255,0.5)');
        gradient.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, jy - 20 * dpr, canvasW, 40 * dpr);
        ctx.restore();
    }

    // --- Phase 3A: Combo display rendering ---
    function renderComboDisplay(ctx) {
        if (comboDisplayAlpha <= 0 || lastComboMilestone <= 0) return;

        var combo = Scoring.getCombo();
        var fontSize = Math.round(28 * dpr);

        ctx.save();
        ctx.globalAlpha = comboDisplayAlpha;
        ctx.fillStyle = '#FFD54F';
        ctx.font = 'bold ' + fontSize + 'px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Scale effect
        var scale = 1 + (1 - comboDisplayAlpha) * 0.3;
        ctx.translate(canvasW / 2, canvasH * 0.35);
        ctx.scale(scale, scale);

        ctx.fillText(combo + ' COMBO', 0, 0);

        if (lastComboMilestone >= 100) {
            var subSize = Math.round(14 * dpr);
            ctx.font = subSize + 'px sans-serif';
            ctx.fillStyle = '#CE93D8';
            ctx.fillText(getMilestoneLabel(lastComboMilestone), 0, fontSize * 0.8);
        }

        ctx.restore();
    }

    function getMilestoneLabel(milestone) {
        var labels = {
            10: '初露锋芒',
            25: '渐入佳境',
            50: '游刃有余',
            100: '登峰造极',
            200: '超凡入圣',
            500: '天人合一'
        };
        return labels[milestone] || '';
    }

    function isFinished() {
        return started && !countdownActive && currentTime >= levelDuration;
    }

    function getCurrentTime() {
        return currentTime;
    }

    function getLevelDuration() {
        return levelDuration;
    }

    function isLaneHeld(lane) {
        return !!lanesHeld[lane];
    }

    // --- Phase 3C: Getters ---
    function isCountdownActive() {
        return countdownActive;
    }

    function isFeverActive() {
        return feverActive;
    }

    function getFeverIntensity() {
        return feverIntensity;
    }

    function getPhaseDensity() {
        return currentPhaseDensity;
    }

    function getRhythmPulseAlpha() {
        return rhythmPulseAlpha;
    }

    function getJudgmentAnims() {
        return judgmentAnims;
    }

    function reset() {
        beats = [];
        currentTime = 0;
        started = false;
        levelDuration = 0;
        lanesHeld = {};
        laneGlowIntensity = [0, 0, 0];
        approachWarningAlpha = 0;
        comboDisplayAlpha = 0;
        comboDisplayTimer = 0;
        lastComboMilestone = 0;
        // Phase 3C
        countdownActive = false;
        countdownElapsed = 0;
        countdownPhase = '';
        trailHistory = {};
        judgmentAnims = [];
        feverActive = false;
        feverIntensity = 0;
        feverPulsePhase = 0;
        rhythmPulseAlpha = 0;
        lastBeatTime = 0;
        bgGradientOffset = 0;
        currentPhaseDensity = 1.0;
        phaseDensityTarget = 1.0;
        currentLevelId = 0;
        currentBPM = 120;
        beatInterval = 500;
        // Narrative state
        narrativeState = { active: false, queue: [], currentNarrative: null, timer: 0 };
        // Phase visual state
        phaseVisualEffect = { active: false, type: 'none', timer: 0, duration: 0 };
        // Background variant state
        currentBgVariant = 'standard';
        lastPhaseName = '';
    }

    // --- Phase 8: Extended judgment feedback & practice helpers ---
    var judgmentFeedbackQueue = [];
    var MAX_FEEDBACK_QUEUE = 20;

    function queueJudgmentFeedback(lane, judgment, timingOffsetMs) {
        judgmentFeedbackQueue.push({
            lane: lane,
            judgment: judgment,
            offset: timingOffsetMs,
            time: Date.now(),
            alpha: 1.0
        });
        if (judgmentFeedbackQueue.length > MAX_FEEDBACK_QUEUE) {
            judgmentFeedbackQueue.shift();
        }
    }

    function getJudgmentFeedbackQueue() {
        return judgmentFeedbackQueue.slice();
    }

    function clearJudgmentFeedback() {
        judgmentFeedbackQueue = [];
    }

    // Timing accuracy analysis
    function getTimingStats() {
        if (judgmentFeedbackQueue.length === 0) return { avgOffset: 0, earlyCount: 0, lateCount: 0, bestOffset: Infinity, worstOffset: 0 };
        var sum = 0, early = 0, late = 0, best = Infinity, worst = 0;
        for (var i = 0; i < judgmentFeedbackQueue.length; i++) {
            var absOff = Math.abs(judgmentFeedbackQueue[i].offset);
            sum += judgmentFeedbackQueue[i].offset;
            if (judgmentFeedbackQueue[i].offset < 0) early++;
            else late++;
            if (absOff < best) best = absOff;
            if (absOff > worst) worst = absOff;
        }
        return {
            avgOffset: Math.round(sum / judgmentFeedbackQueue.length * 10) / 10,
            earlyCount: early,
            lateCount: late,
            bestOffset: best === Infinity ? 0 : best,
            worstOffset: worst
        };
    }

    // Beat density tracker for practice mode
    var beatDensityHistory = [];
    var DENSITY_SAMPLE_INTERVAL = 5000; // 5 seconds
    var lastDensitySample = 0;
    var beatsInSample = 0;

    function trackBeatDensity(currentTimeMs) {
        beatsInSample++;
        if (currentTimeMs - lastDensitySample >= DENSITY_SAMPLE_INTERVAL) {
            beatDensityHistory.push({
                time: currentTimeMs,
                density: beatsInSample / (DENSITY_SAMPLE_INTERVAL / 1000)
            });
            beatsInSample = 0;
            lastDensitySample = currentTimeMs;
        }
    }

    function getBeatDensityHistory() {
        return beatDensityHistory.slice();
    }

    // Phase transition beat effects
    var phaseTransitionEffects = [];
    function triggerTransitionBeatEffect(type, duration) {
        phaseTransitionEffects.push({ type: type, duration: duration, elapsed: 0, alpha: 1.0 });
    }

    function updateTransitionBeatEffects(dt) {
        for (var i = phaseTransitionEffects.length - 1; i >= 0; i--) {
            phaseTransitionEffects[i].elapsed += dt * 1000;
            phaseTransitionEffects[i].alpha = Math.max(0, 1 - phaseTransitionEffects[i].elapsed / phaseTransitionEffects[i].duration);
            if (phaseTransitionEffects[i].alpha <= 0) phaseTransitionEffects.splice(i, 1);
        }
    }

    function getTransitionBeatEffects() {
        return phaseTransitionEffects.slice();
    }

    // Lane-specific performance tracking
    var lanePerformance = [
        { hits: 0, misses: 0, totalOffset: 0 },
        { hits: 0, misses: 0, totalOffset: 0 },
        { hits: 0, misses: 0, totalOffset: 0 }
    ];

    function recordLanePerformance(lane, offsetMs, isHit) {
        if (lane < 0 || lane > 2) return;
        if (isHit) {
            lanePerformance[lane].hits++;
            lanePerformance[lane].totalOffset += Math.abs(offsetMs);
        } else {
            lanePerformance[lane].misses++;
        }
    }

    function getLanePerformance(lane) {
        if (lane < 0 || lane > 2) return { hits: 0, misses: 0, avgOffset: 0, hitRate: 0 };
        var lp = lanePerformance[lane];
        var total = lp.hits + lp.misses;
        return {
            hits: lp.hits,
            misses: lp.misses,
            avgOffset: lp.hits > 0 ? Math.round(lp.totalOffset / lp.hits) : 0,
            hitRate: total > 0 ? Math.round(lp.hits / total * 100) : 0
        };
    }

    function resetLanePerformance() {
        lanePerformance = [
            { hits: 0, misses: 0, totalOffset: 0 },
            { hits: 0, misses: 0, totalOffset: 0 },
            { hits: 0, misses: 0, totalOffset: 0 }
        ];
    }

    return {
        init: init,
        handleLaneHit: handleLaneHit,
        handleLaneRelease: handleLaneRelease,
        update: update,
        render: render,
        isFinished: isFinished,
        getCurrentTime: getCurrentTime,
        getLevelDuration: getLevelDuration,
        getJudgmentLineY: getJudgmentLineY,
        getLaneX: getLaneX,
        getLaneWidth: getLaneWidth,
        isLaneHeld: isLaneHeld,
        LANE_COLORS: LANE_COLORS,
        reset: reset,
        // Phase 3C
        isCountdownActive: isCountdownActive,
        isFeverActive: isFeverActive,
        getFeverIntensity: getFeverIntensity,
        getPhaseDensity: getPhaseDensity,
        getRhythmPulseAlpha: getRhythmPulseAlpha,
        getJudgmentAnims: getJudgmentAnims,
        // Narrative renderer
        queueNarrative: queueNarrative,
        isNarrativeActive: isNarrativeActive,
        clearNarrativeQueue: clearNarrativeQueue,
        getNarrativeState: getNarrativeState,
        // Phase transition visuals
        triggerPhaseVisual: triggerPhaseVisual,
        getPhaseVisualAlpha: getPhaseVisualAlpha,
        getPhaseVisualType: getPhaseVisualType,
        isPhaseVisualActive: isPhaseVisualActive,
        // Background variants
        setBackgroundVariant: setBackgroundVariant,
        getBackgroundVariant: getBackgroundVariant,
        getCurrentBgName: getCurrentBgName,
        getBackgroundAtProgress: getBackgroundAtProgress,
        // Phase 8: Extended features
        getJudgmentFeedbackQueue: getJudgmentFeedbackQueue,
        clearJudgmentFeedback: clearJudgmentFeedback,
        getTimingStats: getTimingStats,
        getBeatDensityHistory: getBeatDensityHistory,
        getTransitionBeatEffects: getTransitionBeatEffects,
        getLanePerformance: getLanePerformance,
        resetLanePerformance: resetLanePerformance
    };
})();

window.rhythmEngine = RhythmEngine;
