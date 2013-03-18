sFoodArraySoundWait = [];

function AddLeg()
{
	sLegArray.push({angle:0, random:myRandom(), state:0, posHandCurrent:new THREE.Vector2(), posHandTarget:new THREE.Vector2(), posHandInit:new THREE.Vector2(), coeffMove: 1, gotObject:null, speed:0.9 + Math.random() * 0.2});
	for(var i = 0; i < sLegArray.length; i++)
	{
		sLegArray[i].angle = i * Math.PI * 2. / sLegArray.length;
	}
}


function ParticleGroupMonsterSound(positionCenter, name) 
{
	this.width = window.innerWidth * 0.3;
	this.cameraDistance = this.width * 3.;
	this.positionCenter = positionCenter;
	this.name = name;
	this.timer = 0;

	this.monster = new MonsterSound(positionCenter, this.width);
	this.InitFood(this.width);
	this.InitSurface(this.width);
}

ParticleGroupMonsterSound.prototype.InitSurface = function(width)
{
	var particleClear = new THREE.Particle( new THREE.ParticleCanvasMaterial( { color: Math.random() * 0x808080 + 0x808080, program: programDoNothing, opacity:0 } ) );
	var width = window.innerWidth * 1.3;
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

ParticleGroupMonsterSound.prototype.InitFood = function(aName, position, size, url)
{
	var randAngle = myRandom() * Math.PI;
	this.positionHomeMonsters = [];
	this.positionHomeMonsters[0] = {pos:new THREE.Vector3(this.positionCenter.y - window.innerWidth * .7, this.positionCenter.y + window.innerHeight * .5, this.positionCenter.z), name:"sound monsters"};
	this.AddFood("tripouille", new THREE.Vector3(this.positionHomeMonsters[0].pos.x, this.positionHomeMonsters[0].pos.y + window.innerHeight * 0.2, this.positionHomeMonsters[0].pos.z), 1., "data/sound/Monsters/Tripouille.mp3", 0.7);
	this.AddFood("elevator song", new THREE.Vector3(this.positionHomeMonsters[0].pos.x + window.innerWidth * 0.3, this.positionHomeMonsters[0].pos.y, this.positionHomeMonsters[0].pos.z), 1., "data/sound/Monsters/ElevatorSong.mp3", 1.);
	this.AddFood("raw cut", new THREE.Vector3(this.positionHomeMonsters[0].pos.x + window.innerWidth * 0.6, this.positionHomeMonsters[0].pos.y + window.innerHeight * 0.2, this.positionHomeMonsters[0].pos.z), 1., "data/sound/Monsters/RawCut.mp3", 0.4);
	this.AddFood("good bye Rowan", new THREE.Vector3(this.positionHomeMonsters[0].pos.x + window.innerWidth * 0.9, this.positionHomeMonsters[0].pos.y, this.positionHomeMonsters[0].pos.z), 1., "data/sound/Monsters/GoodByeRowan.mp3", 1.2);

	randAngle += Math.PI + myRandom() * 0.3;
	this.positionHomeMonsters[1] = {pos:new THREE.Vector3(this.positionCenter.y - window.innerWidth * .7, this.positionCenter.y - window.innerHeight * .7, this.positionCenter.z), name:"lulu's soundtrack"};
	this.AddFood("bycicle", new THREE.Vector3(this.positionHomeMonsters[1].pos.x, this.positionHomeMonsters[1].pos.y + window.innerHeight * 0.2, this.positionHomeMonsters[1].pos.z), 1., "data/sound/Lulu/bycicle.mp3", 1.);
	this.AddFood("theatre", new THREE.Vector3(this.positionHomeMonsters[1].pos.x + window.innerWidth * 0.2, this.positionHomeMonsters[1].pos.y, this.positionHomeMonsters[1].pos.z), 1., "data/sound/Lulu/intro.mp3", 1.);
	this.AddFood("love", new THREE.Vector3(this.positionHomeMonsters[1].pos.x + window.innerWidth * 0.4, this.positionHomeMonsters[1].pos.y + window.innerHeight * 0.2, this.positionHomeMonsters[1].pos.z), 1., "data/sound/Lulu/love.mp3", 1.);
	this.AddFood("morvan", new THREE.Vector3(this.positionHomeMonsters[1].pos.x + window.innerWidth * 0.6, this.positionHomeMonsters[1].pos.y, this.positionHomeMonsters[1].pos.z), 1., "data/sound/Lulu/morvan.mp3", 1.);
	this.AddFood("yokais", new THREE.Vector3(this.positionHomeMonsters[1].pos.x + window.innerWidth * 0.8, this.positionHomeMonsters[1].pos.y + window.innerHeight * 0.2, this.positionHomeMonsters[1].pos.z), 1., "data/sound/Lulu/musicAphex3.mp3", 1.);
	this.AddFood("raclement", new THREE.Vector3(this.positionHomeMonsters[1].pos.x + window.innerWidth * 1., this.positionHomeMonsters[1].pos.y, this.positionHomeMonsters[1].pos.z), 1., "data/sound/Lulu/raclement.mp3", 1.);
	this.AddFood("scutigerus", new THREE.Vector3(this.positionHomeMonsters[1].pos.x + window.innerWidth * 1.2, this.positionHomeMonsters[1].pos.y + window.innerHeight * 0.2, this.positionHomeMonsters[1].pos.z), 1., "data/sound/Lulu/tripouille.mp3", 1.);
}

ParticleGroupMonsterSound.prototype.AddFood = function(aName, position, size, url, volume)
{
	var lPosition = position.clone();
	lPosition.z = this.positionCenter.z;
	var targetObject = {name:aName, url:url};
	var particle = new ParticleSound( lPosition, volume,targetObject);

	particle.scaleInit = particle.scale.x;
	particle.isMovable = true;
	particle.isEaten = false;
	particle.mSpeed = new THREE.Vector3();
	scene.add( particle );
	sFoodArraySoundWait.push(particle);
	return particle;
}

ParticleGroupMonsterSound.prototype.Init = function()
{
	for(var i = 0; i < sFoodArraySoundWait.length; i++)
	{
		sFoodArraySoundWait[i].SetTextEnabled(true);
	}
};

ParticleGroupMonsterSound.prototype.MouseUp = function()
{
	SELECTED = false;
}

ParticleGroupMonsterSound.prototype.MouseDown = function()
{
	if(INTERSECTED)
	{
		INTERSECTED.MyMouseDown();
		SELECTED = INTERSECTED;
	}
	else
	{
		SELECTED = null;
	}

	if(sFoodArraySound.length > 0 && sPlayingSound)
	{
		var vector = new THREE.Vector3( mouse.x, mouse.y, 0.5 );
		projector.unprojectVector( vector, camera );

		var ray = new THREE.Ray( camera.position, vector.subSelf( camera.position ).normalize() );

		if(ray.intersectObject( sFoodArraySound[0] ).length > 0)
		{
			sPlayingSound.particle.MyMouseDown();
			return;
		}
	}
}

ParticleGroupMonsterSound.prototype.UpdateCamera = function(delta)
{
	if(sPlayingSound)
	{
		this.timer += delta * 0.2;
		this.cameraDistance = window.innerWidth * 0.4;
	}
	else
	{
		this.timer = 0.;
		this.cameraDistance = window.innerWidth * 0.99;	
	}
	cameraTarget = this.positionCenter;
	cameraPosition.x = this.positionCenter.x + Math.sin(this.timer) *  this.cameraDistance;
	cameraPosition.y = this.positionCenter.y + Math.sin(this.timer) *  this.cameraDistance;
	cameraPosition.z = this.positionCenter.z + this.cameraDistance * Math.cos(this.timer);
}

ParticleGroupMonsterSound.prototype.UpdateFood = function(delta)
{
	for(var i = 0; i < sFoodArraySoundWait.length; i++)
	{
		sFoodArraySoundWait[i].Update(delta);	
	}

	for(var i = 0; i < sFoodArraySound.length; i++)
	{
		sFoodArraySound[i].Update(delta);	
	}
}

ParticleGroupMonsterSound.prototype.SwitchNextState = function()
{
	sCurrentResumeSate = ResumeStates.IDLE;
}

ParticleGroupMonsterSound.prototype.Update = function(delta)
{
	controlAuto = false;
	this.UpdateCamera(delta);

	this.UpdateFood(delta);

	this.monster.Update(delta);

	this.UpdateIntersectPlane();

	var vector = new THREE.Vector3( mouse.x, mouse.y, 0.5 );
	projector.unprojectVector( vector, camera );

	var ray = new THREE.Ray( camera.position, vector.subSelf( camera.position ).normalize() );

	var intersects = ray.intersectObjects( sFoodArraySoundWait );

	if( intersects.length > 0 )
	{
		INTERSECTED = intersects[0].object;
		INTERSECTED.MyMouseOn();
	}
	else 
	{
		if(sFoodArraySound.length > 0 && sPlayingSound)
		{
			if(ray.intersectObject( sFoodArraySound[0] ).length > 0)
			{
				sPlayingSound.particle.MyMouseOn();
				return;
			}
		}
		if(sPlayingSound)
		{
			sPlayingSound.particle.MyMouseOff();
		}
		if( INTERSECTED ) 
		{
			INTERSECTED.MyMouseOff();
			INTERSECTED = null;
		}
	}
}

ParticleGroupMonsterSound.prototype.Terminate = function()
{
	infoDisplay.FadeOut();
	setTimeout(function() 
	{
	for(var i = 0; i < sFoodArraySoundWait.length; i++)
	{
		sFoodArraySoundWait[i].SetTextEnabled(false);
	}
	}, 1000);
}

ParticleGroupMonsterSound.prototype.UpdateIntersectPlane = function()
{
	// var vector = new THREE.Vector3( mouse.x, mouse.y, 0.5 );
	// projector.unprojectVector( vector, camera );

	// var ray = new THREE.Ray( camera.position, vector.subSelf( camera.position ).normalize() );

	// var intersects = ray.intersectObject( this.plane, true );

	// if( intersects.length > 0 ) 
	// {
	// 	for(var i = 0; i < this.positionHomeMonsters.length; i++)
	// 	{
	// 		if(intersects[0].point.distanceTo(this.positionHomeMonsters[i].pos) < innerWidth * 0.5)
	// 		{
	// 			infoDisplay.SetSize(3.);
 //   				infoDisplay.SetText([{string:this.positionHomeMonsters[i].name, size: 2}]);
 //   				infoDisplay.SetPosition(this.positionHomeMonsters[i].pos, true);
	// 			infoDisplay.FadeIn();
	// 			return;
	// 		}
	// 	}
	// } 
		var i = (mouse.y < 0) ? 1 : 0;
		if(Math.abs(mouse.y) < 0.3)
		{
			infoDisplay.FadeOut();
			return;
		}

		infoDisplay.SetSize(4.5);
		infoDisplay.SetText([{string:this.positionHomeMonsters[i].name, size: 2}]);
		infoDisplay.SetPosition(new THREE.Vector3(this.positionHomeMonsters[i].pos.x - innerWidth * 0.3, this.positionHomeMonsters[i].pos.y + innerWidth * 0.2, this.positionHomeMonsters[i].pos.z), true);
		infoDisplay.FadeTo(0.1);
}
