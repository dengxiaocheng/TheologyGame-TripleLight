/**
 * Input System — 历史中的三重光
 * Keyboard input handling for rhythm gameplay.
 */
var InputSystem = (function () {
    var keysDown = {};
    var initialized = false;

    var LANE_KEYS = ['a', 's', 'd'];

    function init() {
        if (initialized) return;
        initialized = true;

        document.addEventListener('keydown', function (e) {
            if (e.repeat) return;
            var key = e.key.toLowerCase();
            keysDown[key] = true;

            if (LANE_KEYS.indexOf(key) !== -1) {
                e.preventDefault();
                var laneIndex = LANE_KEYS.indexOf(key);
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

        document.addEventListener('keyup', function (e) {
            var key = e.key.toLowerCase();
            keysDown[key] = false;

            if (typeof Game !== 'undefined' && Game.handleKeyUp) {
                Game.handleKeyUp(key);
            }
        });
    }

    function isKeyDown(key) {
        return !!keysDown[key.toLowerCase()];
    }

    function reset() {
        keysDown = {};
    }

    return {
        init: init,
        isKeyDown: isKeyDown,
        reset: reset
    };
})();
