

function Environment() 
{
	// this.particles = [];
	// for(var i = 0; i < 30; i++)
	//  {
	//  	var particle = new THREE.Particle( new THREE.ParticleCanvasMaterial( { color: PickColor(), program: programFill, transparent:true } ) );
	// 	particle.position = new THREE.Vector3(myRandom() * 4000, myRandom() * 4000, myRandom() * 4000);
	// 	particle.scale.x = particle.scale.y = (1. + 0.5 * Math.random()) * sWIDTH * 0.1;
	// 	scene.add(particle);
	// 	var speed = 1. + Math.random();
	// 	speed *= 500;
	// 	var angle = myRandom() * Math.PI;
	// 	particle.mSpeed = new THREE.Vector3(Math.cos(angle) * speed, Math.sin(angle) * speed, myRandom() * speed);
	// 	this.particles.push(particle);
	//  }
}

/*
 * Update camera.
 */
Environment.prototype.Update = function(aTimeInterval)
{
	// var particle;
	// for(var i = 0; i < this.particles.length; i++)
	// {
	// 	particle = this.particles[i];
	// 	particle.position.x += particle.mSpeed.x * aTimeInterval;
	// 	particle.position.y += particle.mSpeed.y * aTimeInterval;
	// 	particle.position.z += particle.mSpeed.z * aTimeInterval;
	// 	if(particle.position.lengthSq() > 5000 * 5000)
	// 	{
	// 		particle.mSpeed.negate();	
	// 		particle.position.x += particle.mSpeed.x * aTimeInterval * 10;
	// 		particle.position.y += particle.mSpeed.y * aTimeInterval * 10;
	// 		particle.position.z += particle.mSpeed.z * aTimeInterval * 10;
	// 		// particle.mSpeed.x += myRandom() * 100;
	// 		// particle.mSpeed.y += myRandom() * 100;
	// 		// particle.mSpeed.z += myRandom() * 100;
	// 	}
	// }
}
