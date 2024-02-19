(function() {
    'use strict';

    // Wrapper around camera plugin
    app.factory('settingsService', function() {

        var settingsFactory = function()
        {
            this.ATTRACTOR_SPACE = 0.2;
            this.STRENGTH_ATTRACTOR = 2.;
            this.STRENGTH_SPRING = 25.;
            this.STRENGTH_SHOW = 2.;
            this.TIME_BEFORE_OUT = 3;
            this.DISTANCE_ATTRACTOR = 0.4;
        };

        var gui = new dat.GUI({width: 300});
        $(gui.domElement).hide();

        settingsFactory.getGUI = function() {
            return gui;
        };

        return settingsFactory;

    });
})();   // use strict