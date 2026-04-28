/**
 * Beat System — 历史中的三重光
 * Generates and manages beat patterns for each level.
 */
var BeatSystem = (function () {
    var BEAT_NORMAL = 0;
    var BEAT_HOLD = 1;
    var BEAT_SIMULTANEOUS = 2;

    var MIN_LANE_GAP_MS = 200;

    function generatePattern(levelConfig) {
        var bpm = levelConfig.bpm;
        var duration = levelConfig.duration;
        var density = levelConfig.beatDensity;
        var weights = levelConfig.laneWeights;

        var beatInterval = 60000 / bpm;
        var beats = [];

        var lastLaneTime = [0, 0, 0];

        var t = beatInterval;
        while (t < duration * 1000 - 1000) {
            var roll = Math.random();
            if (roll < density) {
                var lane = pickLane(weights);
                if (t - lastLaneTime[lane] >= MIN_LANE_GAP_MS) {
                    beats.push({
                        time: t,
                        lane: lane,
                        type: BEAT_NORMAL,
                        duration: 0
                    });
                    lastLaneTime[lane] = t;
                }
            }

            var halfBeat = roll < 0.15 && density > 0.5;
            t += halfBeat ? beatInterval * 0.5 : beatInterval;
        }

        beats.sort(function (a, b) { return a.time - b.time; });
        return beats;
    }

    function pickLane(weights) {
        var r = Math.random();
        var cumulative = 0;
        for (var i = 0; i < weights.length; i++) {
            cumulative += weights[i];
            if (r < cumulative) return i;
        }
        return weights.length - 1;
    }

    var cachedBeats = {};

    function getBeatsForLevel(levelId) {
        if (cachedBeats[levelId]) return cachedBeats[levelId];
        var level = LevelData.getLevel(levelId);
        if (!level) return [];
        var beats = generatePattern(level);
        cachedBeats[levelId] = beats;
        return beats;
    }

    function clearCache() {
        cachedBeats = {};
    }

    return {
        BEAT_NORMAL: BEAT_NORMAL,
        BEAT_HOLD: BEAT_HOLD,
        BEAT_SIMULTANEOUS: BEAT_SIMULTANEOUS,
        generatePattern: generatePattern,
        getBeatsForLevel: getBeatsForLevel,
        clearCache: clearCache
    };
})();
