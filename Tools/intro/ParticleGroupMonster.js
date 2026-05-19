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
	this.positionCenterInitial = positionCenter.clone();
	this.name = name;
	this.id = sTools.ParticleGroup.PART_INTRO;
	// this.goAway = false;
	this.speed = { x: 0, y: 0 };
	this.cameraZRatio = 0.6;
	this.cameraZTimer = 0.;
	this.menuParticles = [];
	this.menuParticlesToUpdate = [];
	this.particles = [];
	this.NavigatorsCenter = null;
	this.navigatorsAngleAmplitude = Math.PI / 4;
	this.navigatorsVerticalAngleAmplitude = Math.PI / 16;
	// this.particleRotate = new THREE.Vector3(0, 0, 0);
	this.particleRotateSpeed = new THREE.Vector3(0, 0, 0);

	this.monster = new MonsterIntro(positionCenter, this.width);
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

ParticleGroupMonster.prototype.AddFood = function(aName, position, speed, size, aPositionTarget, aLetterColor, setToFinalPosition = false)
{
	var lPosition = position.clone();
	lPosition.z = this.positionCenter.z;
	var particle = new ParticleLetter( lPosition, aName, aPositionTarget, size, aLetterColor);

	particle.scaleInit = particle.scale.x;
	particle.isMovable = !setToFinalPosition;
	particle.isTarget = setToFinalPosition;
	particle.mSpeed = speed.clone();
	if(setToFinalPosition)
	{
		particle.position.x = aPositionTarget.x;
		particle.position.y = aPositionTarget.y;
		particle.position.z = aPositionTarget.z;
	}
	scene.add( particle );
	sFoodArray.push(particle);
	return particle;
}

ParticleGroupMonster.prototype.AddString = function(aText, aPosition, aTextSize = 0.03, aTextColor = 0x000000)
{
	var size = window.innerWidth * aTextSize;
	var spaceInit = size * 1.9;
	var position = aPosition.clone();
	position.addSelf(this.positionCenter);
	var width = window.innerWidth * 0.5;
	var testCanvas = document.createElement('canvas');
	var context = testCanvas.getContext('2d');
        context.font = size + "pt TitleText";
        context.textAlign = "left";
    var etalon = context.measureText('a').width;
	var thisSize = 0;
	for(var i = 0; i < aText.length; i++)
	{
		var textMeasured = context.measureText(aText[i]);
		thisSize = textMeasured.width / etalon;
		position.x += spaceInit * thisSize * 0.5;
		var isFinalPosition = i % 7 == 0 || i % 5 == 0 || i % 3 == 0;
		this.AddFood(aText[i], new THREE.Vector3(this.positionCenter.x + myRandom() * width * 0.7, this.positionCenter.y + (myRandom() - 0.4) * width * 0.6, 0), new THREE.Vector3(), size, position.clone(), aTextColor, isFinalPosition);	
		position.x += spaceInit * thisSize * 0.5;
	}
}

ParticleGroupMonster.prototype.InitFood = function(width)
{
	this.AddString("Baptiste Bohelay", new THREE.Vector3(-window.innerWidth * .4, window.innerHeight * 0.3, 0));
	this.AddString("Developer & Designer", new THREE.Vector3(-window.innerWidth * .4, window.innerHeight * 0.3 - window.innerWidth * 0.08, 0), 0.023, 0x666666);
}

ParticleGroupMonster.prototype.MouseUp = function()
{
	SELECTED = false;	
}

ParticleGroupMonster.prototype.GetMenuPositionCenter = function()
{
	// Push z toward the camera so the particles are ~w*0.27 in front of it,
	// matching the apparent scale they had in the old PART_CREA_LULU group
	// (which used cameraDistance = w*0.27, vs the intro's much larger (w+h)*0.45).
	var zOffset = this.cameraDistance - window.innerWidth * 0.27;
	return this.positionCenter.clone().addSelf(new THREE.Vector3(window.innerWidth * 0.0, window.innerHeight * 0.0, zOffset));
}

