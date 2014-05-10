var lIndexStates = 0;
var ResumeStates =
{
	INIT:lIndexStates++,
	IDLE:lIndexStates++,
}

sCurrentResumeSate = ResumeStates.INIT;

function ParticleGroupMonster(positionCenter, name) 
{
	this.width = (window.innerWidth + window.innerHeight) * 0.5 * 0.3;
	this.cameraDistance = this.width * 3.;
	this.positionCenter = positionCenter;
	this.name = name;
	this.goAway = false;

	this.monster = new Monster(positionCenter, this.width);
	this.InitFood(this.width);
	this.InitSurface(this.width);
}


ParticleGroupMonster.prototype.InitSurface = function(width)
{
	var particleClear = new THREE.Particle( new THREE.ParticleCanvasMaterial( { color: Math.random() * 0x808080 + 0x808080, program: programStroke, opacity:0 } ) );
	var width = window.innerWidth * 1.;
	particleClear.scale.x = particleClear.scale.y = width;
	particleClear.position = this.positionCenter.clone();
	scene.add( particleClear );

	// create the mesh's material
		this.plane = new THREE.Mesh( new THREE.PlaneGeometry( 2000, 2000, 8, 8 ), new THREE.MeshBasicMaterial( { color: 0x000000, opacity: 0.25, transparent: true, wireframe: true } ) );
				this.plane.geometry.applyMatrix( new THREE.Matrix4().makeRotationX( Math.PI / 2 ) );
				this.plane.visible = false;
				this.plane.position = this.positionCenter;
				scene.add( this.plane );
}

ParticleGroupMonster.prototype.AddFood = function(aName, position, speed, size, aPositionTarget)
{
	var lPosition = position.clone();
	lPosition.z = this.positionCenter.z;
	var particle = new ParticleLetter( lPosition, aName, aPositionTarget, size);

	particle.scaleInit = particle.scale.x;
	particle.isMovable = true;
	particle.isTarget = false;
	particle.mSpeed = speed.clone();
	scene.add( particle );
	sFoodArray.push(particle);
	return particle;
}

ParticleGroupMonster.prototype.AddString = function(aText, aPosition)
{
	var size = window.innerWidth * 0.03;
	var spaceInit = size * 1.9;
	var position = aPosition.clone();
	position.addSelf(this.positionCenter);
	var width = window.innerWidth * 0.5;
	var testCanvas = document.createElement('canvas');
	var context = testCanvas.getContext('2d');
        context.font = size + "pt Helvetica"
        context.textAlign = "left";
    var etalon = context.measureText('a').width;
    var space = spaceInit;
	var thisSize = 0;
	for(var i = 0; i < aText.length; i++)
	{
		thisSize = context.measureText(aText[i]).width / etalon;
		position.x += spaceInit * thisSize * 0.5;
		this.AddFood(aText[i], new THREE.Vector3(this.positionCenter.x + myRandom() * width, this.positionCenter.y + myRandom() * width * 0.6, 0), new THREE.Vector3(), size, position.clone());	
		position.x += spaceInit * thisSize * 0.5;
	}
}

ParticleGroupMonster.prototype.InitFood = function(width)
{
	this.AddString("Baptiste Bohelay", new THREE.Vector3(-window.innerWidth * .7, window.innerHeight * 0.4, 0));
	this.AddString("Developer & Designer", new THREE.Vector3(-window.innerWidth * 0.5, window.innerHeight * -0.3, 0));
}

ParticleGroupMonster.prototype.MouseUp = function()
{
	SELECTED = false;	
}

ParticleGroupMonster.prototype.MouseDown = function()
{
	if(IS_PHONE)
		this.UpdatePointer();

	if(INTERSECTED || !sEnd)
	{
		sEnd = true;
		this.goAway = true;
		
		$('#githubButton').slideUp(300);
		$('#contactButton').slideUp(200);
		
		infoDisplay.FadeOut();
		// $('#githubButton').slideUp();
		setTimeout(function() {GoToIndex(ParticleGroup.PART_CREA_LULU);}, 1000);
	}
}

