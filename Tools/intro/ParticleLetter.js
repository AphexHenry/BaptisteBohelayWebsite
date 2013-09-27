function ParticleLetter(position, aLetter, aPositionTarget, aSize) 
{
	var letter = aLetter;

	var programText = function ( context ) 
	{
	    context.textAlign = "center"; 
		context.font = 2 + "pt TitleText"
	    context.fillText(letter, -1, 1);
	}

	var particle = new THREE.Particle( new THREE.ParticleCanvasMaterial( { color: 0x000000, program: programText, transparent:true, opacity:1. } ) );

	particle.position = position;
	particle.scale.x = aSize;
	particle.scale.y = -aSize;

	// this.particleClear = new THREE.Particle( new THREE.ParticleCanvasMaterial( { color: Math.random() * 0x808080 + 0x808080, program: programStroke, opacity:0 } ) );
	// var width = window.innerWidth * 1.5;
	// this.particleClear.scale.x = this.particleClear.scale.y = aSize * 2.;
	// scene.add( this.particleClear );
	// this.particleClear.position = info.position;
	particle.TargetObject = {positionTarget:aPositionTarget};
	
	var size = 1;


	particle.SetPosition = function(aPosition)
	{
		particle.position = aPosition;
		// particle.TargetObject.particleClear.position = aPosition;
	};

	particle.Delete = function()
	{
		scene.remove(particle);
		delete this;
	};

	//scene.add( particle );
	return particle;
}