ParticleGroupMonster.prototype.SetMenuParticleVisible = function(aParticle, aVisible)
{
	aParticle.visible = aVisible;
	if(isdefined(aParticle.TargetObject.info))
	{
		aParticle.TargetObject.info.visible = aVisible;
	}
	if(isdefined(aParticle.TargetObject.particleClear))
	{
		aParticle.TargetObject.particleClear.visible = aVisible;
	}
}

ParticleGroupMonster.prototype.AddParticle = function(aParticleObject)
{
	var particle = aParticleObject.particle;
	particle.positionTargetIntro = particle.position.clone();
	particle.SetPosition(particle.positionTargetIntro.clone());
	if(isdefined(this.NavigatorsCenter))
	{
		particle.navigatorOffset = particle.positionTargetIntro.clone().subSelf(this.NavigatorsCenter);
	}
	this.SetMenuParticleVisible(particle, true);
	if(isdefined(particle.SetTextVisible))
	{
		particle.SetTextVisible(true);
	}

	this.menuParticles.push(particle);
	this.menuParticlesToUpdate.push(aParticleObject);
	this.particles = this.menuParticles;
	if(isdefined(aParticleObject.target) && isdefined(aParticleObject.target.target))
	{
		Organigram.Map(this.id, aParticleObject.target.target);
	}
}

ParticleGroupMonster.prototype.UpdateMenuParticles = function(delta)
{
	for(var j = 0; j < this.menuParticlesToUpdate.length; j++)
	{
		if(isdefined(this.menuParticlesToUpdate[j].Update))
		{
			this.menuParticlesToUpdate[j].Update(delta);
		}
	}
}

ParticleGroupMonster.prototype.UpdateNavigatorsRotation = function()
{
	if(!isdefined(this.NavigatorsCenter) || this.menuParticles.length === 0)
		return;

	var theta = -mouse.x * this.navigatorsAngleAmplitude;
	var phi = mouse.y * this.navigatorsVerticalAngleAmplitude;

	this.particleRotateSpeed.x += (phi - this.particleRotateSpeed.x) * 0.03;
	this.particleRotateSpeed.y += (theta - this.particleRotateSpeed.y) * 0.03;

	// this.particleRotate.x += this.particleRotateSpeed.x * 0.03;
	// this.particleRotate.y += this.particleRotateSpeed.y * 0.03;

	// this.particleRotateSpeed.x = this.particleRotateSpeed.x * 0.96;
	// this.particleRotateSpeed.y = this.particleRotateSpeed.y * 0.96;

	var cosT = Math.cos(this.particleRotateSpeed.y);
	var sinT = Math.sin(this.particleRotateSpeed.y);
	var cosP = Math.cos(this.particleRotateSpeed.x);
	var sinP = Math.sin(this.particleRotateSpeed.x);
	var cx = this.NavigatorsCenter.x;
	var cy = this.NavigatorsCenter.y;
	var cz = this.NavigatorsCenter.z;

	for(var i = 0; i < this.menuParticles.length; i++)
	{
		var particle = this.menuParticles[i];
		if(!isdefined(particle.navigatorOffset))
			continue;

		var ox = particle.navigatorOffset.x;
		var oy = particle.navigatorOffset.y;
		var oz = particle.navigatorOffset.z;
		// Y axis (mouse.x), then X axis (mouse.y)
		var x1 = ox * cosT + oz * sinT;
		var y1 = oy;
		var z1 = -ox * sinT + oz * cosT;
		particle.position.x = cx + x1;
		particle.position.y = cy + y1 * cosP - z1 * sinP;
		particle.position.z = cz + y1 * sinP + z1 * cosP;
		particle.SetPosition(particle.position);
	}
}

ParticleGroupMonster.prototype.IsMenuParticle = function(aParticle)
{
	for(var i = 0; i < this.menuParticles.length; i++)
	{
		if(this.menuParticles[i] === aParticle)
		{
			return true;
		}
	}
	return false;
}

