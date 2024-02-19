(function() {
	'use strict';

	// Wrapper around camera plugin
	app.factory('particleService', ['settingsService', 'stateFlowService', 'stateIdleService', 'stateIntenseService', function(settingsService, stateFlowService, stateIdleService, stateIntenseService) {

		var FLIP_ROTATION_SPEED = 15.;
		var CONSERVATION_OF_VELOCITY = 0.98;
		var TEXTURE_SIZE = 300;
		var sShowPartPosition = new THREE.Vector3(0., 0., 0.);
		var sFrameRate = 1.;
		var sizeCube = 20;

		/*
		 * States into the state.
		 * To transit from a state to another, one particle must go threw:
		 *
		 * UPDATE_INIT : an intitialization of his state, then a fade out until it return true.
		 * UPDATE_FADE_IN : a fade in update, until the state return true.
		 * UPDATE_UPDATE : a continuus update.
		 * UPDATE_FADE_OUT : a fade out update, called when the state is changing. Switch to the init of the next state when return true.
		 */
		Particle.StateUpdate =
		{
			UPDATE_INIT : 0,
			UPDATE_FADE_IN : 1,
			UPDATE_UPDATE : 2,
			UPDATE_FADE_OUT : 3
		};


		var SIZE_PART_IDLE = 0.1;
		var sIndex = 0;

		function Particle(aScene, aMaterial, aPosition)
		{
			this.mPosition = aPosition;
			this.mVelocity = new THREE.Vector3(0., 0., 0. );
			this.mLastPosition = this.mPosition.clone();
			this.mRotation = new THREE.Vector3(0, 0 , 0);
			this.mRotationSpeed = new THREE.Vector3(0, 0 , 0);
			this.mSize = SIZE_PART_IDLE;
			this.mSizeSpeed = 0.;
			this.mAlpha = 1.;

			this.mStateUpdate = Particle.StateUpdate.UPDATE_UPDATE;
			this.mParticleState = [];
			this.mParticleState[0] = stateIdleService.getNew(this, aPosition);
			this.mParticleState[1] = stateFlowService.getNew(this, aPosition);
			//this.mParticleState[2] = stateIntenseService.getNew(this, aPosition);

			this.mStateCurrent = 0;
			this.mStateNext = 0;

			this.mIndex = sIndex;
			sIndex++;

			this.mesh = new THREE.Mesh( new THREE.CubeGeometry( sizeCube, sizeCube, sizeCube ), aMaterial );
			aScene.add( this.mesh );
		}

		/*
		 * Trigger the switch to the next state. Fade out first.
		 *
		 * @param aState: next state index.
		 */
		Particle.prototype.SwitchState = function(aState)
		{
			this.mStateNext = aState;
			this.mStateUpdate = Particle.StateUpdate.UPDATE_FADE_OUT;
		};

		Particle.prototype.PrepareTransition = function()
		{
			if(this.mStateUpdate == Particle.StateUpdate.UPDATE_FADE_OUT)
			{
				this.mParticleState[this.mStateNext].GlobalInit();
			}
		};

		/*
		 * Update this particle.
		 *
		 * @param aTimeInterval: time elapsed since last update..
		 */
		Particle.prototype.update = function(aTimeInterval, awidth)
		{
			aTimeInterval *= sFrameRate;
			// call the good update (init -> FadeIn -> Update -> FadeOut.
			var lParticleState = this.mParticleState[this.mStateCurrent];

			switch(this.mStateUpdate)
			{
				case Particle.StateUpdate.UPDATE_INIT:
					lParticleState.init();
					this.mStateUpdate = Particle.StateUpdate.UPDATE_FADE_IN;
				case Particle.StateUpdate.UPDATE_FADE_IN:
					if(lParticleState.FadeIn(aTimeInterval))
					{
						this.mStateUpdate = Particle.StateUpdate.UPDATE_UPDATE;
					}
					break;
				case Particle.StateUpdate.UPDATE_UPDATE:
					lParticleState.update(aTimeInterval);
					break;
				case Particle.StateUpdate.UPDATE_FADE_OUT:
					if(lParticleState.FadeOut(aTimeInterval))
					{
						this.mStateCurrent = this.mStateNext;
						this.mStateUpdate = Particle.StateUpdate.UPDATE_INIT;
					}
					break;
				default:
					break;
			}

			// classic physics equations.
			this.mPosition.x += this.mVelocity.x * aTimeInterval;
			this.mPosition.y += this.mVelocity.y * aTimeInterval;
			this.mPosition.z += this.mVelocity.z * aTimeInterval;
			this.mVelocity.multiplyScalar(CONSERVATION_OF_VELOCITY);

			this.mSize += this.mSizeSpeed * aTimeInterval;
			this.mSizeSpeed *= CONSERVATION_OF_VELOCITY;

			this.mRotation.add(this.mRotationSpeed.clone().multiplyScalar(aTimeInterval));
			this.mRotationSpeed.multiplyScalar(CONSERVATION_OF_VELOCITY);
			if(this.mesh != null)
			{
				this.mesh.position.copy(RelativeToPixel(this.mPosition));
				this.mesh.rotation.x = this.mRotation.x;
				this.mesh.rotation.y = this.mRotation.y + 0.5 * Math.PI;
				this.mesh.rotation.z = 0.5 * Math.PI;
				this.mesh.scale.x = this.mSize;
				this.mesh.scale.y = this.mSize;
				this.mesh.scale.z = this.mSize;
				this.mesh.doubleSided = true;
				this.mesh.updateMatrix();
			}
		};

		Particle.prototype.globalUpdate = function(aTimeInterval) {
			var lParticleState = this.mParticleState[this.mStateCurrent];
			if(lParticleState.globalUpdate) {
				lParticleState.globalUpdate(aTimeInterval);
			}
		};

		Particle.prototype.getWorldPosition = function() {
			return this.mesh.position;
		};

		Particle.prototype.getScale = function() {
			return this.mesh.scale.x * sizeCube;
		};

		Particle.prototype.getGoodPositionCamera = function() {
			var lParticleState = this.mParticleState[this.mStateCurrent];
			return lParticleState.getPositionCamera();
		};

		var particleFactory = {};
		particleFactory.getNew = function(aScene, aMaterial, aPosition) {
			return new Particle(aScene, aMaterial, aPosition);
		};

		return particleFactory;

}]);
})();   // use strict