/**
 * Light Balance System — 历史中的三重光
 * Three-light balance tracking with decay toward equilibrium.
 * Phase 2: History snapshots, sustained imbalance detection.
 * Phase 3B: Min/max tracking, recovery, streaks, milestones, graph data.
 */
var LightBalance = (function () {
    var values = [50, 50, 50];
    var DECAY_RATE = 0.02; // 2% per second toward 50
    var EQUILIBRIUM = 50;

    // --- History tracking ---
    var history = [];        // per-second snapshots: [{time, values:[n,n,n]}]
    var snapshotTimer = 0;
    var SNAPSHOT_INTERVAL = 1; // 1 second
    var gameElapsed = 0;

    // --- Phase 3B: Min/max tracking ---
    var laneMin = [50, 50, 50];
    var laneMax = [50, 50, 50];
    var globalMin = 50;
    var globalMax = 50;
    var laneMinHistory = [[], [], []]; // per-snapshot min tracking
    var laneMaxHistory = [[], [], []]; // per-snapshot max tracking

    // --- Phase 3B: Recovery mechanic ---
    var recoveryActive = false;
    var recoveryTimer = 0;
    var RECOVERY_DURATION = 3; // seconds of boosted recovery
    var RECOVERY_BOOST = 3.0;  // 3x decay rate during recovery
    var recoveryTriggered = false;

    // --- Phase 3B: Balance streak ---
    var BALANCE_STREAK_THRESHOLD = 15; // imbalance below this counts as balanced
    var balanceStreak = 0;       // consecutive seconds of balance
    var maxBalanceStreak = 0;    // best streak this level
    var streakHistory = [];      // [{time, streak}]

    // --- Phase 3B: Milestones ---
    var BALANCE_MILESTONES = [5, 10, 20, 30, 60]; // seconds of sustained balance
    var reachedMilestones = {};
    var lastMilestone = 0;

    // --- Phase 3B: Graph data for UI ---
    var graphSnapshots = []; // compact: [{t, v:[n,n,n]}] every 2 seconds
    var graphTimer = 0;
    var GRAPH_INTERVAL = 2;

    // --- Phase 3B: Communion history ---
    var communionHistory = []; // [{time, score}]
    var communionSnapshotTimer = 0;
    var COMMUNION_SNAPSHOT_INTERVAL = 3;

    // --- Phase 6B: Per-phase balance targets ---
    var phaseTargets = null; // [{targets:[n,n,n], name:''}] per phase
    var currentPhaseIndex = 0;

    // --- Phase 6B: Communion quality tiers ---
    var COMMUNION_TIERS = [
        { name: 'Harmony', minScore: 95, color: '#E1BEE7' },
        { name: 'Communion', minScore: 80, color: '#CE93D8' },
        { name: 'Fellowship', minScore: 60, color: '#4FC3F7' },
        { name: 'Discord', minScore: 0, color: '#EF5350' }
    ];
    var communionTierHistory = []; // [{time, tier}]

    // --- Phase 6B: Phase markers for graph ---
    var phaseMarkers = []; // [{time, phaseIndex, name}]

    // --- Phase 6B: Balance event log ---
    var eventLog = []; // [{time, type, details}]
    var MAX_EVENT_LOG = 50;

    // --- Phase 7: Dynamic targets ---
    var dynamicTargets = null; // [{time, targets:[n,n,n], duration}]
    var dynamicTargetIndex = 0;
    var currentDynamicTarget = null;

    function recordHit(lane, judgment) {
        var delta = 0;
        switch (judgment) {
            case 'perfect': delta = 5; break;
            case 'great': delta = 3; break;
            case 'good': delta = 1; break;
            case 'miss': delta = -2; break;
        }
        if (lane >= 0 && lane < 3) {
            values[lane] = Math.max(0, Math.min(100, values[lane] + delta));

            // Update min/max
            if (values[lane] < laneMin[lane]) laneMin[lane] = values[lane];
            if (values[lane] > laneMax[lane]) laneMax[lane] = values[lane];
            if (values[lane] < globalMin) globalMin = values[lane];
            if (values[lane] > globalMax) globalMax = values[lane];
        }

        // Phase 3B: Perfect hits on underrepresented lanes trigger recovery
        if (judgment === 'perfect' || judgment === 'great') {
            checkRecoveryTrigger(lane);
        }
    }

    function update(dt) {
        dt_estimated = dt;
        gameElapsed += dt;
        snapshotTimer += dt;
        graphTimer += dt;
        communionSnapshotTimer += dt;

        // Phase 7: Update dynamic targets
        updateDynamicTargets();

        // Decay toward equilibrium (boosted during recovery)
        var rate = recoveryActive ? DECAY_RATE * RECOVERY_BOOST : DECAY_RATE;
        for (var i = 0; i < 3; i++) {
            if (values[i] > EQUILIBRIUM) {
                values[i] = Math.max(EQUILIBRIUM, values[i] - rate * dt * 100);
            } else if (values[i] < EQUILIBRIUM) {
                values[i] = Math.min(EQUILIBRIUM, values[i] + rate * dt * 100);
            }
        }

        // Update recovery timer
        if (recoveryActive) {
            recoveryTimer -= dt;
            if (recoveryTimer <= 0) {
                recoveryActive = false;
                recoveryTimer = 0;
            }
        }

        // Take per-second snapshot
        if (snapshotTimer >= SNAPSHOT_INTERVAL) {
            snapshotTimer -= SNAPSHOT_INTERVAL;
            var snap = { time: gameElapsed, values: values.slice() };
            history.push(snap);

            // Track min/max per snapshot
            for (var j = 0; j < 3; j++) {
                laneMinHistory[j].push(laneMin[j]);
                laneMaxHistory[j].push(laneMax[j]);
            }

            // Update balance streak
            updateBalanceStreak();
        }

        // Graph snapshot (every 2 seconds)
        if (graphTimer >= GRAPH_INTERVAL) {
            graphTimer -= GRAPH_INTERVAL;
            graphSnapshots.push({ t: gameElapsed, v: values.slice() });
        }

        // Communion history snapshot (every 3 seconds)
        if (communionSnapshotTimer >= COMMUNION_SNAPSHOT_INTERVAL) {
            communionSnapshotTimer -= COMMUNION_SNAPSHOT_INTERVAL;
            var currentTier = getCommunionTier();
            communionHistory.push({
                time: gameElapsed,
                score: getCommunionScore(),
                tier: currentTier.name
            });
            // Phase 6B: Track tier history
            communionTierHistory.push({ time: gameElapsed, tier: currentTier });
        }
    }

    // --- Phase 3B: Recovery mechanic ---
    function checkRecoveryTrigger(lane) {
        // Trigger recovery if this lane was significantly below others
        var others = 0;
        var count = 0;
        for (var i = 0; i < 3; i++) {
            if (i !== lane) { others += values[i]; count++; }
        }
        var otherAvg = count > 0 ? others / count : EQUILIBRIUM;
        if (values[lane] < otherAvg - 20 && !recoveryActive) {
            recoveryActive = true;
            recoveryTimer = RECOVERY_DURATION;
            recoveryTriggered = true;
        }
    }

    function isRecoveryActive() {
        return recoveryActive;
    }

    function wasRecoveryTriggered() {
        return recoveryTriggered;
    }

    // --- Phase 3B: Balance streak ---
    function updateBalanceStreak() {
        var imbalance = getImbalance();
        if (imbalance < BALANCE_STREAK_THRESHOLD) {
            balanceStreak++;
            if (balanceStreak > maxBalanceStreak) {
                maxBalanceStreak = balanceStreak;
            }
        } else {
            if (balanceStreak > 0) {
                streakHistory.push({ time: gameElapsed, streak: balanceStreak });
            }
            balanceStreak = 0;
        }

        // Check milestones
        for (var i = 0; i < BALANCE_MILESTONES.length; i++) {
            if (balanceStreak >= BALANCE_MILESTONES[i] && !reachedMilestones[BALANCE_MILESTONES[i]]) {
                reachedMilestones[BALANCE_MILESTONES[i]] = true;
                lastMilestone = BALANCE_MILESTONES[i];
            }
        }
    }

    function getBalanceStreak() {
        return balanceStreak;
    }

    function getMaxBalanceStreak() {
        return maxBalanceStreak;
    }

    function getReachedMilestones() {
        var result = [];
        for (var i = 0; i < BALANCE_MILESTONES.length; i++) {
            if (reachedMilestones[BALANCE_MILESTONES[i]]) {
                result.push(BALANCE_MILESTONES[i]);
            }
        }
        return result;
    }

    function getLastMilestone() {
        return lastMilestone;
    }

    function getValues() {
        return values.slice();
    }

    function getImbalance() {
        var avg = (values[0] + values[1] + values[2]) / 3;
        var sum = 0;
        for (var i = 0; i < 3; i++) {
            sum += Math.abs(values[i] - avg);
        }
        return sum;
    }

    function getCommunionScore() {
        return Math.max(0, 100 - getImbalance() * 0.5);
    }

    // --- Phase 3B: Min/max API ---
    function getLaneMin(lane) {
        if (lane < 0 || lane > 2) return 50;
        return laneMin[lane];
    }

    function getLaneMax(lane) {
        if (lane < 0 || lane > 2) return 50;
        return laneMax[lane];
    }

    function getGlobalMin() {
        return globalMin;
    }

    function getGlobalMax() {
        return globalMax;
    }

    function getLaneRange(lane) {
        if (lane < 0 || lane > 2) return { min: 50, max: 50 };
        return { min: laneMin[lane], max: laneMax[lane] };
    }

    // --- Phase 3B: Graph data ---
    function getGraphData() {
        return graphSnapshots.slice();
    }

    function getCommunionHistory() {
        return communionHistory.slice();
    }

    // --- Phase 2: History API ---

    function getHistory() {
        return history.slice();
    }

    function getSustainedImbalance(biasId) {
        // Count how many consecutive recent seconds the bias pattern has been active.
        var dominantLane = -1;
        var checkCommunionBreak = false;
        switch (biasId) {
            case 'creation_only': dominantLane = 0; break;
            case 'incarnation_only': dominantLane = 1; break;
            case 'spirit_only': dominantLane = 2; break;
            case 'communion_break': checkCommunionBreak = true; break;
            default: return 0;
        }

        var IMBALANCE_THRESHOLD = 20;
        var BREAK_THRESHOLD = 8;
        var sustainedSeconds = 0;

        // Walk backward from most recent snapshot
        for (var i = history.length - 1; i >= 0; i--) {
            var snap = history[i];
            var sv = snap.values;
            var maxVal = Math.max(sv[0], sv[1], sv[2]);
            var isActive = false;

            if (checkCommunionBreak) {
                // All values within BREAK_THRESHOLD of 50
                isActive = Math.abs(sv[0] - 50) < BREAK_THRESHOLD &&
                           Math.abs(sv[1] - 50) < BREAK_THRESHOLD &&
                           Math.abs(sv[2] - 50) < BREAK_THRESHOLD;
            } else {
                // Dominant lane is far above others
                var others = 0;
                for (var j = 0; j < 3; j++) {
                    if (j !== dominantLane) others += sv[j];
                }
                var otherAvg = others / 2;
                isActive = sv[dominantLane] - otherAvg > IMBALANCE_THRESHOLD;
            }

            if (isActive) {
                sustainedSeconds++;
            } else {
                break;
            }
        }

        return sustainedSeconds;
    }

    // =================================================================
    // Phase 6B additions
    // =================================================================

    // --- Phase 6B: Per-phase balance targets ---
    function setPhaseTargets(targets) {
        phaseTargets = targets;
    }

    function setPhaseIndex(idx) {
        currentPhaseIndex = idx;
    }

    function getPhaseTargets() {
        return phaseTargets;
    }

    // --- Phase 6B: Balance prediction ---
    var dt_estimated = 0.016; // rough frame-time estimate, updated each frame

    function predictImbalance(secondsAhead) {
        // Project current values forward using decay rate
        var projected = values.slice();
        var steps = Math.max(1, Math.floor(secondsAhead / dt_estimated));
        var dtStep = secondsAhead / steps;
        for (var s = 0; s < steps; s++) {
            for (var i = 0; i < 3; i++) {
                if (projected[i] > EQUILIBRIUM) {
                    projected[i] = Math.max(EQUILIBRIUM, projected[i] - DECAY_RATE * dtStep * 100);
                } else if (projected[i] < EQUILIBRIUM) {
                    projected[i] = Math.min(EQUILIBRIUM, projected[i] + DECAY_RATE * dtStep * 100);
                }
            }
        }
        // Calculate imbalance from projected values
        var avg = (projected[0] + projected[1] + projected[2]) / 3;
        var sum = 0;
        for (var j = 0; j < 3; j++) {
            sum += Math.abs(projected[j] - avg);
        }
        return sum;
    }

    function getPredictionConfidence() {
        // Confidence based on how much history we have
        if (history.length < 5) return 0.2;
        if (history.length < 15) return 0.5;
        if (history.length < 30) return 0.75;
        return 0.9;
    }

    // --- Phase 6B: Communion quality tiers ---
    function getCommunionTier() {
        var score = getCommunionScore();
        for (var i = 0; i < COMMUNION_TIERS.length; i++) {
            if (score >= COMMUNION_TIERS[i].minScore) {
                return COMMUNION_TIERS[i];
            }
        }
        return COMMUNION_TIERS[COMMUNION_TIERS.length - 1];
    }

    function getCommunionTierHistory() {
        return communionTierHistory.slice();
    }

    // --- Phase 6B: Restoration guidance ---
    function getRestorationHint() {
        var avg = (values[0] + values[1] + values[2]) / 3;
        var deviations = [];
        var maxDev = 0;
        var worstLane = 0;

        // If phase targets exist, measure deviation from targets
        if (phaseTargets && currentPhaseIndex < phaseTargets.length) {
            var targets = phaseTargets[currentPhaseIndex].targets;
            for (var i = 0; i < 3; i++) {
                var dev = Math.abs(values[i] - targets[i]);
                deviations.push(dev);
                if (dev > maxDev) {
                    maxDev = dev;
                    worstLane = i;
                }
            }
        } else {
            for (var j = 0; j < 3; j++) {
                var dev2 = Math.abs(values[j] - avg);
                deviations.push(dev2);
                if (dev2 > maxDev) {
                    maxDev = dev2;
                    worstLane = j;
                }
            }
        }

        var laneNames = ['Creation', 'Incarnation', 'Spirit'];
        var urgency = 'low';
        var message = 'Balance is stable.';

        if (maxDev > 25) {
            urgency = 'high';
            message = laneNames[worstLane] + ' needs urgent attention!';
        } else if (maxDev > 12) {
            urgency = 'medium';
            message = laneNames[worstLane] + ' is drifting. Consider focusing there.';
        }

        return { lane: worstLane, urgency: urgency, message: message };
    }

    // --- Phase 6B: Weighted imbalance (relative to phase targets) ---
    function getWeightedImbalance() {
        if (phaseTargets && currentPhaseIndex < phaseTargets.length) {
            var targets = phaseTargets[currentPhaseIndex].targets;
            var targetAvg = (targets[0] + targets[1] + targets[2]) / 3;
            var sum = 0;
            for (var i = 0; i < 3; i++) {
                sum += Math.abs(values[i] - targets[i]);
            }
            // Also measure spread relative to target average
            var valAvg = (values[0] + values[1] + values[2]) / 3;
            sum += Math.abs(valAvg - targetAvg) * 0.5;
            return sum;
        }
        // Fallback to regular imbalance
        return getImbalance();
    }

    // --- Phase 6B: Phase markers for graph ---
    function addPhaseMarker(time, phaseIndex, name) {
        phaseMarkers.push({ time: time, phaseIndex: phaseIndex, name: name });
    }

    function getPhaseMarkers() {
        return phaseMarkers.slice();
    }

    // --- Phase 6B: Balance event log ---
    function logBalanceEvent(type, details) {
        eventLog.push({
            time: gameElapsed,
            type: type,
            details: details || {}
        });
        // Trim to max size
        if (eventLog.length > MAX_EVENT_LOG) {
            eventLog.shift();
        }
    }

    function getBalanceEventLog() {
        return eventLog.slice();
    }

    // =================================================================
    // Phase 7 additions
    // =================================================================

    // --- Phase 7: Dynamic targets ---
    function setDynamicTargets(targets) {
        dynamicTargets = targets;
        dynamicTargetIndex = 0;
        currentDynamicTarget = null;
    }

    function updateDynamicTargets() {
        if (!dynamicTargets || dynamicTargets.length === 0) return;
        // Check if we should advance to next target based on gameElapsed
        if (dynamicTargetIndex < dynamicTargets.length) {
            var next = dynamicTargets[dynamicTargetIndex];
            if (gameElapsed >= next.time) {
                currentDynamicTarget = next.targets;
                dynamicTargetIndex++;
            }
        }
    }

    function getCurrentTargets() {
        return currentDynamicTarget || [EQUILIBRIUM, EQUILIBRIUM, EQUILIBRIUM];
    }

    // --- Phase 7: History replay ---
    function getHistoryAtTime(time) {
        // Find the snapshot closest to the given time
        for (var i = history.length - 1; i >= 0; i--) {
            if (history[i].time <= time) return history[i].values.slice();
        }
        return [50, 50, 50];
    }

    function getHistoryRange(startTime, endTime) {
        // Get all snapshots in a time range
        var result = [];
        for (var i = 0; i < history.length; i++) {
            if (history[i].time >= startTime && history[i].time <= endTime) {
                result.push(history[i]);
            }
        }
        return result;
    }

    function getHistorySummary() {
        // Summary stats from history
        if (history.length === 0) return null;
        var first = history[0];
        var last = history[history.length - 1];
        // Calculate peak imbalance from history
        var peakImbalance = 0;
        for (var i = 0; i < history.length; i++) {
            var hv = history[i].values;
            var havg = (hv[0] + hv[1] + hv[2]) / 3;
            var hsum = 0;
            for (var j = 0; j < 3; j++) {
                hsum += Math.abs(hv[j] - havg);
            }
            if (hsum > peakImbalance) peakImbalance = hsum;
        }
        return {
            duration: last.time - first.time,
            snapshots: history.length,
            startValues: first.values.slice(),
            endValues: last.values.slice(),
            peakImbalance: peakImbalance
        };
    }

    // --- Phase 7: Advanced visualization data ---
    function getHeatmapData() {
        // Returns data for rendering a lane-activity heatmap
        // Groups history into buckets of 5 seconds each
        var bucketSize = 5;
        var buckets = [];
        for (var i = 0; i < history.length; i++) {
            var bucketIdx = Math.floor(history[i].time / bucketSize);
            while (buckets.length <= bucketIdx) {
                buckets.push({ time: buckets.length * bucketSize, values: [0, 0, 0], count: 0 });
            }
            for (var j = 0; j < 3; j++) {
                buckets[bucketIdx].values[j] += history[i].values[j];
            }
            buckets[bucketIdx].count++;
        }
        // Average each bucket
        for (var k = 0; k < buckets.length; k++) {
            if (buckets[k].count > 0) {
                for (var m = 0; m < 3; m++) {
                    buckets[k].values[m] /= buckets[k].count;
                }
            }
        }
        return buckets;
    }

    function getTrajectory() {
        // Returns simplified trajectory showing direction of balance change
        if (history.length < 2) return { direction: 'stable', velocity: [0, 0, 0] };
        var recent = history[history.length - 1].values;
        var prev = history[Math.max(0, history.length - 3)].values;
        var velocity = [];
        for (var i = 0; i < 3; i++) {
            velocity.push(recent[i] - prev[i]);
        }
        var maxV = 0;
        var direction = 'stable';
        for (var j = 0; j < 3; j++) {
            if (Math.abs(velocity[j]) > Math.abs(maxV)) {
                maxV = velocity[j];
                direction = j === 0 ? 'creation' : (j === 1 ? 'incarnation' : 'spirit');
            }
        }
        return { direction: direction, velocity: velocity };
    }

    // --- Phase 7: Extended imbalance metrics ---
    function getDetailedImbalance() {
        // Returns comprehensive imbalance analysis
        var imbalance = getImbalance();
        var vals = getValues();
        var avg = (vals[0] + vals[1] + vals[2]) / 3;
        return {
            total: imbalance,
            perLane: [
                Math.abs(vals[0] - avg),
                Math.abs(vals[1] - avg),
                Math.abs(vals[2] - avg)
            ],
            dominant: vals[0] >= vals[1] && vals[0] >= vals[2] ? 0 : (vals[1] >= vals[2] ? 1 : 2),
            weakest: vals[0] <= vals[1] && vals[0] <= vals[2] ? 0 : (vals[1] <= vals[2] ? 1 : 2),
            spread: Math.max(vals[0], vals[1], vals[2]) - Math.min(vals[0], vals[1], vals[2]),
            health: Math.max(0, 100 - imbalance * 0.5)
        };
    }

    // --- Phase 7: Communion quality trend ---
    function getCommunionTrend() {
        // Is communion getting better or worse?
        if (communionHistory.length < 2) return 'stable';
        var recent = communionHistory[communionHistory.length - 1].score;
        var older = communionHistory[Math.max(0, communionHistory.length - 4)].score;
        var diff = recent - older;
        if (diff > 5) return 'improving';
        if (diff < -5) return 'declining';
        return 'stable';
    }

    function reset() {
        values = [50, 50, 50];
        history = [];
        snapshotTimer = 0;
        gameElapsed = 0;
        // Min/max
        laneMin = [50, 50, 50];
        laneMax = [50, 50, 50];
        globalMin = 50;
        globalMax = 50;
        laneMinHistory = [[], [], []];
        laneMaxHistory = [[], [], []];
        // Recovery
        recoveryActive = false;
        recoveryTimer = 0;
        recoveryTriggered = false;
        // Streak
        balanceStreak = 0;
        maxBalanceStreak = 0;
        streakHistory = [];
        // Milestones
        reachedMilestones = {};
        lastMilestone = 0;
        // Graph
        graphSnapshots = [];
        graphTimer = 0;
        communionHistory = [];
        communionSnapshotTimer = 0;
        // Phase 6B: Per-phase targets
        phaseTargets = null;
        currentPhaseIndex = 0;
        // Phase 6B: Communion tiers
        communionTierHistory = [];
        // Phase 6B: Phase markers
        phaseMarkers = [];
        // Phase 6B: Event log
        eventLog = [];
        dt_estimated = 0.016;
        // Phase 7: Dynamic targets
        dynamicTargets = null;
        dynamicTargetIndex = 0;
        currentDynamicTarget = null;
    }

    // --- Phase 8: Balance presets & extended recovery ---
    var BALANCE_PRESETS = {
        equal: [0.33, 0.34, 0.33],
        creation_focus: [0.7, 0.2, 0.1],
        incarnation_focus: [0.15, 0.7, 0.15],
        spirit_focus: [0.15, 0.15, 0.7],
        balanced_center: [0.3, 0.4, 0.3]
    };

    function applyBalancePreset(name) {
        var preset = BALANCE_PRESETS[name];
        if (preset) {
            values = [preset[0] * 100, preset[1] * 100, preset[2] * 100];
        }
    }

    function getBalancePresets() {
        return JSON.parse(JSON.stringify(BALANCE_PRESETS));
    }

    // Recovery diagnostic
    function getRecoveryDiagnostic() {
        var lowestLane = 0;
        var lowestVal = values[0];
        for (var i = 1; i < 3; i++) {
            if (values[i] < lowestVal) {
                lowestVal = values[i];
                lowestLane = i;
            }
        }
        var laneNames = ['创造/Creation', '道成肉身/Incarnation', '圣灵/Spirit'];
        return {
            lowestLane: lowestLane,
            lowestValue: lowestVal,
            laneName: laneNames[lowestLane],
            isCritical: lowestVal < 20,
            recommendation: lowestVal < 20 ? 'Immediately focus on ' + laneNames[lowestLane] + ' lane' :
                           lowestVal < 35 ? 'Gradually increase ' + laneNames[lowestLane] + ' lane hits' :
                           'Balance is acceptable'
        };
    }

    // Balance stability score (0-100)
    function getStabilityScore() {
        if (history.length < 3) return 100;
        var recentHistory = history.slice(-10);
        var variance = 0;
        for (var l = 0; l < 3; l++) {
            var mean = 0;
            for (var i = 0; i < recentHistory.length; i++) {
                mean += recentHistory[i].values[l];
            }
            mean /= recentHistory.length;
            var sumSqDiff = 0;
            for (var j = 0; j < recentHistory.length; j++) {
                sumSqDiff += Math.pow(recentHistory[j].values[l] - mean, 2);
            }
            variance += sumSqDiff / recentHistory.length;
        }
        variance /= 3;
        return Math.max(0, Math.round(100 - variance * 0.5));
    }

    return {
        recordHit: recordHit,
        update: update,
        getValues: getValues,
        getImbalance: getImbalance,
        getCommunionScore: getCommunionScore,
        getHistory: getHistory,
        getSustainedImbalance: getSustainedImbalance,
        reset: reset,
        // Phase 3B
        getLaneMin: getLaneMin,
        getLaneMax: getLaneMax,
        getGlobalMin: getGlobalMin,
        getGlobalMax: getGlobalMax,
        getLaneRange: getLaneRange,
        isRecoveryActive: isRecoveryActive,
        wasRecoveryTriggered: wasRecoveryTriggered,
        getBalanceStreak: getBalanceStreak,
        getMaxBalanceStreak: getMaxBalanceStreak,
        getReachedMilestones: getReachedMilestones,
        getLastMilestone: getLastMilestone,
        getGraphData: getGraphData,
        getCommunionHistory: getCommunionHistory,
        // Phase 6B
        setPhaseTargets: setPhaseTargets,
        setPhaseIndex: setPhaseIndex,
        getPhaseTargets: getPhaseTargets,
        predictImbalance: predictImbalance,
        getPredictionConfidence: getPredictionConfidence,
        getCommunionTier: getCommunionTier,
        getCommunionTierHistory: getCommunionTierHistory,
        getRestorationHint: getRestorationHint,
        getWeightedImbalance: getWeightedImbalance,
        addPhaseMarker: addPhaseMarker,
        getPhaseMarkers: getPhaseMarkers,
        logBalanceEvent: logBalanceEvent,
        getBalanceEventLog: getBalanceEventLog,
        // Phase 7
        setDynamicTargets: setDynamicTargets,
        getCurrentTargets: getCurrentTargets,
        getHistoryAtTime: getHistoryAtTime,
        getHistoryRange: getHistoryRange,
        getHistorySummary: getHistorySummary,
        getHeatmapData: getHeatmapData,
        getTrajectory: getTrajectory,
        getDetailedImbalance: getDetailedImbalance,
        getCommunionTrend: getCommunionTrend,
        // Phase 8
        applyBalancePreset: applyBalancePreset,
        getBalancePresets: getBalancePresets,
        getRecoveryDiagnostic: getRecoveryDiagnostic,
        getStabilityScore: getStabilityScore
    };
})();

window.lightBalance = LightBalance;