ParticleGroupMonster.prototype.SelectMenuParticle = function(aParticle)
{
	if(isdefined(aParticle.TargetObject.isAutonomous))
	{
		aParticle.MyMouseDown();
		this.cameraDistance = aParticle.MyCameraDistance();
		return;
	}

	aParticle.material.program = programStroke;
	aParticle.TargetObject.info.material.opacity = OPACITY_INFO;
	if(typeof aParticle.TargetObject.target != "undefined")
	{
		GoToIndex(aParticle.TargetObject.target);
	}
	else if(typeof aParticle.TargetObject.targetHTML != "undefined")
	{
		CirclesToHtml(aParticle.TargetObject.targetHTML);
	}
	else if(typeof aParticle.TargetObject.targetURL != "undefined")
	{
		ImageFrontCtx.fillStyle = '#ffffff';
		var newURL = window.location.href.substring(0, window.location.href.indexOf('#')) + aParticle.TargetObject.targetURL;
		GoToURL(newURL);
	}
}

ParticleGroupMonster.prototype.MouseDown = function()
{
	if(IS_PHONE)
		this.UpdatePointer();

	if(this.menuParticles.length > 0 && INTERSECTED && this.IsMenuParticle(INTERSECTED))
	{
		this.SelectMenuParticle(INTERSECTED);
		return;
	}

	if(INTERSECTED || !sEnd)
	{
		sEnd = true;
		// this.goAway = true;
		
		$('#githubButton').slideUp(300);
		$('#contactButton').slideUp(200);
		
		infoDisplay.FadeOut();
		// $('#githubButton').slideUp();
	}
}

ParticleGroupMonster.prototype.UpdateCamera = function(delta)
{
	this.cameraZTimer += delta;
	var delay = 2.;
	var t = Math.min(1., Math.max(0., this.cameraZTimer - delay));
	t = t * t * (3. - 2. * t);
	this.cameraZRatio = 0.7 + 0.3 * t;

	cameraTarget = sTools.ParticleGroups[sTools.ParticleGroup.PART_INTRO].positionCenter;
	cameraPosition = this.GetCameraPosition();
	this.positionCenter.x = this.positionCenterInitial.x + t * window.innerWidth * 0.25;
	this.positionCenter.y = this.positionCenterInitial.y - t * window.innerHeight * 0.3;
}

ParticleGroupMonster.prototype.GetCameraPosition = function()
{
	return new THREE.Vector3(
		this.positionCenter.x + this.cameraDistance * 0.0,
		this.positionCenter.y,
		this.positionCenter.z + this.cameraDistance * this.cameraZRatio
	);
}

/*
* update the position of the letters.
*/
ParticleGroupMonster.prototype.UpdateFood = function(delta)
{
	var lPart;
	for(var i = 0; i < sFoodArray.length; i++)
	{
		lPart = sFoodArray[i];
		if(lPart.isMovable && !lPart.isEaten)
		{
			// lPart.mSpeed.x += myRandom() * window.innerHeight * 0.02;
			lPart.mSpeed.x += (this.positionCenter.x - lPart.position.x) * 0.003;
			// lPart.mSpeed.y += myRandom() * window.innerHeight * 0.02;
			lPart.mSpeed.y += (this.positionCenter.y - lPart.position.y) * 0.003;
			lPart.position.x += lPart.mSpeed.x * delta;
			lPart.position.y += lPart.mSpeed.y * delta;
			lPart.SetPosition(lPart.position);
			lPart.mSpeed.multiplyScalar(0.95);
		}
		// if(this.goAway)
		// {
		// 	lPart.mSpeed.x += myRandom() * window.innerHeight * 0.02;
		// 	lPart.mSpeed.x += (this.positionCenter.x - lPart.position.x) * -0.3;
		// 	lPart.mSpeed.y += myRandom() * window.innerHeight * 0.02;
		// 	lPart.mSpeed.y += (this.positionCenter.y - lPart.position.y) * -0.3;
		// 	lPart.position.x += lPart.mSpeed.x * delta;
		// 	lPart.position.y += lPart.mSpeed.y * delta;
		// 	lPart.SetPosition(lPart.position);
		// 	lPart.mSpeed.multiplyScalar(0.95);
		// }
	}

	var lSpeedX = (this.positionCenter.x + window.innerWidth * 0.3 - sMonster.position.x + window.innerWidth * 0.6);
	var lSpeedY = (this.positionCenter.y + window.innerHeight * 0.3 - sMonster.position.y - window.innerHeight * 0.2);
	sMonster.speed = { x: lSpeedX, y: lSpeedY };

	sMonster.position.x += lSpeedX * delta * 0.45;
	sMonster.position.y += lSpeedY * delta * 0.45;
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
	controlAuto = sTools.CameraControlType.NONE;
	this.UpdateCamera(delta);

	this.UpdateFood(delta);

	this.monster.Update(delta);
	this.UpdateMenuParticles(delta);
	this.UpdateNavigatorsRotation();

	this.UpdateIntersectPlane();
}

