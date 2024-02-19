(function() {
    'use strict';

    // Wrapper around camera plugin
    app.factory('stateIdleService', ['settingsService', 'audioMovementService', function(settingsService, audioMovementService) {

        var stateIdleFactory = {};

        var sTimerEnd = 0;
        var ATTRACTOR_IDLE_SIZE = 1.2;

        function Behaviour(aPart, aPosition)
        {
            this.part = aPart;
            this.randomSeed = Math.random();

            var area = 2.;
            this.mAttractorMatrix = new THREE.Vector3(0, 0, 0);

            this.timer = 0;
            this.life = Math.random();
            this.scale = 1;
            this.outState = 0;
            this.init();
        }

        Behaviour.prototype.init = function()
        {
            var lScale = audioMovementService.getScale();

            this.life = 1 + this.randomSeed;
            //if(lScale > 0.1 && Math.random() < 0.1) {
            //    this.randomSeed = 0.5 + 0.5 * Math.random();
            //    this.part.mVelocity.set(0,0,0);
            //}
            //else {
            //
            //    var positionNoise = 0;
            //
            //    if(lScale > 0.4) {
            //        this.randomSeed = 0.02 + 0.1 * Math.random();
            //        positionNoise = (1 - this.randomSeed) * 0.002;
            //    }
            //    else {
            //        // small
            //        this.randomSeed = 0.02 + 0.2 * Math.random();
            //    }
            //    var strengthX = 0.5 + 0.5 * Math.random();
            //    var strengthY = 0.5 + 0.5 * Math.random();
            //    var strengthZ = 0.5 + 0.5 * Math.random();
            //    var side = Math.random() < 0.5;
            //    this.part.mVelocity.x = positionNoise * (side ?  strengthX : -strengthX);
            //    this.part.mVelocity.y = positionNoise * (side ?  strengthX : -strengthY);
            //    this.part.mVelocity.z = positionNoise * (side ?  strengthX : -strengthZ);
            //}

            this.part.mPosition = new THREE.Vector3();
            this.part.mSize = 0;

            this.scale = 0.001 * this.randomSeed + 0.5;
        };

        Behaviour.prototype.FadeIn = function(aTimeInterval)
        {
            return true;
        };

        Behaviour.prototype.getPositionCamera = function() {
            return new THREE.Vector3(Math.random(), Math.random() * 0.1, Math.random()).multiplyScalar(0.01);
        };

        Behaviour.prototype.update = function(aTimeInterval)
        {
            this.life -= aTimeInterval * 0.04;
            this.timer += aTimeInterval;

            if(this.life <= 0)
            {
                this.scale -= this.scale * aTimeInterval * 0.5;
                if(this.part.mSize <= 0.05) {
                    this.init();
                }
            }

            this.part.mSize += (this.scale * ATTRACTOR_IDLE_SIZE - this.part.mSize) * aTimeInterval * 0.4;

            var rotSpeed = this.randomSeed * 0.001;
            this.part.mRotationSpeed = new THREE.Vector3(0, 0, 0);
            this.part.mRotation.x = (rotSpeed * this.timer + 83) * Math.cos(this.randomSeed * 7);
            this.part.mRotation.y = (rotSpeed * this.timer + 123) * Math.sin(this.randomSeed * 7);
            this.part.mRotation.z = 0;

            this.part.scaleSpeed *= 0.95;
        };

        Behaviour.prototype.FadeOut = function(aTimeInterval)
        {
            switch(this.outState){
                case 0:
                    this.life = (1 + Math.random()) * 0.15;
                    this.outState++;
                case 1:
                    this.part.mSize *= 0.99;
                    this.life -= aTimeInterval * 0.03;
                    if(this.life < 0) {
                        this.outState++;
                    }
                    this.part.mRotation.x += 0.1 * this.randomSeed * aTimeInterval;
                    this.part.mRotation.y += this.randomSeed * 0.3 * aTimeInterval;
                    this.part.mRotation.z += this.randomSeed * 0.6 * aTimeInterval;
                    return false;
                case 2:
                    this.part.mVelocity.set(Math.cos(this.randomSeed * 2000), Math.sin(this.randomSeed * 3000), Math.sin(this.randomSeed * 1000)).multiplyScalar(0.01 * this.randomSeed);
                    this.outState++;
                    return false;
                case 3:
                    this.part.mSize *= 0.99;
                    if((Math.abs(this.part.mVelocity.x) < 0.001) && (this.part.mSize < 0.001) || (this.part.mIndex == 0)){
                        this.outState = 0;

                        return true;
                    }
                    else {
                        return false;
                    }
                default:
                    return true;

            }

        };

        stateIdleFactory.getNew = function(aPart, aPosition) {
            return new Behaviour(aPart, aPosition);
        };
        return stateIdleFactory;

    }]);
})();   // use strict