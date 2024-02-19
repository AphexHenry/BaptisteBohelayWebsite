(function() {
    'use strict';

// Wrapper around camera plugin
    app.factory('updateCallService',
        function() {

            var updateCallFactory = {};
            var updateCalls = [];
            var lastUpdate = Date.now();

            animate();
            function animate() {

                requestAnimationFrame( animate );
                render();
            }

            function render() {
                var time = Date.now() / 1000;
                var delta = time - lastUpdate;
                delta = Math.min(0.1);

                for(var i in updateCalls) {
                    updateCalls[i](delta);
                }
            }

            var noiseService = {};

            updateCallFactory.attach = function(method) {
                updateCalls.push(method);
            };

            return updateCallFactory;

        });
})();   // use strict