ParticleGroupMonster.prototype.Init = function()
{
	if(!this.menuParticles.length)
	{
		this.particles = [];
		return;
	}
	this.particles = this.menuParticles;
	for(var i = 0; i < this.menuParticles.length; i++)
	{
		this.SetMenuParticleVisible(this.menuParticles[i], true);
	}
};
ParticleGroupMonster.prototype.Terminate = function()
{
	// for(var i = 0; i < sFoodArray.length; i++)
	// {
	// 	scene.remove(sFoodArray[i]);
	// }
}

ParticleGroupMonster.prototype.UpdateIntersectPlane = function()
{
	if(IS_PHONE)
		return;

	if(this.menuParticles.length > 0 || sEnd)
	{
		this.UpdatePointer();
	}
}

ParticleGroupMonster.prototype.UpdatePointer = function()
{
	var vector = new THREE.Vector3( mouse.x, mouse.y, 0.5 );
	projector.unprojectVector( vector, camera );

	var ray = new THREE.Ray( camera.position, vector.subSelf( camera.position ).normalize() );

	if(this.menuParticles.length > 0)
	{
		var menuIntersects = ray.intersectObjects(this.menuParticles);
		if(menuIntersects.length > 0)
		{
			if(INTERSECTED != menuIntersects[0].object)
			{
				if(INTERSECTED && this.IsMenuParticle(INTERSECTED))
				{
					if(isdefined(INTERSECTED.TargetObject.isAutonomous))
					{
						INTERSECTED.MyMouseOff(menuIntersects[0]);
					}
					else
					{
						INTERSECTED.material.program = programStroke;
					}
					INTERSECTED.TargetObject.info.material.opacity = OPACITY_INFO;
				}

				INTERSECTED = menuIntersects[0].object;
				if(isdefined(INTERSECTED.TargetObject.isAutonomous))
				{
					INTERSECTED.MyMouseOn(menuIntersects[0]);
					return;
				}
				INTERSECTED.material.program = programFill;
			}

			if(isdefined(INTERSECTED.TargetObject.info))
			{
				INTERSECTED.TargetObject.info.material.opacity += (1. - INTERSECTED.TargetObject.info.material.opacity) * 2. * 0.02;
			}
			return;
		}

		if(INTERSECTED && this.IsMenuParticle(INTERSECTED))
		{
			if(isdefined(INTERSECTED.TargetObject.isAutonomous))
			{
				INTERSECTED.MyMouseOff(menuIntersects[0]);
			}
			else
			{
				INTERSECTED.material.program = programStroke;
			}
			INTERSECTED.TargetObject.info.material.opacity = OPACITY_INFO;
			INTERSECTED = null;
		}
	}

	var intersects = ray.intersectObject( sMonster );

	if ( intersects.length > 0 ) 
	{
			INTERSECTED = intersects[ 0 ].object;
			if(intersects[0].distance < INTERSECTED.boundRadiusScale * sRayCircle)
			{
				// sMonster.material.program = monsterTouched;
				this.monster.setMouseOverDisplay();
				return;
			}
	} 
	this.monster.setNormalDisplay();
}

