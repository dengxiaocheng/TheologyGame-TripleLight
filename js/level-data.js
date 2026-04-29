/**
 * Level Data — 历史中的三重光
 * Defines configuration for all 5 levels with rich event and theology data.
 * Phase 3A: difficulty rating, tips, expanded patterns, theology notes API.
 * Phase 3C: phases array, historical context, background description,
 *   theology questions, narrative beats, expanded events, unlock rewards.
 */
var LevelData = (function () {
    var levels = [
        {
            id: 1,
            name: '创造与世界',
            subtitle: 'Creation & the World',
            bpm: 90,
            duration: 60,
            beatDensity: 0.4,
            unlockCondition: null,
            laneWeights: [0.7, 0.2, 0.1],
            color: '#4FC3F7',
            difficultyRating: 1,
            tips: '注意节奏的起始——创造的韵律从缓慢开始。保持三轨道的平衡，避免只击打蓝色轨道。',
            introText: '上帝在创造中自我通传——万物皆有其时，皆为善。然而，当人类触及自然的极限，创造的秩序何去何从？',
            outroText: '创造的颂歌不会终结。每一片叶、每一滴水都在诉说着上帝的荣耀。',
            theologyNote: '创造论（Creatio continua）：上帝不仅是起初的创造者，更是持续的维系者。受造界不是自动运行的机器，而是每时每刻依赖上帝旨意的恩典之工。',
            events: [
                { time: 8000, eventId: 'ecology_crisis' },
                { time: 15000, eventId: 'biodiversity_loss' },
                { time: 20000, eventId: 'beauty_creation' },
                { time: 30000, eventId: 'climate_justice' },
                { time: 35000, eventId: 'technology_question' },
                { time: 45000, eventId: 'cosmic_wonder' },
                { time: 52000, eventId: 'beauty_creation' },
                { time: 12000, type: 'bias_warning', data: { lane: 0, message: '蓝色轨道偏重，注意平衡' } },
                { time: 28000, type: 'speed_change', data: { multiplier: 1.15, duration: 5000 } },
                { time: 40000, type: 'pattern_shift', data: { from: 'call_response', to: 'wave' } },
                { time: 55000, type: 'balance_challenge', data: { targetBalance: [0.4, 0.35, 0.25], duration: 6000 } }
            ],
            beatPatterns: [
                { startBeat: 0, pattern: 'call_response', measures: 4 },
                { startBeat: 16, pattern: 'wave', measures: 4 }
            ],
            biasThresholds: { warning: 30, critical: 50 },
            requiredCommunion: 40,
            holdNoteChance: 0,
            simNoteChance: 0,
            // --- Phase 3C: Phases ---
            phases: [
                { name: '混沌初开', nameEn: 'Formless Void', startPercent: 0, endPercent: 0.15, beatDensity: 0.25, description: '起初，地是空虚混沌，渊面黑暗。' },
                { name: '创造之光', nameEn: 'Light of Creation', startPercent: 0.15, endPercent: 0.45, beatDensity: 0.45, description: '上帝说：「要有光。」就有了光。' },
                { name: '受造之颂', nameEn: 'Song of Creation', startPercent: 0.45, endPercent: 0.8, beatDensity: 0.55, description: '万物受造，各从其类，上帝看着是好的。' },
                { name: '安息之日', nameEn: 'Day of Rest', startPercent: 0.8, endPercent: 1.0, beatDensity: 0.2, description: '上帝赐福给第七日，定为圣日。' }
            ],
            historicalContext: '创世叙事不仅是希伯来圣经的开篇，更是古代近东世界中对宇宙起源的独特理解。与巴比伦的《厄努玛·埃利什》不同，创世记中的创造不是诸神争斗的副产品，而是出于一位上帝自由、恩典的言说。这一理解深刻影响了西方文明对自然、人类和时间的看法。',
            backgroundDescription: '深邃的宇宙蓝，缓缓旋转的星云。随着关卡推进，从混沌的黑暗逐渐出现光与色彩，象征创造的秩序从虚无中显现。地平线上隐约可见伊甸园的轮廓。',
            theologyQuestions: [
                '创造论与现代科学是否矛盾？',
                '如果上帝持续维系受造界，那么自然灾害意味着什么？',
                '人类作为「上帝的形象」承载者，对自然有什么责任？',
                '安息的概念如何挑战现代的生产主义文化？'
            ],
            narrativeBeats: [
                { time: 3000, text: '在起初，一切从沉默开始……' },
                { time: 10000, text: '光在混沌中闪耀——创造的第一次呼吸。' },
                { time: 20000, text: '天空与大地分离，秩序从无序中诞生。' },
                { time: 35000, text: '万物各从其类——受造界的和谐令天使惊叹。' },
                { time: 50000, text: '人类被托付管理之职——这是恩典还是重担？' },
                { time: 6000, text: '深渊之上，圣灵运行——等待的黑暗中孕育着光。', importance: 'low' },
                { time: 15000, text: '旱地从水中露出——生命的舞台在预备中。', importance: 'medium' },
                { time: 25000, text: '海中的活物、天空的飞鸟——生命以不可遏制的方式涌现。', importance: 'medium' },
                { time: 43000, text: '上帝将生气吹入尘土——人类成为有灵的活人。', importance: 'high' },
                { time: 55000, text: '第七日，上帝安息了——不是疲惫，而是满足。', importance: 'high' }
            ],
            unlockRewards: { title: '创造之子', description: '你已学会在混沌中辨识创造的光。' },
            expandedRewards: [
                { type: 'level', id: 'creation_complete', name: '创造完成', description: '完成创造与世界关卡', icon: 'star' },
                { type: 'insight', id: 'creation_insight_1', name: '混沌中的秩序', description: '理解从无序到有序的创造过程', icon: 'book' },
                { type: 'insight', id: 'creation_insight_2', name: '安息的智慧', description: '领悟安息日作为创造完成的神学意义', icon: 'book' },
                { type: 'achievement', id: 'creation_perfect', name: '创造之光徽章', description: '在创造关卡中达到95%以上准确率', icon: 'trophy' },
                { type: 'character', id: 'augustine_unlock', name: '奥古斯丁', description: '解锁创造论的深度神学反思', icon: 'user' }
            ],
            statistics: { expectedScoreRange: [8000, 25000], avgAccuracy: 78, avgCombo: 15 },
            // --- Phase 6A ---
            historicalTimeline: [
                { year: -4000, title: '创造的记述 / Genesis Account', description: '创世记以宏大的叙事开篇，描述上帝从混沌中创造秩序与生命。' },
                { year: -2000, title: '亚伯拉罕之约 / Abrahamic Covenant', description: '上帝呼召亚伯拉罕，应许万族因他的后裔得福。' },
                { year: -1250, title: '出埃及 / The Exodus', description: '上帝审判埃及的诸神，领以色列人脱离奴役，创造的主题再次彰显。' },
                { year: -586, title: '巴比伦流亡 / Babylonian Exile', description: '以色列被掳，在异邦中重新反思创造的上帝与偶像的区别。' },
                { year: 30, title: '初代教会 / Early Church', description: '使徒宣讲基督为创造之主，新创造在复活中开始。' },
                { year: 397, title: '奥古斯丁《忏悔录》/ Augustine\'s Confessions', description: '奥古斯丁深刻反思创造与时间、恩典与自由的关系。' },
                { year: 1225, title: '方济各《太阳颂》/ Canticle of the Sun', description: '亚西西的方济各以受造之物颂赞上帝，成为生态灵性的先驱。' },
                { year: 2015, title: '《愿你受赞颂》/ Laudato Si', description: '教宗方济各发表关于照料我们共同家园的通谕，呼吁生态皈依。' }
            ],
            characters: [
                { name: '奥古斯丁', role: '教父 / Church Father', description: '希波的奥古斯丁，深刻反思创造、时间与恩典的神学家。', quote: '你造我们是为了你，我们的心不安息，直到安息于你。' },
                { name: '亚西西的方济各', role: '修道士 / Friar', description: '与受造界建立深厚灵性关系的圣徒，被誉为生态主保。', quote: '主啊，藉着我们的 Sister Mother Earth，我们赞美你。' },
                { name: '教宗方济各', role: '当代教宗 / Pope', description: '发表《愿你受赞颂》，呼吁全球生态皈依与整体生态学。', quote: '我们共同的家园需要我们的关怀与保护。' }
            ],
            phaseBeatConfig: [
                { densityMultiplier: 0.6, holdChance: 0, simChance: 0, shadowChance: 0, goldenChance: 0 },
                { densityMultiplier: 0.8, holdChance: 0.05, simChance: 0, shadowChance: 0.02, goldenChance: 0.01 },
                { densityMultiplier: 1.0, holdChance: 0.08, simChance: 0.03, shadowChance: 0.05, goldenChance: 0.02 },
                { densityMultiplier: 0.5, holdChance: 0.03, simChance: 0, shadowChance: 0.01, goldenChance: 0.03 }
            ],
            phaseNarratives: [
                { introText: '混沌初开，深渊无声 / In the beginning, silence over the deep', midText: '黑暗中等待那第一句话 / Waiting in darkness for the first Word', outroText: '光从虚无中迸发 / Light bursts forth from nothingness' },
                { introText: '「要有光」——创造的第一声 / "Let there be light" — the first creative word', midText: '天空、海洋、大地依次显现 / Sky, sea, and land appear in order', outroText: '受造界在光中歌唱 / Creation sings in the light' },
                { introText: '万物齐声颂赞 / All creation joins the chorus', midText: '人类被托付管理之职 / Humanity entrusted with stewardship', outroText: '上帝看着一切所造的都甚好 / God saw all that He had made, and it was very good' },
                { introText: '安息的邀请 / The invitation to Sabbath', midText: '在安息中领受恩典 / Receiving grace in rest', outroText: '创造的颂歌永不停止 / The song of creation never ends' }
            ],
            theologyQuestions: [
                { question: '创造论与现代科学是否矛盾？', context: '创造论与进化论之间的张力是现代信仰的核心议题之一。', reflectionGuide: '思考「如何」创造与「为何」创造之间的区别——科学回答机制，信仰回答意义。' },
                { question: '如果上帝持续维系受造界，那么自然灾害意味着什么？', context: '自然之恶（自然灾害）是神义论的经典难题。', reflectionGuide: '区分受造界的自主秩序与上帝的终极主权——自由与爱需要空间。' },
                { question: '人类作为「上帝的形象」承载者，对自然有什么责任？', context: '「管理」(radah) 一词常被误解为剥削的许可。', reflectionGuide: '重新理解「管理」为园丁般的照料，而非掠夺式的征服。' },
                { question: '安息的概念如何挑战现代的生产主义文化？', context: '安息日是创造的完成，而非可有可无的附加。', reflectionGuide: '反思停止生产本身是否是一种信仰告白——宣告世界不靠我们的劳作维系。' },
                { question: '受造界的美丽如何成为上帝启示的一部分？', context: '自然之美自古以来被视为通往神圣的道路之一。', reflectionGuide: '留意日常生活中受造界的美丽如何唤起你心中的敬畏与感恩。' }
            ],
            balanceConfig: {
                targetValues: [0.7, 0.2, 0.1],
                decayRate: 0.02,
                equilibriumPoints: [0.5, 0.3, 0.2],
                phaseTargets: [
                    { phase: 0, targets: [0.8, 0.1, 0.1] },
                    { phase: 1, targets: [0.6, 0.25, 0.15] },
                    { phase: 2, targets: [0.5, 0.3, 0.2] },
                    { phase: 3, targets: [0.4, 0.35, 0.25] }
                ]
            },
            difficultyCurve: {
                earlyRate: 0.3,
                lateRate: 0.7,
                transitionPoint: 0.45,
                spikePoints: [{ at: 0.15, intensity: 0.4 }, { at: 0.8, intensity: -0.3 }]
            },
            rewardTree: {
                baseReward: 100,
                comboMultiplier: 1.05,
                perfectBonus: 200,
                communionBonus: 500,
                milestones: [
                    { threshold: 5000, reward: '创造之光徽章' },
                    { threshold: 15000, reward: '安息之赐' },
                    { threshold: 25000, reward: '受造之颂称号' }
                ]
            },
            musicDescription: 'Ambient orchestral with soft strings and distant choir — evokes the vastness of cosmic creation. Gentle crescendos mirror the days of creation, resolving into peaceful Sabbath stillness.',
            phaseTransitions: [
                { time: 9000, type: 'flash', duration: 800, message: '光！/ Let there be Light!' },
                { time: 27000, type: 'fade', duration: 1200, message: '受造之颂 / Song of Creation' },
                { time: 48000, type: 'pulse', duration: 1000, message: '安息的邀请 / Sabbath Invitation' }
            ],
            musicConfig: {
                tempo: 90,
                key: 'D major',
                instruments: ['strings', 'choir', 'harp', 'ambient_pad'],
                mood: 'contemplative',
                dynamicRange: [0.3, 0.85],
                phaseMoods: [
                    { phase: 0, mood: 'mysterious', tempoMultiplier: 0.8 },
                    { phase: 1, mood: 'awakening', tempoMultiplier: 1.0 },
                    { phase: 2, mood: 'joyful', tempoMultiplier: 1.1 },
                    { phase: 3, mood: 'peaceful', tempoMultiplier: 0.7 }
                ]
            },
            extendedTips: [
                { text: '混沌阶段节奏缓慢，专注于每个音符的精确击打', category: 'rhythm', phase: 0 },
                { text: '创造之光阶段节奏逐渐加快，预热你的反应', category: 'rhythm', phase: 1 },
                { text: '保持蓝色轨道为主但不要完全忽略其他轨道', category: 'balance', phase: 1 },
                { text: '安息阶段节奏放慢，是恢复平衡的好时机', category: 'strategy', phase: 3 },
                { text: '受造之物是上帝持续维系的结果，不是自动运行的机器', category: 'theology', phase: 2 },
                { text: '注意bias_warning事件，及时调整轨道分布', category: 'strategy', phase: 1 },
                { text: '在pattern_shift时提前准备变换后的节奏模式', category: 'rhythm', phase: 2 }
            ],
            phasePatterns: [
                { phase: 0, pattern: 'meditative', weightMap: [0.8, 0.1, 0.1] },
                { phase: 1, pattern: 'standard', weightMap: [0.7, 0.2, 0.1] },
                { phase: 2, pattern: 'standard', weightMap: [0.6, 0.25, 0.15] },
                { phase: 3, pattern: 'meditative', weightMap: [0.5, 0.3, 0.2] }
            ],
            extendedTheologyQuestions: [
                { question: '安息日的设立如何回应现代人的焦虑文化？', options: ['安息日是逃避现实的借口', '安息日是对生产主义的先知性批判', '安息日只适用于宗教信徒', '安息日已经过时了'], correctIndex: 1, context: '安息日是对「不停歇的生产」的根本质疑。', reflectionGuide: '思考你每周是否有真正的安息——不是懒散，而是对恩典的领受。' },
                { question: '创造论中的「好」(tob) 意味着什么？', options: ['道德上的完美', '符合上帝目的的和谐', '没有苦难', '物质上的丰盛'], correctIndex: 1, context: '上帝看着是「好的」——这不是审美的判断，而是对受造界存在价值的肯定。', reflectionGuide: '反思你如何评判事物的「好」——是功用、外表还是存在本身？' },
                { question: '人类被赋予「管理」受造界的责任，这在当代意味着什么？', options: ['人类可以随意使用自然资源', '人类是受造界的管家和园丁', '人类与自然平等无差别', '自然不需要人类的管理'], correctIndex: 1, context: '「管理」(radah) 在创世记中是园丁式的照料，而非掠夺式的征服。', reflectionGuide: '评估你的生活方式对受造界的影响——你是园丁还是掠夺者？' }
            ],
            theologyNotes: [
                { title: 'Creatio ex nihilo —— 从无到有的创造', text: '上帝不是从已有材料中塑造世界，而是从虚无中藉着话语创造一切。这意味着受造界本质上是恩典——它不必须存在，但因上帝的爱而存在。', references: ['创世记 1:1', '约翰福音 1:3', '希伯来书 11:3'] },
                { title: 'Creatio continua —— 持续的创造', text: '创造不是一次性的事件，而是上帝每时每刻的维系。如果上帝停止维系，受造界将归于虚无。这一理解深刻地连接了信仰与日常生活。', references: ['歌罗西书 1:17', '使徒行传 17:28', '《愿你受赞颂》第80节'] },
                { title: '安息的神学意义', text: '安息不是上帝疲惫后的休息，而是创造完成后的满足与庆祝。安息日是时间的圣化——在时间中分别为圣，这是犹太-基督教对时间最深刻的贡献。', references: ['创世记 2:2-3', '出埃及记 20:8-11', '亚伯拉罕·约书亚·赫舍尔《安息日》'] }
            ],
            // --- Phase 7: Character dialogues ---
            characterDialogues: [
                { character: '奥古斯丁', phase: 0, dialogue: '在混沌之中，上帝的灵已经在运行。不要恐惧黑暗——它是光的摇篮。', triggerCondition: 'phase_enter' },
                { character: '奥古斯丁', phase: 1, dialogue: '「要有光」——这不是命令，而是上帝自由的爱的表达。创造是恩典。', triggerCondition: 'first_perfect' },
                { character: '亚西西的方济各', phase: 2, dialogue: '看看天空中的飞鸟、田野中的百合——它们不忧虑，却比所罗门更荣耀。', triggerCondition: 'combo_milestone' },
                { character: '教宗方济各', phase: 3, dialogue: '安息不是懒惰，而是对受造界恩典本质的承认。停下来，看见。', triggerCondition: 'phase_enter' },
                { character: '亚西西的方济各', phase: 2, dialogue: 'Brother Sun, Sister Moon——受造之物都是我们的家人。', triggerCondition: 'balance_milestone' }
            ],
            liturgicalCalendar: {
                season: 'Ordinary Time / 常年期',
                feasts: [
                    { name: '创造主日 / Creator Sunday', description: '在常规时间中纪念上帝的创造之工，感恩受造界的美丽。' },
                    { name: '受造之日 / Harvest Thanksgiving', description: '感谢上帝赐予大地的丰收——受造之物是恩典的礼物。' }
                ],
                liturgicalColor: '#4FC3F7',
                suggestedReadings: ['创世记 1-2', '诗篇 104', '歌罗西书 1:15-20']
            },
            specialMechanics: {
                name: '创造的韵律 / Rhythm of Creation',
                description: '每个阶段对应创造的一天——节奏从混沌的静默逐渐丰满，到安息归于宁静。',
                rules: [
                    { condition: 'phase == 0', effect: 'beat_density -40%', description: '混沌中只有零星的声音——等待光的降临。' },
                    { condition: 'phase == 3', effect: 'score_multiplier 1.5x', description: '安息的加成——在宁静中得分更高。' },
                    { condition: 'balance_streak >= 10', effect: 'visual_aura creation_glow', description: '平衡时出现创造之光的视觉光环。' }
                ]
            },
            tutorialOverrides: {
                firstLevel: true,
                suppressHints: ['firstBias', 'firstCard'],
                extendedIntro: true,
                customMessages: {
                    comboBreak: '创造的和谐被打断——重新找到节奏。',
                    missStreak: '混沌再次袭来——集中注意力，回到创造的光中。',
                    perfectStreak: '受造之物齐声歌唱——你正在重现创造之美。'
                }
            }
        },
        {
            id: 2,
            name: '具体的人',
            subtitle: 'The Concrete Person',
            bpm: 100,
            duration: 60,
            beatDensity: 0.5,
            unlockCondition: 1,
            laneWeights: [0.15, 0.7, 0.15],
            color: '#FFD54F',
            difficultyRating: 2,
            tips: '道成肉身要求你关注具体的人——金色轨道是关键。试着在节奏变化中保持其他轨道的参与。',
            introText: '道成肉身——上帝进入了具体的历史，成为最微小的人。贫穷、流离、苦难——他在哪里？',
            outroText: '在最卑微的面容中，我们遇见了道成肉身的基督。每一次对穷人的关怀，都是对上帝的回应。',
            theologyNote: '道成肉身（Incarnatio）：上帝不仅创造了世界，更进入了世界。基督的事件是上帝与人类历史的永恒交汇点。每一个具体的人都是上帝形象的承载者。',
            events: [
                { time: 6000, eventId: 'poverty_cry' },
                { time: 14000, eventId: 'marginal_voices' },
                { time: 18000, eventId: 'incarnation_mystery' },
                { time: 26000, eventId: 'suffering_question' },
                { time: 32000, eventId: 'refugee_crisis' },
                { time: 40000, eventId: 'compassion_act' },
                { time: 48000, eventId: 'poverty_cry' },
                { time: 54000, eventId: 'incarnation_mystery' },
                { time: 9000, type: 'bias_warning', data: { lane: 1, message: '过度集中于金色轨道' } },
                { time: 20000, type: 'narrative_pause', data: { duration: 3000, text: '静默——道成肉身的奥秘' } },
                { time: 35000, type: 'speed_change', data: { multiplier: 1.2, duration: 4000 } },
                { time: 46000, type: 'balance_challenge', data: { targetBalance: [0.25, 0.5, 0.25], duration: 5000 } }
            ],
            beatPatterns: [
                { startBeat: 0, pattern: 'call_response', measures: 4 },
                { startBeat: 16, pattern: 'staircase', measures: 4 }
            ],
            biasThresholds: { warning: 30, critical: 50 },
            requiredCommunion: 45,
            holdNoteChance: 0,
            simNoteChance: 0,
            phases: [
                { name: '预言的等待', nameEn: 'Prophetic Waiting', startPercent: 0, endPercent: 0.15, beatDensity: 0.3, description: '先知预告了那一位的来临——旷野中的呼声。' },
                { name: '降生马槽', nameEn: 'Manger Birth', startPercent: 0.15, endPercent: 0.4, beatDensity: 0.5, description: '万王之王降生在最卑微的地方。' },
                { name: '受苦之路', nameEn: 'Via Dolorosa', startPercent: 0.4, endPercent: 0.8, beatDensity: 0.6, description: '十字架——上帝进入了人类苦难的最深处。' },
                { name: '复活的曙光', nameEn: 'Resurrection Dawn', startPercent: 0.8, endPercent: 1.0, beatDensity: 0.25, description: '死亡不能拘禁生命之主。' }
            ],
            historicalContext: '道成肉身的教义在早期教会经历了数百年的论争。从尼西亚会议（325年）到卡尔西顿会议（451年），教会逐渐确立了基督完全的神性与完全的人性。这一教义不仅关乎基督论，更深刻地肯定了物质世界和人类历史的神圣价值——如果上帝亲自成为人，那么每一个人、每一寸历史都值得认真对待。',
            backgroundDescription: '温暖的金色光芒笼罩大地。远处是伯利恒的星空，近处是城市街角的阴影——贫困、战乱、流离的人群穿行其间。金色与暗色交织，象征上帝在黑暗中的临在。',
            theologyQuestions: [
                '道成肉身如何改变了我们对「具体的人」的理解？',
                '为什么上帝选择成为贫穷的人，而非权贵？',
                '十字架上的苦难是上帝的软弱还是上帝的力量？',
                '复活对当下的苦难意味着什么？'
            ],
            narrativeBeats: [
                { time: 3000, text: '黑暗中的微光——一个婴孩的啼哭打破了寂静。' },
                { time: 12000, text: '木匠之子的手，触摸了痲疯病人的脸。' },
                { time: 25000, text: '「这些事你们既做在我这弟兄中一个最小的身上，就是做在我身上了。」' },
                { time: 40000, text: '十字架上：「我的上帝，我的上帝，为什么离弃我？」' },
                { time: 52000, text: '空坟墓——死亡不是终点。' },
                { time: 7000, text: '四百年的沉默之后，天使向玛利亚问安。', importance: 'medium' },
                { time: 18000, text: '迦拿的婚宴——水变为酒，平凡中的奇迹。', importance: 'low' },
                { time: 33000, text: '山上宝训：「虚心的人有福了，因为天国是他们的。」', importance: 'high' },
                { time: 47000, text: '复活的清晨——「不要害怕，你们寻找那钉十字架的耶稣。」', importance: 'high' }
            ],
            unlockRewards: { title: '道成肉身的见证者', description: '你在最卑微处看见了上帝的荣耀。' },
            expandedRewards: [
                { type: 'level', id: 'incarnation_complete', name: '道成肉身', description: '完成具体的人关卡', icon: 'star' },
                { type: 'insight', id: 'incarnation_insight_1', name: '虚己的奥秘', description: '理解基督虚己（kenosis）的深刻含义', icon: 'book' },
                { type: 'achievement', id: 'incarnation_balance', name: '三轨平衡大师', description: '在道成肉身关卡中保持三轨道完美平衡10秒', icon: 'trophy' },
                { type: 'character', id: 'mother_teresa_unlock', name: '特蕾莎修女', description: '解锁在最贫穷者中看见基督的灵性洞察', icon: 'user' },
                { type: 'achievement', id: 'incarnation_combo', name: '马槽之光', description: '在降生马槽阶段达成20连击', icon: 'trophy' }
            ],
            statistics: { expectedScoreRange: [10000, 30000], avgAccuracy: 75, avgCombo: 12 },
            // --- Phase 6A ---
            historicalTimeline: [
                { year: -740, title: '以赛亚预言 / Isaiah\'s Prophecy', description: '以赛亚预言必有童女怀孕生子，给他起名叫以马内利。' },
                { year: -5, title: '耶稣降生 / Birth of Jesus', description: '在伯利恒的马槽中，万王之王以最卑微的方式来到世界。' },
                { year: 27, title: '耶稣受洗与开始传道 / Baptism & Ministry', description: '约旦河中，天开了，圣灵如鸽子降下，父的声音印证了子的身份。' },
                { year: 30, title: '十字架受难 / Crucifixion', description: '在各各他，上帝进入了人类苦难的最深处——彻底的自我给予。' },
                { year: 30, title: '复活 / Resurrection', description: '第三天，空坟墓宣告死亡不是终点——新创造已经开始。' },
                { year: 451, title: '卡尔西顿会议 / Council of Chalcedon', description: '教会确认基督是完全的上帝、也是完全的人——神人二性不混不分。' },
                { year: 1971, title: '解放神学兴起 / Liberation Theology', description: '古铁雷斯等人强调上帝对穷人的偏爱，道成肉身与社会公义紧密相连。' }
            ],
            characters: [
                { name: '耶稣基督', role: '道成肉身 / The Incarnate Word', description: '上帝成为人，在最卑微处彰显最深的荣耀。', quote: '狐狸有洞，天空的飞鸟有窝，人子却没有枕头的地方。' },
                { name: '亚他那修', role: '教父 / Church Father', description: '捍卫基督完全神性的亚历山大主教，「上帝成为人，为使人成为神」。', quote: '他成为我们所是的，为使我们成为他所是的。' },
                { name: '特蕾莎修女', role: '仁爱传教修女会创始人 / Missionary of Charity', description: '在加尔各答最贫穷的人身上看见基督的面容。', quote: '在最贫穷的人身上，我们触摸到基督受苦的身体。' },
                { name: '古铁雷斯', role: '神学家 / Theologian', description: '解放神学奠基人，强调上帝对穷人的优先偏爱。', quote: '信仰不是逃避现实的鸦片，而是改变现实的力量。' }
            ],
            phaseBeatConfig: [
                { densityMultiplier: 0.65, holdChance: 0, simChance: 0, shadowChance: 0.02, goldenChance: 0.01 },
                { densityMultiplier: 0.85, holdChance: 0.08, simChance: 0.02, shadowChance: 0.04, goldenChance: 0.03 },
                { densityMultiplier: 1.0, holdChance: 0.12, simChance: 0.05, shadowChance: 0.08, goldenChance: 0.02 },
                { densityMultiplier: 0.55, holdChance: 0.05, simChance: 0.02, shadowChance: 0.01, goldenChance: 0.05 }
            ],
            phaseNarratives: [
                { introText: '旷野中的呼声——预备主的道 / A voice in the wilderness — prepare the way', midText: '四百年沉默之后，先知再次说话 / After 400 years of silence, the prophets speak again', outroText: '时候满足，上帝差遣了他的儿子 / When the fullness of time came, God sent His Son' },
                { introText: '伯利恒的夜——万王之王的降生 / Night in Bethlehem — born the King of kings', midText: '牧羊人与博士一同前来 / Shepherds and wise men come together', outroText: '马槽中的婴孩震撼了宇宙 / The babe in the manger shakes the cosmos' },
                { introText: '十字架的阴影——进入苦难 / Shadow of the cross — entering suffering', midText: '「我的上帝，为什么离弃我？」/ "My God, why have you forsaken me?"', outroText: '最深的黑暗中，最亮的光 / In the deepest darkness, the brightest light' },
                { introText: '第三天的黎明 / Dawn of the third day', midText: '空坟墓——死亡被吞灭 / Empty tomb — death is swallowed up', outroText: '复活是新创造的开始 / Resurrection is the beginning of new creation' }
            ],
            theologyQuestions: [
                { question: '道成肉身如何改变了我们对「具体的人」的理解？', context: '上帝成为具体的人意味着每一个人都承载着不可剥夺的尊严。', reflectionGuide: '反思你周围那些被忽视的人——道成肉身要求你看见谁？' },
                { question: '为什么上帝选择成为贫穷的人，而非权贵？', context: '降生马槽而非皇宫，这是上帝对权力逻辑的根本颠覆。', reflectionGuide: '思考权力与无力之间的悖论——真正的力量在哪里显现？' },
                { question: '十字架上的苦难是上帝的软弱还是上帝的力量？', context: '十字架是基督教最核心的悖论——上帝以软弱战胜强权。', reflectionGuide: '你是否愿意接受「软弱中的力量」作为你生命的逻辑？' },
                { question: '复活对当下的苦难意味着什么？', context: '复活不是对苦难的否定，而是对苦难最终意义的揭示。', reflectionGuide: '在你正在经历的困难中，复活的盼望如何塑造你的回应？' },
                { question: '基督的二性（完全的神、完全的人）为何重要？', context: '卡尔西顿信经确立了基督神人二性的教义。', reflectionGuide: '思考你的信仰是否过于强调神性而忽略了人性，或反之。' }
            ],
            balanceConfig: {
                targetValues: [0.15, 0.7, 0.15],
                decayRate: 0.025,
                equilibriumPoints: [0.25, 0.5, 0.25],
                phaseTargets: [
                    { phase: 0, targets: [0.2, 0.6, 0.2] },
                    { phase: 1, targets: [0.15, 0.7, 0.15] },
                    { phase: 2, targets: [0.25, 0.5, 0.25] },
                    { phase: 3, targets: [0.2, 0.5, 0.3] }
                ]
            },
            difficultyCurve: {
                earlyRate: 0.35,
                lateRate: 0.75,
                transitionPoint: 0.4,
                spikePoints: [{ at: 0.4, intensity: 0.5 }, { at: 0.8, intensity: -0.4 }]
            },
            rewardTree: {
                baseReward: 120,
                comboMultiplier: 1.06,
                perfectBonus: 250,
                communionBonus: 550,
                milestones: [
                    { threshold: 7000, reward: '马槽之光' },
                    { threshold: 18000, reward: '十字架之路' },
                    { threshold: 30000, reward: '复活见证者' }
                ]
            },
            musicDescription: 'Warm strings and acoustic guitar with Hebrew modal influences — intimate yet expansive. A solo cello represents the human journey of Christ, building to a powerful orchestral climax at the crucifixion, then resolving into gentle resurrection motifs.',
            phaseTransitions: [
                { time: 9000, type: 'fade', duration: 1000, message: '预言成真 / Prophecy Fulfilled' },
                { time: 24000, type: 'flash', duration: 600, message: '十字架的阴影 / Shadow of the Cross' },
                { time: 48000, type: 'pulse', duration: 1200, message: '复活！/ He is Risen!' }
            ],
            musicConfig: {
                tempo: 100,
                key: 'A minor / A major',
                instruments: ['acoustic_guitar', 'cello', 'strings', 'piano'],
                mood: 'intimate',
                dynamicRange: [0.2, 0.95],
                phaseMoods: [
                    { phase: 0, mood: 'anticipation', tempoMultiplier: 0.85 },
                    { phase: 1, mood: 'tender', tempoMultiplier: 1.0 },
                    { phase: 2, mood: 'anguished', tempoMultiplier: 1.15 },
                    { phase: 3, mood: 'triumphant', tempoMultiplier: 0.9 }
                ]
            },
            extendedTips: [
                { text: '金色轨道是本关核心，但保持三轨道参与至关重要', category: 'balance', phase: 1 },
                { text: '受苦之路阶段节奏密集，优先保持金色轨道连击', category: 'rhythm', phase: 2 },
                { text: '道成肉身意味着上帝在具体的历史中行动', category: 'theology', phase: 1 },
                { text: '复活阶段节奏放慢，利用这个窗口恢复连击', category: 'strategy', phase: 3 },
                { text: '十字架是力量在软弱中的彰显——同理，放慢节奏也是一种力量', category: 'theology', phase: 2 },
                { text: '注意narrative_pause事件，保持对叙事节奏的感知', category: 'strategy', phase: 2 },
                { text: '预言等待阶段是热身，为后续高密度做好准备', category: 'rhythm', phase: 0 }
            ],
            phasePatterns: [
                { phase: 0, pattern: 'meditative', weightMap: [0.2, 0.6, 0.2] },
                { phase: 1, pattern: 'standard', weightMap: [0.15, 0.7, 0.15] },
                { phase: 2, pattern: 'intense', weightMap: [0.25, 0.5, 0.25] },
                { phase: 3, pattern: 'climactic', weightMap: [0.2, 0.5, 0.3] }
            ],
            extendedTheologyQuestions: [
                { question: '「上帝成为人」这一教义如何影响我们看待物质世界？', options: ['物质世界是次要的', '物质世界被道成肉身赋予了神圣价值', '只有灵魂是重要的', '物质世界是邪恶的'], correctIndex: 1, context: '如果上帝亲自取了肉身，那么物质、身体、历史本身就是神圣恩典的载体。', reflectionGuide: '反思你对物质世界——包括你自己的身体——的态度是否需要被道成肉身重新塑造。' },
                { question: '十字架上的「被离弃」意味着什么？', options: ['圣父真的离开了圣子', '耶稣只是心理上的痛苦', '上帝在黑暗中与人同在', '十字架只是一个道德榜样'], correctIndex: 2, context: '三一上帝在十字架上经历了内在的撕裂——这是上帝对人类苦难最深度的参与。', reflectionGuide: '在你的被离弃感中，十字架告诉你什么？' },
                { question: '复活的身体性意味着什么？', options: ['复活只是灵魂上天堂', '复活是身体的更新与整个受造界的恢复', '复活只是一个隐喻', '复活与物质无关'], correctIndex: 1, context: '复活的耶稣让门徒触摸他的伤痕，并吃了一片鱼——复活是真实的身体性事件。', reflectionGuide: '思考你的信仰是否过于「属灵」而忽略了上帝对物质世界的救赎。' }
            ],
            theologyNotes: [
                { title: 'Kenosis —— 虚己的道成肉身', text: '基督「虚己」（kenosis）不是放弃神性，而是选择不使用神性的特权。这一概念挑战了一切以权力为导向的关系模式——真正的伟大是自我倾空。', references: ['腓立比书 2:5-11', '卡尔西顿信经', '约翰·加尔文《基督教要义》卷二'] },
                { title: '上帝对穷人的优先偏爱', text: '解放神学强调，上帝在历史中特别站在穷人、被边缘化者一边。这不是对其他人的排斥，而是对不公义秩序的先知性挑战。', references: ['路加福音 4:18-19', '古铁雷斯《解放神学》', '《福音的喜乐》第53节'] },
                { title: '复活作为新创造的开始', text: '复活不是回到从前的生活，而是全新创造的起点。坟墓是空的，但耶稣的身体是更新了的——这预示着整个受造界的终末更新。', references: ['哥林多前书 15章', '罗马书 8:18-25', 'N.T.赖特《耶稣与上帝的得胜》'] }
            ],
            // --- Phase 7: Character dialogues ---
            characterDialogues: [
                { character: '耶稣基督', phase: 1, dialogue: '我赤身露体，你们给我穿；我病了，你们看顾我——这些事你们做在我弟兄中最小的一个身上。', triggerCondition: 'phase_enter' },
                { character: '亚他那修', phase: 0, dialogue: '他成为我们所是的，为使我们成为他所是的——道成肉身的逆转。', triggerCondition: 'first_great' },
                { character: '特蕾莎修女', phase: 2, dialogue: '我在每一个穷人身上看见了基督的面容——他们在呼唤你的回应。', triggerCondition: 'balance_shift' },
                { character: '古铁雷斯', phase: 2, dialogue: '上帝在历史中特别站在穷人一边——这不是偏袒，而是公义。', triggerCondition: 'bias_warning' },
                { character: '耶稣基督', phase: 3, dialogue: '复活不是回到从前——是新创造的开始。看哪，我将一切都更新了。', triggerCondition: 'phase_enter' }
            ],
            liturgicalCalendar: {
                season: 'Christmas / Lent / Easter / 圣诞·大斋·复活',
                feasts: [
                    { name: '圣诞 / Christmas', description: '万王之王降生在马槽——上帝进入人类最卑微的角落。' },
                    { name: '受难日 / Good Friday', description: '十字架——上帝以软弱战胜强权，以爱战胜仇恨。' },
                    { name: '复活节 / Easter', description: '空坟墓——死亡不是终点，是新创造的黎明。' }
                ],
                liturgicalColor: '#FFD54F',
                suggestedReadings: ['腓立比书 2:5-11', '路加福音 1-2', '约翰福音 19-20']
            },
            specialMechanics: {
                name: '虚己之路 / Way of Kenosis',
                description: '金色轨道代表道成肉身——过度集中于它反而会失去平衡。真正的道成肉身要求三重光的同时临在。',
                rules: [
                    { condition: 'lane_1_hits > lane_0_hits * 3', effect: 'bias_warning incarnation_only', description: '过度集中于道成肉身轨道——忽略了创造与圣灵的维度。' },
                    { condition: 'phase == 2 && combo >= 15', effect: 'visual_cross subtle', description: '高连击时出现微妙的十字架视觉元素。' },
                    { condition: 'all_lanes_hit_in_beat', effect: 'score_bonus +50', description: '三轨道同时击打获得额外奖励——三一临在的共融。' }
                ]
            },
            tutorialOverrides: {
                firstLevel: false,
                suppressHints: [],
                extendedIntro: false,
                customMessages: {
                    comboBreak: '道成肉身的旅途被中断——重新踏上虚己之路。',
                    missStreak: '在苦难面前退缩了——记住，十字架是通往复活的必经之路。',
                    perfectStreak: '在具体的人身上看见上帝——这正是道成肉身呼召你做的。'
                }
            }
        },
        {
            id: 3,
            name: '圣灵与回应',
            subtitle: 'Holy Spirit & Response',
            bpm: 110,
            duration: 60,
            beatDensity: 0.6,
            unlockCondition: 2,
            laneWeights: [0.15, 0.15, 0.7],
            color: '#CE93D8',
            difficultyRating: 3,
            tips: '圣灵在出人意料的地方运行——节奏会变得不规则。紫色轨道虽然密集，但不要忽视蓝与金的平衡。',
            introText: '圣灵在历史中运行——在先知的声音中、在群体分辨中、在每一个内心的微声里。你能否听见？',
            outroText: '圣灵不是抽象的力量，而是引导历史走向共融位格性的临在。在多元中合一，在自由中彼此承担。',
            theologyNote: '圣灵论（Pneumatologia）：圣灵是上帝在历史中的动态临在。他不仅赐予个人恩赐，更建立群体的共融。先知性的声音是对权力的质询，也是对盼望的见证。',
            events: [
                { time: 5000, eventId: 'community_discernment' },
                { time: 11000, eventId: 'unity_diversity' },
                { time: 16000, eventId: 'inner_voice' },
                { time: 23000, eventId: 'prophetic_witness' },
                { time: 30000, eventId: 'spiritual_gifts' },
                { time: 37000, eventId: 'prayer_movement' },
                { time: 42000, eventId: 'community_discernment' },
                { time: 50000, eventId: 'prophetic_witness' },
                { time: 55000, eventId: 'prayer_movement' },
                { time: 8000, type: 'pattern_shift', data: { from: 'standard', to: 'syncopation' } },
                { time: 19000, type: 'bias_warning', data: { lane: 2, message: '紫色轨道偏重，注意三重平衡' } },
                { time: 33000, type: 'speed_change', data: { multiplier: 1.25, duration: 4500 } },
                { time: 44000, type: 'balance_challenge', data: { targetBalance: [0.25, 0.25, 0.5], duration: 5500 } },
                { time: 51000, type: 'narrative_pause', data: { duration: 2500, text: '圣灵在静默中说话' } }
            ],
            beatPatterns: [
                { startBeat: 0, pattern: 'wave', measures: 4 },
                { startBeat: 16, pattern: 'syncopation', measures: 4 },
                { startBeat: 24, pattern: 'gallop', measures: 2 }
            ],
            biasThresholds: { warning: 30, critical: 50 },
            requiredCommunion: 50,
            holdNoteChance: 0,
            simNoteChance: 0,
            phases: [
                { name: '五旬的风', nameEn: 'Pentecost Wind', startPercent: 0, endPercent: 0.12, beatDensity: 0.35, description: '忽然，从天上有响声下来，好像一阵大风吹过。' },
                { name: '恩赐的浇灌', nameEn: 'Outpouring of Gifts', startPercent: 0.12, endPercent: 0.35, beatDensity: 0.55, description: '圣灵赐下多元的恩赐，为要建立基督的身体。' },
                { name: '先知的呐喊', nameEn: 'Prophetic Cry', startPercent: 0.35, endPercent: 0.75, beatDensity: 0.7, description: '先知在旷野中呼喊——预备主的道。' },
                { name: '共融的应许', nameEn: 'Promise of Communion', startPercent: 0.75, endPercent: 1.0, beatDensity: 0.3, description: '圣灵与我们的心同证——我们是上帝的儿女。' }
            ],
            historicalContext: '五旬节事件标志着教会的诞生。圣灵的降临不是安静的内省，而是带着风与火的力量——使人说起别国的语言，使胆怯的渔夫成为勇敢的见证者。此后，圣灵论在东方教会（以三一为中心）和西方教会（以恩赐为中心）中发展出不同的侧重，共同丰富了教会的信仰生活。',
            backgroundDescription: '紫色的光芒充满空间，如同清晨的薄雾。风的效果从屏幕两侧掠过，火焰的余烬在上方飘散。背景中隐约可见群体的剪影——有人举手祈祷，有人俯伏敬拜。',
            theologyQuestions: [
                '圣灵的工作如何超越教会的界限？',
                '个人感动与群体分辨之间如何平衡？',
                '先知性的声音在当代社会意味着什么？',
                '多元的恩赐如何导向合一而非分裂？'
            ],
            narrativeBeats: [
                { time: 3000, text: '火焰般的舌头降下——巴别塔的咒诅在此逆转。' },
                { time: 12000, text: '彼得站起来——一个渔夫的讲道震动了整个耶路撒冷。' },
                { time: 25000, text: '「他们专心遵守使徒的教训，彼此交接、掰饼、祈祷。」' },
                { time: 40000, text: '哥尼流的家——圣灵打破了种族的藩篱。' },
                { time: 52000, text: '群体在祈祷中分辨——圣灵说：「要为我分派巴拿巴和扫罗。」' },
                { time: 8000, text: '一阵大风吹过——所有人都被圣灵充满。', importance: 'high' },
                { time: 18000, text: '腓利在旷野遇见太监——圣灵引导出人意料的相遇。', importance: 'medium' },
                { time: 32000, text: '安提阿的门徒首次被称为「基督徒」——一个新的身份诞生。', importance: 'low' },
                { time: 46000, text: '在马可楼的祈祷中——群体同心合意等候圣灵。', importance: 'medium' }
            ],
            unlockRewards: { title: '圣灵的聆听者', description: '你在多元的声音中辨认出了圣灵的引导。' },
            expandedRewards: [
                { type: 'level', id: 'spirit_complete', name: '圣灵降临', description: '完成圣灵与回应关卡', icon: 'star' },
                { type: 'insight', id: 'spirit_insight_1', name: '五旬的火焰', description: '理解五旬节作为巴别塔逆转的神学意义', icon: 'book' },
                { type: 'insight', id: 'spirit_insight_2', name: '恩赐与共融', description: '领悟恩赐是为了建立群体而非高举个人', icon: 'book' },
                { type: 'achievement', id: 'spirit_rhythm', name: '风的节奏', description: '在节奏不规则阶段保持完美连击', icon: 'trophy' },
                { type: 'character', id: 'peter_unlock', name: '彼得', description: '解锁从渔夫到使徒的转变故事', icon: 'user' }
            ],
            statistics: { expectedScoreRange: [12000, 35000], avgAccuracy: 72, avgCombo: 18 },
            // --- Phase 6A ---
            historicalTimeline: [
                { year: 30, title: '五旬节 / Pentecost', description: '圣灵如火焰降临，教会诞生。巴别塔的语言混乱被逆转为多元中的合一。' },
                { year: 35, title: '司提反殉道 / Stephen\'s Martyrdom', description: '第一位殉道者以生命见证了圣灵赋予的勇气。' },
                { year: 49, title: '耶路撒冷会议 / Jerusalem Council', description: '使徒在群体分辨中决定外邦信徒不必受割礼——圣灵引导教会的典范。' },
                { year: 313, title: '米兰敕令 / Edict of Milan', description: '帝国停止迫害教会——圣灵在逼迫中结出的果子改变了历史。' },
                { year: 1206, title: '方济各蒙召 / Francis\'s Calling', description: '亚西西的方济各在祈祷中听见圣灵的呼召，开始贫穷与喜乐的见证。' },
                { year: 1906, title: '阿苏萨街复兴 / Azusa Street Revival', description: '洛杉矶的复兴运动，圣灵以出人意料的方式跨越种族与阶层。' },
                { year: 1962, title: '梵二会议 / Vatican II', description: '天主教会召开大公会议，在圣灵的引导下向现代世界开放。' }
            ],
            characters: [
                { name: '彼得', role: '使徒 / Apostle', description: '五旬节站起来的渔夫，胆怯者成为勇敢的见证者。', quote: '你们各人要悔改，奉耶稣基督的名受洗，叫你们的罪得赦。' },
                { name: '保罗', role: '外邦使徒 / Apostle to the Gentiles', description: '从迫害者变为宣教士，圣灵差遣他将福音带到地极。', quote: '我们不拘是犹太人，是希腊人，是为奴的，是自主的，都从一位圣灵受洗。' },
                { name: '亚西西的方济各', role: '神秘主义者 / Mystic', description: '在祈祷中被圣灵充满，以贫穷和喜乐重建教会。', quote: '主啊，使我做你和平的工具。' },
                { name: '卫斯理兄弟', role: '复兴领袖 / Revival Leaders', description: '约翰与查理·卫斯理经历圣灵的更新，引领英格兰的信仰复兴。', quote: '我心感到一种奇异而温暖的改变。' }
            ],
            phaseBeatConfig: [
                { densityMultiplier: 0.7, holdChance: 0.03, simChance: 0, shadowChance: 0.03, goldenChance: 0.02 },
                { densityMultiplier: 0.9, holdChance: 0.08, simChance: 0.04, shadowChance: 0.05, goldenChance: 0.03 },
                { densityMultiplier: 1.1, holdChance: 0.12, simChance: 0.06, shadowChance: 0.08, goldenChance: 0.04 },
                { densityMultiplier: 0.6, holdChance: 0.05, simChance: 0.02, shadowChance: 0.02, goldenChance: 0.04 }
            ],
            phaseNarratives: [
                { introText: '忽然，从天上有响声——像一阵大风 / Suddenly, a sound from heaven — like a mighty wind', midText: '火焰般的舌头降在每个人头上 / Tongues of fire rest on each one', outroText: '巴别塔的咒诅在此逆转 / The curse of Babel is reversed here' },
                { introText: '圣灵赐下恩赐——为建立基督的身体 / The Spirit gives gifts — to build up the body of Christ', midText: '多元的恩赐，同一个源头 / Diverse gifts, one Source', outroText: '每个恩赐都是为共融而赐 / Every gift is given for communion' },
                { introText: '旷野中的呼声——预备主的道 / A cry in the wilderness — prepare the way of the Lord', midText: '先知不迎合权力，只忠于真理 / Prophets do not please power, they are faithful to truth', outroText: '在边缘处，圣灵的声音最清晰 / At the margins, the Spirit\'s voice is clearest' },
                { introText: '圣灵与我们的心同证 / The Spirit testifies with our spirit', midText: '我们是上帝的儿女——这是自由与责任的呼召 / We are God\'s children — a call of freedom and responsibility', outroText: '共融的应许终将实现 / The promise of communion will be fulfilled' }
            ],
            theologyQuestions: [
                { question: '圣灵的工作如何超越教会的界限？', context: '五旬节中，圣灵的风不受建筑或制度的限制。', reflectionGuide: '观察你周围那些意料之外的恩典时刻——圣灵是否在你没想到的地方工作？' },
                { question: '个人感动与群体分辨之间如何平衡？', context: '耶路撒冷会议是群体分辨的经典范例。', reflectionGuide: '反思你的信仰决定是在群体中形成的还是孤立的——两者如何平衡？' },
                { question: '先知性的声音在当代社会意味着什么？', context: '先知不是预测未来，而是以真理挑战当下。', reflectionGuide: '我们的时代需要什么样的先知性见证？你是否有勇气成为其中之一？' },
                { question: '多元的恩赐如何导向合一而非分裂？', context: '保罗强调恩赐的多样性是为了建立身体，而非制造阶层。', reflectionGuide: '你如何使用自己的恩赐——是为了高举自己还是服务群体？' },
                { question: '圣灵引导的群体分辨有何原则？', context: '早期教会的决定以「圣灵和我们定意」表达。', reflectionGuide: '在你的群体中，决策过程是否留有聆听圣灵的空间？' }
            ],
            balanceConfig: {
                targetValues: [0.15, 0.15, 0.7],
                decayRate: 0.028,
                equilibriumPoints: [0.2, 0.25, 0.55],
                phaseTargets: [
                    { phase: 0, targets: [0.2, 0.15, 0.65] },
                    { phase: 1, targets: [0.15, 0.2, 0.65] },
                    { phase: 2, targets: [0.2, 0.2, 0.6] },
                    { phase: 3, targets: [0.25, 0.25, 0.5] }
                ]
            },
            difficultyCurve: {
                earlyRate: 0.4,
                lateRate: 0.8,
                transitionPoint: 0.35,
                spikePoints: [{ at: 0.12, intensity: 0.35 }, { at: 0.35, intensity: 0.6 }, { at: 0.75, intensity: -0.5 }]
            },
            rewardTree: {
                baseReward: 130,
                comboMultiplier: 1.07,
                perfectBonus: 280,
                communionBonus: 600,
                milestones: [
                    { threshold: 8000, reward: '五旬之火' },
                    { threshold: 20000, reward: '恩赐领受者' },
                    { threshold: 35000, reward: '先知之声' }
                ]
            },
            musicDescription: 'Ethereal synths layered with hand drums and wind instruments — restless and unpredictable. Rhythms shift between measured and free-flowing, mirroring the Spirit\'s unpredictable movement. Choral swells represent the community gathered in prayer.',
            phaseTransitions: [
                { time: 7200, type: 'flash', duration: 700, message: '圣灵降临！/ The Spirit Descends!' },
                { time: 21000, type: 'pulse', duration: 900, message: '恩赐浇灌 / Gifts Poured Out' },
                { time: 33000, type: 'fade', duration: 1100, message: '先知的呼喊 / Prophetic Cry' },
                { time: 45000, type: 'pulse', duration: 1000, message: '共融的应许 / Promise of Communion' }
            ],
            musicConfig: {
                tempo: 110,
                key: 'E minor modal',
                instruments: ['synth_pad', 'hand_drums', 'flute', 'choral_swell'],
                mood: 'restless',
                dynamicRange: [0.25, 0.95],
                phaseMoods: [
                    { phase: 0, mood: 'electric', tempoMultiplier: 0.9 },
                    { phase: 1, mood: 'energetic', tempoMultiplier: 1.05 },
                    { phase: 2, mood: 'prophetic', tempoMultiplier: 1.2 },
                    { phase: 3, mood: 'prayerful', tempoMultiplier: 0.8 }
                ]
            },
            extendedTips: [
                { text: '紫色轨道密集但节奏不规则，学会适应变化', category: 'rhythm', phase: 1 },
                { text: '先知呐喊阶段是最密集的——保持冷静应对', category: 'strategy', phase: 2 },
                { text: '圣灵的工作超越个人——群体分辨与个人感动并重', category: 'theology', phase: 2 },
                { text: '五旬的风阶段是热身，不要浪费这段时间的分数', category: 'rhythm', phase: 0 },
                { text: '三轨道的平衡在本关尤其重要——圣灵运行于所有层面', category: 'balance', phase: 1 },
                { text: 'speed_change事件会暂时加快节奏，深呼吸并跟上去', category: 'strategy', phase: 2 },
                { text: '共融的应许阶段是最后的恢复窗口', category: 'balance', phase: 3 }
            ],
            phasePatterns: [
                { phase: 0, pattern: 'standard', weightMap: [0.2, 0.15, 0.65] },
                { phase: 1, pattern: 'intense', weightMap: [0.15, 0.2, 0.65] },
                { phase: 2, pattern: 'intense', weightMap: [0.2, 0.2, 0.6] },
                { phase: 3, pattern: 'meditative', weightMap: [0.25, 0.25, 0.5] }
            ],
            extendedTheologyQuestions: [
                { question: '五旬节的语言奇迹如何回应巴别塔的混乱？', options: ['两者无关', '五旬节逆转了巴别塔——在多元中恢复合一', '五旬节统一了所有语言', '巴别塔是祝福'], correctIndex: 1, context: '巴别塔是人类试图以统一取代共融的尝试，五旬节则是圣灵在多元中赐下的共融。', reflectionGuide: '反思你所在的群体是追求统一的整齐划一，还是多元中的共融？' },
                { question: '圣灵的恩赐是为了个人还是为了群体？', options: ['只为了个人的灵性满足', '为建立基督的身体——群体', '为彰显个人的敬虔', '恩赐已经停止了'], correctIndex: 1, context: '保罗明确指出恩赐是「为了教会的益处」，而非个人的属灵炫耀。', reflectionGuide: '检查你如何使用自己的恩赐——是服务群体还是高举自己？' },
                { question: '群体分辨（communal discernment）的核心原则是什么？', options: ['少数服从多数', '权威者决定一切', '在祈祷与对话中共同寻求圣灵的引导', '不需要群体过程'], correctIndex: 2, context: '耶路撒冷会议的范式是群体在祈祷、辩论和分辨中寻求上帝的旨意。', reflectionGuide: '在你的群体决策中，是否有足够的空间聆听不同的声音？' }
            ],
            theologyNotes: [
                { title: '圣灵与三一 —— 从东方教会视角', text: '东方教会传统强调圣灵从父而出，是三一共融的完成者。圣灵不是非位格的力量，而是使父与子在爱中联合的那一位。这一理解避免了将圣灵简化为「功能」的倾向。', references: ['约翰福音 15:26', '东方教会三一神学', '约翰·齐齐乌拉斯《共融与他者》'] },
                { title: '先知性的本质 —— 挑战当下而非预测未来', text: '先知不是算命先生，而是以上帝的话语挑战当下的权力结构和社会不义。先知性的声音往往来自边缘，而非中心。这一传统在当代社会同样适用。', references: ['阿摩司书 5:24', '马丁·路德·金《从伯明翰市监狱发出的信》', '沃弗《被遗忘的圣灵》'] },
                { title: '多元中的合一 —— 五旬节的范式', text: '五旬节的奇迹不是统一了所有人的语言，而是让每个人听见自己的方言。合一是多元中的共融，而非整齐划一的统一。这是圣灵工作的本质特征。', references: ['使徒行传 2:1-13', '哥林多前书 12:12-27', '梵二《教会》宪章'] }
            ],
            // --- Phase 7: Character dialogues ---
            characterDialogues: [
                { character: '彼得', phase: 0, dialogue: '我们都听见他们用自己的乡谈讲说上帝的大作为——这是圣灵的工作！', triggerCondition: 'phase_enter' },
                { character: '保罗', phase: 1, dialogue: '恩赐原有分别，圣灵却是一位。事奉原有分别，主却是一位。', triggerCondition: 'first_perfect' },
                { character: '亚西西的方济各', phase: 2, dialogue: '主啊，使我做你和平的工具——在仇恨的地方播下爱。', triggerCondition: 'bias_critical' },
                { character: '卫斯理兄弟', phase: 1, dialogue: '我心感到一种奇异而温暖的改变——圣灵的更新从内心开始。', triggerCondition: 'combo_milestone' },
                { character: '彼得', phase: 3, dialogue: '在群体中，我们一同聆听——圣灵的引导从不孤立。', triggerCondition: 'balance_milestone' }
            ],
            liturgicalCalendar: {
                season: 'Pentecost / 五旬节期',
                feasts: [
                    { name: '五旬节 / Pentecost', description: '圣灵如火降临——巴别塔的咒诅被逆转，多元中的合一。' },
                    { name: '三一主日 / Trinity Sunday', description: '庆祝三一上帝的奥秘——在关系中存在的上帝。' }
                ],
                liturgicalColor: '#CE93D8',
                suggestedReadings: ['使徒行传 2', '哥林多前书 12', '罗马书 8:14-27']
            },
            specialMechanics: {
                name: '风与火 / Wind and Fire',
                description: '节奏不规则变化代表圣灵出人意料的运行。紫色轨道密集但需要与其他轨道保持平衡——恩赐是为了共融。',
                rules: [
                    { condition: 'pattern_shift', effect: 'rhythm_change unpredictable', description: '圣灵如风——不规则的节奏变化考验适应力。' },
                    { condition: 'simultaneous_hit', effect: 'visual_flame', description: '同时击打触发火焰视觉效果——五旬节的火。' },
                    { condition: 'balance >= 0.8', effect: 'score_multiplier 1.3x', description: '三轨道平衡时获得恩赐加成。' }
                ]
            },
            tutorialOverrides: {
                firstLevel: false,
                suppressHints: [],
                extendedIntro: false,
                customMessages: {
                    comboBreak: '圣灵的引导似乎中断了——安静下来，再次聆听。',
                    missStreak: '在纷乱中迷失了方向——回到群体的共融中重新分辨。',
                    perfectStreak: '圣灵在引导你的节奏——让恩赐自由流淌。'
                }
            }
        },
        {
            id: 4,
            name: '教会与历史',
            subtitle: 'Church & History',
            bpm: 120,
            duration: 75,
            beatDensity: 0.75,
            unlockCondition: 3,
            laneWeights: [0.33, 0.34, 0.33],
            color: '#81C784',
            difficultyRating: 4,
            tips: '三轨道趋于均衡——教会需要三重光的同时临在。长音和同时击打会出现，注意提前准备。',
            introText: '教会在历史中行走——有时忠信，有时背逆。改革与迫害，腐败与见证，三重光如何在其中保持平衡？',
            outroText: '教会不是完美的机构，而是蒙召的群体。在历史的长河中，三重光始终指向那个更大的共融。',
            theologyNote: '教会论（Ecclesiologia）：教会是创造、道成肉身、圣灵三种启示的历史性回应。她的使命是在历史的矛盾中见证三一上帝的共融。改革不是背弃传统，而是对传统的深层回归。',
            events: [
                { time: 5000, eventId: 'church_conflict' },
                { time: 11000, eventId: 'persecution_witness' },
                { time: 15000, eventId: 'reformation' },
                { time: 23000, eventId: 'corruption_scandal' },
                { time: 28000, eventId: 'reformation' },
                { time: 35000, eventId: 'mission_history' },
                { time: 40000, eventId: 'church_conflict' },
                { time: 48000, eventId: 'persecution_witness' },
                { time: 55000, eventId: 'reformation' },
                { time: 62000, eventId: 'corruption_scandal' },
                { time: 67000, eventId: 'mission_history' },
                { time: 7000, type: 'bias_warning', data: { lane: 0, message: '蓝色轨道开始偏重' } },
                { time: 18000, type: 'pattern_shift', data: { from: 'call_response', to: 'triple_hit' } },
                { time: 32000, type: 'narrative_pause', data: { duration: 3500, text: '修道院的钟声回荡' } },
                { time: 44000, type: 'speed_change', data: { multiplier: 1.3, duration: 5000 } },
                { time: 58000, type: 'balance_challenge', data: { targetBalance: [0.33, 0.34, 0.33], duration: 7000 } }
            ],
            beatPatterns: [
                { startBeat: 0, pattern: 'call_response', measures: 4 },
                { startBeat: 16, pattern: 'triple_hit', measures: 2 },
                { startBeat: 24, pattern: 'wave', measures: 4 },
                { startBeat: 40, pattern: 'hold_cascade', measures: 4 }
            ],
            biasThresholds: { warning: 25, critical: 45 },
            requiredCommunion: 55,
            holdNoteChance: 0.15,
            simNoteChance: 0.1,
            phases: [
                { name: '使徒的根基', nameEn: 'Apostolic Foundation', startPercent: 0, endPercent: 0.12, beatDensity: 0.5, description: '教会在使徒的教导上建立——信仰的根基。' },
                { name: '帝国与殉道', nameEn: 'Empire & Martyrdom', startPercent: 0.12, endPercent: 0.3, beatDensity: 0.65, description: '罗马的剑与基督的十字架——殉道者的血是教会的种子。' },
                { name: '中世纪的钟声', nameEn: 'Medieval Bells', startPercent: 0.3, endPercent: 0.5, beatDensity: 0.8, description: '修道院的钟声回荡——信仰与权力的交织。' },
                { name: '改革的风暴', nameEn: 'Reformation Storm', startPercent: 0.5, endPercent: 0.75, beatDensity: 0.85, description: '九十五条论纲——教会在分裂中寻找真理。' },
                { name: '普世的呼唤', nameEn: 'Ecumenical Call', startPercent: 0.75, endPercent: 1.0, beatDensity: 0.55, description: '分裂的教会能否在共融中重新合一？' }
            ],
            historicalContext: '教会两千年的历史是一部充满矛盾的书卷。从罗马帝国的迫害到君士坦丁的归信，从东西方大分裂（1054年）到宗教改革（1517年），从殖民时期的宣教到当代普世运动——教会在忠信与背逆之间不断摇摆。梵蒂冈第二届大公会议（1962-1965）标志着天主教会对现代世界的开放，而普世运动则试图弥合数百年的分裂。',
            backgroundDescription: '绿色的大地延伸到远方，象征教会在历史中的旅程。背景中交替出现：罗马竞技场、哥特式大教堂、宗教改革时期的印刷机、现代的普世礼拜。云层在上方流转，时而晴朗，时而乌云密布，象征教会历史的起伏。',
            theologyQuestions: [
                '教会的可见性与不可见性之间有何关系？',
                '宗教改革是分裂还是回归？',
                '教会如何在权力面前保持先知性的见证？',
                '普世合一运动是否意味着信仰的妥协？',
                '教会在数字时代如何保持真实的共融？'
            ],
            narrativeBeats: [
                { time: 4000, text: '「你们要去，使万民作我的门徒。」' },
                { time: 10000, text: '竞技场中，殉道者举目望天：「主啊，接收我的灵魂。」' },
                { time: 22000, text: '修道院的抄写室——每一个字母都是对上帝的祈祷。' },
                { time: 35000, text: '威登堡的教堂门上，九十五条论纲钉入历史的肌理。' },
                { time: 50000, text: '「在这里我站着，我不能做别的。愿上帝帮助我。」' },
                { time: 65000, text: '普世合一的祈祷——分裂的伤痕能否愈合？' },
                { time: 5500, text: '彼得在罗马倒钉十字架——「我不配与主同样地死。」', importance: 'high' },
                { time: 16000, text: '尼西亚的三百一十八位主教——以信经回应异端的挑战。', importance: 'medium' },
                { time: 28000, text: '本笃创立修道院——「祈祷与工作」成为千年秩序。', importance: 'medium' },
                { time: 43000, text: '印刷机转动——上帝的话语以前所未有的速度传播。', importance: 'low' },
                { time: 58000, text: '梵二的窗户打开——新鲜空气吹入古老的殿宇。', importance: 'high' }
            ],
            unlockRewards: { title: '历史的朝圣者', description: '你见证了教会在忠信与背逆之间的漫长旅程。' },
            expandedRewards: [
                { type: 'level', id: 'church_complete', name: '教会历程', description: '完成教会与历史关卡', icon: 'star' },
                { type: 'insight', id: 'church_insight_1', name: '改革与回归', description: '理解宗教改革既是分裂也是深层回归', icon: 'book' },
                { type: 'insight', id: 'church_insight_2', name: '普世的桥梁', description: '领悟普世合一运动的神学基础', icon: 'book' },
                { type: 'achievement', id: 'church_marathon', name: '历史马拉松', description: '完成教会关卡全部5个阶段', icon: 'trophy' },
                { type: 'character', id: 'luther_unlock', name: '马丁·路德', description: '解锁宗教改革者的信仰历程', icon: 'user' },
                { type: 'achievement', id: 'church_balance', name: '三一平衡', description: '在教会关卡中达到三轨道完美均衡', icon: 'trophy' }
            ],
            statistics: { expectedScoreRange: [15000, 45000], avgAccuracy: 68, avgCombo: 20 },
            // --- Phase 6A ---
            historicalTimeline: [
                { year: 325, title: '尼西亚会议 / Council of Nicaea', description: '确立基督与父「同质」(homoousios)，奠定三一教义的基础。' },
                { year: 381, title: '君士坦丁堡会议 / Council of Constantinople', description: '确认圣灵的神性，三一教义的完整框架形成。' },
                { year: 451, title: '卡尔西顿会议 / Council of Chalcedon', description: '确认基督神人二性，道成肉身的教义达到经典表述。' },
                { year: 1054, title: '东西方大分裂 / East-West Schism', description: '东方与西方教会正式分裂——三一共融的合一被历史撕裂。' },
                { year: 1215, title: '第四次拉特兰会议 / Fourth Lateran Council', description: '中世纪教会权力的巅峰，也是腐败开始滋生的转折点。' },
                { year: 1517, title: '九十五条论纲 / 95 Theses', description: '马丁·路德在威登堡钉上论纲，宗教改革的风暴来临。' },
                { year: 1962, title: '梵二会议 / Vatican II', description: '天主教会的大公会议，向现代世界开放，推动普世合一。' },
                { year: 1999, title: '因信称义联合声明 / Joint Declaration on Justification', description: '天主教会与世界信义宗联盟就核心教义达成历史性和解。' }
            ],
            characters: [
                { name: '亚他那修', role: '教父与坚持者 / Defender of the Faith', description: '五次被流放仍坚持基督完全神性的亚历山大主教。', quote: '整个世界都反对你们？那么我反对整个世界。' },
                { name: '马丁·路德', role: '改革者 / Reformer', description: '威登堡的修士，以唯独恩典、唯独信心、唯独圣经挑战教会体制。', quote: '在这里我站着，我不能做别的。愿上帝帮助我。' },
                { name: '特蕾莎修女', role: '圣徒 / Saint', description: '在加尔各答的贫民窟中活出教会的使命——在最小的弟兄身上服侍基督。', quote: '我们做的不是伟大的事，而是以伟大的爱做小事。' },
                { name: '教宗若望二十三世', role: '教宗 / Pope', description: '召开梵二会议，打开窗户让新鲜空气进入教会。', quote: '我要打开教会的窗户，让新鲜空气进来。' },
                { name: '潘霍华', role: '神学家与殉道者 / Theologian & Martyr', description: '以昂贵的恩典对抗廉价的恩典，在反纳粹斗争中殉道。', quote: '当基督呼召一个人，他是呼召他来死。' }
            ],
            phaseBeatConfig: [
                { densityMultiplier: 0.75, holdChance: 0.05, simChance: 0.03, shadowChance: 0.03, goldenChance: 0.02 },
                { densityMultiplier: 0.9, holdChance: 0.1, simChance: 0.05, shadowChance: 0.06, goldenChance: 0.03 },
                { densityMultiplier: 1.05, holdChance: 0.15, simChance: 0.08, shadowChance: 0.08, goldenChance: 0.04 },
                { densityMultiplier: 1.15, holdChance: 0.18, simChance: 0.1, shadowChance: 0.1, goldenChance: 0.05 },
                { densityMultiplier: 0.75, holdChance: 0.08, simChance: 0.04, shadowChance: 0.04, goldenChance: 0.04 }
            ],
            phaseNarratives: [
                { introText: '使徒的根基——磐石上的建造 / Apostolic foundation — built on the Rock', midText: '信仰从耶路撒冷传到地极 / Faith spreads from Jerusalem to the ends of the earth', outroText: '根基既立，风雨中屹立不倒 / The foundation laid, standing firm through storms' },
                { introText: '罗马的剑与羔羊的血 / Rome\'s sword and the Lamb\'s blood', midText: '殉道者的血是教会的种子 / The blood of martyrs is the seed of the Church', outroText: '逼迫中的忠信比权力更有力量 / Faithfulness in persecution is stronger than power' },
                { introText: '修道院的钟声回荡——信仰与权力交织 / Monastery bells echo — faith and power intertwine', midText: '光与影在钟楼间交替 / Light and shadow alternate between the bell towers', outroText: '权力的诱惑与信仰的纯粹之间 / Between the temptation of power and the purity of faith' },
                { introText: '九十五条论纲——裂痕中的真理 / 95 Theses — truth within the fracture', midText: '改革的风暴席卷欧洲 / The storm of reform sweeps across Europe', outroText: '分裂中的寻找——真理的代价 / Searching within division — the cost of truth' },
                { introText: '普世的呼唤——分裂的伤痕能否愈合？/ Ecumenical call — can the wounds of division heal?', midText: '在不同的传统中发现共同的根基 / Discovering a common foundation in different traditions', outroText: '共融的旅程仍在继续 / The journey of communion continues' }
            ],
            theologyQuestions: [
                { question: '教会的可见性与不可见性之间有何关系？', context: '奥古斯丁区分了有形教会与无形教会。', reflectionGuide: '反思教会制度的局限与圣灵超越制度的工作之间的关系。' },
                { question: '宗教改革是分裂还是回归？', context: '路德的本意是改革而非分裂，但历史的后果是深刻的断裂。', reflectionGuide: '思考你如何在自己的传统中同时保持忠信与开放。' },
                { question: '教会如何在权力面前保持先知性的见证？', context: '从君士坦丁到现代，教会与权力的关系始终充满张力。', reflectionGuide: '辨识你所在群体的先知性声音是被权力聆听还是被权力收编。' },
                { question: '普世合一运动是否意味着信仰的妥协？', context: '1999年因信称义联合声明展示了在不妥协核心教义中和解的可能。', reflectionGuide: '区分核心信仰与文化表达——合一需要放弃的是哪些部分？' },
                { question: '教会在数字时代如何保持真实的共融？', context: '虚拟连接能否承载真实的位格相遇，这是数字时代教会的核心挑战。', reflectionGuide: '评估你的在线信仰生活与实体共融之间的平衡。' },
                { question: '尼西亚信经的三一教义为何至今仍不可绕过？', context: '三一教义是基督教信仰的根基，塑造了一切后续的神学发展。', reflectionGuide: '反思三一上帝的观念如何影响你对关系、爱和共融的理解。' }
            ],
            balanceConfig: {
                targetValues: [0.33, 0.34, 0.33],
                decayRate: 0.03,
                equilibriumPoints: [0.33, 0.34, 0.33],
                phaseTargets: [
                    { phase: 0, targets: [0.3, 0.4, 0.3] },
                    { phase: 1, targets: [0.35, 0.3, 0.35] },
                    { phase: 2, targets: [0.3, 0.35, 0.35] },
                    { phase: 3, targets: [0.35, 0.3, 0.35] },
                    { phase: 4, targets: [0.33, 0.34, 0.33] }
                ]
            },
            difficultyCurve: {
                earlyRate: 0.45,
                lateRate: 0.85,
                transitionPoint: 0.5,
                spikePoints: [{ at: 0.12, intensity: 0.3 }, { at: 0.3, intensity: 0.45 }, { at: 0.5, intensity: 0.6 }, { at: 0.75, intensity: -0.4 }]
            },
            rewardTree: {
                baseReward: 140,
                comboMultiplier: 1.08,
                perfectBonus: 300,
                communionBonus: 650,
                milestones: [
                    { threshold: 10000, reward: '尼西亚之光' },
                    { threshold: 25000, reward: '改革的号角' },
                    { threshold: 35000, reward: '普世的桥梁' },
                    { threshold: 45000, reward: '历史的朝圣者' }
                ]
            },
            musicDescription: 'Pipe organ and Gregorian chant evolving into Protestant hymnody — tracing the musical history of the Church. The medieval section features modal harmonies, the Reformation introduces bold chorale melodies, and the final ecumenical section weaves all traditions together.',
            phaseTransitions: [
                { time: 9000, type: 'fade', duration: 1000, message: '使徒的根基 / Apostolic Foundation' },
                { time: 13500, type: 'flash', duration: 700, message: '殉道者的见证 / Martyrs\' Witness' },
                { time: 22500, type: 'pulse', duration: 1100, message: '中世纪的钟声 / Medieval Bells' },
                { time: 37500, type: 'flash', duration: 600, message: '改革的风暴！/ Reformation Storm!' },
                { time: 56250, type: 'fade', duration: 1200, message: '普世的呼唤 / Ecumenical Call' }
            ],
            musicConfig: {
                tempo: 120,
                key: 'G major / G minor',
                instruments: ['pipe_organ', 'gregorian_chant', 'chorale_brass', 'strings'],
                mood: 'majestic',
                dynamicRange: [0.2, 1.0],
                phaseMoods: [
                    { phase: 0, mood: 'solemn', tempoMultiplier: 0.9 },
                    { phase: 1, mood: 'dramatic', tempoMultiplier: 1.05 },
                    { phase: 2, mood: 'contemplative', tempoMultiplier: 1.0 },
                    { phase: 3, mood: 'stormy', tempoMultiplier: 1.15 },
                    { phase: 4, mood: 'hopeful', tempoMultiplier: 0.85 }
                ]
            },
            extendedTips: [
                { text: '三轨道均衡是本关的核心——教会需要三重光同时临在', category: 'balance', phase: 0 },
                { text: '改革风暴阶段长音和同时击打频繁，提前准备', category: 'rhythm', phase: 3 },
                { text: '教会的历史是忠信与背逆交织的故事——接受节奏的起伏', category: 'theology', phase: 2 },
                { text: '殉道阶段节奏提升但不要慌张——殉道者以平静面对风暴', category: 'strategy', phase: 1 },
                { text: 'balance_challenge要求精确的三等分——练习均衡分布', category: 'balance', phase: 3 },
                { text: '本关有5个阶段，节奏变化更多——保持全局视野', category: 'strategy', phase: 0 },
                { text: '普世呼唤阶段是最后的缓和——利用它修复连击和分数', category: 'rhythm', phase: 4 },
                { text: '尼西亚信经奠定三一信仰——三轨道的合一呼应三一共融', category: 'theology', phase: 1 }
            ],
            phasePatterns: [
                { phase: 0, pattern: 'standard', weightMap: [0.3, 0.4, 0.3] },
                { phase: 1, pattern: 'intense', weightMap: [0.35, 0.3, 0.35] },
                { phase: 2, pattern: 'intense', weightMap: [0.3, 0.35, 0.35] },
                { phase: 3, pattern: 'climactic', weightMap: [0.35, 0.3, 0.35] },
                { phase: 4, pattern: 'meditative', weightMap: [0.33, 0.34, 0.33] }
            ],
            extendedTheologyQuestions: [
                { question: '尼西亚信经中的「同质」(homoousios) 为何是关键？', options: ['只是一个哲学概念', '确立了基督与父同等的神性，保护了救恩的可能性', '它使基督教希腊化了', '它否定了基督的人性'], correctIndex: 1, context: '亚他那修坚持「同质」不是因为喜欢哲学争论，而是因为只有真正神性的救主才能带来真正的救恩。', reflectionGuide: '思考你信仰的核心——如果基督不是完全的上帝，你的信仰基础是什么？' },
                { question: '宗教改革的「唯独恩典」如何挑战当代的成功文化？', options: ['它鼓励懒惰', '它宣告人的价值不取决于成就', '它否定了人的努力', '它与现代社会无关'], correctIndex: 1, context: '唯独恩典意味着你不需要「赚得」上帝的爱——这一信息在绩效至上的文化中仍是革命性的。', reflectionGuide: '检查你是否在用「成就」来衡量自己和他人的价值。' },
                { question: '普世运动的核心动力是什么？', options: ['组织上的合并', '在圣灵引导下寻求信仰的可见合一', '降低标准以求和气', '建立统一的全球宗教'], correctIndex: 1, context: '普世运动不是取消差异，而是在三一共融的框架中寻求可以共同见证的根基。', reflectionGuide: '你对不同传统的信徒是什么态度——是隔绝、容忍还是真正寻求理解？' }
            ],
            theologyNotes: [
                { title: '教会作为圣事 —— 共融的标记', text: '梵二会议将教会理解为「拯救的普遍圣事」——教会不是拯救本身，而是拯救的标记和工具。她的使命是让世界看见三一上帝的共融。', references: ['梵二《教会》宪章第1章', '梵二《教会传教工作》法令', '德·吕巴克《教会》'] },
                { title: '改革与回归 —— 辩证的历史', text: '路德的本意是改革教会而非分裂。但历史的复杂性使改革变成了分裂。这一悲剧提醒我们：即使出发点是好的，也可能在历史中产生意料之外的后果。', references: ['马丁·路德《九十五条论纲》', '《奥斯堡信条》', '1999年《因信称义联合声明》'] },
                { title: '从迫害到权力 —— 君士坦丁的转变', text: '313年米兰敕令后，教会从被迫害者变为权力的拥有者。这一转变带来了自由，也带来了诱惑——教会如何在权力面前保持先知性，至今仍是核心问题。', references: ['米兰敕令原文', '约翰·霍华德·尤达《耶稣政治学》', '斯坦利·豪尔沃斯《上帝的国度》'] }
            ],
            // --- Phase 7: Character dialogues ---
            characterDialogues: [
                { character: '亚他那修', phase: 0, dialogue: '整个世界都反对你们？那么我反对整个世界——因为真理不取决于多数。', triggerCondition: 'phase_enter' },
                { character: '马丁·路德', phase: 3, dialogue: '在这里我站着——我不能做别的。上帝的话语比任何权力都坚固。', triggerCondition: 'bias_warning' },
                { character: '潘霍华', phase: 1, dialogue: '当基督呼召一个人，他是呼召他来死——昂贵的恩典要求全部的生命。', triggerCondition: 'miss_streak' },
                { character: '教宗若望二十三世', phase: 4, dialogue: '打开窗户让新鲜空气进来——教会的更新不是背叛传统，而是忠于传统。', triggerCondition: 'phase_enter' },
                { character: '特蕾莎修女', phase: 2, dialogue: '我们做的不是伟大的事，而是以伟大的爱做小事——这是教会的使命。', triggerCondition: 'balance_milestone' }
            ],
            liturgicalCalendar: {
                season: 'Full Liturgical Year / 完整礼仪年',
                feasts: [
                    { name: '诸圣日 / All Saints Day', description: '纪念历世历代的圣徒——从殉道者到改革者，他们共同见证。' },
                    { name: '宗教改革纪念日 / Reformation Day', description: '1517年10月31日——改革的风暴与回归的渴望。' },
                    { name: '建立圣彼得座堂 / Chair of Peter', description: '教会的可见根基——磐石上的建造与改革并存。' }
                ],
                liturgicalColor: '#81C784',
                suggestedReadings: ['马太福音 16:13-20', '以弗所书 4:1-6', '启示录 7:9-12']
            },
            specialMechanics: {
                name: '改革与回归 / Reformation & Return',
                description: '五个阶段对应教会历史的五个时期。三轨道均衡代表教会的三重光——任何偏废都导致教会的失衡。',
                rules: [
                    { condition: 'phase == 3', effect: 'beat_density +20%, sim_chance +15%', description: '改革风暴——节奏最密集，同时击打最频繁。' },
                    { condition: 'phase_count >= 5', effect: 'endurance_bonus +200', description: '五阶段耐力完成奖励。' },
                    { condition: 'hold_duration >= 2000ms', effect: 'visual_monastery_bell', description: '长按音符触发修道院钟声效果。' }
                ]
            },
            tutorialOverrides: {
                firstLevel: false,
                suppressHints: ['firstPlay'],
                extendedIntro: false,
                customMessages: {
                    comboBreak: '教会的旅途充满曲折——但根基立在磐石上。',
                    missStreak: '背逆的时刻——记住，改革是回归不是离开。',
                    perfectStreak: '三重光同时照耀——教会在忠信中找到平衡。'
                }
            }
        },
        {
            id: 5,
            name: '奥秘中的共融',
            subtitle: 'Communion in Mystery',
            bpm: 130,
            duration: 90,
            beatDensity: 0.9,
            unlockCondition: 4,
            laneWeights: [0.33, 0.34, 0.33],
            color: '#FF8A65',
            difficultyRating: 5,
            tips: '终极挑战——所有节奏模式将同时出现。保持冷静，用三一平衡的眼光看待每一个音符。共融是目标。',
            introText: '在一切差异中寻求共融——不同信仰、不同文化、不同受造之物。三重光汇聚于此，考验你能否在奥秘中拥抱他者。',
            outroText: '共融不是消除差异，而是在差异中彼此拥抱。三一上帝的奥秘正是如此——在爱中合一，在合一中保持位格。',
            theologyNote: '共融论（Communio）：三一上帝的本质就是共融——在爱中彼此给予、彼此领受。教会的使命是成为这种共融的圣事，让世界在差异中看见合一的可能。这不是削平一切的统一，而是位格性的彼此渗透。',
            events: [
                { time: 5000, eventId: 'interfaith_dialogue' },
                { time: 11000, eventId: 'ecological_spirituality' },
                { time: 15000, eventId: 'liberation_theology' },
                { time: 22000, eventId: 'digital_age' },
                { time: 25000, eventId: 'ecological_spirituality' },
                { time: 32000, eventId: 'global_solidarity' },
                { time: 38000, eventId: 'cultural_encounter' },
                { time: 42000, eventId: 'wisdom_tradition' },
                { time: 48000, eventId: 'interfaith_dialogue' },
                { time: 55000, eventId: 'liberation_theology' },
                { time: 58000, eventId: 'mystical_union' },
                { time: 65000, eventId: 'eschatological_hope' },
                { time: 70000, eventId: 'ecological_spirituality' },
                { time: 75000, eventId: 'global_solidarity' },
                { time: 80000, eventId: 'interfaith_dialogue' },
                { time: 85000, eventId: 'eschatological_hope' },
                { time: 8000, type: 'pattern_shift', data: { from: 'standard', to: 'polyrhythm' } },
                { time: 17000, type: 'bias_warning', data: { lane: 2, message: '紫色轨道压力过大' } },
                { time: 30000, type: 'speed_change', data: { multiplier: 1.35, duration: 5500 } },
                { time: 45000, type: 'narrative_pause', data: { duration: 3000, text: '在共融的深处静默' } },
                { time: 60000, type: 'balance_challenge', data: { targetBalance: [0.3, 0.4, 0.3], duration: 6000 } },
                { time: 73000, type: 'pattern_shift', data: { from: 'crescendo', to: 'double_stop' } }
            ],
            beatPatterns: [
                { startBeat: 0, pattern: 'wave', measures: 4 },
                { startBeat: 16, pattern: 'triple_hit', measures: 2 },
                { startBeat: 24, pattern: 'staircase', measures: 4 },
                { startBeat: 40, pattern: 'polyrhythm', measures: 4 },
                { startBeat: 56, pattern: 'crescendo', measures: 4 },
                { startBeat: 72, pattern: 'double_stop', measures: 4 },
                { startBeat: 84, pattern: 'wave', measures: 2 }
            ],
            biasThresholds: { warning: 25, critical: 40 },
            requiredCommunion: 60,
            holdNoteChance: 0.2,
            simNoteChance: 0.15,
            phases: [
                { name: '奥秘的门槛', nameEn: 'Threshold of Mystery', startPercent: 0, endPercent: 0.1, beatDensity: 0.5, description: '站在共融的门槛前——你准备好进入奥秘了吗？' },
                { name: '差异的碰撞', nameEn: 'Clash of Differences', startPercent: 0.1, endPercent: 0.3, beatDensity: 0.7, description: '不同的声音交织——差异是威胁还是恩赐？' },
                { name: '深层的相遇', nameEn: 'Deep Encounter', startPercent: 0.3, endPercent: 0.55, beatDensity: 0.9, description: '在对话的深处，真理的面容开始显现。' },
                { name: '共融的试炼', nameEn: 'Trial of Communion', startPercent: 0.55, endPercent: 0.8, beatDensity: 1.0, description: '共融不是廉价的合一——它需要牺牲与悔改。' },
                { name: '永恒的盼望', nameEn: 'Eternal Hope', startPercent: 0.8, endPercent: 1.0, beatDensity: 0.45, description: '一切的终末指向一个应许——上帝是一切中的一切。' }
            ],
            historicalContext: '共融（Communio）的概念根植于三一上帝的内在生命。在当代神学中，共融成为回应分裂世界的关键概念。从宗教间对话到生态神学，从解放神学到女性主义神学，各种神学传统都在尝试从不同角度理解这一奥秘。教宗方济各的《众位弟兄》（Fratelli Tutti）通谕呼吁超越宗教和文化差异的人类友爱。',
            backgroundDescription: '三色光（蓝、金、紫）交织成一个巨大的光环，象征三一上帝的共融。背景中旋转着世界各地的文化符号——教堂、清真寺、佛塔、犹太会堂。光的交汇处呈现出新的色彩，象征差异中的合一。远方的地平线上，新耶路撒冷的轮廓若隐若现。',
            theologyQuestions: [
                '共融是否意味着所有差异的消除？',
                '宗教间对话是否可能不牺牲真理？',
                '三一上帝的内在关系如何启示人类社会？',
                '共融与公义之间有何关系？',
                '永恒的盼望如何影响当下的行动？',
                '受造之物在终末的共融中有何位置？'
            ],
            narrativeBeats: [
                { time: 4000, text: '三重光在此汇聚——你是否准备好进入奥秘？' },
                { time: 12000, text: '亚西西的方济各与苏丹王对话——和平从相遇开始。' },
                { time: 25000, text: '受造之物一同叹息——生态危机是共融的断裂。' },
                { time: 40000, text: '「不再分犹太人、希腊人、自主的、为奴的」——在基督里是一。' },
                { time: 55000, text: '穷人与富人、强者与弱者——共融的餐桌足够大吗？' },
                { time: 70000, text: '数字连接与真实共融——屏幕能否传递位格的爱？' },
                { time: 83000, text: '一切的终末——上帝是一切中的一切。' },
                { time: 7500, text: '三重光的门槛——进入奥秘需要放下确定性的幻觉。', importance: 'medium' },
                { time: 19000, text: '不同的语言、不同的祈祷——但同一呼求。', importance: 'high' },
                { time: 34000, text: '在倾听中相遇——真正的对话从沉默开始。', importance: 'medium' },
                { time: 48000, text: '共融要求牺牲——你愿意为合一付出什么？', importance: 'high' },
                { time: 63000, text: '受造之物切望等候——整个宇宙在盼望中叹息。', importance: 'high' },
                { time: 78000, text: '新天新地的异象——上帝擦去一切眼泪。', importance: 'medium' }
            ],
            unlockRewards: { title: '三重光的传承者', description: '你在差异中拥抱了共融的奥秘。三重光与你同在。' },
            expandedRewards: [
                { type: 'level', id: 'communion_complete', name: '奥秘共融', description: '完成奥秘中的共融关卡——终极挑战', icon: 'star' },
                { type: 'insight', id: 'communion_insight_1', name: '差异中的合一', description: '理解三一共融中的位格性差异', icon: 'book' },
                { type: 'insight', id: 'communion_insight_2', name: '终末的盼望', description: '领悟终末论作为当下行动的动力', icon: 'book' },
                { type: 'insight', id: 'communion_insight_3', name: '受造界的未来', description: '理解整个受造界在终末共融中的位置', icon: 'book' },
                { type: 'achievement', id: 'communion_master', name: '三重光传承者', description: '在共融关卡中获得60000分以上', icon: 'trophy' },
                { type: 'character', id: 'pope_francis_unlock', name: '教宗方济各', description: '解锁当代共融与弟兄友爱的见证', icon: 'user' },
                { type: 'achievement', id: 'communion_perfect', name: '永恒之光', description: '在共融关卡中达成全阶段完美击打', icon: 'trophy' }
            ],
            statistics: { expectedScoreRange: [20000, 60000], avgAccuracy: 65, avgCombo: 25 },
            // --- Phase 6A ---
            historicalTimeline: [
                { year: 1517, title: '宗教改革 / Reformation', description: '路德的改革开启了现代基督教的多元格局——在分裂中寻找真理。' },
                { year: 1789, title: '法国大革命 / French Revolution', description: '世俗化浪潮席卷欧洲——信仰在理性时代面临前所未有的挑战。' },
                { year: 1910, title: '爱丁堡宣教会议 / Edinburgh Missionary Conference', description: '现代普世运动的开端——不同宗派开始寻求合一的见证。' },
                { year: 1948, title: '世界基督教联合会成立 / WCC Founded', description: '普世合一运动进入制度化阶段，各国教会在共融中寻找共同基础。' },
                { year: 1965, title: '梵二会议闭幕 / Vatican II Closes', description: '天主教会的自我更新——礼仪改革、宗教自由、普世对话。' },
                { year: 1989, title: '柏林墙倒塌 / Fall of Berlin Wall', description: '冷战结束——自由与和解的新时代，共融在历史裂缝中显现。' },
                { year: 2015, title: '《愿你受赞颂》/ Laudato Si', description: '教宗方济各发表生态通谕——受造界的共融成为全球议题。' },
                { year: -1, title: '新天新地 / New Heaven and New Earth', description: '终末的盼望——一切受造之物终将在共融中得到完全的恢复。' }
            ],
            characters: [
                { name: '教宗方济各', role: '当代教宗 / Pope', description: '呼吁全球弟兄友爱与生态皈依，在差异中见证共融。', quote: '我们之间的差异是合一的丰富，而非分裂的理由。' },
                { name: '潘霍华', role: '殉道神学家 / Martyr Theologian', description: '以「昂贵的恩典」挑战廉价的信仰，在纳粹的绞刑架上殉道。', quote: '教会只有在为他人存在时才是教会。' },
                { name: '罗哲兄弟', role: '泰泽创始人 / Founder of Taize', description: '在泰泽建立共融的修和团体，成为青年信仰的灯塔。', quote: '在内心保持和平的源泉，你将能在他人心中找到和平。' },
                { name: '教宗若望保禄二世', role: '教宗 / Pope', description: '跨越宗教与文化的界限推动和解，见证三一上帝的共融。', quote: '信仰与理性像两只翅膀，使人精神飞扬，瞻仰真理。' },
                { name: '图图大主教', role: '大主教 / Archbishop', description: '在南非种族隔离的黑暗中坚持真相与和解，活出共融的福音。', quote: '我的使命是和平。我们被造是为了彼此相连。' }
            ],
            phaseBeatConfig: [
                { densityMultiplier: 0.7, holdChance: 0.06, simChance: 0.04, shadowChance: 0.03, goldenChance: 0.03 },
                { densityMultiplier: 0.85, holdChance: 0.12, simChance: 0.06, shadowChance: 0.06, goldenChance: 0.04 },
                { densityMultiplier: 1.1, holdChance: 0.16, simChance: 0.1, shadowChance: 0.1, goldenChance: 0.05 },
                { densityMultiplier: 1.2, holdChance: 0.2, simChance: 0.12, shadowChance: 0.12, goldenChance: 0.06 },
                { densityMultiplier: 0.6, holdChance: 0.08, simChance: 0.04, shadowChance: 0.02, goldenChance: 0.06 }
            ],
            phaseNarratives: [
                { introText: '奥秘的门槛——你准备好了吗？/ Threshold of mystery — are you ready?', midText: '三重光汇聚于此 / The Triple Light converges here', outroText: '踏入奥秘，放下掌控 / Step into mystery, release control' },
                { introText: '不同的声音交织——差异是威胁还是恩赐？/ Voices intertwine — is difference threat or gift?', midText: '碰撞中产生新的可能 / New possibilities emerge from collision', outroText: '多元不是分裂的种子，而是丰富的标志 / Diversity is not the seed of division, but a sign of richness' },
                { introText: '在对话的深处，真理的面容开始显现 / In the depths of dialogue, the face of Truth appears', midText: '相遇需要勇气与谦卑 / Encounter requires courage and humility', outroText: '在关系中认识真理，而非在孤立中 / Knowing truth in relationship, not in isolation' },
                { introText: '共融的试炼——不是廉价的合一 / The trial of communion — not cheap unity', midText: '牺牲与悔改是共融的代价 / Sacrifice and repentance are the price of communion', outroText: '真正的合一是在爱中承担彼此 / True unity is bearing one another in love' },
                { introText: '一切的终末指向一个应许 / All things point to one Promise', midText: '上帝是一切中的一切 / God is all in all', outroText: '永恒的光——三重光的最终汇聚 / Eternal light — the final convergence of the Triple Light' }
            ],
            theologyQuestions: [
                { question: '共融是否意味着所有差异的消除？', context: '三一上帝的三个位格在爱中合一却保持各自的位格性。', reflectionGuide: '反思你与他人的差异——它们是需要消除的障碍还是共融中的恩赐？' },
                { question: '宗教间对话是否可能不牺牲真理？', context: '方济各与苏丹王的对话展示了在不妥协中相遇的可能。', reflectionGuide: '思考你对真理的理解——真理是占有的还是相遇的？' },
                { question: '三一上帝的内在关系如何启示人类社会？', context: '三一论的社会性解读认为上帝的内在关系是社会关系的范式。', reflectionGuide: '想象一个以三一共融为范式的社会——权力、资源、关系将如何重新安排？' },
                { question: '共融与公义之间有何关系？', context: '没有公义的共融是虚伪的，没有共融的公义是冰冷的。', reflectionGuide: '在你的处境中，共融是否需要首先面对公义的问题？' },
                { question: '永恒的盼望如何影响当下的行动？', context: '终末论不是对未来的逃避，而是当下行动的动力。', reflectionGuide: '你的盼望是让你逃避现实还是投入现实？' },
                { question: '受造之物在终末的共融中有何位置？', context: '保罗说受造之物切望等候得赎——终末的共融包括整个受造界。', reflectionGuide: '思考你的生态行动是否根植于终末的盼望——受造界的未来是什么？' },
                { question: '在数字化时代，「位格性的相遇」意味着什么？', context: '技术连接了全球但加深了孤立——共融需要身体的临在。', reflectionGuide: '评估你的关系质量——深度连接需要什么样的临在？' }
            ],
            balanceConfig: {
                targetValues: [0.33, 0.34, 0.33],
                decayRate: 0.035,
                equilibriumPoints: [0.33, 0.34, 0.33],
                phaseTargets: [
                    { phase: 0, targets: [0.35, 0.3, 0.35] },
                    { phase: 1, targets: [0.3, 0.35, 0.35] },
                    { phase: 2, targets: [0.33, 0.34, 0.33] },
                    { phase: 3, targets: [0.3, 0.4, 0.3] },
                    { phase: 4, targets: [0.33, 0.34, 0.33] }
                ]
            },
            difficultyCurve: {
                earlyRate: 0.5,
                lateRate: 0.95,
                transitionPoint: 0.3,
                spikePoints: [{ at: 0.1, intensity: 0.3 }, { at: 0.3, intensity: 0.5 }, { at: 0.55, intensity: 0.7 }, { at: 0.8, intensity: -0.6 }]
            },
            rewardTree: {
                baseReward: 150,
                comboMultiplier: 1.1,
                perfectBonus: 350,
                communionBonus: 750,
                milestones: [
                    { threshold: 12000, reward: '奥秘的探求者' },
                    { threshold: 25000, reward: '差异中的桥梁' },
                    { threshold: 40000, reward: '共融的见证' },
                    { threshold: 50000, reward: '永恒的盼望' },
                    { threshold: 60000, reward: '三重光传承者' }
                ]
            },
            musicDescription: 'Full orchestral synthesis blending all previous styles — a cosmic symphony of communion. Elements from every level interweave: creation\'s ambient expanse, incarnation\'s warm strings, the Spirit\'s restless rhythms, the Church\'s choral traditions. Building to a transcendent finale where all voices merge into a single resonant chord of eternal light.',
            phaseTransitions: [
                { time: 9000, type: 'fade', duration: 1000, message: '进入奥秘 / Entering Mystery' },
                { time: 18000, type: 'flash', duration: 700, message: '差异的碰撞 / Clash of Differences' },
                { time: 27000, type: 'pulse', duration: 1100, message: '深层的相遇 / Deep Encounter' },
                { time: 49500, type: 'flash', duration: 600, message: '共融的试炼 / Trial of Communion' },
                { time: 72000, type: 'fade', duration: 1500, message: '永恒的盼望 / Eternal Hope' }
            ],
            musicConfig: {
                tempo: 130,
                key: 'C major / chromatic fusion',
                instruments: ['full_orchestra', 'synth_layers', 'world_percussion', 'solo_voice', 'choir'],
                mood: 'transcendent',
                dynamicRange: [0.15, 1.0],
                phaseMoods: [
                    { phase: 0, mood: 'mysterious', tempoMultiplier: 0.85 },
                    { phase: 1, mood: 'turbulent', tempoMultiplier: 1.1 },
                    { phase: 2, mood: 'convergent', tempoMultiplier: 1.0 },
                    { phase: 3, mood: 'climactic', tempoMultiplier: 1.25 },
                    { phase: 4, mood: 'eternal', tempoMultiplier: 0.75 }
                ]
            },
            extendedTips: [
                { text: '所有节奏模式同时出现——保持冷静，一拍一拍地击', category: 'rhythm', phase: 0 },
                { text: '共融的试炼是最密集阶段——这是决定最终分数的关键', category: 'strategy', phase: 3 },
                { text: '三一上帝的本质是共融——在差异中寻求合一', category: 'theology', phase: 2 },
                { text: '共融不是消除差异而是在差异中彼此拥抱', category: 'theology', phase: 3 },
                { text: '终极挑战需要三轨道完美平衡——任何偏差都会被放大', category: 'balance', phase: 3 },
                { text: '差异碰撞阶段节奏变化大——预判pattern_shift的时机', category: 'rhythm', phase: 1 },
                { text: '永恒盼望阶段节奏放慢——这是最后的平静与感恩', category: 'strategy', phase: 4 },
                { text: '长按音符和同时击打在本关密度最高——手指灵活度是关键', category: 'rhythm', phase: 2 },
                { text: '整个受造界都在盼望共融——你的每一次击打都回应这盼望', category: 'theology', phase: 4 }
            ],
            phasePatterns: [
                { phase: 0, pattern: 'standard', weightMap: [0.35, 0.3, 0.35] },
                { phase: 1, pattern: 'intense', weightMap: [0.3, 0.35, 0.35] },
                { phase: 2, pattern: 'climactic', weightMap: [0.33, 0.34, 0.33] },
                { phase: 3, pattern: 'climactic', weightMap: [0.3, 0.4, 0.3] },
                { phase: 4, pattern: 'meditative', weightMap: [0.33, 0.34, 0.33] }
            ],
            extendedTheologyQuestions: [
                { question: '三一上帝的「位格性关系」如何挑战个体主义文化？', options: ['三一论与现代文化无关', '三一启示真实的人性在于关系而非孤立', '三一只是一个神学理论', '三一意味着三个神'], correctIndex: 1, context: '三一上帝不是一个孤独的个体，而是三个位格在永恒的爱中彼此给予。这揭示了人性的本质是关系性的。', reflectionGuide: '你的自我理解是「独立的个体」还是「关系中的人」？' },
                { question: '宗教间对话的「双重视听」原则是什么？', options: ['只听不说', '在忠实于自己信仰的同时真诚聆听他者', '放弃自己的信仰以达成共识', '试图改变对方的信仰'], correctIndex: 1, context: '真正的对话需要「双重忠信」——忠于自己的传统，同时开放地聆听他人的真理。', reflectionGuide: '你是否能在不放弃自己信仰的前提下，真诚地尊重并学习其他传统？' },
                { question: '终末盼望与当下行动的关系是什么？', options: ['盼望让我们逃避现实', '盼望是当下行动的动力和方向', '盼望只关于死后上天堂', '盼望与行动无关'], correctIndex: 1, context: '基督教的终末论不是「等末日」的消极等待，而是因为知道终局而积极投入当下的转化。', reflectionGuide: '你的盼望是否让你更投入现实，还是更逃避现实？' }
            ],
            theologyNotes: [
                { title: 'Communio —— 共融作为上帝的本质', text: '三一上帝不是三个孤立的个体，而是永恒的共融——在爱中彼此给予、彼此领受。教会的使命是成为这种共融的圣事，让世界在分裂中看见合一的可能。', references: ['约翰·齐齐乌拉斯《共融与他者》', '约瑟夫·拉辛格《基督教导论》', '《教会》宪章第4章'] },
                { title: '受造界的终末 —— 整个宇宙的共融', text: '终末不是灵魂上天堂，而是新天新地——整个受造界的更新。保罗说受造之物切望等候得赎，这意味着生态关怀不只是社会议题，更是终末盼望的实践。', references: ['罗马书 8:18-25', '启示录 21:1-5', '《愿你受赞颂》第83-84节'] },
                { title: '差异中的合一 —— 三一共融的社会意义', text: '三一论的社会性解读认为，上帝的内在关系为人类社会提供了范式——不是消除差异的统一，而是在爱中保持位格性差异的共融。这一理解对种族、宗教和文化对话具有深远意义。', references: ['米罗斯拉夫·沃弗《拥抱的神学》', '教宗方济各《众位弟兄》', '加尔西枢机《共融与解放》'] }
            ],
            // --- Phase 7: Character dialogues ---
            characterDialogues: [
                { character: '教宗方济各', phase: 0, dialogue: '我们之间的差异是合一的丰富，而非分裂的理由——踏入奥秘吧。', triggerCondition: 'phase_enter' },
                { character: '潘霍华', phase: 3, dialogue: '教会只有在为他人存在时才是教会——共融要求自我倾空。', triggerCondition: 'bias_critical' },
                { character: '罗哲兄弟', phase: 2, dialogue: '在内心保持和平的源泉——然后在他人心中找到和平。', triggerCondition: 'combo_milestone' },
                { character: '图图大主教', phase: 4, dialogue: '我的使命是和平。我们被造是为了彼此相连——终末的共融已然开始。', triggerCondition: 'phase_enter' },
                { character: '教宗若望保禄二世', phase: 1, dialogue: '信仰与理性像两只翅膀——在差异的碰撞中寻求真理的面容。', triggerCondition: 'balance_shift' },
                { character: '教宗方济各', phase: 4, dialogue: '上帝是一切中的一切——一切的终末指向共融。', triggerCondition: 'level_complete' }
            ],
            liturgicalCalendar: {
                season: 'Eschatological Hope / 终末盼望',
                feasts: [
                    { name: '基督君王节 / Christ the King', description: '礼仪年的终结指向终末——一切在基督中合而为一。' },
                    { name: '诸圣相通 / Communion of Saints', description: '所有时空中的信徒在基督里共融——跨越差异的合一。' },
                    { name: '受造之物的盼望 / Hope of Creation', description: '受造之物切望等候——终末的共融包含整个宇宙。' }
                ],
                liturgicalColor: '#FF8A65',
                suggestedReadings: ['以弗所书 1:3-14', '启示录 21:1-7', '罗马书 8:18-25', '哥林多前书 15:24-28']
            },
            specialMechanics: {
                name: '终极共融 / Ultimate Communion',
                description: '所有机制的综合——节奏最密集，平衡最严格，长音和同时击打最多。三轨道的完美平衡代表三一上帝的共融。',
                rules: [
                    { condition: 'phase == 3', effect: 'beat_density +30%, judgment_window -20%', description: '共融试炼——最高密度，最严判断。' },
                    { condition: 'all_lanes_simultaneous', effect: 'visual_triple_light_convergence', description: '三轨道同时触发三重光汇聚特效。' },
                    { condition: 'communion_score >= required', effect: 'phase_4_mood eternal_peace', description: '达到共融要求后，最终阶段进入永恒平安氛围。' },
                    { condition: 'full_combo', effect: 'visual_new_creation_aurora', description: '全连击触发新创造的极光效果。' }
                ]
            },
            tutorialOverrides: {
                firstLevel: false,
                suppressHints: ['firstPlay', 'firstCombo', 'firstBias', 'firstCard', 'firstPerfect'],
                extendedIntro: false,
                customMessages: {
                    comboBreak: '共融的纽带被中断——在差异中重新寻找合一。',
                    missStreak: '分裂再次出现——但共融的应许始终有效。',
                    perfectStreak: '三一上帝的共融在你指尖流淌——这就是永恒的预尝。'
                }
            }
        }
    ];

    function getLevel(id) {
        for (var i = 0; i < levels.length; i++) {
            if (levels[i].id === id) return levels[i];
        }
        return null;
    }

    function getAllLevels() {
        return levels.slice();
    }

    function getLevelEvents(levelId) {
        var level = getLevel(levelId);
        return level ? (level.events || []) : [];
    }

    function getIntroText(levelId) {
        var level = getLevel(levelId);
        return level ? (level.introText || '') : '';
    }

    function getOutroText(levelId) {
        var level = getLevel(levelId);
        return level ? (level.outroText || '') : '';
    }

    // --- Phase 3A: Theology notes ---
    function getTheologyNote(levelId) {
        var level = getLevel(levelId);
        return level ? (level.theologyNote || '') : '';
    }

    function getTips(levelId) {
        var level = getLevel(levelId);
        return level ? (level.tips || '') : '';
    }

    function getDifficultyRating(levelId) {
        var level = getLevel(levelId);
        return level ? (level.difficultyRating || 0) : 0;
    }

    // --- Phase 3C: Phase data ---
    function getPhases(levelId) {
        var level = getLevel(levelId);
        return level ? (level.phases || []) : [];
    }

    function getCurrentPhase(levelId, progress) {
        var phases = getPhases(levelId);
        for (var i = phases.length - 1; i >= 0; i--) {
            if (progress >= phases[i].startPercent) {
                return phases[i];
            }
        }
        return phases.length > 0 ? phases[0] : null;
    }

    function getHistoricalContext(levelId) {
        var level = getLevel(levelId);
        return level ? (level.historicalContext || '') : '';
    }

    function getBackgroundDescription(levelId) {
        var level = getLevel(levelId);
        return level ? (level.backgroundDescription || '') : '';
    }

    function getTheologyQuestions(levelId) {
        var level = getLevel(levelId);
        return level ? (level.theologyQuestions || []) : [];
    }

    function getNarrativeBeats(levelId) {
        var level = getLevel(levelId);
        return level ? (level.narrativeBeats || []) : [];
    }

    function getUnlockRewards(levelId) {
        var level = getLevel(levelId);
        return level ? (level.unlockRewards || null) : null;
    }

    function getStatistics(levelId) {
        var level = getLevel(levelId);
        return level ? (level.statistics || null) : null;
    }

    // --- Phase 3C: Narrative beat lookup by time ---
    function getNarrativeBeatAtTime(levelId, currentTimeMs) {
        var beats = getNarrativeBeats(levelId);
        for (var i = 0; i < beats.length; i++) {
            if (Math.abs(beats[i].time - currentTimeMs) < 1500) {
                return beats[i];
            }
        }
        return null;
    }

    // --- Phase 3C: Narrative beats in range ---
    function getNarrativeBeatsInRange(levelId, startMs, endMs) {
        var beats = getNarrativeBeats(levelId);
        var result = [];
        for (var i = 0; i < beats.length; i++) {
            if (beats[i].time >= startMs && beats[i].time < endMs) {
                result.push(beats[i]);
            }
        }
        return result;
    }

    // --- Phase 6A: Historical timeline, characters, phase configs, narratives ---
    function getHistoricalTimeline(levelId) {
        var level = getLevel(levelId);
        return level ? (level.historicalTimeline || []) : [];
    }

    function getCharacters(levelId) {
        var level = getLevel(levelId);
        return level ? (level.characters || []) : [];
    }

    function getPhaseBeatConfig(levelId, phaseIndex) {
        var level = getLevel(levelId);
        if (!level || !level.phaseBeatConfig) return null;
        if (phaseIndex < 0 || phaseIndex >= level.phaseBeatConfig.length) return null;
        return level.phaseBeatConfig[phaseIndex];
    }

    function getPhaseNarrative(levelId, phaseIndex) {
        var level = getLevel(levelId);
        if (!level || !level.phaseNarratives) return null;
        if (phaseIndex < 0 || phaseIndex >= level.phaseNarratives.length) return null;
        return level.phaseNarratives[phaseIndex];
    }

    function getBalanceConfig(levelId) {
        var level = getLevel(levelId);
        return level ? (level.balanceConfig || null) : null;
    }

    function getDifficultyCurve(levelId) {
        var level = getLevel(levelId);
        return level ? (level.difficultyCurve || null) : null;
    }

    function getRewardTree(levelId) {
        var level = getLevel(levelId);
        return level ? (level.rewardTree || null) : null;
    }

    function getMusicDescription(levelId) {
        var level = getLevel(levelId);
        return level ? (level.musicDescription || '') : '';
    }

    function getPhaseTransitions(levelId) {
        var level = getLevel(levelId);
        return level ? (level.phaseTransitions || []) : [];
    }

    function getPhaseTransitionAtTime(levelId, time) {
        var transitions = getPhaseTransitions(levelId);
        var best = null;
        var bestDiff = Infinity;
        for (var i = 0; i < transitions.length; i++) {
            var diff = transitions[i].time - time;
            if (diff > 0 && diff < bestDiff) {
                bestDiff = diff;
                best = transitions[i];
            }
        }
        return best;
    }

    // --- New API functions ---

    function getPhasePatterns(levelId, phaseIndex) {
        var level = getLevel(levelId);
        if (!level || !level.phasePatterns) return null;
        for (var i = 0; i < level.phasePatterns.length; i++) {
            if (level.phasePatterns[i].phase === phaseIndex) {
                return level.phasePatterns[i];
            }
        }
        return null;
    }

    function getMusicConfig(levelId) {
        var level = getLevel(levelId);
        return level ? (level.musicConfig || null) : null;
    }

    function getTipsByCategory(levelId, category) {
        var level = getLevel(levelId);
        if (!level || !level.extendedTips) return [];
        var result = [];
        for (var i = 0; i < level.extendedTips.length; i++) {
            if (level.extendedTips[i].category === category) {
                result.push(level.extendedTips[i]);
            }
        }
        return result;
    }

    function getExtendedTheology(levelId) {
        var level = getLevel(levelId);
        if (!level) return { questions: [], notes: [] };
        return {
            questions: level.extendedTheologyQuestions || [],
            notes: level.theologyNotes || []
        };
    }

    // --- Phase 7: Character dialogues ---
    function getCharacterDialogues(levelId, phaseIndex) {
        var level = getLevel(levelId);
        if (!level || !level.characterDialogues) return [];
        if (phaseIndex === undefined) return level.characterDialogues;
        var result = [];
        for (var i = 0; i < level.characterDialogues.length; i++) {
            if (level.characterDialogues[i].phase === phaseIndex) {
                result.push(level.characterDialogues[i]);
            }
        }
        return result;
    }

    function getCharacterDialogueByTrigger(levelId, trigger) {
        var level = getLevel(levelId);
        if (!level || !level.characterDialogues) return null;
        var candidates = [];
        for (var i = 0; i < level.characterDialogues.length; i++) {
            if (level.characterDialogues[i].triggerCondition === trigger) {
                candidates.push(level.characterDialogues[i]);
            }
        }
        if (candidates.length === 0) return null;
        return candidates[Math.floor(Math.random() * candidates.length)];
    }

    // --- Phase 7: Liturgical calendar ---
    function getLiturgicalCalendar(levelId) {
        var level = getLevel(levelId);
        return level ? (level.liturgicalCalendar || null) : null;
    }

    // --- Phase 7: Special mechanics ---
    function getSpecialMechanics(levelId) {
        var level = getLevel(levelId);
        return level ? (level.specialMechanics || null) : null;
    }

    function getActiveMechanicRules(levelId, phaseIndex) {
        var mechanics = getSpecialMechanics(levelId);
        if (!mechanics || !mechanics.rules) return [];
        var result = [];
        for (var i = 0; i < mechanics.rules.length; i++) {
            if (mechanics.rules[i].condition.indexOf('phase == ' + phaseIndex) !== -1) {
                result.push(mechanics.rules[i]);
            }
        }
        return result;
    }

    // --- Phase 7: Tutorial overrides ---
    function getTutorialOverrides(levelId) {
        var level = getLevel(levelId);
        return level ? (level.tutorialOverrides || null) : null;
    }

    function getTutorialMessage(levelId, messageType) {
        var overrides = getTutorialOverrides(levelId);
        if (!overrides || !overrides.customMessages) return null;
        return overrides.customMessages[messageType] || null;
    }

    return {
        getLevel: getLevel,
        getAllLevels: getAllLevels,
        getLevelEvents: getLevelEvents,
        getIntroText: getIntroText,
        getOutroText: getOutroText,
        // Phase 3A
        getTheologyNote: getTheologyNote,
        getTips: getTips,
        getDifficultyRating: getDifficultyRating,
        // Phase 3C
        getPhases: getPhases,
        getCurrentPhase: getCurrentPhase,
        getHistoricalContext: getHistoricalContext,
        getBackgroundDescription: getBackgroundDescription,
        getTheologyQuestions: getTheologyQuestions,
        getNarrativeBeats: getNarrativeBeats,
        getUnlockRewards: getUnlockRewards,
        getStatistics: getStatistics,
        getNarrativeBeatAtTime: getNarrativeBeatAtTime,
        getNarrativeBeatsInRange: getNarrativeBeatsInRange,
        // Phase 6A
        getHistoricalTimeline: getHistoricalTimeline,
        getCharacters: getCharacters,
        getPhaseBeatConfig: getPhaseBeatConfig,
        getPhaseNarrative: getPhaseNarrative,
        getBalanceConfig: getBalanceConfig,
        getDifficultyCurve: getDifficultyCurve,
        getRewardTree: getRewardTree,
        getMusicDescription: getMusicDescription,
        getPhaseTransitions: getPhaseTransitions,
        getPhaseTransitionAtTime: getPhaseTransitionAtTime,
        // New API
        getPhasePatterns: getPhasePatterns,
        getMusicConfig: getMusicConfig,
        getTipsByCategory: getTipsByCategory,
        getExtendedTheology: getExtendedTheology,
        // Phase 7
        getCharacterDialogues: getCharacterDialogues,
        getCharacterDialogueByTrigger: getCharacterDialogueByTrigger,
        getLiturgicalCalendar: getLiturgicalCalendar,
        getSpecialMechanics: getSpecialMechanics,
        getActiveMechanicRules: getActiveMechanicRules,
        getTutorialOverrides: getTutorialOverrides,
        getTutorialMessage: getTutorialMessage
    };
})();
