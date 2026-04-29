/**
 * Bias System — 历史中的三重光
 * Detects imbalanced play patterns and applies theological feedback.
 * Phase 2: Full implementation with 4 bias types, timers, warnings, penalties.
 * Phase 3B: Multiple simultaneous biases, recovery, history log, resolution feedback.
 */
var BiasSystem = (function () {
    // --- Bias Definitions ---
    var BIAS_DEFS = {
        creation_only: {
            id: 'creation_only',
            name: '创造的偏执',
            description: '你只关注创造之道，忽略了道成肉身与圣灵的启示。',
            warningColor: '#4FC3F7',
            criticalColor: '#1565C0',
            sustainedThreshold: 5,
            criticalThreshold: 10,
            recoveryAdvice: '试着关注金色和紫色轨道，让三重光恢复平衡。'
        },
        incarnation_only: {
            id: 'incarnation_only',
            name: '道成肉身的独占',
            description: '你沉浸在具体的人之中，却忘记了创造的广度与圣灵的自由。',
            warningColor: '#FFD54F',
            criticalColor: '#F57F17',
            sustainedThreshold: 5,
            criticalThreshold: 10,
            recoveryAdvice: '创造与圣灵同样重要——让蓝色和紫色轨道重新参与。'
        },
        spirit_only: {
            id: 'spirit_only',
            name: '圣灵的迷失',
            description: '你追求内在的声音，却脱离了受造界和具体之人的根基。',
            warningColor: '#CE93D8',
            criticalColor: '#6A1B9A',
            sustainedThreshold: 5,
            criticalThreshold: 10,
            recoveryAdvice: '没有创造和道成肉身的根基，圣灵的声音会失真。'
        },
        communion_break: {
            id: 'communion_break',
            name: '共融的断裂',
            description: '三重光的平衡完全丧失——你需要重新找回三一上帝的共融。',
            warningColor: '#EF5350',
            criticalColor: '#B71C1C',
            sustainedThreshold: 5,
            criticalThreshold: 10,
            recoveryAdvice: '共融需要三重光同时临在——让每个轨道都有节奏地参与。'
        }
    };

    var BIAS_IDS = ['creation_only', 'incarnation_only', 'spirit_only', 'communion_break'];

    // --- Runtime State ---
    var activeBias = null;
    var biasLevels = {};
    var penaltyActive = false;
    var penaltyMultiplier = 1.0;
    var warningAlpha = 0;
    var criticalAlpha = 0;
    var levelConfig = null;

    // --- Phase 3B: Multiple simultaneous biases ---
    var activeBiases = []; // array of currently active biasIds (warning or critical)

    // --- Phase 3B: Recovery tracking ---
    var recoveryProgress = {}; // biasId -> { resolving: bool, resolveTimer: number }
    var RESOLVE_TIME = 3; // seconds of non-sustained to resolve a bias
    var biasResolved = {}; // biasId -> true if was resolved this level

    // --- Phase 3B: Bias history log ---
    var biasLog = []; // [{time, biasId, event: 'warning'|'critical'|'resolved'}]
    var logTimer = 0;

    // --- Phase 3B: Resolution feedback ---
    var resolutionFlash = 0;
    var resolutionBias = null;

    function init() {
        activeBias = null;
        activeBiases = [];
        penaltyActive = false;
        penaltyMultiplier = 1.0;
        warningAlpha = 0;
        criticalAlpha = 0;
        levelConfig = null;
        biasLevels = {};
        recoveryProgress = {};
        biasResolved = {};
        biasLog = [];
        logTimer = 0;
        resolutionFlash = 0;
        resolutionBias = null;
        for (var i = 0; i < BIAS_IDS.length; i++) {
            biasLevels[BIAS_IDS[i]] = { level: 'none', sustainedSeconds: 0 };
            recoveryProgress[BIAS_IDS[i]] = { resolving: false, resolveTimer: 0 };
        }
        // Clear new tracking state
        biasProgress = {};
        biasHistory = [];
        adaptiveThresholds = false;
    }

    function reset() {
        init();
    }

    function setLevelConfig(config) {
        levelConfig = config || null;
    }

    function update() {
        if (!LightBalance) return;

        var mostSevere = null;
        var mostSevereLevel = 'none';
        activeBiases = [];

        for (var i = 0; i < BIAS_IDS.length; i++) {
            var bid = BIAS_IDS[i];
            var def = BIAS_DEFS[bid];
            var sustained = LightBalance.getSustainedImbalance(bid);
            biasLevels[bid].sustainedSeconds = sustained;

            var prevLevel = biasLevels[bid].level;
            var newLevel = 'none';

            if (sustained >= def.criticalThreshold) {
                newLevel = 'critical';
            } else if (sustained >= def.sustainedThreshold) {
                newLevel = 'warning';
            }

            biasLevels[bid].level = newLevel;

            // Track active biases
            if (newLevel !== 'none') {
                activeBiases.push(bid);
            }

            // Log transitions
            if (newLevel !== prevLevel) {
                if (newLevel === 'warning') {
                    biasLog.push({ time: Date.now(), biasId: bid, event: 'warning' });
                    if (typeof Animation !== 'undefined') {
                        Animation.biasWarningEffect(bid);
                    }
                } else if (newLevel === 'critical') {
                    biasLog.push({ time: Date.now(), biasId: bid, event: 'critical' });
                    if (typeof Animation !== 'undefined') {
                        Animation.biasCriticalEffect(bid);
                    }
                } else if (prevLevel !== 'none' && newLevel === 'none') {
                    biasLog.push({ time: Date.now(), biasId: bid, event: 'resolved' });
                    biasResolved[bid] = true;
                    resolutionFlash = 1.0;
                    resolutionBias = bid;
                }
            }

            // Recovery progress tracking
            if (newLevel === 'none' && prevLevel !== 'none') {
                recoveryProgress[bid].resolving = true;
                recoveryProgress[bid].resolveTimer = RESOLVE_TIME;
            }
            if (recoveryProgress[bid].resolving) {
                recoveryProgress[bid].resolveTimer -= 0.016; // ~60fps
                if (recoveryProgress[bid].resolveTimer <= 0) {
                    recoveryProgress[bid].resolving = false;
                }
            }

            // Track most severe
            if (newLevel === 'critical') {
                if (mostSevereLevel !== 'critical') {
                    mostSevere = bid;
                    mostSevereLevel = 'critical';
                }
            } else if (newLevel === 'warning' && mostSevereLevel === 'none') {
                mostSevere = bid;
                mostSevereLevel = 'warning';
            }
        }

        activeBias = mostSevereLevel !== 'none' ? mostSevere : null;

        // Apply penalty (worse with multiple biases)
        var biasCount = activeBiases.length;
        if (mostSevereLevel === 'critical') {
            penaltyActive = true;
            penaltyMultiplier = Math.max(0.5, 0.7 - (biasCount - 1) * 0.05);
        } else if (mostSevereLevel === 'warning') {
            penaltyActive = true;
            penaltyMultiplier = Math.max(0.7, 0.85 - (biasCount - 1) * 0.03);
        } else {
            penaltyActive = false;
            penaltyMultiplier = 1.0;
        }

        // Update visual alpha
        if (mostSevereLevel === 'critical') {
            criticalAlpha = Math.min(1, criticalAlpha + 0.05);
            warningAlpha = 0;
        } else if (mostSevereLevel === 'warning') {
            warningAlpha = Math.min(1, warningAlpha + 0.05);
            criticalAlpha = 0;
        } else {
            warningAlpha = Math.max(0, warningAlpha - 0.05);
            criticalAlpha = Math.max(0, criticalAlpha - 0.05);
        }

        // Resolution flash decay
        if (resolutionFlash > 0) {
            resolutionFlash = Math.max(0, resolutionFlash - 0.03);
        }
    }

    function getActiveBias() {
        return activeBias;
    }

    function getActiveBiases() {
        return activeBiases.slice();
    }

    function getBiasLevel(biasId) {
        if (biasLevels[biasId]) return biasLevels[biasId].level;
        return 'none';
    }

    function getScorePenalty() {
        return penaltyMultiplier;
    }

    function isPenaltyActive() {
        return penaltyActive;
    }

    function getBiasLevels() {
        var result = {};
        for (var i = 0; i < BIAS_IDS.length; i++) {
            result[BIAS_IDS[i]] = biasLevels[BIAS_IDS[i]].level;
        }
        return result;
    }

    // --- Phase 3B: Recovery & history API ---
    function isResolving(biasId) {
        return recoveryProgress[biasId] ? recoveryProgress[biasId].resolving : false;
    }

    function wasBiasResolved(biasId) {
        return !!biasResolved[biasId];
    }

    function getRecoveryAdvice(biasId) {
        var def = BIAS_DEFS[biasId];
        return def ? def.recoveryAdvice : '';
    }

    function getBiasLog() {
        return biasLog.slice();
    }

    function getBiasCount() {
        return activeBiases.length;
    }

    // --- Rendering ---
    function render(ctx, canvasW, canvasH, dpr) {
        if (!activeBias) return;

        var def = BIAS_DEFS[activeBias];

        // Warning: subtle border pulse
        if (warningAlpha > 0) {
            ctx.save();
            ctx.globalAlpha = warningAlpha * 0.3;
            ctx.strokeStyle = def.warningColor;
            ctx.lineWidth = 4 * dpr;
            ctx.strokeRect(2 * dpr, 2 * dpr, canvasW - 4 * dpr, canvasH - 4 * dpr);
            ctx.restore();
        }

        // Critical: stronger border + vignette
        if (criticalAlpha > 0) {
            ctx.save();

            ctx.globalAlpha = criticalAlpha * 0.5;
            ctx.strokeStyle = def.criticalColor;
            ctx.lineWidth = 6 * dpr;
            ctx.strokeRect(3 * dpr, 3 * dpr, canvasW - 6 * dpr, canvasH - 6 * dpr);

            ctx.globalAlpha = criticalAlpha * 0.15;
            var gradient = ctx.createRadialGradient(
                canvasW / 2, canvasH / 2, canvasH * 0.3,
                canvasW / 2, canvasH / 2, canvasH * 0.8
            );
            gradient.addColorStop(0, 'rgba(0,0,0,0)');
            gradient.addColorStop(1, def.criticalColor);
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvasW, canvasH);

            ctx.restore();
        }

        // Bias text indicator
        if (warningAlpha > 0 || criticalAlpha > 0) {
            ctx.save();
            var alpha = Math.max(warningAlpha, criticalAlpha) * 0.8;
            ctx.globalAlpha = alpha;

            var fontSize = Math.round(12 * dpr);
            ctx.fillStyle = criticalAlpha > warningAlpha ? def.criticalColor : def.warningColor;
            ctx.font = 'bold ' + fontSize + 'px sans-serif';
            ctx.textAlign = 'right';
            ctx.fillText(def.name, canvasW - 16 * dpr, canvasH - 100 * dpr);

            // Recovery advice when in warning state
            if (warningAlpha > criticalAlpha && def.recoveryAdvice) {
                var smallFont = Math.round(9 * dpr);
                ctx.font = smallFont + 'px sans-serif';
                ctx.fillStyle = 'rgba(255,255,255,0.5)';
                ctx.fillText(def.recoveryAdvice, canvasW - 16 * dpr, canvasH - 84 * dpr);
            }

            ctx.restore();
        }

        // Resolution flash (green pulse when bias resolves)
        if (resolutionFlash > 0 && resolutionBias) {
            ctx.save();
            ctx.globalAlpha = resolutionFlash * 0.2;
            ctx.fillStyle = '#81C784';
            ctx.fillRect(0, 0, canvasW, canvasH);
            ctx.restore();
        }

        // Multiple bias indicators
        if (activeBiases.length > 1) {
            ctx.save();
            var indY = canvasH - 116 * dpr;
            var indFont = Math.round(9 * dpr);
            ctx.font = indFont + 'px sans-serif';
            ctx.textAlign = 'right';
            ctx.globalAlpha = 0.6;
            ctx.fillStyle = '#EF5350';
            ctx.fillText(activeBiases.length + ' 个偏执同时活跃', canvasW - 16 * dpr, indY);
            ctx.restore();
        }
    }

    // --- Theological Reflections ---
    // 神学反思：当偏执持续时，以神学洞见提醒玩家三一上帝的平衡
    var THEOLOGICAL_REFLECTIONS = {
        creation_only: [
            { text: '创造之美在于它指向造物主 / The beauty of creation points to the Creator', severity: 'warning' },
            { text: '当创造成为偶像，我们便失去了道成肉身的意义 / When creation becomes idol, we lose incarnation\'s meaning', severity: 'critical' },
            { text: '受造界是好的，但它不是最终的目的 / Creation is good, but it is not the final end', severity: 'warning' },
            { text: '创造之道需要道成肉身来完成 / The word of creation needs incarnation to be fulfilled', severity: 'critical' },
            { text: '只看受造之物，便看不见造物主的荣光 / Looking only at creation, we miss the Creator\'s glory', severity: 'warning' }
        ],
        incarnation_only: [
            { text: '道成肉身是上帝进入受造界，不是取代受造界 / Incarnation is God entering creation, not replacing it', severity: 'warning' },
            { text: '基督取了肉身，但仍与圣父和圣灵同在 / Christ took flesh, yet remains with Father and Spirit', severity: 'critical' },
            { text: '只关注具体之人，会失去创造的广度 / Focusing only on persons loses creation\'s breadth', severity: 'warning' },
            { text: '道成肉身连接了创造与救赎 / Incarnation bridges creation and redemption', severity: 'critical' },
            { text: '没有创造的根基，肉身便失去了家园 / Without creation\'s foundation, the flesh has no home', severity: 'warning' }
        ],
        spirit_only: [
            { text: '圣灵在受造界中运行，不脱离受造界 / The Spirit moves within creation, not apart from it', severity: 'warning' },
            { text: '内在的声音需要外在的印证 / The inner voice needs outward confirmation', severity: 'critical' },
            { text: '圣灵是三一的共融之灵，不是孤独的灵 / The Spirit is the communion-Spirit, not a solitary one', severity: 'warning' },
            { text: '脱离了创造和道成肉身，灵便会飘渺无根 / Without creation and incarnation, the spirit drifts rootless', severity: 'critical' },
            { text: '真正的灵性是在三重光中行走 / True spirituality walks in the triple light', severity: 'warning' }
        ],
        communion_break: [
            { text: '三一上帝的本质是共融，不是孤立 / The Trinity\'s essence is communion, not isolation', severity: 'warning' },
            { text: '当三重光断裂，每一道都变得暗淡 / When the triple light breaks, each ray grows dim', severity: 'critical' },
            { text: '共融是上帝的存在方式，也应是我们存在的样式 / Communion is God\'s way of being, and should be ours', severity: 'warning' },
            { text: '真正的平衡不是均匀分配，而是和谐共舞 / True balance is not equal distribution, but harmonious dance', severity: 'critical' },
            { text: '恢复共融需要每一道光的参与 / Restoring communion requires every ray\'s participation', severity: 'warning' }
        ]
    };

    function getTheologicalReflection(biasId, severity) {
        var reflections = THEOLOGICAL_REFLECTIONS[biasId];
        if (!reflections) return '';
        var matched = [];
        for (var i = 0; i < reflections.length; i++) {
            if (reflections[i].severity === severity) {
                matched.push(reflections[i]);
            }
        }
        if (matched.length === 0) {
            // Fallback: return any reflection for this bias
            var idx = Math.floor(Math.random() * reflections.length);
            return reflections[idx].text;
        }
        var chosen = Math.floor(Math.random() * matched.length);
        return matched[chosen].text;
    }

    // --- Bias Progress Tracking ---
    // 偏执进度追踪：记录每种偏执的发生频率、持续时间和严重程度升级
    var biasProgress = {};

    function trackBiasProgress(biasId, duration, severity) {
        if (!biasProgress[biasId]) {
            biasProgress[biasId] = {
                count: 0,
                totalTime: 0,
                lastTriggered: 0,
                severity: 'none',
                peakSeverity: 'none'
            };
        }
        var progress = biasProgress[biasId];
        progress.count += 1;
        progress.totalTime += duration;
        progress.lastTriggered = Date.now();
        progress.severity = severity;

        // Track peak severity escalation
        if (severity === 'critical') {
            progress.peakSeverity = 'critical';
        } else if (severity === 'warning' && progress.peakSeverity !== 'critical') {
            progress.peakSeverity = 'warning';
        }
    }

    function getBiasProgress(biasId) {
        return biasProgress[biasId] || null;
    }

    function getBiasProgressSummary() {
        var summary = {};
        for (var key in biasProgress) {
            if (biasProgress.hasOwnProperty(key)) {
                summary[key] = {
                    count: biasProgress[key].count,
                    totalTime: biasProgress[key].totalTime,
                    lastTriggered: biasProgress[key].lastTriggered,
                    severity: biasProgress[key].severity,
                    peakSeverity: biasProgress[key].peakSeverity
                };
            }
        }
        return summary;
    }

    function getMostFrequentBias() {
        var maxCount = 0;
        var maxBias = null;
        for (var key in biasProgress) {
            if (biasProgress.hasOwnProperty(key)) {
                if (biasProgress[key].count > maxCount) {
                    maxCount = biasProgress[key].count;
                    maxBias = key;
                }
            }
        }
        return maxBias;
    }

    // --- Detailed Recovery Guidance ---
    // 详细恢复指引：针对每种偏执类型提供即时行动和长期策略
    function getDetailedRecovery(biasId) {
        var guidance = {
            creation_only: {
                immediateActions: [
                    '将注意力转移到金色（道成肉身）轨道',
                    '让紫色（圣灵）轨道的音符自然落下',
                    '暂时减少对蓝色（创造）轨道的点击频率'
                ],
                longTermStrategy: [
                    '练习三轨交替模式，建立均匀的节奏感',
                    '在创造轨道上适当放空，感受其他轨道的存在',
                    '记住：创造之美需要道成肉身来完成'
                ],
                theologicalInsight: '创造是上帝的第一个行动，但它不是唯一的一个。' +
                    '道成肉身和圣灵的降临使创造得以圆满。'
            },
            incarnation_only: {
                immediateActions: [
                    '开始关注蓝色（创造）轨道的节奏',
                    '让紫色（圣灵）轨道融入你的节奏感',
                    '不要只专注于金色轨道的精确击打'
                ],
                longTermStrategy: [
                    '建立从创造到道成肉身的流畅过渡',
                    '练习在道成肉身轨道上适当放手',
                    '记住：道成肉身连接了创造与救赎'
                ],
                theologicalInsight: '道成肉身是上帝最深的爱的行动，' +
                    '但这份爱根植于受造界，并借着圣灵得以持续。'
            },
            spirit_only: {
                immediateActions: [
                    '回到蓝色（创造）轨道建立根基',
                    '关注金色（道成肉身）轨道的具体性',
                    '让圣灵轨道成为三重光的一部分，而非全部'
                ],
                longTermStrategy: [
                    '练习以创造为起点、道成肉身为路径、圣灵为引导的完整节奏',
                    '在圣灵轨道上适当留白，感受其他轨道的脉动',
                    '记住：圣灵在三一共融中运行'
                ],
                theologicalInsight: '圣灵是三一上帝的共融之灵，' +
                    '祂在受造界中运行，借着道成肉身显现，使一切归于和谐。'
            },
            communion_break: {
                immediateActions: [
                    '停止专注于任何单一轨道',
                    '尝试以均匀的节奏同时关注三个轨道',
                    '深呼吸，让三重光自然流动'
                ],
                longTermStrategy: [
                    '建立三轨协调的基本节奏模式',
                    '每次偏离后及时调整，不要让偏执累积',
                    '练习共融意识：每一拍都是三重光的合奏'
                ],
                theologicalInsight: '三一上帝的本质是共融——' +
                    '圣父、圣子、圣灵在永恒的爱中相互交通。' +
                    '我们的游戏也应反映这种和谐。'
            }
        };

        if (guidance[biasId]) {
            return guidance[biasId];
        }
        return {
            immediateActions: [],
            longTermStrategy: [],
            theologicalInsight: ''
        };
    }

    // --- Bias History Timeline ---
    // 偏执历史时间线：记录偏执事件的完整时间序列
    var biasHistory = [];
    var MAX_BIAS_HISTORY = 30;

    function recordBiasEvent(biasId, severity, duration) {
        var entry = {
            time: Date.now(),
            biasId: biasId,
            severity: severity,
            duration: duration || 0
        };
        biasHistory.push(entry);
        if (biasHistory.length > MAX_BIAS_HISTORY) {
            biasHistory.shift();
        }
        // Also track progress
        trackBiasProgress(biasId, duration || 0, severity);
    }

    function getBiasTimeline() {
        return biasHistory.slice();
    }

    function getBiasFrequency() {
        var freq = {};
        for (var i = 0; i < biasHistory.length; i++) {
            var bid = biasHistory[i].biasId;
            if (!freq[bid]) {
                freq[bid] = 0;
            }
            freq[bid] += 1;
        }
        return freq;
    }

    function getBiasHistorySince(timestamp) {
        var result = [];
        for (var i = 0; i < biasHistory.length; i++) {
            if (biasHistory[i].time >= timestamp) {
                result.push(biasHistory[i]);
            }
        }
        return result;
    }

    // --- Adaptive Thresholds ---
    // 自适应阈值：根据玩家的偏执历史调整阈值
    var adaptiveThresholds = false;

    function enableAdaptiveThresholds(enabled) {
        adaptiveThresholds = !!enabled;
    }

    function getAdaptiveThreshold(biasId) {
        if (!adaptiveThresholds) return null;
        var def = BIAS_DEFS[biasId];
        if (!def) return null;

        var progress = biasProgress[biasId];
        var sustainedMod = 0;
        var criticalMod = 0;

        if (progress) {
            // Players who trigger a bias frequently get slightly more lenient thresholds
            // (to avoid frustration), but those who reach critical often get stricter ones
            if (progress.count > 5) {
                sustainedMod += 1; // more lenient
            }
            if (progress.peakSeverity === 'critical') {
                criticalMod -= 1; // stricter: catch critical earlier
            }
        }

        return {
            sustained: Math.max(3, def.sustainedThreshold + sustainedMod),
            critical: Math.max(5, def.criticalThreshold + criticalMod)
        };
    }

    function isAdaptiveThresholdsEnabled() {
        return adaptiveThresholds;
    }

    // --- Phase 8: Bias pattern recognition ---
    function getBiasPatterns() {
        var patterns = [];
        if (biasHistory.length < 2) return patterns;
        // Detect repeating bias sequences
        var typeSequence = [];
        for (var i = 0; i < biasHistory.length; i++) {
            typeSequence.push(biasHistory[i].type);
        }
        // Find consecutive same-type patterns
        var currentStreak = 1;
        for (var j = 1; j < typeSequence.length; j++) {
            if (typeSequence[j] === typeSequence[j-1]) {
                currentStreak++;
            } else {
                if (currentStreak >= 2) {
                    patterns.push({ type: typeSequence[j-1], count: currentStreak, description: 'Recurring ' + typeSequence[j-1] + ' bias suggests systematic imbalance' });
                }
                currentStreak = 1;
            }
        }
        if (currentStreak >= 2) {
            patterns.push({ type: typeSequence[typeSequence.length-1], count: currentStreak, description: 'Recurring ' + typeSequence[typeSequence.length-1] + ' bias suggests systematic imbalance' });
        }
        return patterns;
    }

    // Bias recovery statistics
    function getRecoveryStats() {
        var totalRecoveries = 0;
        var totalRecoveryTime = 0;
        for (var i = 0; i < biasHistory.length; i++) {
            if (biasHistory[i].resolved) {
                totalRecoveries++;
                totalRecoveryTime += biasHistory[i].duration || 0;
            }
        }
        return {
            totalRecoveries: totalRecoveries,
            avgRecoveryTime: totalRecoveries > 0 ? Math.round(totalRecoveryTime / totalRecoveries) : 0,
            fastestRecovery: getFastestRecovery(),
            totalBiasEvents: biasHistory.length
        };
    }

    function getFastestRecovery() {
        var fastest = Infinity;
        for (var i = 0; i < biasHistory.length; i++) {
            if (biasHistory[i].resolved && biasHistory[i].duration) {
                if (biasHistory[i].duration < fastest) fastest = biasHistory[i].duration;
            }
        }
        return fastest === Infinity ? 0 : fastest;
    }

    return {
        init: init,
        reset: reset,
        setLevelConfig: setLevelConfig,
        update: update,
        render: render,
        getActiveBias: getActiveBias,
        getBiasLevel: getBiasLevel,
        getScorePenalty: getScorePenalty,
        isPenaltyActive: isPenaltyActive,
        getBiasLevels: getBiasLevels,
        BIAS_DEFS: BIAS_DEFS,
        BIAS_IDS: BIAS_IDS,
        // Phase 3B
        getActiveBiases: getActiveBiases,
        isResolving: isResolving,
        wasBiasResolved: wasBiasResolved,
        getRecoveryAdvice: getRecoveryAdvice,
        getBiasLog: getBiasLog,
        getBiasCount: getBiasCount,
        // Theological reflections
        THEOLOGICAL_REFLECTIONS: THEOLOGICAL_REFLECTIONS,
        getTheologicalReflection: getTheologicalReflection,
        // Bias progress tracking
        getBiasProgress: getBiasProgress,
        getBiasProgressSummary: getBiasProgressSummary,
        getMostFrequentBias: getMostFrequentBias,
        // Detailed recovery guidance
        getDetailedRecovery: getDetailedRecovery,
        // Bias history timeline
        recordBiasEvent: recordBiasEvent,
        getBiasTimeline: getBiasTimeline,
        getBiasFrequency: getBiasFrequency,
        getBiasHistorySince: getBiasHistorySince,
        // Adaptive thresholds
        enableAdaptiveThresholds: enableAdaptiveThresholds,
        getAdaptiveThreshold: getAdaptiveThreshold,
        isAdaptiveThresholdsEnabled: isAdaptiveThresholdsEnabled,
        // Phase 8
        getBiasPatterns: getBiasPatterns,
        getRecoveryStats: getRecoveryStats
    };
})();

window.biasSystem = BiasSystem;
