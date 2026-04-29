/**
 * Scoring System — 历史中的三重光
 * Score, combo, accuracy tracking with judgment grades.
 * Phase 2: Event card lane bonus, bias penalty, communion result, level pass.
 * Phase 3A: Per-lane tracking, combo milestones, score breakdown, achievements.
 */
var Scoring = (function () {
    var WEIGHTS = { perfect: 300, great: 200, good: 100, miss: 0 };
    var COMBO_STEP = 10;

    // --- Core state ---
    var score = 0;
    var combo = 0;
    var maxCombo = 0;
    var judgments = { perfect: 0, great: 0, good: 0, miss: 0 };
    var totalNotes = 0;

    // --- Phase 3A: Per-lane tracking ---
    var laneJudgments = [
        { perfect: 0, great: 0, good: 0, miss: 0 },
        { perfect: 0, great: 0, good: 0, miss: 0 },
        { perfect: 0, great: 0, good: 0, miss: 0 }
    ];
    var laneTotalNotes = [0, 0, 0];

    // --- Phase 3A: Score breakdown ---
    var baseScore = 0;
    var comboBonus = 0;
    var laneBonusTotal = 0;
    var biasPenaltyTotal = 0;

    // --- Phase 3A: Combo milestones ---
    var COMBO_MILESTONES = [10, 25, 50, 100, 200, 500];
    var reachedMilestones = {};
    var lastMilestoneReached = 0;

    // --- Phase 3A: Achievement flags ---
    var fullCombo = false;
    var allPerfect = false;
    var recoveryCount = 0;
    var missCount = 0;
    var wasInMissStreak = false;

    // --- Phase 3A: Difficulty rating ---
    var difficultyRating = 0;

    function getComboMultiplier() {
        return Math.min(2.0, 1 + Math.floor(combo / COMBO_STEP) * 0.1);
    }

    function recordJudgment(judgment, laneBonus) {
        if (judgment === 'miss') {
            combo = 0;
            judgments.miss++;
            missCount++;
            wasInMissStreak = true;
        } else {
            judgments[judgment]++;
            combo++;
            if (combo > maxCombo) maxCombo = combo;

            // Track recovery (ending a miss streak)
            if (wasInMissStreak) {
                recoveryCount++;
                wasInMissStreak = false;
            }

            var base = WEIGHTS[judgment];
            var multiplier = getComboMultiplier();
            var bonusMultiplier = 1 + (laneBonus || 0);
            var biasPenalty = 1.0;

            if (typeof BiasSystem !== 'undefined' && BiasSystem.isPenaltyActive()) {
                biasPenalty = BiasSystem.getScorePenalty();
            }

            var rawScore = Math.round(base * multiplier * bonusMultiplier * biasPenalty);

            // Accumulate breakdown
            baseScore += base;
            var comboAdd = Math.round(base * (multiplier - 1));
            comboBonus += comboAdd;
            var laneAdd = Math.round(base * bonusMultiplier) - base;
            if (laneAdd !== 0) laneBonusTotal += laneAdd;
            var biasDeduct = Math.round(base * multiplier * bonusMultiplier) - rawScore;
            if (biasDeduct !== 0) biasPenaltyTotal += Math.abs(biasDeduct);

            score += rawScore;

            // Check combo milestones
            for (var mi = 0; mi < COMBO_MILESTONES.length; mi++) {
                if (combo === COMBO_MILESTONES[mi]) {
                    reachedMilestones[COMBO_MILESTONES[mi]] = true;
                    lastMilestoneReached = COMBO_MILESTONES[mi];
                }
            }
        }
        totalNotes++;
    }

    // --- Phase 3A: Per-lane recording ---
    function recordLaneHit(lane, judgment) {
        if (lane < 0 || lane > 2) return;
        laneJudgments[lane][judgment]++;
        laneTotalNotes[lane]++;
    }

    function getLaneAccuracy(lane) {
        if (lane < 0 || lane > 2) return 0;
        var total = laneTotalNotes[lane];
        if (total === 0) return 100;
        var hits = laneJudgments[lane].perfect + laneJudgments[lane].great + laneJudgments[lane].good;
        return Math.round((hits / total) * 10000) / 100;
    }

    function getLaneJudgments(lane) {
        if (lane < 0 || lane > 2) return { perfect: 0, great: 0, good: 0, miss: 0 };
        return {
            perfect: laneJudgments[lane].perfect,
            great: laneJudgments[lane].great,
            good: laneJudgments[lane].good,
            miss: laneJudgments[lane].miss
        };
    }

    function getLaneTotalNotes(lane) {
        if (lane < 0 || lane > 2) return 0;
        return laneTotalNotes[lane];
    }

    function getAccuracy() {
        if (totalNotes === 0) return 100;
        var hits = judgments.perfect + judgments.great + judgments.good;
        return Math.round((hits / totalNotes) * 10000) / 100;
    }

    function getGrade() {
        var acc = getAccuracy();
        if (acc >= 95) return 'S';
        if (acc >= 85) return 'A';
        if (acc >= 70) return 'B';
        if (acc >= 50) return 'C';
        return 'D';
    }

    // --- Phase 3A: Combo milestones ---
    function getReachedMilestones() {
        var result = [];
        for (var mi = 0; mi < COMBO_MILESTONES.length; mi++) {
            if (reachedMilestones[COMBO_MILESTONES[mi]]) {
                result.push(COMBO_MILESTONES[mi]);
            }
        }
        return result;
    }

    function getLastMilestone() {
        return lastMilestoneReached;
    }

    function isMilestoneReached(milestone) {
        return !!reachedMilestones[milestone];
    }

    // --- Phase 3A: Score breakdown ---
    function getScoreBreakdown() {
        return {
            baseScore: baseScore,
            comboBonus: comboBonus,
            laneBonusTotal: laneBonusTotal,
            biasPenaltyTotal: biasPenaltyTotal,
            total: score
        };
    }

    // --- Phase 3A: Achievements ---
    function getAchievements() {
        // fullCombo: no misses
        fullCombo = missCount === 0 && totalNotes > 0;
        // allPerfect: all judgments are perfect
        allPerfect = judgments.perfect > 0 && totalNotes === judgments.perfect;

        return {
            fullCombo: fullCombo,
            allPerfect: allPerfect,
            recoveryCount: recoveryCount
        };
    }

    function isFullCombo() {
        return missCount === 0 && totalNotes > 0;
    }

    function isAllPerfect() {
        return judgments.perfect > 0 && totalNotes === judgments.perfect;
    }

    // --- Phase 3A: Difficulty rating ---
    function computeDifficultyRating() {
        if (totalNotes === 0) { difficultyRating = 0; return 0; }

        var acc = getAccuracy();
        var perfectRate = judgments.perfect / totalNotes;
        var comboRatio = maxCombo / totalNotes;

        // Weighted formula: accuracy(40%) + perfectRate(35%) + comboRatio(25%)
        difficultyRating = Math.round((acc * 0.4 + perfectRate * 100 * 0.35 + comboRatio * 100 * 0.25) * 10) / 10;
        return difficultyRating;
    }

    function getDifficultyRating() {
        return difficultyRating;
    }

    function getCommunionResult(levelId) {
        var communionScore = LightBalance.getCommunionScore();
        var level = null;
        if (typeof LevelData !== 'undefined') {
            level = LevelData.getLevel(levelId);
        }
        var requiredCommunion = level ? (level.requiredCommunion || 50) : 50;
        return {
            score: Math.round(communionScore),
            required: requiredCommunion,
            passed: communionScore >= requiredCommunion
        };
    }

    function isLevelPassed(levelId) {
        var acc = getAccuracy();
        var communion = getCommunionResult(levelId);
        return acc >= 50 && communion.passed;
    }

    function getScore() { return score; }
    function getCombo() { return combo; }
    function getMaxCombo() { return maxCombo; }
    function getJudgments() { return judgments; }
    function getTotalNotes() { return totalNotes; }

    // ================================================================
    // Multipliers system
    // ================================================================
    var multipliers = { combo: 1.0, perfect: 1.0, communion: 1.0, phase: 1.0 };

    function setMultiplier(type, value) {
        if (multipliers[type] !== undefined) multipliers[type] = value;
    }

    function getMultiplier(type) {
        return multipliers[type] || 1.0;
    }

    function getTotalMultiplier() {
        return multipliers.combo * multipliers.perfect * multipliers.communion * multipliers.phase;
    }

    function resetMultipliers() {
        multipliers = { combo: 1.0, perfect: 1.0, communion: 1.0, phase: 1.0 };
    }

    // ================================================================
    // Combo milestones (check-based, returns milestone when newly reached)
    // ================================================================
    var reachedComboMilestones = [];

    function checkComboMilestone() {
        var currentCombo = getCombo();
        for (var i = 0; i < COMBO_MILESTONES.length; i++) {
            if (currentCombo >= COMBO_MILESTONES[i] && reachedComboMilestones.indexOf(COMBO_MILESTONES[i]) === -1) {
                reachedComboMilestones.push(COMBO_MILESTONES[i]);
                return COMBO_MILESTONES[i];
            }
        }
        return 0;
    }

    function getReachedComboMilestones() {
        return reachedComboMilestones.slice();
    }

    // ================================================================
    // Detailed statistics (timing accuracy, lane distribution, streaks)
    // ================================================================
    var detailedStats = {
        earlyHits: 0,
        lateHits: 0,
        laneHits: [0, 0, 0],
        bestStreak: 0,
        currentStreak: 0
    };

    function recordTimingAccuracy(early) {
        if (early) detailedStats.earlyHits++;
        else detailedStats.lateHits++;
    }

    function recordDetailedLaneHit(lane) {
        if (lane >= 0 && lane < 3) detailedStats.laneHits[lane]++;
    }

    function updateStreak(isHit) {
        if (isHit) {
            detailedStats.currentStreak++;
            if (detailedStats.currentStreak > detailedStats.bestStreak) {
                detailedStats.bestStreak = detailedStats.currentStreak;
            }
        } else {
            detailedStats.currentStreak = 0;
        }
    }

    function getDetailedStats() {
        return {
            earlyHits: detailedStats.earlyHits,
            lateHits: detailedStats.lateHits,
            laneHits: detailedStats.laneHits.slice(),
            bestStreak: detailedStats.bestStreak,
            currentStreak: detailedStats.currentStreak
        };
    }

    function resetDetailedStats() {
        detailedStats = {
            earlyHits: 0,
            lateHits: 0,
            laneHits: [0, 0, 0],
            bestStreak: 0,
            currentStreak: 0
        };
    }

    // ================================================================
    // Score history (event log for replay analysis)
    // ================================================================
    var scoreHistory = []; // [{time, score, event}]

    function recordScoreEvent(event) {
        scoreHistory.push({ time: Date.now(), score: getScore(), event: event });
    }

    function getScoreHistory() {
        return scoreHistory.slice();
    }

    function getScoreVelocity() {
        // Points per second over last several events
        if (scoreHistory.length < 2) return 0;
        var recent = scoreHistory[scoreHistory.length - 1];
        var older = scoreHistory[Math.max(0, scoreHistory.length - 5)];
        var dt = (recent.time - older.time) / 1000;
        return dt > 0 ? (recent.score - older.score) / dt : 0;
    }

    function resetScoreHistory() {
        scoreHistory = [];
    }

    // ================================================================
    // Configurable grade thresholds
    // ================================================================
    var gradeThresholds = { S: 95, A: 85, B: 70, C: 55, D: 0 };

    function setGradeThresholds(thresholds) {
        if (thresholds) gradeThresholds = thresholds;
    }

    function getGradeThresholds() {
        return gradeThresholds;
    }

    function getGradeForScore(accuracy) {
        if (accuracy >= gradeThresholds.S) return 'S';
        if (accuracy >= gradeThresholds.A) return 'A';
        if (accuracy >= gradeThresholds.B) return 'B';
        if (accuracy >= gradeThresholds.C) return 'C';
        return 'D';
    }

    function reset() {
        score = 0;
        combo = 0;
        maxCombo = 0;
        judgments = { perfect: 0, great: 0, good: 0, miss: 0 };
        totalNotes = 0;
        // Per-lane
        laneJudgments = [
            { perfect: 0, great: 0, good: 0, miss: 0 },
            { perfect: 0, great: 0, good: 0, miss: 0 },
            { perfect: 0, great: 0, good: 0, miss: 0 }
        ];
        laneTotalNotes = [0, 0, 0];
        // Breakdown
        baseScore = 0;
        comboBonus = 0;
        laneBonusTotal = 0;
        biasPenaltyTotal = 0;
        // Milestones
        reachedMilestones = {};
        lastMilestoneReached = 0;
        // Achievements
        fullCombo = false;
        allPerfect = false;
        recoveryCount = 0;
        missCount = 0;
        wasInMissStreak = false;
        // Rating
        difficultyRating = 0;
        // Multipliers
        resetMultipliers();
        // Combo milestones (check-based)
        reachedComboMilestones = [];
        // Detailed statistics
        resetDetailedStats();
        // Score history
        resetScoreHistory();
        // Grade thresholds stay configurable, do not reset
    }

    // --- Phase 8: Session analytics ---
    function getSessionAnalytics() {
        var elapsed = scoreHistory.length > 1 ? (scoreHistory[scoreHistory.length-1].time - scoreHistory[0].time) / 1000 : 0;
        return {
            totalScore: score,
            elapsedSeconds: Math.round(elapsed),
            scorePerMinute: elapsed > 0 ? Math.round(score / (elapsed / 60)) : 0,
            hitRate: totalNotes > 0 ? Math.round((totalNotes - judgments.miss) / totalNotes * 100) : 100,
            perfectRate: totalNotes > 0 ? Math.round(judgments.perfect / totalNotes * 100) : 0,
            consistencyIndex: getConsistencyIndex()
        };
    }

    function getConsistencyIndex() {
        if (scoreHistory.length < 3) return 100;
        var diffs = [];
        for (var i = 1; i < scoreHistory.length; i++) {
            diffs.push(scoreHistory[i].score - scoreHistory[i-1].score);
        }
        var mean = 0;
        for (var j = 0; j < diffs.length; j++) mean += diffs[j];
        mean /= diffs.length;
        var variance = 0;
        for (var k = 0; k < diffs.length; k++) variance += Math.pow(diffs[k] - mean, 2);
        variance /= diffs.length;
        return Math.max(0, Math.round(100 - Math.sqrt(variance) * 0.1));
    }

    return {
        recordJudgment: recordJudgment,
        recordLaneHit: recordLaneHit,
        getScore: getScore,
        getCombo: getCombo,
        getMaxCombo: getMaxCombo,
        getAccuracy: getAccuracy,
        getGrade: getGrade,
        getJudgments: getJudgments,
        getTotalNotes: getTotalNotes,
        getCommunionResult: getCommunionResult,
        isLevelPassed: isLevelPassed,
        // Phase 3A: Per-lane
        getLaneAccuracy: getLaneAccuracy,
        getLaneJudgments: getLaneJudgments,
        getLaneTotalNotes: getLaneTotalNotes,
        // Phase 3A: Milestones
        getReachedMilestones: getReachedMilestones,
        getLastMilestone: getLastMilestone,
        isMilestoneReached: isMilestoneReached,
        // Phase 3A: Breakdown
        getScoreBreakdown: getScoreBreakdown,
        // Phase 3A: Achievements
        getAchievements: getAchievements,
        isFullCombo: isFullCombo,
        isAllPerfect: isAllPerfect,
        // Phase 3A: Difficulty rating
        computeDifficultyRating: computeDifficultyRating,
        getDifficultyRating: getDifficultyRating,
        // Multipliers
        setMultiplier: setMultiplier,
        getMultiplier: getMultiplier,
        getTotalMultiplier: getTotalMultiplier,
        resetMultipliers: resetMultipliers,
        // Combo milestones (check-based)
        checkComboMilestone: checkComboMilestone,
        getReachedComboMilestones: getReachedComboMilestones,
        // Detailed statistics
        recordTimingAccuracy: recordTimingAccuracy,
        recordDetailedLaneHit: recordDetailedLaneHit,
        updateStreak: updateStreak,
        getDetailedStats: getDetailedStats,
        resetDetailedStats: resetDetailedStats,
        // Score history
        recordScoreEvent: recordScoreEvent,
        getScoreHistory: getScoreHistory,
        getScoreVelocity: getScoreVelocity,
        resetScoreHistory: resetScoreHistory,
        // Configurable grade thresholds
        setGradeThresholds: setGradeThresholds,
        getGradeThresholds: getGradeThresholds,
        getGradeForScore: getGradeForScore,
        reset: reset,
        // Phase 8
        getSessionAnalytics: getSessionAnalytics,
        getConsistencyIndex: getConsistencyIndex
    };
})();

window.scoring = Scoring;
