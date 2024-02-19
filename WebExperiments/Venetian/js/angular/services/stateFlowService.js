(function() {
	'use strict';

	// Wrapper around camera plugin
	app.factory('stateFlowService', ['settingsService', 'audioMovementService', function(settingsService, audioMovementService) {

		var stateFlowFactory = {};

		var sTimerEnd = 0;
		var ATTRACTOR_IDLE_SIZE = 1.2;
		var thisIsTheEnd = true;
		var thisIsTheEndTimer = 0;
		var positionEnd = null;
		var positionEndAngle = 0;

		var positionWhenStringStart = new THREE.Vector3();
		var positionWhenString = new THREE.Vector3();


		function BehaviourIntro(aPart, aPosition)
		{
			this.part = aPart;
			this.randomSeed = Math.random();

			thisIsTheEnd = false;
			this.timer = 0;

			this.life = Math.random();
			this.hasDoneLast = false;
			this.firstInit = true;
			this.angleString = 0;
			this.rotationSpeed = 0;
		}


		BehaviourIntro.prototype.init = function()
		{
			var lScale = audioMovementService.getScale();

			if(this.firstInit) {
				this.life = Math.random();
				this.firstInit = false;
			}
			else {
				this.life = 1 + this.randomSeed;
			}
			this.positionEnd = null;

			if(audioMovementService.getString() > 0.05) {

				this.randomSeed = (0.25 + 0.26 * Math.random());

				this.positionEndAngle = this.timer * 0.2 + (Math.random() < 0.5 ? Math.PI : 0);
				this.angleString = this.positionEndAngle + Math.random() * audioMovementService.getString();
				this.rotationSpeed = 1 + audioMovementService.getString() * 20;
				this.part.mPosition = positionWhenString.clone();
				this.positionEnd = positionWhenString.clone();//.clone().add(new THREE.Vector3(side ?  strengthX : -strengthX, side ?  strengthY : -strengthY, 0));
			}
			else {
				if(thisIsTheEnd) {
					this.hasDoneLast = true;
				}

				if(lScale > 0.1 && Math.random() < 0.1) {
					this.randomSeed = 0.5 + 0.5 * Math.random();
					this.part.mVelocity.set(0,0,0);
				}
				else {
					var positionNoise = 0;

					if(lScale > Math.min(0.4, this.timer * 0.2)) {
						this.randomSeed = 0.02 + 0.04 * Math.random();
						positionNoise = (1 - this.randomSeed) * 0.002;
					}
					else {
						this.randomSeed = 0.02 + 0.2 * Math.random();
					}
					var normalStrength = 1.4;
					var strengthX = (0.5 + 0.5 * Math.random()) * normalStrength;
					var strengthY = (0.5 + 0.5 * Math.random()) * normalStrength;
					var strengthZ = (0.5 + 0.5 * Math.random()) * normalStrength;
					this.part.mVelocity.x = positionNoise * ( Math.random() < 0.5 ?  strengthX : -strengthX);
					this.part.mVelocity.y = positionNoise * ( Math.random() < 0.5 ?  strengthY : -strengthY);
					this.part.mVelocity.z = positionNoise * ( Math.random() < 0.5 ?  strengthZ : -strengthZ);
				}

				this.part.mPosition = thisIsTheEnd ? positionEnd.clone() : audioMovementService.getPosition();
			}


			this.part.mSize = 0;
			this.scale = (0.001 + this.randomSeed) * 1;
		};

		BehaviourIntro.prototype.FadeIn = function(aTimeInterval)
		{
			return true;
		};

		BehaviourIntro.prototype.globalUpdate = function(aTimeInterval) {
			thisIsTheEnd = audioMovementService.getTimeLeftS() < 25;
			if(thisIsTheEnd) {
				thisIsTheEndTimer += aTimeInterval;
				if(!positionEnd) {
					positionEnd = audioMovementService.getPositionWithDelay(1).clone();
				}
			}

			if(audioMovementService.getString() > 0.05) {
				//if(!positionWhenStringStart) {
				positionWhenString = audioMovementService.getPosition().clone();
				positionWhenString.z *= 1.2;
				//}
				//positionWhenString.z = positionWhenStringStart.z + Math.cos(this.timer * 0.1) * 0.1;
			}
			else {
				positionWhenStringStart = null;
			}
		};

		BehaviourIntro.prototype.update = function(aTimeInterval)
		{
			this.life -= aTimeInterval * (thisIsTheEnd ? 0.1 : 0.04);
			this.timer += aTimeInterval;

			if(this.life <= 0)
			{
				if(!this.hasDoneLast) {
					this.scale -= this.scale * aTimeInterval * 0.5;
				}

				if(this.part.mSize <= 0.02) {

					if(!this.hasDoneLast) {
						this.init();
					}
				}
			}

			if(this.positionEnd) {
				var normalStrength = 0.04 * Math.min(1, this.life) * audioMovementService.getString();
				this.angleString += aTimeInterval * 0.03 * this.rotationSpeed;

				var strengthX = Math.cos(this.angleString) * normalStrength;
				var strengthY = Math.sin(this.angleString) * normalStrength;

				this.part.mPosition.x += (strengthX + this.positionEnd.x - this.part.mPosition.x) * aTimeInterval;
				this.part.mPosition.y += (strengthY + this.positionEnd.y - this.part.mPosition.y) * aTimeInterval;
				this.part.mPosition.z += (this.positionEnd.z - this.part.mPosition.z) * aTimeInterval;
			}

			this.part.mSize += (this.scale * ATTRACTOR_IDLE_SIZE - this.part.mSize) * aTimeInterval * 0.4;

			var rotSpeed = this.randomSeed * 0.001;
			this.part.mRotationSpeed = new THREE.Vector3(0, 0, 0);
			this.part.mRotation.x = (rotSpeed * this.timer + 83) * Math.cos(this.randomSeed);
			this.part.mRotation.y = (rotSpeed * this.timer + 123) * Math.sin(this.randomSeed);
			this.part.mRotation.z = 0;

			this.part.scaleSpeed *= 0.95;
		};

		BehaviourIntro.prototype.getPositionCamera = function() {
			if(positionWhenStringStart) {
				return positionWhenString.clone();
			}
			else if(!thisIsTheEnd) {
				return audioMovementService.getPositionWithDelay(1)
			}
			else {
				return positionEnd.clone();
			}
		};

		BehaviourIntro.prototype.FadeOut = function(aTimeInterval)
		{
			this.part.mSize *= 0.97;
			return (this.part.mSize < 0.01);
		};

		stateFlowFactory.getNew = function(aPart, aPosition) {
			return new BehaviourIntro(aPart, aPosition);
		};
		return stateFlowFactory;

	}]);
})();   // use strict