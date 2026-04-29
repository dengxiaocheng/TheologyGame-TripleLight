/**
 * Input System — 历史中的三重光
 * Keyboard + touch input handling for rhythm gameplay.
 * Phase 2: Haptic feedback (navigator.vibrate on successful hit).
 * Phase 3A: Bug fixes, lane flash, input stats, calibration, multi-finger.
 */
var InputSystem = (function () {
    var keysDown = {};
    var initialized = false;
    var canvas = null;

    var LANE_KEYS = ['a', 's', 'd'];
    var LANE_ACTIONS = ['lane_0', 'lane_1', 'lane_2'];
    var isTouchDevice = false;
    var touchLaneMap = {}; // touchId -> lane index

    // --- Phase 3A: Lane flash visual feedback ---
    var laneFlashAlpha = [0, 0, 0];
    var LANE_FLASH_DECAY = 4.0; // alpha units per second

    // --- Phase 3A: Input statistics ---
    var laneHits = [0, 0, 0];
    var keyboardHits = 0;
    var touchHits = 0;

    // --- Phase 3A: Calibration system ---
    var calibrationTaps = [];
    var CALIBRATION_TAPS_NEEDED = 8;
    var calibrationOffset = 0; // ms offset (positive = inputs are early)
    var calibrationDone = false;

    // --- Phase 3A: Multi-finger detection ---
    var simultaneousLanes = {}; // lane -> true if currently held by touch
    var simultaneousTimer = 0;
    var lastSimultaneousCheck = 0;

    function init() {
        if (initialized) return;
        initialized = true;

        canvas = document.getElementById('gameCanvas');
        if (canvas) {
            canvas.style.touchAction = 'none';
        }

        // Detect touch support
        isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

        // Keyboard events
        document.addEventListener('keydown', function (e) {
            if (e.repeat) return;
            var key = e.key.toLowerCase();
            keysDown[key] = true;

            if (LANE_KEYS.indexOf(key) !== -1) {
                e.preventDefault();
                var laneIndex = LANE_KEYS.indexOf(key);
                laneHits[laneIndex]++;
                keyboardHits++;
                laneFlashAlpha[laneIndex] = 1.0;
                if (typeof Game !== 'undefined' && Game.handleKeyDown) {
                    Game.handleKeyDown('lane_' + laneIndex);
                }
            }

            if (key === 'escape') {
                e.preventDefault();
                if (typeof Game !== 'undefined' && Game.handleKeyDown) {
                    Game.handleKeyDown('escape');
                }
            }

            if (key === ' ' || key === 'enter') {
                e.preventDefault();
                if (typeof Game !== 'undefined' && Game.handleKeyDown) {
                    Game.handleKeyDown('confirm');
                }
            }
        });

        // FIX BUG #1: keyup now sends 'lane_N' format instead of raw key
        document.addEventListener('keyup', function (e) {
            var key = e.key.toLowerCase();
            keysDown[key] = false;

            if (typeof Game !== 'undefined' && Game.handleKeyUp) {
                var laneIdx = LANE_KEYS.indexOf(key);
                if (laneIdx !== -1) {
                    Game.handleKeyUp('lane_' + laneIdx);
                } else {
                    Game.handleKeyUp(key);
                }
            }
        });

        // Touch events on canvas
        if (canvas) {
            canvas.addEventListener('touchstart', function (e) {
                e.preventDefault();
                for (var i = 0; i < e.changedTouches.length; i++) {
                    var touch = e.changedTouches[i];
                    var lane = getLaneFromX(touch.clientX);
                    if (lane !== -1) {
                        touchLaneMap[touch.identifier] = lane;
                        simultaneousLanes[lane] = true;
                        laneHits[lane]++;
                        touchHits++;
                        laneFlashAlpha[lane] = 1.0;
                        if (typeof Game !== 'undefined' && Game.handleKeyDown) {
                            Game.handleKeyDown('lane_' + lane);
                        }
                        // Haptic feedback on touch lane hit
                        hapticHit(lane);
                    }
                }
                // Check for pause area
                for (var j = 0; j < e.changedTouches.length; j++) {
                    if (isInPauseArea(e.changedTouches[j].clientX, e.changedTouches[j].clientY)) {
                        if (typeof Game !== 'undefined' && Game.handleKeyDown) {
                            Game.handleKeyDown('escape');
                        }
                    }
                }

                // Multi-finger simultaneous detection
                checkSimultaneousTouch();
            }, { passive: false });

            // FIX BUG #2: touchend now calls Game.handleKeyUp('lane_N')
            canvas.addEventListener('touchend', function (e) {
                e.preventDefault();
                for (var i = 0; i < e.changedTouches.length; i++) {
                    var touch = e.changedTouches[i];
                    var lane = touchLaneMap[touch.identifier];
                    if (lane !== undefined) {
                        delete simultaneousLanes[lane];
                        if (typeof Game !== 'undefined' && Game.handleKeyUp) {
                            Game.handleKeyUp('lane_' + lane);
                        }
                        delete touchLaneMap[touch.identifier];
                    }
                }
            }, { passive: false });

            canvas.addEventListener('touchmove', function (e) {
                e.preventDefault();
            }, { passive: false });
        }
    }

    function getLaneFromX(clientX) {
        if (!canvas) return -1;
        var rect = canvas.getBoundingClientRect();
        var relX = clientX - rect.left;
        var laneWidth = rect.width / 3;
        if (relX < 0 || relX > rect.width) return -1;
        return Math.min(2, Math.floor(relX / laneWidth));
    }

    function isInPauseArea(clientX, clientY) {
        // Top-right 44×44 area
        if (!canvas) return false;
        var rect = canvas.getBoundingClientRect();
        return clientX > rect.right - 44 && clientY < rect.top + 44;
    }

    function hapticHit(lane) {
        if (navigator.vibrate) {
            navigator.vibrate(15);
        }
    }

    // --- Phase 3A: Multi-finger detection ---
    function checkSimultaneousTouch() {
        var heldCount = 0;
        for (var l in simultaneousLanes) {
            if (simultaneousLanes[l]) heldCount++;
        }
        if (heldCount >= 2) {
            lastSimultaneousCheck = Date.now();
        }
    }

    function getSimultaneousLanes() {
        var result = [];
        for (var l in simultaneousLanes) {
            if (simultaneousLanes[l]) result.push(parseInt(l, 10));
        }
        return result;
    }

    function wasRecentSimultaneous(windowMs) {
        if (!windowMs) windowMs = 200;
        return (Date.now() - lastSimultaneousCheck) < windowMs;
    }

    // --- Phase 3A: Input statistics ---
    function getLaneHits() {
        return laneHits.slice();
    }

    function getKeyboardHits() {
        return keyboardHits;
    }

    function getTouchHits() {
        return touchHits;
    }

    function getTouchRatio() {
        var total = keyboardHits + touchHits;
        if (total === 0) return 0;
        return touchHits / total;
    }

    function resetStats() {
        laneHits = [0, 0, 0];
        keyboardHits = 0;
        touchHits = 0;
    }

    // --- Phase 3A: Calibration ---
    function recordCalibrationTap(timestamp) {
        calibrationTaps.push(timestamp);
        if (calibrationTaps.length > CALIBRATION_TAPS_NEEDED) {
            calibrationTaps.shift();
        }

        if (calibrationTaps.length >= CALIBRATION_TAPS_NEEDED) {
            computeCalibration();
        }
    }

    function computeCalibration() {
        if (calibrationTaps.length < 4) return;
        // Compute average interval between taps
        var intervals = [];
        for (var i = 1; i < calibrationTaps.length; i++) {
            intervals.push(calibrationTaps[i] - calibrationTaps[i - 1]);
        }
        // Sort and use median to avoid outlier skew
        intervals.sort(function (a, b) { return a - b; });
        var medianInterval = intervals[Math.floor(intervals.length / 2)];

        // Offset is the difference between expected beat interval and actual
        // For now, store as a simple latency estimate
        var sum = 0;
        for (var j = 0; j < intervals.length; j++) sum += intervals[j];
        var avgInterval = sum / intervals.length;
        calibrationOffset = Math.round(medianInterval - avgInterval);
        calibrationDone = true;
    }

    function getCalibrationOffset() {
        return calibrationOffset;
    }

    function isCalibrated() {
        return calibrationDone;
    }

    function resetCalibration() {
        calibrationTaps = [];
        calibrationOffset = 0;
        calibrationDone = false;
    }

    // --- Phase 3A: Lane flash update & render ---
    function update(dt) {
        for (var i = 0; i < 3; i++) {
            if (laneFlashAlpha[i] > 0) {
                laneFlashAlpha[i] = Math.max(0, laneFlashAlpha[i] - LANE_FLASH_DECAY * dt);
            }
        }
    }

    function renderLaneFlash(ctx, canvasW, canvasH, dpr) {
        var laneW = canvasW / 3;
        var jy = canvasH - 90 * dpr;

        for (var i = 0; i < 3; i++) {
            if (laneFlashAlpha[i] <= 0) continue;
            var LANE_COLORS = ['#4FC3F7', '#FFD54F', '#CE93D8'];
            ctx.save();
            ctx.globalAlpha = laneFlashAlpha[i] * 0.4;
            ctx.fillStyle = LANE_COLORS[i];
            ctx.fillRect(i * laneW, 0, laneW, canvasH);
            ctx.restore();
        }
    }

    function isKeyDown(key) {
        return !!keysDown[key.toLowerCase()];
    }

    // ================================================================
    // Gesture recognition
    // ================================================================
    var gestureState = { startX: 0, startY: 0, startTime: 0, tracking: false };
    var GESTURE_THRESHOLD = 50; // pixels
    var SWIPE_THRESHOLD = 30;
    var gestures = [];

    function startGesture(x, y) {
        gestureState.startX = x;
        gestureState.startY = y;
        gestureState.startTime = Date.now();
        gestureState.tracking = true;
    }

    function endGesture(x, y) {
        if (!gestureState.tracking) return null;
        gestureState.tracking = false;
        var dx = x - gestureState.startX;
        var dy = y - gestureState.startY;
        var dt = Date.now() - gestureState.startTime;
        var dist = Math.sqrt(dx * dx + dy * dy);

        var gesture = null;
        if (dist < GESTURE_THRESHOLD) {
            gesture = { type: 'tap', x: x, y: y, duration: dt };
        } else if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > SWIPE_THRESHOLD) {
            gesture = { type: 'swipe', direction: dx > 0 ? 'right' : 'left', distance: dist, duration: dt };
        } else if (Math.abs(dy) > SWIPE_THRESHOLD) {
            gesture = { type: 'swipe', direction: dy > 0 ? 'down' : 'up', distance: dist, duration: dt };
        }
        if (gesture) gestures.push(gesture);
        return gesture;
    }

    function getRecentGestures(count) {
        return gestures.slice(-count);
    }

    function resetGestures() {
        gestureState = { startX: 0, startY: 0, startTime: 0, tracking: false };
        gestures = [];
    }

    // ================================================================
    // Input buffering
    // ================================================================
    var inputBuffer = []; // {time, lane, type}
    var BUFFER_DURATION = 200; // ms
    var MAX_BUFFER_SIZE = 10;

    function bufferInput(lane, type) {
        var now = Date.now();
        inputBuffer.push({ time: now, lane: lane, type: type || 'tap' });
        // Trim old entries
        while (inputBuffer.length > MAX_BUFFER_SIZE) inputBuffer.shift();
        while (inputBuffer.length > 0 && now - inputBuffer[0].time > BUFFER_DURATION) inputBuffer.shift();
    }

    function getInputBuffer() {
        return inputBuffer.slice();
    }

    function getBufferedInput(lane) {
        var now = Date.now();
        for (var i = inputBuffer.length - 1; i >= 0; i--) {
            if (inputBuffer[i].lane === lane && now - inputBuffer[i].time < BUFFER_DURATION) {
                return inputBuffer.splice(i, 1)[0];
            }
        }
        return null;
    }

    function clearBuffer() {
        inputBuffer = [];
    }

    // ================================================================
    // Haptic feedback support (configurable)
    // ================================================================
    var hapticEnabled = false;

    function enableHaptic(enabled) {
        hapticEnabled = enabled;
    }

    function isHapticEnabled() {
        return hapticEnabled;
    }

    function triggerHaptic(intensity) {
        if (!hapticEnabled) return;
        if (navigator.vibrate) {
            var ms = intensity === 'light' ? 10 : (intensity === 'medium' ? 25 : 50);
            navigator.vibrate(ms);
        }
    }

    // ================================================================
    // Input statistics (extended)
    // ================================================================
    var inputStats = {
        totalTaps: 0,
        laneTaps: [0, 0, 0],
        avgResponseTime: 0,
        responseTimes: []
    };

    function recordInputStat(lane, responseTime) {
        inputStats.totalTaps++;
        if (lane >= 0 && lane < 3) inputStats.laneTaps[lane]++;
        if (responseTime !== undefined) {
            inputStats.responseTimes.push(responseTime);
            if (inputStats.responseTimes.length > 50) inputStats.responseTimes.shift();
            var sum = 0;
            for (var i = 0; i < inputStats.responseTimes.length; i++) sum += inputStats.responseTimes[i];
            inputStats.avgResponseTime = sum / inputStats.responseTimes.length;
        }
    }

    function getInputStats() {
        return {
            totalTaps: inputStats.totalTaps,
            laneTaps: inputStats.laneTaps.slice(),
            avgResponseTime: inputStats.avgResponseTime
        };
    }

    function resetInputStats() {
        inputStats = {
            totalTaps: 0,
            laneTaps: [0, 0, 0],
            avgResponseTime: 0,
            responseTimes: []
        };
    }

    // ================================================================
    // Accessibility options
    // ================================================================
    var accessibility = {
        highContrast: false,
        largerTargets: false,
        reducedMotion: false,
        colorBlind: false
    };

    function setAccessibilityOption(key, value) {
        if (accessibility[key] !== undefined) accessibility[key] = value;
    }

    function getAccessibilityOptions() {
        return {
            highContrast: accessibility.highContrast,
            largerTargets: accessibility.largerTargets,
            reducedMotion: accessibility.reducedMotion,
            colorBlind: accessibility.colorBlind
        };
    }

    function getAccessibilityLaneColors() {
        if (!accessibility.colorBlind) return null;
        // Color-blind friendly palette: blue, orange, green
        return ['#0072B2', '#E69F00', '#009E73'];
    }

    function resetAccessibility() {
        accessibility = {
            highContrast: false,
            largerTargets: false,
            reducedMotion: false,
            colorBlind: false
        };
    }

    function reset() {
        keysDown = {};
        touchLaneMap = {};
        laneFlashAlpha = [0, 0, 0];
        simultaneousLanes = {};
        // Gesture recognition
        resetGestures();
        // Input buffer
        clearBuffer();
        // Extended input stats
        resetInputStats();
        // Haptic feedback stays configured, do not reset
        // Accessibility options stay configured, do not reset
    }

    return {
        init: init,
        isKeyDown: isKeyDown,
        update: update,
        renderLaneFlash: renderLaneFlash,
        reset: reset,
        resetStats: resetStats,
        isTouchDevice: function () { return isTouchDevice; },
        // Stats
        getLaneHits: getLaneHits,
        getKeyboardHits: getKeyboardHits,
        getTouchHits: getTouchHits,
        getTouchRatio: getTouchRatio,
        // Calibration
        recordCalibrationTap: recordCalibrationTap,
        getCalibrationOffset: getCalibrationOffset,
        isCalibrated: isCalibrated,
        resetCalibration: resetCalibration,
        // Multi-finger
        getSimultaneousLanes: getSimultaneousLanes,
        wasRecentSimultaneous: wasRecentSimultaneous,
        // Gesture recognition
        startGesture: startGesture,
        endGesture: endGesture,
        getRecentGestures: getRecentGestures,
        resetGestures: resetGestures,
        // Input buffering
        bufferInput: bufferInput,
        getInputBuffer: getInputBuffer,
        getBufferedInput: getBufferedInput,
        clearBuffer: clearBuffer,
        // Haptic feedback
        enableHaptic: enableHaptic,
        isHapticEnabled: isHapticEnabled,
        triggerHaptic: triggerHaptic,
        // Extended input statistics
        recordInputStat: recordInputStat,
        getInputStats: getInputStats,
        resetInputStats: resetInputStats,
        // Accessibility
        setAccessibilityOption: setAccessibilityOption,
        getAccessibilityOptions: getAccessibilityOptions,
        getAccessibilityLaneColors: getAccessibilityLaneColors,
        resetAccessibility: resetAccessibility
    };
})();
