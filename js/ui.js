/**
 * UI System — 历史中的三重光
 * HUD rendering: score, combo, pause button, balance bars, touch lane strips.
 * Phase 2: Event card banner, bias badges, intro overlay, updated results.
 * Phase 3B: Progress bar, mini balance graph, tutorial hints, combo animation.
 */
var UI = (function () {
    var LANE_COLORS = ['#4FC3F7', '#FFD54F', '#CE93D8'];
    var LANE_LABELS = ['创造', '道成肉身', '圣灵'];

    // Intro overlay state
    var introAlpha = 0;
    var introText = '';
    var introFading = false;

    // --- Phase 3B: Combo animation ---
    var comboScale = 1.0;
    var COMBO_SCALE_DECAY = 3.0;

    // --- Phase 3B: Tutorial hints ---
    var HINT_DURATION = 4.0;
    var HINTS = {
        firstPlay: { text: '点击底部轨道击打节奏 / Tap lanes to hit beats', y: 0.55 },
        firstCombo: { text: '连续击打获得连击加成 / Keep hitting for combo bonus', y: 0.55 },
        firstBias: { text: '注意偏执警告——保持三重光平衡 / Watch for bias warnings', y: 0.45 },
        firstCard: { text: '事件卡会改变规则——留意顶部提示 / Event cards change rules', y: 0.45 },
        firstPerfect: { text: '精准击打提升光之值 / Perfect hits boost light values', y: 0.55 }
    };
    var activeHint = null;
    var hintTimer = 0;
    var shownHints = {};

    // --- Phase 6C: Narrative text state ---
    var narrativeText = '';
    var narrativeAlpha = 0;
    var narrativeTimer = 0;
    var narrativeCharIndex = 0;
    var NARRATIVE_SPEED = 30; // chars per second

    // --- Phase 6C: Phase announcement state ---
    var phaseAnnouncement = { text: '', alpha: 0, timer: 0 };

    // --- Phase 3B: Helper ---
    function formatTime(ms) {
        var seconds = Math.max(0, Math.floor(ms / 1000));
        var m = Math.floor(seconds / 60);
        var s = seconds % 60;
        return m + ':' + (s < 10 ? '0' : '') + s;
    }

    function renderHUD(ctx, canvasW, canvasH, dpr, levelName) {
        var fontSize = Math.round(14 * (dpr > 1 ? dpr : 1));

        // Score (top-left)
        ctx.fillStyle = '#fff';
        ctx.font = 'bold ' + fontSize + 'px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('Score: ' + Scoring.getScore(), 10 * dpr, 24 * dpr);

        // Combo (below score) with Phase 3B scale animation
        var combo = Scoring.getCombo();
        if (combo > 0) {
            ctx.save();
            ctx.translate(10 * dpr, 44 * dpr);
            ctx.scale(comboScale, comboScale);
            ctx.fillStyle = '#FFD54F';
            ctx.font = 'bold ' + Math.round(fontSize * 0.9) + 'px sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText(combo + ' Combo', 0, 0);
            ctx.restore();
        }

        // Level name (top-center)
        if (levelName) {
            ctx.fillStyle = 'rgba(255,255,255,0.6)';
            ctx.font = Math.round(fontSize * 0.85) + 'px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(levelName, canvasW / 2, 24 * dpr);
        }

        // Pause button (top-right)
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.textAlign = 'right';
        ctx.font = 'bold ' + Math.round(20 * (dpr > 1 ? dpr : 1)) + 'px sans-serif';
        ctx.fillText('\u23F8', canvasW - 10 * dpr, 28 * dpr);

        // Balance bars (left side, vertical)
        var balanceValues = LightBalance.getValues();
        var barX = 8 * dpr;
        var barWidth = 6 * dpr;
        var barMaxH = 80 * dpr;
        var barY = canvasH - 90 * dpr - barMaxH - 20 * dpr;

        for (var i = 0; i < 3; i++) {
            var val = balanceValues[i] / 100;
            var barH = val * barMaxH;
            var by = barY + barMaxH - barH;

            ctx.fillStyle = 'rgba(255,255,255,0.15)';
            ctx.fillRect(barX, barY, barWidth, barMaxH);

            ctx.fillStyle = LANE_COLORS[i];
            ctx.fillRect(barX, by, barWidth, barH);

            barX += (barWidth + 4 * dpr);
        }

        // Touch lane strips at bottom
        var jy = canvasH - 90 * dpr;
        var laneW = canvasW / 3;
        for (var l = 0; l < 3; l++) {
            ctx.fillStyle = 'rgba(255,255,255,0.03)';
            ctx.fillRect(l * laneW, jy, laneW, 90 * dpr);

            ctx.fillStyle = LANE_COLORS[l];
            ctx.globalAlpha = 0.3;
            ctx.fillRect(l * laneW, jy, laneW, 3 * dpr);
            ctx.globalAlpha = 1;

            ctx.fillStyle = 'rgba(255,255,255,0.3)';
            ctx.font = Math.round(10 * (dpr > 1 ? dpr : 1)) + 'px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(LANE_LABELS[l], l * laneW + laneW / 2, jy + 50 * dpr);
        }

        // --- Phase 2: Bias badge ---
        renderBiasBadge(ctx, canvasW, canvasH, dpr);

        // --- Phase 3B: Progress bar ---
        renderProgressBar(ctx, canvasW, canvasH, dpr);

        // --- Phase 3B: Mini balance graph ---
        renderMiniBalanceGraph(ctx, canvasW, canvasH, dpr);

        // --- Phase 3B: Tutorial hint ---
        renderTutorialHint(ctx, canvasW, canvasH, dpr);

        // --- Phase 6C: Communion quality ---
        renderCommunionQuality(ctx, canvasW, canvasH, dpr);

        // --- Phase 6C: Prediction indicator ---
        renderPredictionIndicator(ctx, canvasW, canvasH, dpr);

        // --- Phase 6C: Phase indicator ---
        renderPhaseIndicator(ctx, canvasW, canvasH, dpr);

        // --- Phase 6C: Narrative text ---
        renderNarrative(ctx, canvasW, canvasH, dpr);

        // --- Phase 6C: Phase announcement ---
        renderPhaseAnnouncement(ctx, canvasW, canvasH, dpr);
    }

    // --- Phase 3B: Progress bar ---
    function renderProgressBar(ctx, canvasW, canvasH, dpr) {
        var barW = canvasW - 20 * dpr;
        var barH = 4 * dpr;
        var barX = 10 * dpr;
        var barY = canvasH - 6 * dpr;

        var currentTime = typeof RhythmEngine !== 'undefined' ? RhythmEngine.getCurrentTime() : 0;
        var duration = typeof RhythmEngine !== 'undefined' ? RhythmEngine.getLevelDuration() : 1;
        var progress = Math.min(1, Math.max(0, currentTime / duration));

        // Background
        ctx.fillStyle = 'rgba(255,255,255,0.1)';
        ctx.fillRect(barX, barY, barW, barH);

        // Gradient fill
        if (progress > 0) {
            var gradient = ctx.createLinearGradient(barX, barY, barX + barW * progress, barY);
            gradient.addColorStop(0, '#4FC3F7');
            gradient.addColorStop(0.5, '#FFD54F');
            gradient.addColorStop(1, '#CE93D8');
            ctx.fillStyle = gradient;
            ctx.fillRect(barX, barY, barW * progress, barH);
        }

        // Time labels
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.font = Math.round(8 * dpr) + 'px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(formatTime(currentTime), barX, barY - 3 * dpr);
        ctx.textAlign = 'right';
        ctx.fillText(formatTime(duration), barX + barW, barY - 3 * dpr);
    }

    // --- Phase 3B: Mini balance graph ---
    function renderMiniBalanceGraph(ctx, canvasW, canvasH, dpr) {
        var graphData = LightBalance.getGraphData();
        if (graphData.length < 2) return;

        var graphW = 40 * dpr;
        var graphH = 50 * dpr;
        var graphX = canvasW - graphW - 10 * dpr;
        var graphY = canvasH - 90 * dpr - graphH - 28 * dpr;
        var maxPoints = 20;

        // Background
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(graphX, graphY, graphW, graphH);

        // Border
        ctx.strokeStyle = 'rgba(255,255,255,0.15)';
        ctx.lineWidth = 1;
        ctx.strokeRect(graphX, graphY, graphW, graphH);

        // Get last N data points
        var startIdx = Math.max(0, graphData.length - maxPoints);
        var points = graphData.slice(startIdx);

        // Draw lines for each lane
        for (var lane = 0; lane < 3; lane++) {
            ctx.strokeStyle = LANE_COLORS[lane];
            ctx.lineWidth = 1.5;
            ctx.globalAlpha = 0.7;
            ctx.beginPath();

            for (var p = 0; p < points.length; p++) {
                var px = graphX + (p / (maxPoints - 1)) * graphW;
                var val = points[p].v[lane] / 100;
                var py = graphY + graphH - val * graphH;

                if (p === 0) {
                    ctx.moveTo(px, py);
                } else {
                    ctx.lineTo(px, py);
                }
            }
            ctx.stroke();
        }
        ctx.globalAlpha = 1;
    }

    // --- Phase 3B: Tutorial hint ---
    function showTutorialHint(triggerId) {
        if (shownHints[triggerId]) return;
        if (!HINTS[triggerId]) return;
        shownHints[triggerId] = true;
        activeHint = triggerId;
        hintTimer = HINT_DURATION;
    }

    function updateTutorialHint(dt) {
        if (hintTimer > 0) {
            hintTimer -= dt;
            if (hintTimer <= 0) {
                activeHint = null;
                hintTimer = 0;
            }
        }

        // Decay combo scale
        if (comboScale > 1.0) {
            comboScale = Math.max(1.0, comboScale - COMBO_SCALE_DECAY * dt);
        }
    }

    function renderTutorialHint(ctx, canvasW, canvasH, dpr) {
        if (!activeHint || hintTimer <= 0) return;
        var hint = HINTS[activeHint];
        if (!hint) return;

        // Fade in/out
        var alpha = 1.0;
        if (hintTimer > HINT_DURATION - 0.5) {
            alpha = (HINT_DURATION - hintTimer) / 0.5;
        } else if (hintTimer < 0.5) {
            alpha = hintTimer / 0.5;
        }

        ctx.save();
        ctx.globalAlpha = alpha * 0.85;

        var fontSize = Math.round(12 * dpr);
        var textW = canvasW * 0.8;
        var textX = canvasW / 2;
        var textY = canvasH * hint.y;

        // Background pill
        var metrics = ctx.measureText(hint.text);
        var pillW = Math.min(textW, metrics.width + 30 * dpr);
        var pillH = 30 * dpr;
        var pillX = textX - pillW / 2;
        var pillY = textY - pillH / 2;

        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.beginPath();
        ctx.moveTo(pillX + 8 * dpr, pillY);
        ctx.lineTo(pillX + pillW - 8 * dpr, pillY);
        ctx.quadraticCurveTo(pillX + pillW, pillY, pillX + pillW, pillY + 8 * dpr);
        ctx.lineTo(pillX + pillW, pillY + pillH - 8 * dpr);
        ctx.quadraticCurveTo(pillX + pillW, pillY + pillH, pillX + pillW - 8 * dpr, pillY + pillH);
        ctx.lineTo(pillX + 8 * dpr, pillY + pillH);
        ctx.quadraticCurveTo(pillX, pillY + pillH, pillX, pillY + pillH - 8 * dpr);
        ctx.lineTo(pillX, pillY + 8 * dpr);
        ctx.quadraticCurveTo(pillX, pillY, pillX + 8 * dpr, pillY);
        ctx.closePath();
        ctx.fill();

        // Text
        ctx.fillStyle = '#fff';
        ctx.font = fontSize + 'px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(hint.text, textX, textY);

        ctx.restore();
    }

    // --- Phase 2: Render event card banner ---
    function renderEventCard(ctx, canvasW, canvasH, dpr) {
        if (typeof EventCards === 'undefined') return;
        EventCards.render(ctx, canvasW, canvasH, dpr);
    }

    // --- Phase 2: Bias badge ---
    function renderBiasBadge(ctx, canvasW, canvasH, dpr) {
        if (typeof BiasSystem === 'undefined') return;
        var activeBias = BiasSystem.getActiveBias();
        if (!activeBias) return;

        var def = BiasSystem.BIAS_DEFS[activeBias];
        if (!def) return;

        var level = BiasSystem.getBiasLevel(activeBias);
        var badgeX = 10 * dpr;
        var badgeY = (canvasH - 90 * dpr) + 70 * dpr;
        var fontSize = Math.round(10 * dpr);

        ctx.save();
        ctx.globalAlpha = 0.8;

        var badgeColor = level === 'critical' ? def.criticalColor : def.warningColor;
        ctx.fillStyle = badgeColor;
        ctx.font = 'bold ' + fontSize + 'px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('\u26A0 ' + def.name, badgeX, badgeY);

        ctx.restore();
    }

    // --- Phase 2: Intro overlay ---
    function showIntro(text) {
        introText = text || '';
        introAlpha = 1;
        introFading = false;
    }

    function fadeIntro() {
        introFading = true;
    }

    function updateIntro(dt) {
        if (introFading && introAlpha > 0) {
            introAlpha = Math.max(0, introAlpha - dt * 0.8);
        }

        // Phase 3B: Tutorial hint & combo scale update
        updateTutorialHint(dt);

        // Phase 6C: Narrative and phase announcement
        updateNarrative(dt);
        updatePhaseAnnouncement(dt);
    }

    function renderIntro(ctx, canvasW, canvasH, dpr) {
        if (introAlpha <= 0 || !introText) return;

        ctx.save();
        ctx.globalAlpha = introAlpha * 0.85;
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(0, 0, canvasW, canvasH);

        // Text
        var fontSize = Math.round(16 * dpr);
        var smallFont = Math.round(12 * dpr);
        ctx.textAlign = 'center';

        ctx.fillStyle = '#fff';
        ctx.font = fontSize + 'px sans-serif';
        wrapText(ctx, introText, canvasW / 2, canvasH * 0.4, canvasW * 0.8, fontSize * 1.4);

        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.font = smallFont + 'px sans-serif';
        ctx.fillText('点击继续 / Tap to continue', canvasW / 2, canvasH * 0.65);

        ctx.restore();
    }

    function isIntroVisible() {
        return introAlpha > 0;
    }

    function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
        var words = text.split('');
        var line = '';
        var currentY = y;

        for (var i = 0; i < words.length; i++) {
            var testLine = line + words[i];
            var metrics = ctx.measureText(testLine);
            if (metrics.width > maxWidth && i > 0) {
                ctx.fillText(line, x, currentY);
                line = words[i];
                currentY += lineHeight;
            } else {
                line = testLine;
            }
        }
        ctx.fillText(line, x, currentY);
    }

    function renderResults(ctx, canvasW, canvasH, dpr, levelName, levelId) {
        // Semi-transparent overlay
        ctx.fillStyle = 'rgba(0,0,0,0.85)';
        ctx.fillRect(0, 0, canvasW, canvasH);

        var cx = canvasW / 2;
        var fontSize = Math.round(18 * (dpr > 1 ? dpr : 1));
        var smallFont = Math.round(14 * (dpr > 1 ? dpr : 1));
        var y = canvasH * 0.12;

        // Pass/Fail status
        var passed = typeof Scoring !== 'undefined' && Scoring.isLevelPassed(levelId);
        ctx.textAlign = 'center';
        ctx.font = 'bold ' + Math.round(14 * dpr) + 'px sans-serif';
        ctx.fillStyle = passed ? '#81C784' : '#EF5350';
        ctx.fillText(passed ? '通关 / Passed' : '未通过 / Not Passed', cx, y);
        y += 28 * dpr;

        // Grade
        ctx.fillStyle = '#FFD54F';
        ctx.font = 'bold ' + Math.round(48 * (dpr > 1 ? dpr : 1)) + 'px sans-serif';
        ctx.fillText(Scoring.getGrade(), cx, y);
        y += 50 * dpr;

        // Level name
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.font = smallFont + 'px sans-serif';
        ctx.fillText(levelName || '', cx, y);
        y += 28 * dpr;

        // Score
        ctx.fillStyle = '#fff';
        ctx.font = 'bold ' + fontSize + 'px sans-serif';
        ctx.fillText('Score: ' + Scoring.getScore(), cx, y);
        y += 26 * dpr;

        // Accuracy
        ctx.font = smallFont + 'px sans-serif';
        ctx.fillText('Accuracy: ' + Scoring.getAccuracy() + '%', cx, y);
        y += 22 * dpr;

        // Max combo
        ctx.fillText('Max Combo: ' + Scoring.getMaxCombo(), cx, y);
        y += 22 * dpr;

        // Judgment breakdown
        var jdgs = Scoring.getJudgments();
        ctx.fillStyle = '#FFD54F';
        ctx.fillText('Perfect: ' + jdgs.perfect, cx, y);
        y += 18 * dpr;
        ctx.fillStyle = '#4FC3F7';
        ctx.fillText('Great: ' + jdgs.great, cx, y);
        y += 18 * dpr;
        ctx.fillStyle = '#81C784';
        ctx.fillText('Good: ' + jdgs.good, cx, y);
        y += 18 * dpr;
        ctx.fillStyle = '#EF5350';
        ctx.fillText('Miss: ' + jdgs.miss, cx, y);
        y += 26 * dpr;

        // Communion score
        var communionResult = Scoring.getCommunionResult(levelId);
        ctx.fillStyle = communionResult.passed ? '#CE93D8' : '#EF5350';
        ctx.font = smallFont + 'px sans-serif';
        ctx.fillText('Communion: ' + communionResult.score + ' / ' + communionResult.required, cx, y);
        y += 22 * dpr;

        // --- Phase 6C: Results balance chart ---
        y = renderResultsChart(ctx, canvasW, canvasH, dpr, y);

        // Theology note (if available)
        if (typeof LevelData !== 'undefined') {
            var outroText = LevelData.getOutroText(levelId);
            if (outroText) {
                ctx.fillStyle = 'rgba(255,255,255,0.5)';
                var theoFont = Math.round(11 * dpr);
                ctx.font = theoFont + 'px sans-serif';
                wrapText(ctx, outroText, cx, y, canvasW * 0.8, theoFont * 1.4);
                y += theoFont * 3;
            }
        }

        // Instructions
        y = canvasH * 0.9;
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.font = Math.round(12 * (dpr > 1 ? dpr : 1)) + 'px sans-serif';
        ctx.fillText('Tap or press Enter to continue', cx, y);
    }

    // --- Phase 6C: Narrative text renderer ---
    function showNarrative(text, duration) {
        narrativeText = text || '';
        narrativeAlpha = 1;
        narrativeTimer = duration || 4;
        narrativeCharIndex = 0;
    }

    function updateNarrative(dt) {
        if (narrativeAlpha <= 0) return;
        // Advance typewriter
        if (narrativeCharIndex < narrativeText.length) {
            narrativeCharIndex += NARRATIVE_SPEED * dt;
        }
        // Fade after duration
        if (narrativeCharIndex >= narrativeText.length) {
            narrativeTimer -= dt;
            if (narrativeTimer <= 0) {
                narrativeAlpha = Math.max(0, narrativeAlpha - dt);
            }
        }
    }

    function renderNarrative(ctx, canvasW, canvasH, dpr) {
        if (narrativeAlpha <= 0 || !narrativeText) return;

        var visibleText = narrativeText.substring(0, Math.floor(narrativeCharIndex));
        if (!visibleText) return;

        var fontSize = Math.round(13 * dpr);
        var boxW = canvasW * 0.7;
        var boxH = 50 * dpr;
        var boxX = (canvasW - boxW) / 2;
        var boxY = 60 * dpr;

        ctx.save();
        ctx.globalAlpha = narrativeAlpha;

        // Background box
        ctx.fillStyle = 'rgba(0,0,0,0.65)';
        ctx.beginPath();
        var r = 10 * dpr;
        ctx.moveTo(boxX + r, boxY);
        ctx.lineTo(boxX + boxW - r, boxY);
        ctx.quadraticCurveTo(boxX + boxW, boxY, boxX + boxW, boxY + r);
        ctx.lineTo(boxX + boxW, boxY + boxH - r);
        ctx.quadraticCurveTo(boxX + boxW, boxY + boxH, boxX + boxW - r, boxY + boxH);
        ctx.lineTo(boxX + r, boxY + boxH);
        ctx.quadraticCurveTo(boxX, boxY + boxH, boxX, boxY + boxH - r);
        ctx.lineTo(boxX, boxY + r);
        ctx.quadraticCurveTo(boxX, boxY, boxX + r, boxY);
        ctx.closePath();
        ctx.fill();

        // Text
        ctx.fillStyle = '#fff';
        ctx.font = fontSize + 'px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        wrapText(ctx, visibleText, canvasW / 2, boxY + boxH / 2, boxW - 20 * dpr, fontSize * 1.4);

        ctx.restore();
    }

    // --- Phase 6C: Phase transition announcement ---
    function showPhaseAnnouncement(text) {
        phaseAnnouncement.text = text;
        phaseAnnouncement.alpha = 1;
        phaseAnnouncement.timer = 3;
    }

    function updatePhaseAnnouncement(dt) {
        if (phaseAnnouncement.timer > 0) {
            phaseAnnouncement.timer -= dt;
        } else if (phaseAnnouncement.alpha > 0) {
            phaseAnnouncement.alpha = Math.max(0, phaseAnnouncement.alpha - dt * 0.8);
        }
    }

    function renderPhaseAnnouncement(ctx, canvasW, canvasH, dpr) {
        if (phaseAnnouncement.alpha <= 0) return;

        var elapsed = 3 - phaseAnnouncement.timer;
        // Scale: starts large (1.5), settles to 1.0 over 0.5s
        var scale = elapsed < 0.5 ? 1.5 - elapsed : 1.0;

        var fontSize = Math.round(28 * dpr);
        var cx = canvasW / 2;
        var cy = canvasH * 0.35;

        ctx.save();
        ctx.globalAlpha = phaseAnnouncement.alpha;
        ctx.translate(cx, cy);
        ctx.scale(scale, scale);

        // Shadow text
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.font = 'bold ' + fontSize + 'px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(phaseAnnouncement.text, 2 * dpr, 2 * dpr);

        // Main text with gradient feel
        ctx.fillStyle = '#FFD54F';
        ctx.fillText(phaseAnnouncement.text, 0, 0);

        ctx.restore();
    }

    // --- Phase 6C: Enhanced results chart ---
    function renderResultsChart(ctx, canvasW, canvasH, dpr, startY) {
        var graphData = LightBalance.getGraphData();
        if (graphData.length < 2) return startY;

        var graphW = canvasW * 0.6;
        var graphH = 60 * dpr;
        var graphX = (canvasW - graphW) / 2;
        var graphY = startY + 10 * dpr;

        // Background
        ctx.fillStyle = 'rgba(255,255,255,0.05)';
        ctx.fillRect(graphX, graphY, graphW, graphH);

        // Border
        ctx.strokeStyle = 'rgba(255,255,255,0.15)';
        ctx.lineWidth = 1;
        ctx.strokeRect(graphX, graphY, graphW, graphH);

        // Axis labels
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.font = Math.round(8 * dpr) + 'px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Balance History', graphX + graphW / 2, graphY - 3 * dpr);

        // Draw lines for each lane
        var step = graphW / Math.max(1, graphData.length - 1);
        for (var lane = 0; lane < 3; lane++) {
            ctx.strokeStyle = LANE_COLORS[lane];
            ctx.lineWidth = 1.5;
            ctx.globalAlpha = 0.7;
            ctx.beginPath();

            for (var p = 0; p < graphData.length; p++) {
                var px = graphX + p * step;
                var val = graphData[p].v[lane] / 100;
                var py = graphY + graphH - val * graphH;

                if (p === 0) {
                    ctx.moveTo(px, py);
                } else {
                    ctx.lineTo(px, py);
                }
            }
            ctx.stroke();
        }
        ctx.globalAlpha = 1;

        // Lane labels below chart
        var labelY = graphY + graphH + 12 * dpr;
        var labelFontSize = Math.round(9 * dpr);
        ctx.font = labelFontSize + 'px sans-serif';
        for (var li = 0; li < 3; li++) {
            var lx = graphX + graphW * (li / 2);
            ctx.fillStyle = LANE_COLORS[li];
            ctx.textAlign = li === 0 ? 'left' : (li === 2 ? 'right' : 'center');
            ctx.fillText(LANE_LABELS[li], lx, labelY);
        }

        return labelY + 8 * dpr;
    }

    // --- Phase 6C: Communion quality display ---
    function renderCommunionQuality(ctx, canvasW, canvasH, dpr) {
        if (typeof LightBalance === 'undefined') return;
        if (!LightBalance.getCommunionTier) return;

        var tier = LightBalance.getCommunionTier();
        if (!tier) return;

        var badgeX = 8 * dpr + (6 * dpr + 4 * dpr) * 3 + 6 * dpr;
        var badgeY = canvasH - 90 * dpr - 80 * dpr - 20 * dpr;
        var fontSize = Math.round(9 * dpr);

        ctx.save();
        ctx.globalAlpha = 0.85;

        ctx.fillStyle = tier.color || '#CE93D8';
        ctx.font = 'bold ' + fontSize + 'px sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText(tier.name, badgeX, badgeY);

        ctx.restore();
    }

    // --- Phase 6C: Balance prediction indicator ---
    function renderPredictionIndicator(ctx, canvasW, canvasH, dpr) {
        if (typeof LightBalance === 'undefined') return;
        if (!LightBalance.predictImbalance) return;

        var prediction = LightBalance.predictImbalance();
        if (!prediction || prediction.direction === 0) return;

        var arrowX = 8 * dpr + (6 * dpr + 4 * dpr) * 3 + 6 * dpr;
        var arrowY = canvasH - 90 * dpr - 80 * dpr - 20 * dpr + 14 * dpr;
        var fontSize = Math.round(12 * dpr);

        ctx.save();
        ctx.globalAlpha = 0.6;

        ctx.fillStyle = prediction.direction > 0 ? '#EF5350' : '#81C784';
        ctx.font = fontSize + 'px sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';

        // Up arrow or down arrow based on imbalance direction
        var arrow = prediction.direction > 0 ? '\u25B2' : '\u25BC';
        ctx.fillText(arrow, arrowX, arrowY);

        ctx.restore();
    }

    // --- Phase 6C: Phase progress indicator ---
    function renderPhaseIndicator(ctx, canvasW, canvasH, dpr) {
        if (typeof LevelData === 'undefined' || typeof RhythmEngine === 'undefined') return;
        if (!LevelData.getPhaseCount || !RhythmEngine.getCurrentPhase) return;

        var phaseCount = LevelData.getPhaseCount();
        var currentPhase = RhythmEngine.getCurrentPhase();
        if (phaseCount <= 1) return;

        var dotRadius = 4 * dpr;
        var dotSpacing = 16 * dpr;
        var totalW = phaseCount * dotSpacing - (dotSpacing - dotRadius * 2);
        var startX = canvasW / 2 - totalW / 2;
        var dotY = 38 * dpr;

        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        for (var p = 0; p < phaseCount; p++) {
            var dx = startX + p * dotSpacing + dotRadius;
            if (p < currentPhase) {
                // Completed phase
                ctx.fillStyle = '#FFD54F';
                ctx.globalAlpha = 0.7;
            } else if (p === currentPhase) {
                // Current phase
                ctx.fillStyle = '#fff';
                ctx.globalAlpha = 1.0;
            } else {
                // Future phase
                ctx.fillStyle = '#fff';
                ctx.globalAlpha = 0.25;
            }
            ctx.beginPath();
            ctx.arc(dx, dotY, dotRadius, 0, Math.PI * 2);
            ctx.fill();
        }

        // Connecting lines
        ctx.strokeStyle = 'rgba(255,255,255,0.2)';
        ctx.lineWidth = 1;
        ctx.globalAlpha = 1;
        if (phaseCount > 1) {
            ctx.beginPath();
            ctx.moveTo(startX + dotRadius * 2 + 2 * dpr, dotY);
            ctx.lineTo(startX + (phaseCount - 1) * dotSpacing + dotRadius - 2 * dpr, dotY);
            ctx.stroke();
        }

        ctx.restore();
    }

    return {
        renderHUD: renderHUD,
        renderEventCard: renderEventCard,
        renderBiasBadge: renderBiasBadge,
        renderResults: renderResults,
        showIntro: showIntro,
        fadeIntro: fadeIntro,
        updateIntro: updateIntro,
        renderIntro: renderIntro,
        isIntroVisible: isIntroVisible,
        LANE_COLORS: LANE_COLORS,
        // Phase 3B
        showTutorialHint: showTutorialHint,
        updateTutorialHint: updateTutorialHint,
        formatTime: formatTime,
        // Phase 6C
        showNarrative: showNarrative,
        updateNarrative: updateNarrative,
        renderNarrative: renderNarrative,
        showPhaseAnnouncement: showPhaseAnnouncement,
        updatePhaseAnnouncement: updatePhaseAnnouncement,
        renderPhaseAnnouncement: renderPhaseAnnouncement,
        renderResultsChart: renderResultsChart,
        renderCommunionQuality: renderCommunionQuality,
        renderPredictionIndicator: renderPredictionIndicator,
        renderPhaseIndicator: renderPhaseIndicator
    };
})();

window.ui = UI;
