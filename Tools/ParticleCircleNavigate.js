function ParticleCircleNavigate(position, aTargetObject) 
{
	this.name = aTargetObject.name;

	var particle = new THREE.Particle( new THREE.ParticleCanvasMaterial( { color: PickColor(), program: programStroke, transparent:true } ) );

	particle.position = position;

	var size = 1;
	if(aTargetObject.size)
	{
		size = aTargetObject.size;
	}
	else
	{
		aTargetObject.size = 1.;
	}

	var infoText = [];
	infoText.push({string:this.name, size: 2});

	var programText = function ( context ) 
	{
		SetTextInCanvas(infoText, context.canvas)
	}

	var info = new THREE.Particle( new THREE.ParticleCanvasMaterial( { color: PickColor(), program: programText, transparent:true, opacity:OPACITY_INFO } ) );
	info.position = particle.position;

	particle.scale.x = particle.scale.y = 3 * sWIDTH * 0.07 * size;
	info.scale.x = particle.scale.x * 0.3;
	info.scale.y = -info.scale.x;
	aTargetObject.info = info;
	particle.TargetObject = aTargetObject;

	this.particleClear = new THREE.Particle( new THREE.ParticleCanvasMaterial( { color: Math.random() * 0x808080 + 0x808080, program: programDoNothing, opacity:0 } ) );
	var width = window.innerWidth * 1.5;
	this.particleClear.scale.x = this.particleClear.scale.y = 4 * width * 0.05;
	scene.add( this.particleClear );
	this.particleClear.position = info.position;
	particle.TargetObject.particleClear = this.particleClear;
	
	particle.SetPosition = function(aPosition)
	{
		particle.position = aPosition;
		particle.TargetObject.particleClear.position = aPosition;
		particle.TargetObject.info.position = aPosition;
	};

	particle.SetName = function(aName)
	{
		infoText = [];
		infoText.push({string:aName, size: 2});
	}

	particle.SetAutonomous = function(aValue)
	{
		particle.TargetObject.isAutonomous = aValue;
	}

	particle.Delete = function()
	{
		scene.remove(particle);
		scene.remove(particle.TargetObject.particleClear);
		scene.remove(particle.TargetObject.info);
		delete this;
	};

	particle.GetInfo = function()
	{
		return particle.TargetObject.info;
	}

	particle.SetTextVisible = function(aVisible)
	{
		this.TargetObject.info.visible = aVisible;
		this.TargetObject.info.particleClear = aVisible;
	}

	scene.add( particle );
	scene.add(info);
	particle.SetTextVisible(false);
	return particle;
}