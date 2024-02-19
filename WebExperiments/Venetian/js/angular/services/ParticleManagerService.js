
(function() {
	'use strict';

	// Wrapper around camera plugin
	app.factory('particleManagerService', ['settingsService', 'particleService', 'updateCallService', function(settingsService, particleService, updateCallService) {

		var NUM_PART = 375;
		var particles = null;

		updateCallService.attach(update);

		var particleManagerFactory = {};

		var init = function(scene, material) {
			particles = [];
			for(var i =  0; i < NUM_PART; i++) {
				var particle = particleService.getNew(scene, material, new THREE.Vector3(0,0,0));
				//particle.SwitchState(0);
				particles.push(particle);
			}
		};

		var getParticle = function(aIndex) {
			if(!particles)
				return null;

			var index = aIndex % particles.length || 0;
			var rParticle = particles[index];
			return rParticle;
		};

		function update(aTimeInterval) {

			if(!particles)
				return;

			particles[0].globalUpdate(aTimeInterval);

			for(var i =  0; i < particles.length; i++) {
				particles[i].update(aTimeInterval);
			}
		}

		var getGoodCameraPosition = function() {
			var positionRel = particles[0].getGoodPositionCamera();
			return RelativeToPixel(positionRel);
		};

		var setState = function(aState) {
			for(var i =  0; i < particles.length; i++) {
				var particle = particles[i];
				particle.SwitchState(aState);
			}
		};

		particleManagerFactory.init = init;
		particleManagerFactory.setState = setState;
		particleManagerFactory.getParticle = getParticle;
		particleManagerFactory.getGoodCameraPosition = getGoodCameraPosition;

		return particleManagerFactory;

	}]);
})();   // use strict
