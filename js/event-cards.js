/**
 * Event Cards System — 历史中的三重光
 * Strategic event cards that modify lane weights and scoring during gameplay.
 * Phase 3C: 10 cross-theme cards, card combo system, card choice mechanic,
 *           extended theology text, card synergy tracking, enhanced rendering.
 */
var EventCards = (function () {
    // --- Card Definitions ---
    var CARD_DEFS = {
        // Creation theme (Level 1)
        ecology_crisis: {
            id: 'ecology_crisis',
            title: '生态危机',
            description: '工业化的代价…创造在呻吟，受造之物的叹息你可听见？',
            theology: '受造之物切望等候，指望脱离败坏的辖制。',
            extendedTheology: '罗马书第八章描绘了受造之物的共同叹息——生态危机不只是环境问题，而是整个受造界对救赎的渴望。人类的管理职分（创世记1:28）意味着责任而非掠夺。',
            themes: ['creation'],
            favoredLanes: [0],
            penalizedLanes: [1, 2],
            duration: 12000,
            weightShift: [1.5, 0.5, 0.5],
            effect: 'glow_lane_0'
        },
        beauty_creation: {
            id: 'beauty_creation',
            title: '受造之美',
            description: '山川湖海都在歌颂——创造的和谐令人敬畏。',
            theology: '诸天述说上帝的荣耀，穹苍传扬他的手段。',
            extendedTheology: '诗篇19篇宣告自然是无声的启示——受造之美不仅是审美的，更是神学的。每一朵花的绽放都在诉说创造主的心意， beauty is a sacrament of presence.',
            themes: ['creation'],
            favoredLanes: [0],
            penalizedLanes: [],
            duration: 10000,
            weightShift: [2.0, 1.0, 1.0],
            effect: 'glow_lane_0'
        },
        technology_question: {
            id: 'technology_question',
            title: '技术的质问',
            description: '人工智能、基因编辑…人类是否在扮演上帝？',
            theology: '知识的增加是否带来智慧的深厚？创造的界限何在？',
            extendedTheology: '巴别塔的故事提醒我们，技术的傲慢可以成为新的偶像。真正的智慧不在于能力的扩张，而在于在界限面前的谦卑——认识自己受造的身份。',
            themes: ['creation', 'incarnation'],
            favoredLanes: [0, 2],
            penalizedLanes: [1],
            duration: 11000,
            weightShift: [1.3, 0.7, 1.3],
            effect: 'glow_lane_0_2'
        },
        cosmic_wonder: {
            id: 'cosmic_wonder',
            title: '宇宙的奇观',
            description: '从星系的旋转到量子的舞蹈——宇宙的奥秘指向何方？',
            theology: '自从造天地以来，上帝的永能和神性是明明可知的。',
            extendedTheology: '保罗在罗马书1:20中宣告，自然的宏大与精微都是上帝属性的映射。宇宙的奇妙秩序不是偶然的产物，而是创造主智慧的印记。',
            themes: ['creation'],
            favoredLanes: [0],
            penalizedLanes: [],
            duration: 10000,
            weightShift: [1.8, 1.0, 1.0],
            effect: 'glow_lane_0'
        },
        biodiversity_loss: {
            id: 'biodiversity_loss',
            title: '生物多样性消逝',
            description: '物种以惊人的速度灭绝——我们是否辜负了管理之职？',
            theology: '上帝将管理受造之物的责任交托于人，这责任何其沉重。',
            extendedTheology: '挪亚方舟的故事是第一次生态保护行动——上帝吩咐保存每一个物种。当物种消逝，不只是生物学的损失，更是上帝创造的丰富性的减损。',
            themes: ['creation'],
            favoredLanes: [0],
            penalizedLanes: [2],
            duration: 11000,
            weightShift: [1.6, 1.0, 0.6],
            effect: 'glow_lane_0'
        },
        climate_justice: {
            id: 'climate_justice',
            title: '气候正义',
            description: '气候变化影响最深的是穷人——创造与公义不可分割。',
            theology: '义与义之间，土地与人民之间，有着不可断裂的纽带。',
            extendedTheology: '气候危机揭示了创造的完整性和人类命运的共同体性质。圣经中的"安息年"（利未记25章）提醒我们，土地的安息与人的安息是相连的——对土地的不公就是对人的不公。',
            themes: ['creation', 'incarnation'],
            favoredLanes: [0, 1],
            penalizedLanes: [2],
            duration: 12000,
            weightShift: [1.4, 1.4, 0.5],
            effect: 'glow_lane_0_1'
        },

        // Incarnation theme (Level 2)
        poverty_cry: {
            id: 'poverty_cry',
            title: '穷人的呼声',
            description: '道成肉身的上帝站在穷人一边——你听见他们的声音吗？',
            theology: '你们为我这弟兄中最小的一个所做的，就是为我做的。',
            extendedTheology: '马太福音25章将服务穷人与服务基督等同——这不是比喻，而是本体论的宣告。贫穷不是命运，而是结构性罪性的显影。道成肉身意味着上帝进入了人类贫穷的最深处。',
            themes: ['incarnation'],
            favoredLanes: [1],
            penalizedLanes: [0],
            duration: 12000,
            weightShift: [0.5, 1.8, 1.0],
            effect: 'glow_lane_1'
        },
        refugee_crisis: {
            id: 'refugee_crisis',
            title: '难民危机',
            description: '流离失所的人们——圣家庭也曾是难民。',
            theology: '客旅中接待一个，就是接待基督自己。',
            extendedTheology: '耶稣一家逃往埃及（马太福音2:13-15），使上帝之子成为难民。希伯来书13:2提醒我们"不可忘记用爱心接待客旅"。在每一个流离失所的面孔背后，是基督的容颜。',
            themes: ['incarnation', 'communion'],
            favoredLanes: [1, 2],
            penalizedLanes: [0],
            duration: 11000,
            weightShift: [0.6, 1.4, 1.4],
            effect: 'glow_lane_1_2'
        },
        suffering_question: {
            id: 'suffering_question',
            title: '苦难之问',
            description: '如果上帝是爱，为何允许苦难？十字架是唯一的回答。',
            theology: '上帝没有从苦难之外回答苦难，而是进入了苦难之中。',
            extendedTheology: '约伯记没有给出苦难的哲学解释，而是将问题带入与上帝面对面的关系之中。十字架不是苦难的答案，而是上帝与苦难同在的终极证明——神学不应解释苦难，而应陪伴苦难。',
            themes: ['incarnation'],
            favoredLanes: [1],
            penalizedLanes: [],
            duration: 10000,
            weightShift: [1.0, 1.6, 1.0],
            effect: 'glow_lane_1'
        },
        incarnation_mystery: {
            id: 'incarnation_mystery',
            title: '道成肉身的奥秘',
            description: '无限者成为有限——上帝进入了历史的每一寸肌理。',
            theology: '道成了肉身，住在我们中间，充充满满地有恩典有真理。',
            extendedTheology: '迦克墩信经宣告基督是完全的神也是完全的人——这不是逻辑的矛盾，而是爱的极致。无限甘愿受限于有限，永恒甘愿进入时间——道成肉身是上帝对物质世界最深的肯定。',
            themes: ['incarnation'],
            favoredLanes: [1],
            penalizedLanes: [],
            duration: 10000,
            weightShift: [1.0, 2.0, 1.0],
            effect: 'glow_lane_1'
        },
        compassion_act: {
            id: 'compassion_act',
            title: '慈悲的行动',
            description: '怜悯不只是情感——它是改变结构的行动。',
            theology: '怜悯公义并行，如同溪水与江河同源。',
            extendedTheology: '好撒马利亚人的比喻（路加福音10章）重新定义了"邻舍"——怜悯超越了民族、宗教和社会的边界。真正的慈悲必然导致行动，而这行动必然挑战不义的结构。',
            themes: ['incarnation', 'spirit'],
            favoredLanes: [1, 2],
            penalizedLanes: [],
            duration: 11000,
            weightShift: [0.8, 1.5, 1.5],
            effect: 'glow_lane_1_2'
        },
        marginal_voices: {
            id: 'marginal_voices',
            title: '边缘的声音',
            description: '被忽视的群体在呼喊——道成肉身的上帝站在他们中间。',
            theology: '上帝拣选了世上愚拙的、软弱的，叫有智慧的羞愧。',
            extendedTheology: '哥林多前书1:27-28宣告了上帝的"优先选择"——不是权力的中心，而是社会的边缘。马利亚的尊主颂（路加福音1:46-55）是一首革命性的诗歌，宣告上帝推翻了权势者的宝座。',
            themes: ['incarnation'],
            favoredLanes: [1],
            penalizedLanes: [0],
            duration: 10000,
            weightShift: [0.5, 1.8, 1.0],
            effect: 'glow_lane_1'
        },

        // Holy Spirit theme (Level 3)
        community_discernment: {
            id: 'community_discernment',
            title: '群体分辨',
            description: '圣灵在群体中运行——真理不是个人的专利，而是共同的寻找。',
            theology: '圣灵赐给各人不同的恩赐，为要建立基督的身体。',
            extendedTheology: '耶路撒冷会议（使徒行传15章）展示了群体分辨的典范——不是权威的裁定，而是"圣灵和我们定意"的共同 discernment。真理在对话中显现，而非在独白中。',
            themes: ['spirit', 'church'],
            favoredLanes: [2],
            penalizedLanes: [],
            duration: 11000,
            weightShift: [1.0, 1.0, 1.8],
            effect: 'glow_lane_2'
        },
        inner_voice: {
            id: 'inner_voice',
            title: '内心的微声',
            description: '在喧嚣中辨认圣灵的声音——安静下来，聆听。',
            theology: '你们要安静，要知道我是上帝。',
            extendedTheology: '以利亚在何烈山不是在风暴中，而是在"微小的声音"中遇见上帝（列王纪上19:12）。沙漠教父的传统教导我们，安静不是空的，而是充满了上帝的同在。',
            themes: ['spirit'],
            favoredLanes: [2],
            penalizedLanes: [0, 1],
            duration: 10000,
            weightShift: [0.5, 0.5, 2.0],
            effect: 'glow_lane_2'
        },
        prophetic_witness: {
            id: 'prophetic_witness',
            title: '先知性的见证',
            description: '先知不是预言未来的人，而是对当下说出真理的人。',
            theology: '先知为真理站立，即使整个世代都沉默。',
            extendedTheology: '阿摩司从提哥亚的牧羊人成为北国的先知——先知的权威不来自体制，而来自对上帝心意的敏锐。先知性的声音在任何时代都是必要的，因为权力永远倾向于自我辩护。',
            themes: ['spirit', 'incarnation'],
            favoredLanes: [2, 1],
            penalizedLanes: [],
            duration: 12000,
            weightShift: [0.8, 1.4, 1.4],
            effect: 'glow_lane_1_2'
        },
        spiritual_gifts: {
            id: 'spiritual_gifts',
            title: '属灵恩赐',
            description: '圣灵赐下多元的恩赐——不是竞争，而是互补。',
            theology: '恩赐原有分别，圣灵却是一位。',
            extendedTheology: '哥林多前书12章描绘了一个有机的身体——每一个恩赐都是必要的，没有一个可以自称独立。圣灵的多元性反对一切单一化的权力结构，呼召我们进入一种彼此需要的脆弱关系中。',
            themes: ['spirit', 'church'],
            favoredLanes: [0, 2],
            penalizedLanes: [],
            duration: 10000,
            weightShift: [1.4, 1.0, 1.4],
            effect: 'glow_lane_0_2'
        },
        unity_diversity: {
            id: 'unity_diversity',
            title: '多元中的合一',
            description: '差异不是威胁——在圣灵中，多元成为共融的源泉。',
            theology: '身体是一个，却有许多肢体。',
            extendedTheology: '五旬节（使徒行传2章）的奇迹不是统一语言，而是每个人听见自己的方言——合一不消灭差异，而是在差异中实现共融。巴别塔的逆转不是回到一种语言，而是在多元中实现理解。',
            themes: ['spirit', 'communion'],
            favoredLanes: [0, 1, 2],
            penalizedLanes: [],
            duration: 10000,
            weightShift: [1.3, 1.3, 1.3],
            effect: 'glow_all'
        },
        prayer_movement: {
            id: 'prayer_movement',
            title: '祈祷的运动',
            description: '祈祷不是逃避世界，而是更深地进入世界的苦难。',
            theology: '祈祷是圣灵在我们里面叹息，用说不出的祷告托住一切。',
            extendedTheology: '罗马书8:26告诉我们，圣灵用"说不出来的叹息"替我们祷告——祈祷不是我们找到合适的词语，而是圣灵在我们无词之处代求。祈祷是参与上帝对世界的忧伤与盼望。',
            themes: ['spirit'],
            favoredLanes: [2],
            penalizedLanes: [],
            duration: 10000,
            weightShift: [1.0, 1.0, 1.6],
            effect: 'glow_lane_2'
        },

        // Church theme (Level 4)
        church_conflict: {
            id: 'church_conflict',
            title: '教会冲突',
            description: '分歧与争端——三重光在分裂中如何保持平衡？',
            theology: '你们要彼此和睦——教会是和好的圣事。',
            extendedTheology: '保罗与巴拿巴的分歧（使徒行传15:36-41）甚至导致他们分道扬镳——但分裂并不意味着恩赐的终止。教会的冲突史提醒我们，合一不是没有分歧，而是在分歧中选择爱。',
            themes: ['church'],
            favoredLanes: [0, 1],
            penalizedLanes: [2],
            duration: 12000,
            weightShift: [1.4, 1.4, 0.6],
            effect: 'glow_lane_0_1'
        },
        reformation: {
            id: 'reformation',
            title: '改革运动',
            description: '回到源头——改革的本质是对三重光的重新发现。',
            theology: '不断改革（Ecclesia semper reformanda）——教会始终需要回归福音的核心。',
            extendedTheology: '宗教改革不是单一事件，而是一个持续的精神——"唯独恩典、唯独信心、唯独圣经、唯独基督、唯独上帝的荣耀"。改革的精神是自我批判的勇气，是对传统的忠诚与超越的辩证。',
            themes: ['church', 'spirit'],
            favoredLanes: [0, 1, 2],
            penalizedLanes: [],
            duration: 11000,
            weightShift: [1.3, 1.3, 1.3],
            effect: 'glow_all'
        },
        persecution_witness: {
            id: 'persecution_witness',
            title: '迫害中的见证',
            description: '在火焰中，信仰是否更加纯粹？殉道者的血是教会的种子。',
            theology: '为义受逼迫的人有福了，因为天国是他们的。',
            extendedTheology: '特土良说"殉道者的血是教会的种子"——从罗马竞技场到现代的迫害，见证（marturia）的本质没有改变。启示录中的教会不是权力的象征，而是羔羊的跟随者。',
            themes: ['church', 'incarnation'],
            favoredLanes: [1, 2],
            penalizedLanes: [],
            duration: 12000,
            weightShift: [0.8, 1.5, 1.5],
            effect: 'glow_lane_1_2'
        },
        corruption_scandal: {
            id: 'corruption_scandal',
            title: '权力腐败',
            description: '当教会与权力结合——三重光的平衡被打破。',
            theology: '权力使人腐化，绝对的权力绝对腐化——教会亦不例外。',
            extendedTheology: '中世纪教会的历史是权力腐蚀信仰的警示录——从君士坦丁的"捐赠"到宗教战争。耶稣在旷野拒绝了权力的试探（马太福音4章），教会的权力欲望是对这一拒绝的背叛。',
            themes: ['church'],
            favoredLanes: [],
            penalizedLanes: [0, 1, 2],
            duration: 10000,
            weightShift: [0.7, 0.7, 0.7],
            effect: 'dim_all'
        },
        mission_history: {
            id: 'mission_history',
            title: '宣教的历史',
            description: '福音传遍天下——但传教是否伴随着尊重与谦卑？',
            theology: '宣教不是文化的征服，而是在尊重中见证真理。',
            extendedTheology: '宣教的历史既有忠心的见证，也有文化帝国主义的阴影。保罗在雅典（使徒行传17章）展示了尊重本地文化的宣教模式——他引用希腊诗人的话来建立对话，而非强加外来框架。',
            themes: ['church', 'communion'],
            favoredLanes: [0, 1, 2],
            penalizedLanes: [],
            duration: 11000,
            weightShift: [1.3, 1.3, 1.3],
            effect: 'glow_all'
        },

        // Communion theme (Level 5)
        interfaith_dialogue: {
            id: 'interfaith_dialogue',
            title: '宗教间对话',
            description: '在差异中寻找真理的交汇——对话不是妥协，而是更深的见证。',
            theology: '在一切真理中，圣灵都在运行。',
            extendedTheology: '梵二会议的《教会对非基督宗教态度宣言》开创了对话的新纪元——尊重不是相对主义，而是承认真理的普遍性。对话是圣灵的工作，不是我们的策略。',
            themes: ['communion', 'spirit'],
            favoredLanes: [0, 1, 2],
            penalizedLanes: [],
            duration: 12000,
            weightShift: [1.2, 1.2, 1.2],
            effect: 'glow_all'
        },
        ecological_spirituality: {
            id: 'ecological_spirituality',
            title: '生态灵性',
            description: '受造之物不是资源，而是上帝启示的媒介。',
            theology: '受造之物与上帝的儿女一同叹息，等候得赎。',
            extendedTheology: '亚西西的方济各称太阳为"太阳兄弟"、月亮为"月亮姐妹"——这是一种深刻的关系性宇宙观。生态灵性不是新发明，而是对最古老的创造神学的重新发现。',
            themes: ['communion', 'creation'],
            favoredLanes: [0, 2],
            penalizedLanes: [],
            duration: 11000,
            weightShift: [1.5, 1.0, 1.5],
            effect: 'glow_lane_0_2'
        },
        liberation_theology: {
            id: 'liberation_theology',
            title: '解放神学',
            description: '上帝站在被压迫者一边——这是偏见还是启示？',
            theology: '上帝在历史中拣选了贫穷和受压迫的人，以此揭示救恩的优先选择。',
            extendedTheology: '古铁雷斯的《解放神学》重新诠释了出埃及——上帝的救赎不仅是灵魂的，也是社会结构的。出埃及不只是历史事件，而是上帝持续介入历史的范式——每一条释放的河流都是出埃及的重演。',
            themes: ['communion', 'incarnation'],
            favoredLanes: [1],
            penalizedLanes: [0],
            duration: 12000,
            weightShift: [0.6, 1.8, 1.0],
            effect: 'glow_lane_1'
        },
        digital_age: {
            id: 'digital_age',
            title: '数字时代',
            description: '虚拟连接是否带来真实的共融？屏幕背后的灵魂需要什么？',
            theology: '共融不是信息的交换，而是位格的相遇。',
            extendedTheology: '道成肉身是上帝对虚拟的拒绝——他选择了物质的真实、血肉的触碰。在数字时代，教会的挑战是如何在虚拟空间中保持位格的真实性。屏幕不能取代面对面，但可以成为通往面面的桥梁。',
            themes: ['communion', 'creation'],
            favoredLanes: [2, 0],
            penalizedLanes: [],
            duration: 10000,
            weightShift: [1.3, 0.8, 1.5],
            effect: 'glow_lane_0_2'
        },
        global_solidarity: {
            id: 'global_solidarity',
            title: '全球团结',
            description: '在一个分裂的世界中，共融意味着什么？',
            theology: '合一不是统一，而是在爱中彼此承担的差异之和。',
            extendedTheology: '早期教会的凡物公用（使徒行传2:44-45）不是共产主义实验，而是共融的经济表达。全球团结意味着将"我的"转化为"我们的"，将匮乏转化为分享——这是三一神内在共融的外在彰显。',
            themes: ['communion', 'church'],
            favoredLanes: [0, 1, 2],
            penalizedLanes: [],
            duration: 12000,
            weightShift: [1.4, 1.4, 1.4],
            effect: 'glow_all'
        },

        // --- Phase 3C: Cross-theme cards (10 new cards) ---

        cultural_encounter: {
            id: 'cultural_encounter',
            title: '文化的相遇',
            description: '当福音进入一种文化——是征服还是对话？道成肉身回答了这个问题。',
            theology: '道成了肉身——上帝以人类文化的形式启示自己。',
            extendedTheology: '道成肉身是最伟大的文化相遇——永恒进入了犹太文化的土壤。利玛窦在中国、尼布尔在印度的宣教实验都指向同一个真理：福音尊重文化，但也会挑战文化中的不义。',
            themes: ['incarnation', 'communion', 'creation'],
            favoredLanes: [0, 1],
            penalizedLanes: [],
            duration: 11000,
            weightShift: [1.4, 1.4, 0.8],
            effect: 'glow_lane_0_1'
        },
        wisdom_tradition: {
            id: 'wisdom_tradition',
            title: '智慧的传统',
            description: '创造的秩序中蕴含着智慧——从箴言到量子物理，智慧在呼唤。',
            theology: '智慧在街市上呼喊，在宽阔处发声。',
            extendedTheology: '箴言8章描绘智慧为创造的共同建筑师——"在耶和华造化的起头，就有了我"。这暗示着上帝的创造不是任意的，而是充满了可理解的秩序。科学与信仰的对话，本质上是对这智慧的不同角度的追寻。',
            themes: ['creation', 'spirit'],
            favoredLanes: [0, 2],
            penalizedLanes: [],
            duration: 10000,
            weightShift: [1.5, 0.8, 1.5],
            effect: 'glow_lane_0_2'
        },
        mystical_union: {
            id: 'mystical_union',
            title: '神秘的联合',
            description: '圣灵引导我们进入与上帝的深层联合——超越理性，不否定理性。',
            theology: '与主联合的，便是与主成为一灵。',
            extendedTheology: '保罗在哥林多前书6:17宣告了一种本体论的联合——不是泛神论的消融，而是在位格关系中的深度共融。从奥古斯丁到十字约翰，神秘传统提醒我们，上帝既超越理性，也不与理性矛盾。',
            themes: ['spirit', 'communion'],
            favoredLanes: [1, 2],
            penalizedLanes: [],
            duration: 11000,
            weightShift: [0.8, 1.4, 1.6],
            effect: 'glow_lane_1_2'
        },
        eschatological_hope: {
            id: 'eschatological_hope',
            title: '末世的盼望',
            description: '历史不是循环的，而是朝向一个目标——新天新地的应许。',
            theology: '看哪，我将一切都更新了。',
            extendedTheology: '启示录21章不是对现世的逃避，而是对现世最深的肯定——如果上帝要更新一切，那么现在的一切都值得珍视和守护。末世论不是关于毁灭的恐惧，而是关于更新的盼望。',
            themes: ['creation', 'incarnation', 'spirit', 'communion'],
            favoredLanes: [0, 1, 2],
            penalizedLanes: [],
            duration: 12000,
            weightShift: [1.4, 1.4, 1.4],
            effect: 'glow_all'
        },
        creation_spirituality: {
            id: 'creation_spirituality',
            title: '创造灵性',
            description: '圣灵在创造之初就运行——创造、圣灵、敬拜是三重的旋律。',
            theology: '上帝的灵运行在水面上——创造本身就是圣灵的工作。',
            extendedTheology: '创世记1:2的"灵运行"暗示了一种持续的、动态的创造——圣灵不是创造的旁观者，而是创造的内驱力。每一朵花的绽放都是圣灵的舞蹈，每一次呼吸都是创造的重演。',
            themes: ['creation', 'spirit'],
            favoredLanes: [0, 2],
            penalizedLanes: [1],
            duration: 10000,
            weightShift: [1.6, 0.7, 1.6],
            effect: 'glow_lane_0_2'
        },
        social_trinity: {
            id: 'social_trinity',
            title: '社会的三一',
            description: '三一神不是一个孤独的个体——上帝本身就是关系和共融。',
            theology: '你们要去，使万民作门徒，奉父、子、圣灵的名给他们施洗。',
            extendedTheology: '东正教的传统强调三一神的社会性——上帝不是孤独的权能者，而是三位之间的永恒之爱。这意味着权力不是上帝的本质，关系才是。社会的三一论为民主、人权和社会正义提供了最深的神学基础。',
            themes: ['spirit', 'church', 'communion'],
            favoredLanes: [0, 1, 2],
            penalizedLanes: [],
            duration: 11000,
            weightShift: [1.3, 1.3, 1.3],
            effect: 'glow_all'
        },
        kenosis_service: {
            id: 'kenosis_service',
            title: '虚己的服务',
            description: '基督倒空自己——权力不是掌握，而是释放。',
            theology: '反倒虚己，取了奴仆的形像，成为人的样式。',
            extendedTheology: '腓立比书2:5-11的"虚己颂"是基督教权力观的核心——基督的权力不是攫取而是释放，不是统治而是服务。Kenosis（虚己）意味着权力在爱中的自我限制，这是对一切权力神学的最深刻的颠覆。',
            themes: ['incarnation', 'church'],
            favoredLanes: [1],
            penalizedLanes: [0],
            duration: 12000,
            weightShift: [0.6, 1.8, 1.2],
            effect: 'glow_lane_1'
        },
        cosmic_christ: {
            id: 'cosmic_christ',
            title: '宇宙的基督',
            description: '基督不只是个人的救主——万有都是藉着他造的，也是为他造的。',
            theology: '万有都是在他里面造的，无论是天上的、地上的。',
            extendedTheology: '歌罗西书1:15-20描绘了一个宇宙性的基督——他不只是以色列的弥赛亚，更是整个宇宙的创造者和维系者。德日进的"宇宙基督"概念将进化的终点指向了基督的充满——一切受造物都在基督中找到自己的完成。',
            themes: ['creation', 'incarnation'],
            favoredLanes: [0, 1],
            penalizedLanes: [],
            duration: 11000,
            weightShift: [1.5, 1.5, 0.8],
            effect: 'glow_lane_0_1'
        },
        pentecost_reversal: {
            id: 'pentecost_reversal',
            title: '五旬节的逆转',
            description: '巴别塔的咒诅在五旬节被逆转——语言不再是障碍，而是恩赐。',
            theology: '各人听见门徒用众人的乡谈说话，就甚纳闷。',
            extendedTheology: '巴别塔（创世记11章）是人类试图通过统一语言达到天的傲慢；五旬节（使徒行传2章）是上帝通过多元语言降临到地的谦卑。这不是回到统一，而是在多元中实现真正的沟通——差异成为祝福而非咒诅。',
            themes: ['spirit', 'church'],
            favoredLanes: [0, 2],
            penalizedLanes: [],
            duration: 10000,
            weightShift: [1.3, 0.9, 1.5],
            effect: 'glow_lane_0_2'
        },
        new_creation: {
            id: 'new_creation',
            title: '新创造',
            description: '在基督里，一切都是新的——三重光汇聚于最终的更新。',
            theology: '若有人在基督里，他就是新造的人。',
            extendedTheology: '哥林多后书5:17不只是关于个人的重生——"新创造"（kaine ktisis）在保罗的思想中指向整个宇宙的更新。启示录的新耶路撒冷从天而降，意味着天与地的最终合一——这是三重光（创造、道成肉身、圣灵）的终极汇聚。',
            themes: ['creation', 'incarnation', 'spirit', 'communion'],
            favoredLanes: [0, 1, 2],
            penalizedLanes: [],
            duration: 12000,
            weightShift: [1.5, 1.5, 1.5],
            effect: 'glow_all'
        }
    };

    // --- Runtime State ---
    var activeCard = null;
    var cardQueue = [];
    var cardStartTime = 0;
    var cardElapsed = 0;
    var cardsActivated = 0;

    var SLIDE_IN_MS = 500;
    var SLIDE_OUT_MS = 500;

    // --- Phase 3C: Card combo system ---
    var CARD_COMBO_WINDOW = 3000; // ms between cards to maintain combo
    var cardComboCount = 0;
    var cardComboTimer = 0;
    var cardComboBonus = 0;
    var lastCardEndTime = 0;

    // --- Phase 3C: Card choice mechanic ---
    var choiceState = {
        pending: false,
        options: [],
        selectedIndex: -1,
        time: 0
    };

    // --- Phase 3C: Card synergy tracking ---
    var synergyHistory = [];
    var synergyBonus = 0;

    // --- Phase 3C: Card activation animation ---
    var activationFlash = 0;
    var activationColor = '#fff';

    function init() {
        activeCard = null;
        cardQueue = [];
        cardStartTime = 0;
        cardElapsed = 0;
        cardsActivated = 0;
        cardComboCount = 0;
        cardComboTimer = 0;
        cardComboBonus = 0;
        lastCardEndTime = 0;
        choiceState = { pending: false, options: [], selectedIndex: -1, time: 0 };
        synergyHistory = [];
        synergyBonus = 0;
        activationFlash = 0;
        activationColor = '#fff';
    }

    function reset() {
        activeCard = null;
        cardQueue = [];
        cardStartTime = 0;
        cardElapsed = 0;
        cardsActivated = 0;
        cardComboCount = 0;
        cardComboTimer = 0;
        cardComboBonus = 0;
        lastCardEndTime = 0;
        choiceState = { pending: false, options: [], selectedIndex: -1, time: 0 };
        synergyHistory = [];
        synergyBonus = 0;
        activationFlash = 0;
        activationColor = '#fff';
    }

    function loadEvents(levelEvents) {
        cardQueue = [];
        if (!levelEvents) return;
        for (var i = 0; i < levelEvents.length; i++) {
            cardQueue.push({
                time: levelEvents[i].time,
                eventId: levelEvents[i].eventId,
                cardDef: CARD_DEFS[levelEvents[i].eventId] || null
            });
        }
        cardQueue.sort(function (a, b) { return a.time - b.time; });
    }

    function update(dt, currentTime) {
        // Check for new card activation
        if (!activeCard && cardQueue.length > 0) {
            var next = cardQueue[0];
            if (currentTime >= next.time) {
                activeCard = {
                    def: next.cardDef,
                    eventId: next.eventId
                };
                cardStartTime = currentTime;
                cardElapsed = 0;
                cardsActivated++;
                cardQueue.shift();

                // Phase 3C: Update card combo
                updateCardCombo(currentTime);

                // Phase 3C: Track synergy
                if (activeCard.def && activeCard.def.themes) {
                    synergyHistory.push({
                        themes: activeCard.def.themes.slice(),
                        time: currentTime
                    });
                    // Keep only last 5 cards
                    while (synergyHistory.length > 5) {
                        synergyHistory.shift();
                    }
                    calculateSynergy();
                }

                // Phase 3C: Activation flash
                if (activeCard.def) {
                    var LANE_COLORS = ['#4FC3F7', '#FFD54F', '#CE93D8'];
                    if (activeCard.def.favoredLanes && activeCard.def.favoredLanes.length > 0) {
                        activationColor = LANE_COLORS[activeCard.def.favoredLanes[0]];
                    } else {
                        activationColor = '#FFD54F';
                    }
                    activationFlash = 1.0;
                }

                // Trigger animation
                if (typeof Animation !== 'undefined' && activeCard.def) {
                    Animation.cardActivateEffect(activeCard.def);
                }
            }
        }

        // Update active card timing
        if (activeCard) {
            cardElapsed += dt * 1000;
            var dur = activeCard.def ? activeCard.def.duration : 10000;
            if (cardElapsed >= dur) {
                lastCardEndTime = currentTime;
                activeCard = null;
                cardElapsed = 0;
            }
        }

        // Phase 3C: Decay card combo timer
        if (cardComboTimer > 0) {
            cardComboTimer -= dt * 1000;
            if (cardComboTimer <= 0) {
                cardComboCount = 0;
                cardComboBonus = 0;
                cardComboTimer = 0;
            }
        }

        // Phase 3C: Decay activation flash
        if (activationFlash > 0) {
            activationFlash = Math.max(0, activationFlash - dt * 3);
        }
    }

    // --- Phase 3C: Card combo system ---
    function updateCardCombo(currentTime) {
        if (lastCardEndTime > 0 && (currentTime - lastCardEndTime) < CARD_COMBO_WINDOW) {
            cardComboCount++;
            cardComboBonus = 0.1 * cardComboCount;
            cardComboTimer = CARD_COMBO_WINDOW;

            // Show combo notification
            if (cardComboCount >= 2 && typeof Animation !== 'undefined') {
                Animation.showAchievement(
                    'Card Combo x' + cardComboCount + '!',
                    '卡牌连击 — 得分加成 +' + Math.round(cardComboBonus * 100) + '%'
                );
            }
        } else {
            cardComboCount = 1;
            cardComboBonus = 0;
            cardComboTimer = CARD_COMBO_WINDOW;
        }
    }

    // --- Phase 3C: Card synergy calculation ---
    function calculateSynergy() {
        if (synergyHistory.length < 2) {
            synergyBonus = 0;
            return;
        }

        // Count shared themes across recent cards
        var themeCounts = {};
        for (var i = 0; i < synergyHistory.length; i++) {
            var themes = synergyHistory[i].themes;
            for (var t = 0; t < themes.length; t++) {
                themeCounts[themes[t]] = (themeCounts[themes[t]] || 0) + 1;
            }
        }

        // Find themes that appear in 3+ recent cards
        var synergisticThemes = 0;
        for (var key in themeCounts) {
            if (themeCounts.hasOwnProperty(key) && themeCounts[key] >= 3) {
                synergisticThemes++;
            }
        }

        synergyBonus = synergisticThemes * 0.05;
    }

    // --- Phase 3C: Card choice mechanic ---
    function generateCardChoices(currentTime) {
        // Pick 2-3 random card IDs from CARD_DEFS
        var allIds = [];
        for (var key in CARD_DEFS) {
            if (CARD_DEFS.hasOwnProperty(key)) {
                allIds.push(key);
            }
        }

        // Shuffle and pick 3
        for (var i = allIds.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var temp = allIds[i];
            allIds[i] = allIds[j];
            allIds[j] = temp;
        }

        var choices = [];
        var count = Math.min(3, allIds.length);
        for (var c = 0; c < count; c++) {
            choices.push({
                eventId: allIds[c],
                cardDef: CARD_DEFS[allIds[c]]
            });
        }

        return choices;
    }

    function presentChoice(currentTime) {
        choiceState.options = generateCardChoices(currentTime);
        choiceState.pending = true;
        choiceState.selectedIndex = -1;
        choiceState.time = currentTime;
    }

    function selectChoice(index) {
        if (!choiceState.pending || index < 0 || index >= choiceState.options.length) return false;
        var chosen = choiceState.options[index];
        choiceState.selectedIndex = index;
        choiceState.pending = false;

        // Activate the chosen card
        activeCard = {
            def: chosen.cardDef,
            eventId: chosen.eventId
        };
        cardStartTime = choiceState.time;
        cardElapsed = 0;
        cardsActivated++;

        // Trigger animation
        if (typeof Animation !== 'undefined' && activeCard.def) {
            Animation.cardActivateEffect(activeCard.def);
        }

        return true;
    }

    function dismissChoice() {
        choiceState.pending = false;
        choiceState.selectedIndex = -1;
    }

    function getActiveCard() {
        return activeCard;
    }

    function getCardProgress() {
        if (!activeCard || !activeCard.def) return 0;
        var dur = activeCard.def.duration;
        var displayDur = dur - SLIDE_IN_MS - SLIDE_OUT_MS;
        if (displayDur < 0) displayDur = 0;

        if (cardElapsed < SLIDE_IN_MS) {
            return cardElapsed / SLIDE_IN_MS; // slide-in 0→1
        }
        if (cardElapsed >= SLIDE_IN_MS + displayDur) {
            var outProgress = (cardElapsed - SLIDE_IN_MS - displayDur) / SLIDE_OUT_MS;
            return 1 - outProgress; // slide-out 1→0
        }
        return 1; // fully visible
    }

    function getWeightModifier() {
        if (!activeCard || !activeCard.def) return [1, 1, 1];
        return activeCard.def.weightShift || [1, 1, 1];
    }

    function getLaneBonus(lane) {
        if (!activeCard || !activeCard.def) return 0;
        var def = activeCard.def;
        var base = 0;
        if (def.favoredLanes && def.favoredLanes.indexOf(lane) !== -1) base = 0.5;
        if (def.penalizedLanes && def.penalizedLanes.indexOf(lane) !== -1) base = -0.3;

        // Phase 3C: Add combo bonus
        base += cardComboBonus;

        // Phase 3C: Add synergy bonus
        base += synergyBonus;

        return base;
    }

    // --- Phase 3C: Extended theology ---
    function getExtendedTheology(cardId) {
        var def = CARD_DEFS[cardId];
        if (!def) return '';
        return def.extendedTheology || def.theology || '';
    }

    // --- Phase 3C: Card combo getters ---
    function getCardComboCount() {
        return cardComboCount;
    }

    function getCardComboBonus() {
        return cardComboBonus;
    }

    function getSynergyBonus() {
        return synergyBonus;
    }

    // --- Phase 3C: Choice state getter ---
    function getChoiceState() {
        return choiceState;
    }

    // --- Phase 3C: Get cards by theme ---
    function getCardsByTheme(theme) {
        var result = [];
        for (var key in CARD_DEFS) {
            if (CARD_DEFS.hasOwnProperty(key)) {
                var def = CARD_DEFS[key];
                if (def.themes && def.themes.indexOf(theme) !== -1) {
                    result.push(def);
                }
            }
        }
        return result;
    }

    // --- Phase 3C: Get card stats ---
    function getCardStats() {
        return {
            totalCards: Object.keys(CARD_DEFS).length,
            cardsActivated: cardsActivated,
            currentCombo: cardComboCount,
            synergyBonus: synergyBonus,
            queueLength: cardQueue.length
        };
    }

    function render(ctx, canvasW, canvasH, dpr) {
        if (!activeCard || !activeCard.def) return;

        var def = activeCard.def;
        var progress = getCardProgress();
        if (progress <= 0) return;

        var bannerH = 100 * dpr;
        var targetY = 50 * dpr;
        var offsetY = -bannerH; // start off-screen
        var currentY = offsetY + (targetY - offsetY) * Math.min(progress, 1);

        // Banner background
        ctx.save();
        ctx.globalAlpha = 0.9;
        ctx.fillStyle = 'rgba(0,0,0,0.85)';
        var margin = 16 * dpr;
        var bannerW = canvasW - margin * 2;
        roundRect(ctx, margin, currentY, bannerW, bannerH, 12 * dpr);
        ctx.fill();

        // Border glow for favored lanes
        var borderColor = '#FFD54F';
        var LANE_COLORS = ['#4FC3F7', '#FFD54F', '#CE93D8'];
        if (def.favoredLanes && def.favoredLanes.length > 0) {
            borderColor = LANE_COLORS[def.favoredLanes[0]];
        }
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = 2 * dpr;
        ctx.shadowColor = borderColor;
        ctx.shadowBlur = 8 * dpr;
        roundRect(ctx, margin, currentY, bannerW, bannerH, 12 * dpr);
        ctx.stroke();
        ctx.shadowBlur = 0;

        ctx.globalAlpha = 1;

        // Title
        var fontSize = Math.round(16 * dpr);
        ctx.fillStyle = borderColor;
        ctx.font = 'bold ' + fontSize + 'px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(def.title, margin + 16 * dpr, currentY + 28 * dpr);

        // Phase 3C: Card combo indicator
        if (cardComboCount >= 2) {
            var comboFontSize = Math.round(10 * dpr);
            ctx.fillStyle = '#FFD54F';
            ctx.font = 'bold ' + comboFontSize + 'px sans-serif';
            ctx.textAlign = 'right';
            ctx.fillText('Combo x' + cardComboCount, margin + bannerW - 16 * dpr, currentY + 28 * dpr);
        }

        // Description (truncate if needed)
        var smallFont = Math.round(11 * dpr);
        ctx.fillStyle = 'rgba(255,255,255,0.8)';
        ctx.font = smallFont + 'px sans-serif';
        ctx.textAlign = 'left';
        var desc = def.description;
        if (desc.length > 40) desc = desc.substring(0, 40) + '…';
        ctx.fillText(desc, margin + 16 * dpr, currentY + 50 * dpr);

        // Theology note (smaller)
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        var theoFont = Math.round(10 * dpr);
        ctx.font = theoFont + 'px sans-serif';
        var theo = def.theology;
        if (theo.length > 45) theo = theo.substring(0, 45) + '…';
        ctx.fillText(theo, margin + 16 * dpr, currentY + 68 * dpr);

        // Favored lane indicators (dots)
        if (def.favoredLanes) {
            var dotY = currentY + 85 * dpr;
            var dotX = margin + 16 * dpr;
            var LANE_COLS = ['#4FC3F7', '#FFD54F', '#CE93D8'];
            for (var i = 0; i < def.favoredLanes.length; i++) {
                ctx.fillStyle = LANE_COLS[def.favoredLanes[i]];
                ctx.beginPath();
                ctx.arc(dotX + i * 18 * dpr, dotY, 4 * dpr, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // Phase 3C: Theme tags
        if (def.themes && def.themes.length > 0) {
            var tagX = margin + 16 * dpr + (def.favoredLanes ? def.favoredLanes.length * 18 * dpr + 10 * dpr : 0);
            var tagY = currentY + 85 * dpr;
            var THEME_COLORS = {
                creation: '#4FC3F7',
                incarnation: '#FFD54F',
                spirit: '#CE93D8',
                church: '#81C784',
                communion: '#FF8A65'
            };
            for (var ti = 0; ti < Math.min(def.themes.length, 3); ti++) {
                var themeName = def.themes[ti];
                var tagColor = THEME_COLORS[themeName] || '#999';
                ctx.fillStyle = tagColor;
                ctx.globalAlpha = 0.6;
                ctx.font = Math.round(8 * dpr) + 'px sans-serif';
                ctx.textAlign = 'left';
                ctx.fillText(themeName, tagX + ti * 50 * dpr, tagY);
            }
            ctx.globalAlpha = 1;
        }

        // Remaining time bar
        if (def.duration > 0) {
            var elapsed = cardElapsed;
            var remaining = Math.max(0, 1 - elapsed / def.duration);
            var barY = currentY + bannerH - 4 * dpr;
            ctx.fillStyle = 'rgba(255,255,255,0.15)';
            ctx.fillRect(margin + 16 * dpr, barY, bannerW - 32 * dpr, 3 * dpr);
            ctx.fillStyle = borderColor;
            ctx.fillRect(margin + 16 * dpr, barY, (bannerW - 32 * dpr) * remaining, 3 * dpr);
        }

        // Phase 3C: Activation flash overlay
        if (activationFlash > 0) {
            ctx.globalAlpha = activationFlash * 0.15;
            ctx.fillStyle = activationColor;
            roundRect(ctx, margin, currentY, bannerW, bannerH, 12 * dpr);
            ctx.fill();
            ctx.globalAlpha = 1;
        }

        ctx.restore();

        // Phase 3C: Card choice overlay
        if (choiceState.pending) {
            renderChoiceOverlay(ctx, canvasW, canvasH, dpr);
        }
    }

    // --- Phase 3C: Render choice overlay ---
    function renderChoiceOverlay(ctx, canvasW, canvasH, dpr) {
        if (!choiceState.pending || choiceState.options.length === 0) return;

        var overlayAlpha = 0.85;
        var cardW = (canvasW - 60 * dpr) / 3;
        var cardH = 160 * dpr;
        var cardY = canvasH * 0.35;
        var startX = 15 * dpr;

        // Dim background
        ctx.save();
        ctx.globalAlpha = overlayAlpha;
        ctx.fillStyle = 'rgba(0,0,0,0.9)';
        ctx.fillRect(0, 0, canvasW, canvasH);

        // Title
        ctx.globalAlpha = 1;
        ctx.fillStyle = '#FFD54F';
        ctx.font = 'bold ' + Math.round(14 * dpr) + 'px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('选择一张事件卡 / Choose a Card', canvasW / 2, cardY - 20 * dpr);

        // Render choice cards
        var LANE_COLORS = ['#4FC3F7', '#FFD54F', '#CE93D8'];
        for (var c = 0; c < choiceState.options.length; c++) {
            var opt = choiceState.options[c];
            if (!opt || !opt.cardDef) continue;

            var cx = startX + c * (cardW + 15 * dpr);

            // Card background
            ctx.fillStyle = 'rgba(30,30,50,0.95)';
            roundRect(ctx, cx, cardY, cardW, cardH, 8 * dpr);
            ctx.fill();

            // Card border
            var optBorder = '#FFD54F';
            if (opt.cardDef.favoredLanes && opt.cardDef.favoredLanes.length > 0) {
                optBorder = LANE_COLORS[opt.cardDef.favoredLanes[0]];
            }
            ctx.strokeStyle = optBorder;
            ctx.lineWidth = 2 * dpr;
            roundRect(ctx, cx, cardY, cardW, cardH, 8 * dpr);
            ctx.stroke();

            // Card title
            ctx.fillStyle = optBorder;
            ctx.font = 'bold ' + Math.round(11 * dpr) + 'px sans-serif';
            ctx.textAlign = 'center';
            var titleText = opt.cardDef.title;
            if (titleText.length > 8) titleText = titleText.substring(0, 8) + '…';
            ctx.fillText(titleText, cx + cardW / 2, cardY + 24 * dpr);

            // Card description
            ctx.fillStyle = 'rgba(255,255,255,0.7)';
            ctx.font = Math.round(9 * dpr) + 'px sans-serif';
            var cardDesc = opt.cardDef.description;
            if (cardDesc.length > 30) cardDesc = cardDesc.substring(0, 30) + '…';
            ctx.fillText(cardDesc, cx + cardW / 2, cardY + 48 * dpr);

            // Card number
            ctx.fillStyle = 'rgba(255,255,255,0.4)';
            ctx.font = 'bold ' + Math.round(20 * dpr) + 'px sans-serif';
            ctx.fillText('' + (c + 1), cx + cardW / 2, cardY + cardH - 20 * dpr);
        }

        // Instructions
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.font = Math.round(10 * dpr) + 'px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('按 1/2/3 或点击选择 / Press 1/2/3 or tap', canvasW / 2, cardY + cardH + 30 * dpr);

        ctx.restore();
    }

    function roundRect(ctx, x, y, w, h, r) {
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

    function getCardsActivated() {
        return cardsActivated;
    }

    return {
        init: init,
        reset: reset,
        loadEvents: loadEvents,
        update: update,
        render: render,
        getActiveCard: getActiveCard,
        getCardProgress: getCardProgress,
        getWeightModifier: getWeightModifier,
        getLaneBonus: getLaneBonus,
        getCardsActivated: getCardsActivated,
        CARD_DEFS: CARD_DEFS,
        // Phase 3C
        getExtendedTheology: getExtendedTheology,
        getCardComboCount: getCardComboCount,
        getCardComboBonus: getCardComboBonus,
        getSynergyBonus: getSynergyBonus,
        getChoiceState: getChoiceState,
        getCardsByTheme: getCardsByTheme,
        getCardStats: getCardStats,
        presentChoice: presentChoice,
        selectChoice: selectChoice,
        dismissChoice: dismissChoice
    };
})();
