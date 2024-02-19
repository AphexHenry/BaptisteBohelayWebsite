var lIndexStates = 0;
var ResumeStates =
{
	INIT:lIndexStates++,
	IDLE:lIndexStates++,
}

sCurrentResumeSate = ResumeStates.INIT;

function ParticleGroupMonster(positionCenter, name) 
{
	this.width = window.innerWidth * 0.3;
	this.cameraDistance = this.width * 3.;
	this.positionCenter = positionCenter;
	this.name = name;

	this.monster = new Monster(positionCenter, this.width);
	this.InitFood(this.width);
	this.InitSurface(this.width);
	this.InitChallenges();
}

ParticleGroupMonster.prototype.InitChallenges = function()
{
	this.NextChallenge = 0;
}

ParticleGroupMonster.prototype.InitChallenge = function(index)
{
	switch(index)
	{
		case 0:	
			sChallenge = new DancingDots(this.positionCenter);
			break;
		case 1:
			sChallenge = new Idle(this.positionCenter);
			break;
	}

	this.NextChallenge++;
}

ParticleGroupMonster.prototype.InitSurface = function(width)
{
	// create the mesh's material
		this.plane = new THREE.Mesh( new THREE.PlaneGeometry( 2000, 2000, 8, 8 ), new THREE.MeshBasicMaterial( { color: 0x000000, opacity: 0.25, transparent: true, wireframe: true } ) );
				this.plane.geometry.applyMatrix( new THREE.Matrix4().makeRotationX( Math.PI / 2 ) );
				this.plane.visible = false;
				this.plane.position = this.positionCenter;
				scene.add( this.plane );
}

ParticleGroupMonster.prototype.AddFood = function(aType, aName, position, speed, size)
{
	var skill = {type:"skill", skillType:aType, name:aName, size:size};

	var lPosition = position.clone();
	lPosition.z = this.positionCenter.z;
	var particle = new ParticleCircleNavigate( lPosition, skill );

	particle.scaleInit = particle.scale.x;
	particle.isMovable = true;
	particle.isEaten = false;
	particle.mSpeed = speed.clone();
	scene.add( particle );
	sFoodArray.push(particle);
	return particle;
}

ParticleGroupMonster.prototype.InitFood = function(width)
{
	this.AddFood("programming", "C programming", new THREE.Vector3(this.positionCenter.x + myRandom() * width, this.positionCenter.y + myRandom() * width, 0), new THREE.Vector3(), 1.);
	this.AddFood("programming", "C++ programming", new THREE.Vector3(this.positionCenter.x + myRandom() * width, this.positionCenter.y + myRandom() * width, 0), new THREE.Vector3(), 1.);
	this.AddFood("sound design", "sound recording", new THREE.Vector3(this.positionCenter.x + myRandom() * width, this.positionCenter.y + myRandom() * width, 0), new THREE.Vector3(), 1.);
	this.AddFood("experimentation", "sound experimentation", new THREE.Vector3(this.positionCenter.x + myRandom() * width, this.positionCenter.y + myRandom() * width, 0), new THREE.Vector3(), 1.);
	this.AddFood("sound processing", "Pure Data programming", new THREE.Vector3(this.positionCenter.x + myRandom() * width, this.positionCenter.y + myRandom() * width, 0), new THREE.Vector3(), 1.);
	this.AddFood("sound design", "sound edition", new THREE.Vector3(this.positionCenter.x + myRandom() * width, this.positionCenter.y + myRandom() * width, 0), new THREE.Vector3(), 1.);
	// flyer = [];
	// flyer.push({type:"experience", name:"Horse Life 2", skills:["sound design", "C++"], size:0.8, html:"html/resume/HorseLife.html"});
	// flyer.push({type:"experience", name:"PES Iphone", skills:["sound design", "C++"], size:1.1});
	// flyer.push({type:"experience", name:"Art programing at Le Cube", skills:["C++", "interaction design"], size:0.9});
	// flyer.push({type:"experience", name:"Purity Ring Cocoons", skills:["C++", "interaction design", "sound processing"], size:0.9});
	// flyer.push({type:"experience", name:"Lulu's Unreal exploration", skills:["sound design", "C++", "graphic design", "game design"]});
	// flyer.push({type:"experience", name:"Purity Ring Cocoons", skills:["C++", "interaction design", "Ableton Live"]});
	// flyer.push({type:"experience", name:"this website", skills:["javascript", "html5", "Three.js", "graphic design"]});
	// flyer.push({type:"skill", skillType:, name:});
	// flyer.push({type:"skill", skillType:"programming", name:"C programming"});
	// flyer.push({type:"skill", skillType:"sound design", name:"sound recording"});
	// flyer.push({type:"skill", skillType:"experimentation", name:"sound experimentation"});
	// flyer.push({type:"skill", skillType:"sound processing", name:"Pure Data programming"});
	// flyer.push({type:"skill", skillType:"sound design", name:"sound edition"});

}

