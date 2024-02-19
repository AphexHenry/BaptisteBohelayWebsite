(function() {
    'use strict';

    // Wrapper around camera plugin
    app.factory('stateIntenseService', ['settingsService', 'audioMovementService', 'stateFlowService', function(settingsService, audioMovementService, stateFlowService) {

        var stateIntenseFactory = {};
        var ATTRACTOR_IDLE_SIZE = 1.2;

        Behaviour.prototype = stateFlowService.getNew();
        Behaviour.prototype.constructor=Behaviour;

        var positionCenter = new THREE.Vector3();
        var scaleCenter = 0;

        function Behaviour(aPart, aPosition){
            this.part = aPart;
            this.randomSeed = Math.random();

            this.scale = 0;
            this.strength = 0;

            this.timer = 0;
            this.life = Math.random();
            this.attractor = new THREE.Vector3();
            this.attractorSpeed = new THREE.Vector3();
        }

        Behaviour.prototype.init = function()
        {
            var that = this;
            setTimeout(function() {
                this.strength = 0;
                //that.part.mPosition = positionCenter.clone();
                that.randomSeed = Math.random();

                var invertedSeed = (1 - that.randomSeed);
                var distanceAtt = 0.15 * invertedSeed * invertedSeed * (0.1 + Math.abs(scaleCenter));
                that.attractor = new THREE.Vector3();
                that.attractor.y = (0.5 - Math.random()) * distanceAtt;
                that.attractor.x = (0.5 - Math.random()) * distanceAtt;
                that.attractor.z = (0.5 - Math.random()) * distanceAtt;

                that.attractor.add(positionCenter);

                distanceAtt *= 0.03;
                that.attractorSpeed.x = (0.5 - Math.random()) * distanceAtt;
                that.attractorSpeed.y = (0.5 - Math.random()) * distanceAtt;
                that.attractorSpeed.z = (0.5 - Math.random()) * distanceAtt;

                //that.part.mSize = 0;
                that.scale = (0.02 + that.randomSeed * that.randomSeed * that.randomSeed * 5) * 2 * (Math.abs(scaleCenter));
                that.scale = Math.min(that.scale, 1);
            }, Math.random() * 2000);


        };

        Behaviour.prototype.getPositionCamera = function() {
            return new THREE.Vector3(0,0,0);
        };

        Behaviour.prototype.globalUpdate = function(aTimeInterval) {
            this.timer += aTimeInterval;
            positionCenter.x = Math.cos(this.timer * 0.4 +  Math.sin(this.timer * 0.1) * 10) * 0.03;
            positionCenter.y = Math.sin(this.timer * 0.81) *  (0.5 + Math.sin(this.timer * 0.15)) * 0.03;
            positionCenter.z = Math.cos(this.timer * 0.2) * (0.2 + Math.sin(this.timer * 0.05)) * 0.03;
            scaleCenter = Math.cos(this.timer * 0.3 +  Math.sin(this.timer * 0.13) * 3);
        };

        Behaviour.prototype.update = function(aTimeInterval)
        {
            aTimeInterval *= 0.4;
            this.part.mPosition.x += (this.attractor.x - this.part.mPosition.x) * aTimeInterval;
            this.part.mPosition.y += (this.attractor.y - this.part.mPosition.y) * aTimeInterval;
            this.part.mPosition.z += (this.attractor.z - this.part.mPosition.z) * aTimeInterval;

            this.attractor.addScaledVector(this.attractorSpeed, aTimeInterval);

            this.part.mSize += (this.scale * ATTRACTOR_IDLE_SIZE - this.part.mSize) * aTimeInterval * 0.4;

            var rotSpeed = this.randomSeed * 0.001;
            this.part.mRotationSpeed = new THREE.Vector3(0, 0, 0);
            this.part.mRotation.x = (rotSpeed * this.timer + 83) * Math.cos(this.randomSeed);
            this.part.mRotation.y = (rotSpeed * this.timer + 123) * Math.sin(this.randomSeed);
            this.part.mRotation.z = 0;

            this.part.scaleSpeed *= 0.95;
        };

        Behaviour.prototype.FadeOut = function(aTimeInterval)
        {
            return true;
        };

        stateIntenseFactory.getNew = function(aPart, aPosition) {
            return new Behaviour(aPart, aPosition);
        };

        return stateIntenseFactory;

    }]);
})();   // use strict