/**
 * Level Data — 历史中的三重光
 * Defines configuration for all 5 levels.
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
            color: '#4FC3F7'
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
            color: '#FFD54F'
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
            color: '#CE93D8'
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
            color: '#81C784'
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
            color: '#FF8A65'
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

    return {
        getLevel: getLevel,
        getAllLevels: getAllLevels
    };
})();