ParticleGroupMonster.prototype.UpdateCamera = function(delta)
{
	cameraTarget = ParticleGroups[ParticleGroup.PART_INTRO].positionCenter;
	cameraPosition.x = this.positionCenter.x;
	cameraPosition.y = this.positionCenter.y;
	cameraPosition.z = this.positionCenter.z + this.cameraDistance;
}

ParticleGroupMonster.prototype.UpdateFood = function(delta)
{
	var lPart;
	for(var i = 0; i < sFoodArray.length; i++)
	{
		lPart = sFoodArray[i];
		if(lPart.isMovable && !lPart.isEaten)
		{
			lPart.mSpeed.x += myRandom() * window.innerHeight * 0.02;
			lPart.mSpeed.x += (this.positionCenter.x - lPart.position.x) * 0.003;
			lPart.mSpeed.y += myRandom() * window.innerHeight * 0.02;
			lPart.mSpeed.y += (this.positionCenter.y - lPart.position.y) * 0.003;
			lPart.position.x += lPart.mSpeed.x * delta;
			lPart.position.y += lPart.mSpeed.y * delta;
			lPart.SetPosition(lPart.position);
			lPart.mSpeed.multiplyScalar(0.95);
		}
		if(this.goAway)
		{
			lPart.mSpeed.x += myRandom() * window.innerHeight * 0.02;
			lPart.mSpeed.x += (this.positionCenter.x - lPart.position.x) * -0.3;
			lPart.mSpeed.y += myRandom() * window.innerHeight * 0.02;
			lPart.mSpeed.y += (this.positionCenter.y - lPart.position.y) * -0.3;
			lPart.position.x += lPart.mSpeed.x * delta;
			lPart.position.y += lPart.mSpeed.y * delta;
			lPart.SetPosition(lPart.position);
			lPart.mSpeed.multiplyScalar(0.95);
		}
	}

	sMonster.position.x += (this.positionCenter.x + window.innerWidth * 0.5 - sMonster.position.x) * delta * 0.25;
	sMonster.position.y += (this.positionCenter.y + window.innerHeight * 0.5 - sMonster.position.y) * delta * 0.25;
}

ParticleGroupMonster.prototype.SwitchNextState = function()
{
	sCurrentResumeSate = ResumeStates.IDLE;
}

ParticleGroupMonster.prototype.Update = function(delta)
{
	switch(sCurrentResumeSate)
	{
		case ResumeStates.INIT:
			if(sFoodArray.length == 0)
			{
				sCurrentResumeSate = ResumeStates.IDLE;
			}
			break;
		case ResumeStates.IDLE:
			this.InitChallenge(this.NextChallenge);
			sCurrentResumeSate++;
			break;
	}

	if(isdefined(sChallenge))
		sChallenge.Update(delta);

	if(sMessageDisplaying)
	{
		delta *= 0.05;
	}
	controlAuto = false;
	this.UpdateCamera(delta);

	this.UpdateFood(delta);

	this.monster.Update(delta);

	this.UpdateIntersectPlane();
}

ParticleGroupMonster.prototype.Init = function(){};
ParticleGroupMonster.prototype.Terminate = function()
{
	for(var i = 0; i < sFoodArray.length; i++)
	{
		scene.remove(sFoodArray[i]);
	}
}

ParticleGroupMonster.prototype.UpdateIntersectPlane = function()
{
	if(!sEnd)
		return;

	if(IS_PHONE)
		return;

	this.UpdatePointer();

}

ParticleGroupMonster.prototype.UpdatePointer = function()
{
	var vector = new THREE.Vector3( mouse.x, mouse.y, 0.5 );
	projector.unprojectVector( vector, camera );

	var ray = new THREE.Ray( camera.position, vector.subSelf( camera.position ).normalize() );

	var intersects = ray.intersectObject( sMonster );

	if ( intersects.length > 0 ) 
	{
			INTERSECTED = intersects[ 0 ].object;
			if(intersects[0].distance < INTERSECTED.boundRadiusScale * sRayCircle)
			{
				sMonster.material.program = monsterTouched;
				return;
			}
	} 
	sMonster.material.program = programMonster;
}

