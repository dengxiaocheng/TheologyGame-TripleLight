/**
 * Animation System — 历史中的三重光
 * Particle effects, floating judgment text, screen flash.
 * Phase 2: Card activation effects, bias warning/critical visual effects.
 * Phase 3B: Background stars, screen shake, combo fire, achievement popups, beat trails.
 */
var Animation = (function () {
    var particles = [];
    var floatingTexts = [];
    var flashAlpha = 0;
    var flashColor = '#fff';

    var LANE_COLORS = ['#4FC3F7', '#FFD54F', '#CE93D8'];
    var JUDGMENT_COLORS = {
        perfect: '#FFD54F',
        great: '#4FC3F7',
        good: '#81C784',
        miss: '#EF5350'
    };

    // Card activation effect state
    var cardEffectQueue = [];
    var activeCardEffect = null;
    var cardEffectElapsed = 0;

    // --- Phase 3B: Background stars ---
    var STAR_COUNT = 60;
    var stars = [];

    // --- Phase 3B: Screen shake ---
    var shakeIntensity = 0;
    var shakeOffsetX = 0;
    var shakeOffsetY = 0;
    var SHAKE_DECAY = 5.0;

    // --- Phase 3B: Combo fire ---
    var COMBO_FIRE_THRESHOLD = 25;
    var comboFireIntensity = 0;
    var comboFireParticles = [];

    // --- Phase 3B: Achievement popup ---
    var ACHIEVEMENT_DISPLAY_TIME = 3.0;
    var achievementQueue = [];
    var activeAchievement = null;
    var achievementTimer = 0;
    var achievementAlpha = 0;

    // --- Phase 3B: Beat trails ---
    var trailBursts = []; // [{x, y, lane, time}]

    // --- Phase transition effects ---
    var phaseTransition = { active: false, progress: 0, duration: 1.5, oldPhase: 0, newPhase: 0, type: 'fade' };

    function startPhaseTransition(oldPhase, newPhase, type) {
        phaseTransition.active = true;
        phaseTransition.progress = 0;
        phaseTransition.duration = 1.5;
        phaseTransition.oldPhase = oldPhase;
        phaseTransition.newPhase = newPhase;
        phaseTransition.type = type || 'fade';
    }

    function updatePhaseTransition(dt) {
        if (!phaseTransition.active) return;
        phaseTransition.progress += dt / phaseTransition.duration;
        if (phaseTransition.progress >= 1) {
            phaseTransition.active = false;
            phaseTransition.progress = 1;
        }
    }

    function renderPhaseTransition(ctx, canvasW, canvasH, dpr) {
        if (!phaseTransition.active) return;
        var p = phaseTransition.progress;
        var alpha = 0;
        // Different visual effects per type
        switch(phaseTransition.type) {
            case 'fade':
                alpha = p < 0.5 ? p * 2 : (1 - p) * 2;
                ctx.fillStyle = 'rgba(255,255,255,' + (alpha * 0.3) + ')';
                ctx.fillRect(0, 0, canvasW, canvasH);
                break;
            case 'flash':
                alpha = Math.max(0, 1 - p * 3);
                ctx.fillStyle = 'rgba(255,215,0,' + (alpha * 0.4) + ')';
                ctx.fillRect(0, 0, canvasW, canvasH);
                break;
            case 'pulse':
                for (var i = 0; i < 3; i++) {
                    var ring = (p + i * 0.2) % 1;
                    var radius = ring * canvasW * 0.6;
                    ctx.strokeStyle = 'rgba(206,147,216,' + ((1 - ring) * 0.5) + ')';
                    ctx.lineWidth = 3 * dpr;
                    ctx.beginPath();
                    ctx.arc(canvasW/2, canvasH/2, radius, 0, Math.PI * 2);
                    ctx.stroke();
                }
                break;
        }
    }

    function isTransitioning() { return phaseTransition.active; }

    // --- Shimmer/sparkle effects ---
    var sparkles = []; // {x, y, life, maxLife, size, color, vx, vy}
    var MAX_SPARKLES = 50;

    function addSparkle(x, y, color, count) {
        count = count || 5;
        for (var i = 0; i < count; i++) {
            if (sparkles.length >= MAX_SPARKLES) sparkles.shift();
            var angle = Math.random() * Math.PI * 2;
            var speed = 20 + Math.random() * 40;
            sparkles.push({
                x: x, y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 0.5 + Math.random() * 0.5,
                maxLife: 0.5 + Math.random() * 0.5,
                size: 2 + Math.random() * 3,
                color: color || '#FFD54F'
            });
        }
    }

    function updateSparkles(dt) {
        for (var i = sparkles.length - 1; i >= 0; i--) {
            var s = sparkles[i];
            s.x += s.vx * dt;
            s.y += s.vy * dt;
            s.vy += 50 * dt; // gravity
            s.life -= dt;
            if (s.life <= 0) sparkles.splice(i, 1);
        }
    }

    function renderSparkles(ctx, dpr) {
        for (var i = 0; i < sparkles.length; i++) {
            var s = sparkles[i];
            var alpha = s.life / s.maxLife;
            ctx.globalAlpha = alpha;
            ctx.fillStyle = s.color;
            ctx.fillRect(s.x * dpr - s.size/2, s.y * dpr - s.size/2, s.size, s.size);
        }
        ctx.globalAlpha = 1;
    }

    // --- Glow trail effect ---
    var glowTrails = []; // {x, y, radius, color, life}

    function addGlowTrail(x, y, radius, color) {
        glowTrails.push({x:x, y:y, radius:radius||10, color:color||'#4FC3F7', life:0.8});
        if (glowTrails.length > 30) glowTrails.shift();
    }

    function updateGlowTrails(dt) {
        for (var i = glowTrails.length - 1; i >= 0; i--) {
            glowTrails[i].life -= dt;
            if (glowTrails[i].life <= 0) glowTrails.splice(i, 1);
        }
    }

    function renderGlowTrails(ctx, dpr) {
        for (var i = 0; i < glowTrails.length; i++) {
            var g = glowTrails[i];
            var alpha = g.life * 0.5;
            var gradient = ctx.createRadialGradient(g.x*dpr, g.y*dpr, 0, g.x*dpr, g.y*dpr, g.radius*dpr);
            gradient.addColorStop(0, g.color.replace(')', ',' + alpha + ')').replace('rgb', 'rgba'));
            gradient.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = gradient;
            ctx.fillRect((g.x - g.radius)*dpr, (g.y - g.radius)*dpr, g.radius*2*dpr, g.radius*2*dpr);
        }
    }

    // --- Screen shake (extended) ---
    var shakeState = { intensity: 0, duration: 0, timer: 0 };

    function triggerShakeEx(intensity, duration) {
        shakeState.intensity = intensity || 5;
        shakeState.duration = duration || 0.3;
        shakeState.timer = shakeState.duration;
    }

    function updateShakeEx(dt) {
        if (shakeState.timer > 0) shakeState.timer -= dt;
    }

    function getShakeOffsetEx() {
        if (shakeState.timer <= 0) return {x: 0, y: 0};
        var decay = shakeState.timer / shakeState.duration;
        return {
            x: (Math.random() - 0.5) * shakeState.intensity * decay,
            y: (Math.random() - 0.5) * shakeState.intensity * decay
        };
    }

    // --- Combined update/render convenience ---
    function updateAll(dt) {
        updatePhaseTransition(dt);
        updateSparkles(dt);
        updateGlowTrails(dt);
        updateShakeEx(dt);
    }

    function renderAll(ctx, canvasW, canvasH, dpr) {
        renderGlowTrails(ctx, dpr);
        renderSparkles(ctx, dpr);
        renderPhaseTransition(ctx, canvasW, canvasH, dpr);
    }

    function initStars() {
        stars = [];
        for (var i = 0; i < STAR_COUNT; i++) {
            stars.push({
                x: Math.random(),
                y: Math.random(),
                size: 0.5 + Math.random() * 1.5,
                brightness: 0.2 + Math.random() * 0.6,
                twinkleSpeed: 0.5 + Math.random() * 2.0,
                twinklePhase: Math.random() * Math.PI * 2
            });
        }
    }

    // Initialize stars on load
    initStars();

    function hitEffect(x, y, lane, judgment) {
        var count = judgment === 'perfect' ? 20 :
                    judgment === 'great' ? 12 :
                    judgment === 'good' ? 6 : 3;
        var color = JUDGMENT_COLORS[judgment] || '#fff';
        var baseColor = LANE_COLORS[lane] || color;

        for (var i = 0; i < count; i++) {
            var angle = (Math.PI * 2 / count) * i + (Math.random() - 0.5) * 0.5;
            var speed = 80 + Math.random() * 120;
            particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 0.5 + Math.random() * 0.3,
                maxLife: 0.5 + Math.random() * 0.3,
                size: 3 + Math.random() * 4,
                color: Math.random() > 0.5 ? color : baseColor
            });
        }

        if (judgment === 'perfect') {
            flashAlpha = 0.3;
            flashColor = '#fff';
        }

        floatingTexts.push({
            text: judgment.charAt(0).toUpperCase() + judgment.slice(1),
            x: x,
            y: y - 20,
            life: 0.8,
            maxLife: 0.8,
            color: color
        });

        // Phase 3B: Trail burst on hit
        trailBursts.push({ x: x, y: y, lane: lane, time: 0.5 });
    }

    function missEffect(x, y, lane) {
        hitEffect(x, y, lane, 'miss');
    }

    // --- Phase 2: Card activation effect ---
    function cardActivateEffect(cardDef) {
        if (!cardDef) return;
        activeCardEffect = cardDef;
        cardEffectElapsed = 0;

        // Spawn particles for favored lanes
        if (cardDef.favoredLanes) {
            for (var i = 0; i < cardDef.favoredLanes.length; i++) {
                var lane = cardDef.favoredLanes[i];
                var cx = typeof RhythmEngine !== 'undefined' ? RhythmEngine.getLaneX(lane) : 0;
                var cy = typeof RhythmEngine !== 'undefined' ? RhythmEngine.getJudgmentLineY() : 0;

                for (var p = 0; p < 15; p++) {
                    var angle = Math.random() * Math.PI * 2;
                    var speed = 40 + Math.random() * 80;
                    particles.push({
                        x: cx,
                        y: cy,
                        vx: Math.cos(angle) * speed,
                        vy: Math.sin(angle) * speed,
                        life: 0.8 + Math.random() * 0.4,
                        maxLife: 0.8 + Math.random() * 0.4,
                        size: 4 + Math.random() * 4,
                        color: LANE_COLORS[lane] || '#FFD54F'
                    });
                }
            }
        }

        // Brief flash in card's theme color
        if (cardDef.favoredLanes && cardDef.favoredLanes.length > 0) {
            flashColor = LANE_COLORS[cardDef.favoredLanes[0]];
        } else {
            flashColor = '#fff';
        }
        flashAlpha = 0.15;
    }

    // --- Phase 2: Bias warning/critical effects ---
    function biasWarningEffect(biasId) {
        var color = '#FFD54F';
        if (typeof BiasSystem !== 'undefined' && BiasSystem.BIAS_DEFS && BiasSystem.BIAS_DEFS[biasId]) {
            color = BiasSystem.BIAS_DEFS[biasId].warningColor;
        }
        flashColor = color;
        flashAlpha = 0.08;
    }

    function biasCriticalEffect(biasId) {
        var color = '#EF5350';
        if (typeof BiasSystem !== 'undefined' && BiasSystem.BIAS_DEFS && BiasSystem.BIAS_DEFS[biasId]) {
            color = BiasSystem.BIAS_DEFS[biasId].criticalColor;
        }
        flashColor = color;
        flashAlpha = 0.15;
        // Phase 3B: Screen shake on critical bias
        triggerShake(4.0);
    }

    function communionBreakEffect() {
        flashColor = '#B71C1C';
        flashAlpha = 0.25;
        // Phase 3B: Stronger screen shake
        triggerShake(8.0);
    }

    // --- Phase 3B: Screen shake ---
    function triggerShake(intensity) {
        shakeIntensity = Math.max(shakeIntensity, intensity);
    }

    function getShakeOffset() {
        return { x: shakeOffsetX, y: shakeOffsetY };
    }

    // --- Phase 3B: Combo fire ---
    function updateComboFire(combo, dt) {
        if (combo >= COMBO_FIRE_THRESHOLD) {
            comboFireIntensity = Math.min(1.0, comboFireIntensity + dt * 2);

            // Spawn fire particles
            if (Math.random() < comboFireIntensity * 0.5) {
                var canvasW = typeof window !== 'undefined' && window.innerWidth ? window.innerWidth : 400;
                var canvasH = typeof window !== 'undefined' && window.innerHeight ? window.innerHeight : 700;
                var dpr = typeof window !== 'undefined' ? (window.devicePixelRatio || 1) : 1;

                for (var lane = 0; lane < 3; lane++) {
                    var laneW = canvasW * dpr / 3;
                    var fx = lane * laneW + laneW / 2;
                    var fy = canvasH * dpr - 90 * dpr;

                    comboFireParticles.push({
                        x: fx + (Math.random() - 0.5) * 20 * dpr,
                        y: fy,
                        vx: (Math.random() - 0.5) * 30,
                        vy: -(40 + Math.random() * 60),
                        life: 0.4 + Math.random() * 0.3,
                        maxLife: 0.4 + Math.random() * 0.3,
                        size: 3 + Math.random() * 5,
                        color: LANE_COLORS[lane]
                    });
                }
            }
        } else {
            comboFireIntensity = Math.max(0, comboFireIntensity - dt * 2);
        }

        // Update fire particles
        for (var i = comboFireParticles.length - 1; i >= 0; i--) {
            var p = comboFireParticles[i];
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.life -= dt;
            if (p.life <= 0) {
                comboFireParticles.splice(i, 1);
            }
        }
    }

    // --- Phase 3B: Achievement popup ---
    function showAchievement(text, subtext) {
        achievementQueue.push({ text: text, subtext: subtext || '' });
    }

    function updateAchievements(dt) {
        if (!activeAchievement && achievementQueue.length > 0) {
            activeAchievement = achievementQueue.shift();
            achievementTimer = ACHIEVEMENT_DISPLAY_TIME;
            achievementAlpha = 0;
        }

        if (activeAchievement) {
            achievementTimer -= dt;

            // Fade in/out
            var elapsed = ACHIEVEMENT_DISPLAY_TIME - achievementTimer;
            if (elapsed < 0.3) {
                achievementAlpha = elapsed / 0.3;
            } else if (achievementTimer < 0.5) {
                achievementAlpha = achievementTimer / 0.5;
            } else {
                achievementAlpha = 1;
            }

            if (achievementTimer <= 0) {
                activeAchievement = null;
                achievementAlpha = 0;
            }
        }
    }

    function update(dt) {
        // Update particles
        for (var i = particles.length - 1; i >= 0; i--) {
            var p = particles[i];
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.vy += 200 * dt; // gravity
            p.life -= dt;
            if (p.life <= 0) {
                particles.splice(i, 1);
            }
        }

        // Update floating texts
        for (var j = floatingTexts.length - 1; j >= 0; j--) {
            var ft = floatingTexts[j];
            ft.y -= 60 * dt;
            ft.life -= dt;
            if (ft.life <= 0) {
                floatingTexts.splice(j, 1);
            }
        }

        // Decay flash
        if (flashAlpha > 0) {
            flashAlpha = Math.max(0, flashAlpha - dt * 2);
        }

        // Update card effect
        if (activeCardEffect) {
            cardEffectElapsed += dt;
            if (cardEffectElapsed > 1.0) {
                activeCardEffect = null;
            }
        }

        // Phase 3B: Screen shake decay
        if (shakeIntensity > 0) {
            shakeIntensity = Math.max(0, shakeIntensity - SHAKE_DECAY * dt);
            shakeOffsetX = (Math.random() - 0.5) * 2 * shakeIntensity;
            shakeOffsetY = (Math.random() - 0.5) * 2 * shakeIntensity;
        } else {
            shakeOffsetX = 0;
            shakeOffsetY = 0;
        }

        // Phase 3B: Trail bursts decay
        for (var t = trailBursts.length - 1; t >= 0; t--) {
            trailBursts[t].time -= dt;
            if (trailBursts[t].time <= 0) {
                trailBursts.splice(t, 1);
            }
        }

        // Phase 3B: Achievement update
        updateAchievements(dt);

        // Phase 3B: Twinkle stars
        var time = typeof performance !== 'undefined' ? performance.now() / 1000 : 0;
        for (var s = 0; s < stars.length; s++) {
            stars[s].currentBrightness = stars[s].brightness +
                0.2 * Math.sin(time * stars[s].twinkleSpeed + stars[s].twinklePhase);
        }
    }

    // --- Phase 3B: Helper for rounded rects ---
    function roundRect(ctx, x, y, w, h, r) {
        r = Math.min(r, w / 2, h / 2);
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
    }

    function render(ctx) {
        // Render particles
        for (var i = 0; i < particles.length; i++) {
            var p = particles[i];
            var alpha = Math.max(0, p.life / p.maxLife);
            ctx.globalAlpha = alpha;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2);
            ctx.fill();
        }

        // Phase 3B: Render combo fire particles
        for (var fi = 0; fi < comboFireParticles.length; fi++) {
            var fp = comboFireParticles[fi];
            var fAlpha = Math.max(0, fp.life / fp.maxLife);
            ctx.globalAlpha = fAlpha * 0.7;
            ctx.fillStyle = fp.color;
            ctx.beginPath();
            ctx.arc(fp.x, fp.y, fp.size * fAlpha, 0, Math.PI * 2);
            ctx.fill();
        }

        // Render floating texts
        for (var j = 0; j < floatingTexts.length; j++) {
            var ft = floatingTexts[j];
            var ftAlpha = Math.max(0, ft.life / ft.maxLife);
            ctx.globalAlpha = ftAlpha;
            ctx.fillStyle = ft.color;
            ctx.font = 'bold 20px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(ft.text, ft.x, ft.y);
        }

        // Render flash
        if (flashAlpha > 0) {
            ctx.globalAlpha = flashAlpha;
            ctx.fillStyle = flashColor;
            ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        }

        // Phase 3B: Render trail bursts
        for (var ti = 0; ti < trailBursts.length; ti++) {
            var tb = trailBursts[ti];
            var tbAlpha = Math.max(0, tb.time / 0.5) * 0.4;
            ctx.globalAlpha = tbAlpha;
            ctx.fillStyle = LANE_COLORS[tb.lane] || '#fff';
            ctx.beginPath();
            ctx.arc(tb.x, tb.y, 8 + (0.5 - tb.time) * 20, 0, Math.PI * 2);
            ctx.fill();
        }

        // Phase 3B: Render achievement popup
        if (activeAchievement && achievementAlpha > 0) {
            var canvasW = ctx.canvas.width;
            var dpr = typeof window !== 'undefined' ? (window.devicePixelRatio || 1) : 1;
            var popW = 200 * dpr;
            var popH = 50 * dpr;
            var popX = (canvasW - popW) / 2;
            var popY = 60 * dpr;

            ctx.save();
            ctx.globalAlpha = achievementAlpha * 0.9;

            // Background
            ctx.fillStyle = 'rgba(0,0,0,0.8)';
            roundRect(ctx, popX, popY, popW, popH, 8 * dpr);
            ctx.fill();

            // Border
            ctx.strokeStyle = '#FFD54F';
            ctx.lineWidth = 2 * dpr;
            roundRect(ctx, popX, popY, popW, popH, 8 * dpr);
            ctx.stroke();

            // Text
            ctx.fillStyle = '#FFD54F';
            ctx.font = 'bold ' + Math.round(12 * dpr) + 'px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(activeAchievement.text, popX + popW / 2, popY + 22 * dpr);

            if (activeAchievement.subtext) {
                ctx.fillStyle = 'rgba(255,255,255,0.7)';
                ctx.font = Math.round(10 * dpr) + 'px sans-serif';
                ctx.fillText(activeAchievement.subtext, popX + popW / 2, popY + 38 * dpr);
            }

            ctx.restore();
        }

        ctx.globalAlpha = 1;
    }

    // --- Phase 3B: Render background stars ---
    function renderStars(ctx, canvasW, canvasH) {
        for (var i = 0; i < stars.length; i++) {
            var s = stars[i];
            var brightness = s.currentBrightness || s.brightness;
            ctx.globalAlpha = Math.max(0, Math.min(1, brightness));
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(s.x * canvasW, s.y * canvasH, s.size, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;
    }

    function reset() {
        particles = [];
        floatingTexts = [];
        flashAlpha = 0;
        flashColor = '#fff';
        activeCardEffect = null;
        cardEffectElapsed = 0;
        // Phase 3B
        shakeIntensity = 0;
        shakeOffsetX = 0;
        shakeOffsetY = 0;
        comboFireIntensity = 0;
        comboFireParticles = [];
        achievementQueue = [];
        activeAchievement = null;
        achievementTimer = 0;
        achievementAlpha = 0;
        trailBursts = [];
        // Phase transition
        phaseTransition = { active: false, progress: 0, duration: 1.5, oldPhase: 0, newPhase: 0, type: 'fade' };
        // Sparkles
        sparkles = [];
        // Glow trails
        glowTrails = [];
        // Extended shake
        shakeState = { intensity: 0, duration: 0, timer: 0 };
    }

    // --- Phase 8: Pulse ring effect ---
    var pulseRings = [];
    var MAX_PULSE_RINGS = 8;

    function addPulseRing(x, y, color, maxRadius) {
        pulseRings.push({ x: x, y: y, color: color || '#FFFFFF', radius: 0, maxRadius: maxRadius || 80, alpha: 1.0 });
        if (pulseRings.length > MAX_PULSE_RINGS) pulseRings.shift();
    }

    function updatePulseRings(dt) {
        for (var i = pulseRings.length - 1; i >= 0; i--) {
            pulseRings[i].radius += 120 * dt;
            pulseRings[i].alpha = Math.max(0, 1 - pulseRings[i].radius / pulseRings[i].maxRadius);
            if (pulseRings[i].alpha <= 0) pulseRings.splice(i, 1);
        }
    }

    function renderPulseRings(ctx) {
        for (var i = 0; i < pulseRings.length; i++) {
            var r = pulseRings[i];
            ctx.save();
            ctx.globalAlpha = r.alpha * 0.6;
            ctx.strokeStyle = r.color;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(r.x, r.y, Math.max(1, r.radius), 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        }
    }

    return {
        hitEffect: hitEffect,
        missEffect: missEffect,
        cardActivateEffect: cardActivateEffect,
        biasWarningEffect: biasWarningEffect,
        biasCriticalEffect: biasCriticalEffect,
        communionBreakEffect: communionBreakEffect,
        update: update,
        render: render,
        reset: reset,
        LANE_COLORS: LANE_COLORS,
        JUDGMENT_COLORS: JUDGMENT_COLORS,
        // Phase 3B
        triggerShake: triggerShake,
        getShakeOffset: getShakeOffset,
        updateComboFire: updateComboFire,
        showAchievement: showAchievement,
        renderStars: renderStars,
        roundRect: roundRect,
        // Phase transition
        startPhaseTransition: startPhaseTransition,
        updatePhaseTransition: updatePhaseTransition,
        renderPhaseTransition: renderPhaseTransition,
        isTransitioning: isTransitioning,
        // Sparkles
        addSparkle: addSparkle,
        updateSparkles: updateSparkles,
        renderSparkles: renderSparkles,
        // Glow trails
        addGlowTrail: addGlowTrail,
        updateGlowTrails: updateGlowTrails,
        renderGlowTrails: renderGlowTrails,
        // Extended screen shake
        triggerShakeEx: triggerShakeEx,
        updateShakeEx: updateShakeEx,
        getShakeOffsetEx: getShakeOffsetEx,
        // Combined convenience
        updateAll: updateAll,
        renderAll: renderAll,
        // Phase 8
        addPulseRing: addPulseRing,
        updatePulseRings: updatePulseRings,
        renderPulseRings: renderPulseRings
    };
})();

window.animation = Animation;
