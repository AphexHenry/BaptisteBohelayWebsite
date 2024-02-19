(function() {
    'use strict';

    // Wrapper around camera plugin
    app.factory('analyzeParserService', ['updateCallService', function(updateCallService) {

        var audioMovementFactory = {};

        var lastIndex = 0;

        var getAttack = function(timeMs) {
            var lastIndexTime = sAttacks[lastIndex][0];
            if(timeMs >= lastIndexTime) {
                lastIndex++;
                return true;
            }
            else {
                return false;
            }
        };

        audioMovementFactory.getAttack = getAttack;
        return audioMovementFactory;

    }]);
})();   // use strict