ParticleGroupMonster.prototype.MouseUp = function()
{
	SELECTED = false;	
}

ParticleGroupMonster.prototype.MouseDown = function()
{
	if(INTERSECTED)
	{
		SELECTED = INTERSECTED;
	}
	else
	{
		// SELECTED.material.program = programStroke;
		SELECTED = null;
	}
}

ParticleGroupMonster.prototype.UpdateCamera = function(delta)
{
	cameraTarget = ParticleGroups[sGroupCurrent].positionCenter;
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
		if(lPart.isMovable)
		{
			lPart.mSpeed.x += myRandom() * window.innerHeight * 0.02;
			lPart.mSpeed.y += myRandom() * window.innerHeight * 0.02;
			lPart.position.x += lPart.mSpeed.x * delta;
			lPart.position.y += lPart.mSpeed.y * delta;
			lPart.mSpeed.multiplyScalar(0.95);
		}

		if(lPart.isEaten)
		{
			lPart.scale.x += -lPart.scale.x * delta * 10;
			lPart.scale.y = lPart.scale.x;
			if(lPart.scale.x < 1)
			{
				lPart.isEaten = false;
				lPart.isMovable = true;
				// lPart.position.x = this.positionCenter.x + this.width * 1.7 * (1. + myRandom() * 0.3) * Math.sin(myRandom() * 0.7 );
				// lPart.position.y = this.positionCenter.y + this.width * 1.7 * (1. + myRandom() * 0.3) * Math.sin(myRandom() * 0.7 );
				lPart.Delete();
				sFoodArray.splice(i, 1);
			}
		}
		else
		{
			lPart.scale.x += (lPart.scaleInit -lPart.scale.x) * delta;
			lPart.scale.y = lPart.scale.x;
		}
	}
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

	var vector = new THREE.Vector3( mouse.x, mouse.y, 0.5 );
	projector.unprojectVector( vector, camera );

	var ray = new THREE.Ray( camera.position, vector.subSelf( camera.position ).normalize() );

	var intersects = ray.intersectObjects( sFoodArray );

	if ( intersects.length > 0 ) 
	{
			INTERSECTED = intersects[ 0 ].object;

			INTERSECTED.TargetObject.info.material.opacity += (1. - INTERSECTED.TargetObject.info.material.opacity) * 2. * 0.02;
	} 
	else 
	{
		if ( INTERSECTED ) 
		{
			INTERSECTED.material.program = programStroke;
			INTERSECTED.TargetObject.info.material.opacity = 0.2;
		}

		INTERSECTED = null;
	}
}

ParticleGroupMonster.prototype.UpdateIntersectPlane = function()
{
	var vector = new THREE.Vector3( mouse.x, mouse.y, 0.5 );
	projector.unprojectVector( vector, camera );

	var ray = new THREE.Ray( camera.position, vector.subSelf( camera.position ).normalize() );

	var intersects = ray.intersectObject( this.plane, true );

	if ( intersects.length > 0 ) 
	{
		var isClose = false;
		if(SELECTED && SELECTED.isMovable)
		{
			SELECTED.SetPosition(intersects[0].point);
		}

		if(intersects[0].point.distanceToSquared(sMonster.position) < (sMonster.scale.x * sMonster.scale.x))
		{
			this.monster.WakeUp(0.5);
		}

		// for(var i = 0; i < this.particlesSkills.length; i++)
		// {
		// 	var distance = this.particlesSkills[i].position.distanceTo(intersects[0].point);
		// 	if(distance < window.innerWidth * 0.2)
		// 	{
		// 		distance = Math.max(50, distance);
		// 		this.particlesSkills[i].mSpeed.x += -(intersects[0].point.x - this.particlesSkills[i].position.x) * 200 / (distance * distance);
		// 		this.particlesSkills[i].mSpeed.y += -(intersects[0].point.y - this.particlesSkills[i].position.y) * 200 / (distance * distance);
		// 	}
		// }

		// var objectString = INTERSECTED.TargetObject;
		// if(objectString)
		// {
		// 	var text = [];
		// 	//infoCanvas = infoDisplay.GetCanvas();
		// 	text.push({string:objectString.name, size: 2});

		// 	infoDisplay.SetText(text);
		// 	infoDisplay.SetSize(0.4 * objectString.size);
		// 	infoDisplay.SetPosition(INTERSECTED.position);
		// 	infoDisplay.FadeIn();
		// }
	} 
}

