/**
 * Beat System — 历史中的三重光
 * Generates and manages beat patterns with hold/simultaneous support.
 * Phase 3A: 7 new templates, seeded random, difficulty estimation, beat count.
 * Phase 3C: 5 new patterns (swing, tremolo, cascade, cross_hands, mirror),
 *   pattern combination, difficulty-scaled generation, special beats (golden, shadow).
 */
var BeatSystem = (function () {
    var BEAT_NORMAL = 0;
    var BEAT_HOLD = 1;
    var BEAT_SIMULTANEOUS = 2;

    // --- Phase 3C: Special beat types ---
    var BEAT_GOLDEN = 3;   // 2x score multiplier
    var BEAT_SHADOW = 4;   // Penalty if missed (double miss weight)

    var MIN_LANE_GAP_MS = 200;

    // --- Phase 3A: Seeded PRNG (mulberry32) ---
    var seed = 12345;
    var prngState = 0;

    function setSeed(s) {
        seed = s;
        prngState = s;
    }

    function nextRandom() {
        prngState |= 0;
        prngState = prngState + 0x6D2B79F5 | 0;
        var t = Math.imul(prngState ^ prngState >>> 15, 1 | prngState);
        t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }

    // --- Pattern templates ---
    function applyCallResponse(beats, startBeat, beatInterval, measures, weights) {
        var beatsPerMeasure = 4;
        var totalBeats = measures * beatsPerMeasure;
        for (var i = 0; i < totalBeats; i++) {
            var t = (startBeat + i) * beatInterval;
            var lane = (i % 2 === 0) ? 0 : 1;
            if (lane < weights.length) {
                beats.push({ time: t, lane: lane, type: BEAT_NORMAL, duration: 0 });
            }
        }
    }

    function applyTripleHit(beats, startBeat, beatInterval, measures) {
        var beatsPerMeasure = 2;
        var totalBeats = measures * beatsPerMeasure;
        for (var i = 0; i < totalBeats; i++) {
            var t = (startBeat + i * 2) * beatInterval;
            beats.push({ time: t, lane: 0, type: BEAT_SIMULTANEOUS, duration: 0 });
            beats.push({ time: t, lane: 1, type: BEAT_SIMULTANEOUS, duration: 0 });
            beats.push({ time: t, lane: 2, type: BEAT_SIMULTANEOUS, duration: 0 });
        }
    }

    function applyWave(beats, startBeat, beatInterval, measures) {
        var totalBeats = measures * 4;
        for (var i = 0; i < totalBeats; i++) {
            var t = (startBeat + i) * beatInterval;
            var lane = i % 3;
            beats.push({ time: t, lane: lane, type: BEAT_NORMAL, duration: 0 });
        }
    }

    // --- Phase 3A: 7 new pattern templates ---

    // Staircase: ascending then descending lane pattern
    function applyStaircase(beats, startBeat, beatInterval, measures) {
        var totalBeats = measures * 4;
        for (var i = 0; i < totalBeats; i++) {
            var t = (startBeat + i) * beatInterval;
            // 0-1-2-2-1-0 pattern
            var seq = [0, 1, 2, 2, 1, 0];
            var lane = seq[i % seq.length];
            beats.push({ time: t, lane: lane, type: BEAT_NORMAL, duration: 0 });
        }
    }

    // Syncopation: off-beat accents with gaps
    function applySyncopation(beats, startBeat, beatInterval, measures) {
        var totalBeats = measures * 4;
        for (var i = 0; i < totalBeats; i++) {
            // Skip every other beat for syncopation feel
            if (i % 2 === 1) continue;
            var t = (startBeat + i) * beatInterval;
            // Alternate between lanes with wider spread
            var lane = (i / 2) % 3;
            beats.push({ time: t, lane: lane, type: BEAT_NORMAL, duration: 0 });
        }
    }

    // Gallop: short-long-short rhythm pattern (like Iron Maiden gallop)
    function applyGallop(beats, startBeat, beatInterval, measures) {
        var totalGroups = measures * 2;
        for (var i = 0; i < totalGroups; i++) {
            var baseT = (startBeat + i * 2) * beatInterval;
            var lane = i % 3;
            // Three notes: short, long gap, short
            beats.push({ time: baseT, lane: lane, type: BEAT_NORMAL, duration: 0 });
            beats.push({ time: baseT + beatInterval * 0.25, lane: lane, type: BEAT_NORMAL, duration: 0 });
            beats.push({ time: baseT + beatInterval * 0.75, lane: lane, type: BEAT_NORMAL, duration: 0 });
        }
    }

    // Hold cascade: hold notes cascading across lanes
    function applyHoldCascade(beats, startBeat, beatInterval, measures) {
        var totalBeats = measures * 2;
        for (var i = 0; i < totalBeats; i++) {
            var t = (startBeat + i * 2) * beatInterval;
            var lane = i % 3;
            var dur = beatInterval * 2; // 2-beat hold
            beats.push({ time: t, lane: lane, type: BEAT_HOLD, duration: dur });
        }
    }

    // Double stop: two lanes hit simultaneously
    function applyDoubleStop(beats, startBeat, beatInterval, measures) {
        var totalBeats = measures * 4;
        var pairs = [[0, 1], [1, 2], [0, 2], [0, 1]];
        for (var i = 0; i < totalBeats; i++) {
            var t = (startBeat + i) * beatInterval;
            var pair = pairs[i % pairs.length];
            beats.push({ time: t, lane: pair[0], type: BEAT_SIMULTANEOUS, duration: 0 });
            beats.push({ time: t, lane: pair[1], type: BEAT_SIMULTANEOUS, duration: 0 });
        }
    }

    // Polyrhythm: two different rhythms on different lanes
    function applyPolyrhythm(beats, startBeat, beatInterval, measures) {
        var totalMs = measures * 4 * beatInterval;
        // Lane 0: every 2 beats
        var t0 = 0;
        while (t0 < totalMs) {
            var absT = startBeat * beatInterval + t0;
            beats.push({ time: absT, lane: 0, type: BEAT_NORMAL, duration: 0 });
            t0 += beatInterval * 2;
        }
        // Lane 1: every 3 beats (polyrhythm against lane 0)
        var t1 = 0;
        while (t1 < totalMs) {
            var absT1 = startBeat * beatInterval + t1;
            beats.push({ time: absT1, lane: 1, type: BEAT_NORMAL, duration: 0 });
            t1 += beatInterval * 3;
        }
        // Lane 2: every 4 beats
        var t2 = 0;
        while (t2 < totalMs) {
            var absT2 = startBeat * beatInterval + t2;
            beats.push({ time: absT2, lane: 2, type: BEAT_NORMAL, duration: 0 });
            t2 += beatInterval * 4;
        }
    }

    // Crescendo: starts sparse, builds density within the pattern
    function applyCrescendo(beats, startBeat, beatInterval, measures) {
        var totalBeats = measures * 8;
        for (var i = 0; i < totalBeats; i++) {
            var phase = i / totalBeats; // 0..1
            // Density increases: early beats have lower chance of being included
            if (phase < 0.3 && i % 3 !== 0) continue;
            if (phase < 0.6 && i % 2 !== 0) continue;

            var t = (startBeat + i * 0.5) * beatInterval;
            var lane = i % 3;

            // Later beats more likely to be simultaneous
            if (phase > 0.8 && i % 4 === 0) {
                beats.push({ time: t, lane: 0, type: BEAT_SIMULTANEOUS, duration: 0 });
                beats.push({ time: t, lane: 1, type: BEAT_SIMULTANEOUS, duration: 0 });
                beats.push({ time: t, lane: 2, type: BEAT_SIMULTANEOUS, duration: 0 });
            } else if (phase > 0.6 && i % 3 === 0) {
                beats.push({ time: t, lane: lane, type: BEAT_HOLD, duration: beatInterval });
            } else {
                beats.push({ time: t, lane: lane, type: BEAT_NORMAL, duration: 0 });
            }
        }
    }

    // --- Phase 3C: 5 new pattern templates ---

    // Swing: triplet-feel swing rhythm with alternating lane emphasis
    function applySwing(beats, startBeat, beatInterval, measures) {
        var totalBeats = measures * 4;
        for (var i = 0; i < totalBeats; i++) {
            var baseT = (startBeat + i) * beatInterval;
            var lane = i % 3;
            // Main beat on downbeat
            beats.push({ time: baseT, lane: lane, type: BEAT_NORMAL, duration: 0 });
            // Swung eighth note (2/3 of the interval later)
            var swingOffset = beatInterval * 0.66;
            var swingLane = (lane + 1) % 3;
            beats.push({ time: baseT + swingOffset, lane: swingLane, type: BEAT_NORMAL, duration: 0 });
        }
    }

    // Tremolo: rapid repeated notes on same lane with bursts
    function applyTremolo(beats, startBeat, beatInterval, measures) {
        var totalGroups = measures * 2;
        for (var i = 0; i < totalGroups; i++) {
            var baseT = (startBeat + i * 2) * beatInterval;
            var lane = i % 3;
            // 4 rapid hits in quick succession
            var tremSpeed = beatInterval * 0.15;
            for (var j = 0; j < 4; j++) {
                beats.push({
                    time: baseT + j * tremSpeed,
                    lane: lane,
                    type: BEAT_NORMAL,
                    duration: 0
                });
            }
        }
    }

    // Cascade: notes cascade across all lanes in waterfall pattern
    function applyCascade(beats, startBeat, beatInterval, measures) {
        var totalBeats = measures * 6;
        var cascadeDelay = beatInterval * 0.2;
        for (var i = 0; i < totalBeats; i++) {
            var baseT = (startBeat + i * 0.66) * beatInterval;
            // Three notes cascading: lane 0 -> 1 -> 2
            for (var lane = 0; lane < 3; lane++) {
                beats.push({
                    time: baseT + lane * cascadeDelay,
                    lane: lane,
                    type: BEAT_NORMAL,
                    duration: 0
                });
            }
        }
    }

    // Cross hands: alternating extreme lanes (0 <-> 2) with center hits
    function applyCrossHands(beats, startBeat, beatInterval, measures) {
        var totalBeats = measures * 4;
        for (var i = 0; i < totalBeats; i++) {
            var t = (startBeat + i) * beatInterval;
            var position = i % 4;
            if (position === 0) {
                beats.push({ time: t, lane: 0, type: BEAT_NORMAL, duration: 0 });
            } else if (position === 1) {
                beats.push({ time: t, lane: 2, type: BEAT_NORMAL, duration: 0 });
            } else if (position === 2) {
                beats.push({ time: t, lane: 0, type: BEAT_NORMAL, duration: 0 });
                beats.push({ time: t, lane: 2, type: BEAT_NORMAL, duration: 0 });
            } else {
                beats.push({ time: t, lane: 1, type: BEAT_NORMAL, duration: 0 });
            }
        }
    }

    // Mirror: symmetric pattern that mirrors around center lane
    function applyMirror(beats, startBeat, beatInterval, measures) {
        var totalBeats = measures * 4;
        for (var i = 0; i < totalBeats; i++) {
            var t = (startBeat + i) * beatInterval;
            var phase = i % 6;
            // Ascending then descending: 0-1-2-2-1-0
            var mirrorSeq = [0, 1, 2, 2, 1, 0];
            var lane = mirrorSeq[phase];
            beats.push({ time: t, lane: lane, type: BEAT_NORMAL, duration: 0 });

            // Add center accent on every other beat
            if (i % 2 === 0) {
                beats.push({
                    time: t + beatInterval * 0.33,
                    lane: 1,
                    type: BEAT_NORMAL,
                    duration: 0
                });
            }
        }
    }

    // --- Pattern name map ---
    var PATTERN_NAMES = {
        call_response: '呼应',
        triple_hit: '三重击',
        wave: '波浪',
        staircase: '阶梯',
        syncopation: '切分',
        gallop: '驰骋',
        hold_cascade: '长音瀑布',
        double_stop: '双轨齐奏',
        polyrhythm: '复节奏',
        crescendo: '渐强',
        // Phase 3C
        swing: '摇摆',
        tremolo: '颤音',
        cascade: '瀑布',
        cross_hands: '交叉',
        mirror: '镜像'
    };

    function getPatternName(patternId) {
        return PATTERN_NAMES[patternId] || patternId;
    }

    function applyPattern(beats, patternDef, bpm) {
        var beatInterval = 60000 / bpm;
        switch (patternDef.pattern) {
            case 'call_response':
                applyCallResponse(beats, patternDef.startBeat, beatInterval, patternDef.measures, [0.5, 0.5, 0]);
                break;
            case 'triple_hit':
                applyTripleHit(beats, patternDef.startBeat, beatInterval, patternDef.measures);
                break;
            case 'wave':
                applyWave(beats, patternDef.startBeat, beatInterval, patternDef.measures);
                break;
            case 'staircase':
                applyStaircase(beats, patternDef.startBeat, beatInterval, patternDef.measures);
                break;
            case 'syncopation':
                applySyncopation(beats, patternDef.startBeat, beatInterval, patternDef.measures);
                break;
            case 'gallop':
                applyGallop(beats, patternDef.startBeat, beatInterval, patternDef.measures);
                break;
            case 'hold_cascade':
                applyHoldCascade(beats, patternDef.startBeat, beatInterval, patternDef.measures);
                break;
            case 'double_stop':
                applyDoubleStop(beats, patternDef.startBeat, beatInterval, patternDef.measures);
                break;
            case 'polyrhythm':
                applyPolyrhythm(beats, patternDef.startBeat, beatInterval, patternDef.measures);
                break;
            case 'crescendo':
                applyCrescendo(beats, patternDef.startBeat, beatInterval, patternDef.measures);
                break;
            // Phase 3C
            case 'swing':
                applySwing(beats, patternDef.startBeat, beatInterval, patternDef.measures);
                break;
            case 'tremolo':
                applyTremolo(beats, patternDef.startBeat, beatInterval, patternDef.measures);
                break;
            case 'cascade':
                applyCascade(beats, patternDef.startBeat, beatInterval, patternDef.measures);
                break;
            case 'cross_hands':
                applyCrossHands(beats, patternDef.startBeat, beatInterval, patternDef.measures);
                break;
            case 'mirror':
                applyMirror(beats, patternDef.startBeat, beatInterval, patternDef.measures);
                break;
        }
    }

    // --- Phase 3C: Pattern combination ---
    function applyCombinedPattern(beats, patternDefs, bpm) {
        for (var p = 0; p < patternDefs.length; p++) {
            applyPattern(beats, patternDefs[p], bpm);
        }
    }

    // --- Phase 3C: Difficulty-scaled generation ---
    function getDifficultyScale(difficultyRating) {
        // Returns modifiers based on difficulty (1-5)
        var scales = {
            1: { densityMul: 0.8, specialChance: 0.02, holdMul: 0.5, simMul: 0.3 },
            2: { densityMul: 0.9, specialChance: 0.04, holdMul: 0.7, simMul: 0.5 },
            3: { densityMul: 1.0, specialChance: 0.06, holdMul: 1.0, simMul: 0.7 },
            4: { densityMul: 1.1, specialChance: 0.08, holdMul: 1.3, simMul: 1.0 },
            5: { densityMul: 1.2, specialChance: 0.12, holdMul: 1.5, simMul: 1.3 }
        };
        return scales[difficultyRating] || scales[3];
    }

    function generatePattern(levelConfig) {
        var bpm = levelConfig.bpm;
        var duration = levelConfig.duration;
        var density = levelConfig.beatDensity;
        var weights = levelConfig.laneWeights;
        var holdChance = levelConfig.holdNoteChance || 0;
        var simChance = levelConfig.simNoteChance || 0;
        var beatPatterns = levelConfig.beatPatterns || [];
        var difficultyRating = levelConfig.difficultyRating || 1;

        var beatInterval = 60000 / bpm;
        var totalMs = duration * 1000;
        var beats = [];

        var lastLaneTime = [0, 0, 0];

        // --- Phase 3C: Apply difficulty scaling ---
        var diffScale = getDifficultyScale(difficultyRating);
        var scaledDensity = density * diffScale.densityMul;
        var scaledHoldChance = holdChance * diffScale.holdMul;
        var scaledSimChance = simChance * diffScale.simMul;
        var specialChance = diffScale.specialChance;

        // Apply manual patterns first
        for (var p = 0; p < beatPatterns.length; p++) {
            applyPattern(beats, beatPatterns[p], bpm);
        }

        // Structure phases: intro(sparse), development(building), climax(dense), outro(sparse)
        var introEnd = totalMs * 0.15;
        var devEnd = totalMs * 0.4;
        var climaxEnd = totalMs * 0.8;

        var t = beatInterval;
        while (t < totalMs - 1000) {
            // Determine phase density modifier
            var phaseDensity = scaledDensity;
            if (t < introEnd) {
                phaseDensity = scaledDensity * 0.4; // sparse intro
            } else if (t < devEnd) {
                phaseDensity = scaledDensity * 0.7; // building
            } else if (t < climaxEnd) {
                phaseDensity = scaledDensity * 1.2; // climax (can exceed 1.0 for dense patterns)
            } else {
                phaseDensity = scaledDensity * 0.5; // sparse outro
            }

            var roll = nextRandom();
            if (roll < Math.min(phaseDensity, 1.0)) {
                // Check for simultaneous notes
                if (scaledSimChance > 0 && nextRandom() < scaledSimChance) {
                    var numLanes = nextRandom() < 0.5 ? 2 : 3;
                    var lanes = [0, 1, 2];
                    for (var si = lanes.length - 1; si > 0; si--) {
                        var sj = Math.floor(nextRandom() * (si + 1));
                        var tmp = lanes[si]; lanes[si] = lanes[sj]; lanes[sj] = tmp;
                    }
                    for (var li = 0; li < numLanes; li++) {
                        var slane = lanes[li];
                        if (t - lastLaneTime[slane] >= MIN_LANE_GAP_MS) {
                            beats.push({
                                time: t,
                                lane: slane,
                                type: BEAT_SIMULTANEOUS,
                                duration: 0
                            });
                            lastLaneTime[slane] = t;
                        }
                    }
                } else {
                    var lane = pickLane(weights);
                    if (t - lastLaneTime[lane] >= MIN_LANE_GAP_MS) {
                        var type = BEAT_NORMAL;
                        var dur = 0;

                        if (scaledHoldChance > 0 && nextRandom() < scaledHoldChance) {
                            type = BEAT_HOLD;
                            dur = beatInterval * (1 + Math.floor(nextRandom() * 3));
                        }

                        // --- Phase 3C: Special beat types ---
                        if (type === BEAT_NORMAL && nextRandom() < specialChance) {
                            type = BEAT_GOLDEN;
                        } else if (type === BEAT_NORMAL && nextRandom() < specialChance * 0.5) {
                            type = BEAT_SHADOW;
                        }

                        beats.push({
                            time: t,
                            lane: lane,
                            type: type,
                            duration: dur
                        });
                        lastLaneTime[lane] = t;
                    }
                }
            }

            var halfBeat = roll < 0.15 && density > 0.5;
            t += halfBeat ? beatInterval * 0.5 : beatInterval;
        }

        beats.sort(function (a, b) { return a.time - b.time; });

        // Remove duplicate beats at same time+lane
        var deduped = [];
        var seen = {};
        for (var di = 0; di < beats.length; di++) {
            var key = beats[di].time + '_' + beats[di].lane;
            if (!seen[key]) {
                seen[key] = true;
                deduped.push(beats[di]);
            }
        }

        return deduped;
    }

    function pickLane(weights) {
        var r = nextRandom();
        var cumulative = 0;
        for (var i = 0; i < weights.length; i++) {
            cumulative += weights[i];
            if (r < cumulative) return i;
        }
        return weights.length - 1;
    }

    // --- Phase 3A: Difficulty estimation ---
    function estimateDifficulty(levelConfig) {
        if (!levelConfig) return 0;

        var bpm = levelConfig.bpm;
        var density = levelConfig.beatDensity;
        var holdChance = levelConfig.holdNoteChance || 0;
        var simChance = levelConfig.simNoteChance || 0;
        var patterns = levelConfig.beatPatterns || [];

        // BPM factor (60-140 mapped to 0-40)
        var bpmScore = Math.max(0, Math.min(40, (bpm - 60) / 80 * 40));

        // Density factor (0-1 mapped to 0-25)
        var densityScore = density * 25;

        // Complexity factor: hold + simultaneous + pattern count
        var complexityScore = (holdChance * 10 + simChance * 15 + patterns.length * 3);
        complexityScore = Math.min(20, complexityScore);

        // Duration factor (60-120s mapped to 0-15)
        var durScore = Math.max(0, Math.min(15, (levelConfig.duration - 60) / 60 * 15));

        var total = bpmScore + densityScore + complexityScore + durScore;
        return Math.round(total * 10) / 10;
    }

    // --- Phase 3A: Beat count estimation ---
    function estimateBeatCount(levelConfig) {
        if (!levelConfig) return 0;
        var bpm = levelConfig.bpm;
        var duration = levelConfig.duration;
        var density = levelConfig.beatDensity;
        var beatInterval = 60000 / bpm;
        var totalBeats = Math.floor(duration * 1000 / beatInterval);

        // Rough estimate based on average density across phases
        var avgDensity = density * (0.15 * 0.4 + 0.25 * 0.7 + 0.4 * 1.2 + 0.2 * 0.5);
        return Math.round(totalBeats * avgDensity);
    }

    // --- Phase 3C: Beat type helpers ---
    function isSpecialBeat(beatType) {
        return beatType === BEAT_GOLDEN || beatType === BEAT_SHADOW;
    }

    function getSpecialBeatMultiplier(beatType) {
        if (beatType === BEAT_GOLDEN) return 2.0;
        if (beatType === BEAT_SHADOW) return -0.5;
        return 1.0;
    }

    function getBeatTypeName(beatType) {
        switch (beatType) {
            case BEAT_NORMAL: return 'normal';
            case BEAT_HOLD: return 'hold';
            case BEAT_SIMULTANEOUS: return 'simultaneous';
            case BEAT_GOLDEN: return 'golden';
            case BEAT_SHADOW: return 'shadow';
            default: return 'unknown';
        }
    }

    // --- Phase 3C: Pattern statistics ---
    function getPatternStats(levelConfig) {
        if (!levelConfig) return null;
        var beats = generatePattern(levelConfig);
        var stats = {
            totalBeats: beats.length,
            normalBeats: 0,
            holdBeats: 0,
            simBeats: 0,
            goldenBeats: 0,
            shadowBeats: 0,
            laneDistribution: [0, 0, 0]
        };
        for (var i = 0; i < beats.length; i++) {
            var b = beats[i];
            stats.laneDistribution[b.lane]++;
            switch (b.type) {
                case BEAT_NORMAL: stats.normalBeats++; break;
                case BEAT_HOLD: stats.holdBeats++; break;
                case BEAT_SIMULTANEOUS: stats.simBeats++; break;
                case BEAT_GOLDEN: stats.goldenBeats++; break;
                case BEAT_SHADOW: stats.shadowBeats++; break;
            }
        }
        return stats;
    }

    var cachedBeats = {};

    function getBeatsForLevel(levelId) {
        if (cachedBeats[levelId]) return cachedBeats[levelId];
        var level = LevelData.getLevel(levelId);
        if (!level) return [];
        // Seed based on levelId for deterministic patterns
        setSeed(levelId * 7919 + 31337);
        var beats = generatePattern(level);
        cachedBeats[levelId] = beats;
        return beats;
    }

    function clearCache() {
        cachedBeats = {};
    }

    // --- Phase 4: 5 new beat pattern types ---

    var PATTERN_CROSS_RHYTHM = 'cross_rhythm';
    var PATTERN_CASCADE = 'cascade';
    var PATTERN_MIRROR = 'mirror';
    var PATTERN_GALLOP = 'gallop';
    var PATTERN_BUILDUP = 'buildup';

    var PATTERN_DEFS = {};
    PATTERN_DEFS[PATTERN_CROSS_RHYTHM] = { intervalRatio: [1, 1.5, 1], description: 'Cross-rhythm pattern' };
    PATTERN_DEFS[PATTERN_CASCADE] = { intervalRatio: [0.5, 0.5, 0.5], description: 'Cascade pattern', laneOrder: [0, 1, 2] };
    PATTERN_DEFS[PATTERN_MIRROR] = { intervalRatio: [1, 1, 1], description: 'Mirror pattern', mirrored: true };
    PATTERN_DEFS[PATTERN_GALLOP] = { intervalRatio: [0.25, 0.25, 0.75], description: 'Gallop pattern' };
    PATTERN_DEFS[PATTERN_BUILDUP] = { intervalRatio: [2, 1.5, 1, 0.75, 0.5], description: 'Buildup pattern' };

    function generatePatternBeats(patternType, startTime, count, bpm) {
        var def = PATTERN_DEFS[patternType];
        if (!def) return [];
        var beats = [];
        var baseInterval = 60000 / bpm;
        var ratios = def.intervalRatio;
        var current = startTime;

        for (var i = 0; i < count; i++) {
            var ratioIndex = i % ratios.length;
            var interval = baseInterval * ratios[ratioIndex];
            var lane = i % 3;

            if (def.laneOrder) {
                lane = def.laneOrder[i % def.laneOrder.length];
            }
            if (def.mirrored) {
                var mirrorSeq = [0, 1, 2, 2, 1, 0];
                lane = mirrorSeq[i % mirrorSeq.length];
            }

            beats.push({
                time: current,
                lane: lane,
                type: BEAT_NORMAL,
                duration: 0
            });

            current += interval;
        }

        return beats;
    }

    // --- Phase 4: Distribution analysis ---

    function analyzeDistribution(beats) {
        var laneCount = [0, 0, 0];
        var typeCount = { normal: 0, hold: 0, sim: 0, golden: 0, shadow: 0 };
        for (var i = 0; i < beats.length; i++) {
            laneCount[beats[i].lane]++;
            switch (beats[i].type) {
                case BEAT_NORMAL: typeCount.normal++; break;
                case BEAT_HOLD: typeCount.hold++; break;
                case BEAT_SIMULTANEOUS: typeCount.sim++; break;
                case BEAT_GOLDEN: typeCount.golden++; break;
                case BEAT_SHADOW: typeCount.shadow++; break;
            }
        }
        return {
            laneCount: laneCount,
            typeCount: typeCount,
            totalBeats: beats.length,
            density: beats.length > 1 ? (beats[beats.length - 1].time - beats[0].time) / beats.length : 0
        };
    }

    function getBalanceScore(beats) {
        var analysis = analyzeDistribution(beats);
        var total = analysis.totalBeats;
        if (total === 0) return 100;
        var ideal = total / 3;
        var deviation = 0;
        for (var i = 0; i < 3; i++) {
            deviation += Math.abs(analysis.laneCount[i] - ideal);
        }
        return Math.max(0, Math.round(100 - (deviation / total) * 100));
    }

    // --- Phase 4: Beat rating display ---

    function getBeatRating(analysis) {
        var balance;
        if (analysis.totalBeats > 0) {
            var mockBeats = [];
            for (var i = 0; i < analysis.totalBeats; i++) {
                mockBeats.push({ lane: i % 3, type: 0 });
            }
            balance = getBalanceScore(mockBeats);
        } else {
            balance = 100;
        }

        if (balance > 90) return { rating: 'S', description: 'Perfectly balanced' };
        if (balance > 75) return { rating: 'A', description: 'Well balanced' };
        if (balance > 60) return { rating: 'B', description: 'Moderately balanced' };
        if (balance > 40) return { rating: 'C', description: 'Slightly imbalanced' };
        return { rating: 'D', description: 'Highly imbalanced' };
    }

    // --- Phase 4: Extended generation config ---

    function generateWithConfig(config) {
        if (!config) return [];
        var bpm = config.bpm || 120;
        var duration = config.duration || 60;
        var density = config.density || 0.5;
        var laneWeights = config.laneWeights || [0.33, 0.33, 0.34];
        var patterns = config.patterns || [];
        var cfgSeed = config.seed || 42;

        setSeed(cfgSeed);

        var levelConfig = {
            bpm: bpm,
            duration: duration,
            beatDensity: density,
            laneWeights: laneWeights,
            holdNoteChance: config.holdChance || 0,
            simNoteChance: config.simChance || 0,
            beatPatterns: patterns,
            difficultyRating: config.difficulty || 3
        };

        var beats = generatePattern(levelConfig);

        // Append any additional pattern-specific beats
        for (var p = 0; p < patterns.length; p++) {
            var pat = patterns[p];
            if (pat.patternType && PATTERN_DEFS[pat.patternType]) {
                var extra = generatePatternBeats(
                    pat.patternType,
                    (pat.startBeat || 0) * (60000 / bpm),
                    pat.count || 8,
                    bpm
                );
                for (var e = 0; e < extra.length; e++) {
                    beats.push(extra[e]);
                }
            }
        }

        beats.sort(function (a, b) { return a.time - b.time; });
        return beats;
    }

    // --- Phase 8: Beat validation & sequence analysis ---
    function validateBeatSequence(beats, bpm) {
        if (!beats || beats.length === 0) return { valid: false, errors: ['Empty beat sequence'] };
        var errors = [];
        var minInterval = 60000 / bpm / 4; // Minimum: 16th note
        for (var i = 1; i < beats.length; i++) {
            if (beats[i].time - beats[i-1].time < minInterval * 0.5) {
                errors.push('Beats ' + (i-1) + ' and ' + i + ' too close (' + (beats[i].time - beats[i-1].time) + 'ms)');
            }
        }
        // Check lane validity
        for (var j = 0; j < beats.length; j++) {
            if (beats[j].lane < 0 || beats[j].lane > 2) {
                errors.push('Beat ' + j + ' has invalid lane ' + beats[j].lane);
            }
        }
        return { valid: errors.length === 0, errors: errors, beatCount: beats.length };
    }

    // Pattern difficulty scorer
    function scorePatternDifficulty(beats, bpm) {
        if (!beats || beats.length === 0) return 0;
        var score = 0;
        var avgInterval = 60000 / bpm;
        // Density factor
        var density = beats.length / (beats[beats.length-1].time / 1000);
        score += Math.min(40, density * 8);
        // Simultaneous factor
        var simCount = 0;
        for (var i = 0; i < beats.length; i++) {
            if (beats[i].type === BEAT_SIMULTANEOUS) simCount++;
        }
        score += Math.min(20, (simCount / beats.length) * 60);
        // Speed change factor (rapid alternation between lanes)
        var alternations = 0;
        for (var k = 1; k < beats.length; k++) {
            if (beats[k].lane !== beats[k-1].lane) alternations++;
        }
        score += Math.min(20, (alternations / beats.length) * 40);
        // Hold note factor
        var holdCount = 0;
        for (var m = 0; m < beats.length; m++) {
            if (beats[m].type === BEAT_HOLD) holdCount++;
        }
        score += Math.min(10, (holdCount / beats.length) * 30);
        // Special beat factor
        var specialCount = 0;
        for (var n = 0; n < beats.length; n++) {
            if (beats[n].type === BEAT_GOLDEN || beats[n].type === BEAT_SHADOW) specialCount++;
        }
        score += Math.min(10, (specialCount / beats.length) * 20);
        return Math.round(Math.min(100, score));
    }

    // Beat pattern presets for quick generation
    var BEAT_PRESETS = {
        easy: { density: 0.3, holdChance: 0, simChance: 0, specialChance: 0.01, pattern: 'call_response' },
        normal: { density: 0.5, holdChance: 0.05, simChance: 0.03, specialChance: 0.03, pattern: 'standard' },
        hard: { density: 0.75, holdChance: 0.12, simChance: 0.08, specialChance: 0.08, pattern: 'intense' },
        extreme: { density: 1.0, holdChance: 0.2, simChance: 0.15, specialChance: 0.12, pattern: 'climactic' }
    };

    function getPreset(name) {
        return BEAT_PRESETS[name] ? JSON.parse(JSON.stringify(BEAT_PRESETS[name])) : null;
    }

    function generateFromPreset(levelId, presetName) {
        var preset = getPreset(presetName);
        if (!preset) return [];
        return generateWithConfig(levelId, preset);
    }

    // Sequence similarity comparison
    function compareSequences(beatsA, beatsB) {
        if (!beatsA || !beatsB) return 0;
        var matches = 0;
        var maxLen = Math.max(beatsA.length, beatsB.length);
        if (maxLen === 0) return 1;
        var minLen = Math.min(beatsA.length, beatsB.length);
        for (var i = 0; i < minLen; i++) {
            if (beatsA[i].lane === beatsB[i].lane) matches++;
        }
        return matches / maxLen;
    }

    return {
        BEAT_NORMAL: BEAT_NORMAL,
        BEAT_HOLD: BEAT_HOLD,
        BEAT_SIMULTANEOUS: BEAT_SIMULTANEOUS,
        BEAT_GOLDEN: BEAT_GOLDEN,
        BEAT_SHADOW: BEAT_SHADOW,
        generatePattern: generatePattern,
        getBeatsForLevel: getBeatsForLevel,
        clearCache: clearCache,
        // Phase 3A
        setSeed: setSeed,
        estimateDifficulty: estimateDifficulty,
        estimateBeatCount: estimateBeatCount,
        getPatternName: getPatternName,
        PATTERN_NAMES: PATTERN_NAMES,
        // Phase 3C
        applyCombinedPattern: applyCombinedPattern,
        getDifficultyScale: getDifficultyScale,
        isSpecialBeat: isSpecialBeat,
        getSpecialBeatMultiplier: getSpecialBeatMultiplier,
        getBeatTypeName: getBeatTypeName,
        getPatternStats: getPatternStats,
        // Phase 4
        PATTERN_CROSS_RHYTHM: PATTERN_CROSS_RHYTHM,
        PATTERN_CASCADE: PATTERN_CASCADE,
        PATTERN_MIRROR: PATTERN_MIRROR,
        PATTERN_GALLOP: PATTERN_GALLOP,
        PATTERN_BUILDUP: PATTERN_BUILDUP,
        PATTERN_DEFS: PATTERN_DEFS,
        generatePatternBeats: generatePatternBeats,
        analyzeDistribution: analyzeDistribution,
        getBalanceScore: getBalanceScore,
        getBeatRating: getBeatRating,
        generateWithConfig: generateWithConfig,
        // Phase 8
        validateBeatSequence: validateBeatSequence,
        scorePatternDifficulty: scorePatternDifficulty,
        getPreset: getPreset,
        generateFromPreset: generateFromPreset,
        compareSequences: compareSequences
    };
})();
