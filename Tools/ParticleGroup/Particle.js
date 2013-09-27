
var FLIP_ROTATION_SPEED = 15.;
var CONSERVATION_OF_VELOCITY = 0.95;
var sShowPartPosition = new THREE.Vector3(0., 0., 0.);
var sFrameRate = 1.;

var sGroupCurrent = ParticleGroup.PART_INTRO;

function GetReference(aName, aDescription, aPath, aChromeOnly, aCPUUse, aOtherPage)
{
	if(!aOtherPage)
	{
		aOtherPage = false;
	}
	var lObject = {name:aName, description:aDescription, path:aPath, chromeOnly:aChromeOnly, cpuUse:aCPUUse, newDomain:aOtherPage};
	return lObject;
}

function ParticleGroupWebExperiment(positionCenter, name) 
{
	this.name = name;
	this.references = [];
	this.references.push(GetReference("Slug Journey", "", "WebExperiments/slug", true, "high"));
	this.references.push(GetReference("Moving Mirror", "", "WebExperiments/mirror", true, "high"));
	this.references.push(GetReference("3D Videos", "", "WebExperiments/videos", true, "high"));
	this.references.push(GetReference("Plane Forest", "", "WebExperiments/LightForest", true, "high"));
	this.references.push(GetReference("Plane Forest", "", "WebExperiments/LightForest", true, "high"));
	this.references.push(GetReference("Sound Visu", "", "WebExperiments/SoundVisu", true, "high"));
	var width = window.innerWidth * .7;
	this.cameraDistance = width * 0.6;
	this.positionCenter = positionCenter;
	this.particles = [];

	for ( var i = 0; i < this.references.length; i ++ ) 
	{
		for(var j = 0; j < 2; j++)
		{
			var particle = new THREE.Particle( new THREE.ParticleCanvasMaterial( { color: PickColor(), program: programStroke, transparent:true } ) );
			particle.position.x = positionCenter.x + Math.random() * width - width * 0.5;
			particle.position.y = positionCenter.y + Math.random() * width - width * 0.5;
			particle.position.z = positionCenter.z + Math.random() * width - width * 0.5;
			particle.scale.x = particle.scale.y = (Math.random() + 4) * width * 0.0065;
			particle.WebObject = this.references[i];
			scene.add( particle );
			this.particles.push(particle);
		}
	}
}

ParticleGroupWebExperiment.prototype.Init = function()
{
	$("#roundCorner").load("html/aboutWebExperiments.html");
	
	setTimeout(function() {$("#roundCorner").slideDown(500);}, 1500);
	$('body').bind('touchend mousedown',function(e){
   	if( e.target.id == 'roundCorner' )
   	{
    	return true; 
   	}
   	else
   	{
    	$("#roundCorner").slideUp(400);
	}

	});
}

ParticleGroupWebExperiment.prototype.MouseUp = function()
{
}

ParticleGroupWebExperiment.prototype.MouseDown = function()
{
	if(INTERSECTED)
	{
		if(SELECTED === INTERSECTED)
		{
			if(!SELECTED.WebObject.newDomain)
			{
				ImageFrontCtx.fillStyle = '#ffffff';
				var newURL = window.location.href.substring(0, window.location.href.indexOf('#')) + SELECTED.WebObject.path;
				GoToURL(newURL);
				// document.location.href += ;
			}
			else
			{
				GoToURL(SELECTED.WebObject.path);
			}
		}
		SELECTED = INTERSECTED;
		cameraTarget = INTERSECTED.position.clone().addSelf(infoDisplay.particle.position).multiplyScalar(0.5);
		cameraPosition = cameraTarget.clone();
		cameraPosition.z += window.innerWidth * 0.2;
		cameraTarget.x += window.innerWidth * 0.05;
		INTERSECTED.material.program = programTriangle;
	}
	else
	{
		SELECTED.material.program = programStroke;
		SELECTED = null;
	}
}

ParticleGroupWebExperiment.prototype.Terminate = function()
{
	$("#roundCorner").slideUp(400);
}

ParticleGroupWebExperiment.prototype.Update = function()
{
	var vector = new THREE.Vector3( mouse.x, mouse.y, 0.5 );
	projector.unprojectVector( vector, camera );

	var ray = new THREE.Ray( camera.position, vector.subSelf( camera.position ).normalize() );

	var intersects = ray.intersectObjects( this.particles );

	if ( intersects.length > 0 ) 
	{

		if ( INTERSECTED != intersects[ 0 ].object ) {

			if ( INTERSECTED ) INTERSECTED.material.program = programStroke;

			INTERSECTED = intersects[ 0 ].object;

			if(INTERSECTED === SELECTED)
			{
				INTERSECTED.material.program = programTriangle;
			}
			else
			{
				sWaterHeight = 0.01;
				INTERSECTED.material.program = programFill;
			}
		}

			var webObject = INTERSECTED.WebObject;
			if(webObject)
			{
				var text = [];
				//infoCanvas = infoDisplay.GetCanvas();
				text.push({string:webObject.name, size: 2});
				if(webObject.chromeOnly)
				{
					text.push({string: "Chrome Only", size: 1});
				}
				if(webObject.cpuUse.length > 0)
				{
					text.push({string:"CPU need : " + webObject.cpuUse, size: 1});
				}
				if(webObject.description.length > 0)
				{
					text.push({string:webObject.description, size: 1});
				}

				infoDisplay.SetSize(.5);
				infoDisplay.SetText(text);
				infoDisplay.SetPosition(INTERSECTED.position);
				infoDisplay.FadeIn();
			}

	} 
	else 
	{
		if(!SELECTED)
		{
			infoDisplay.FadeOut();
		}

		if ( INTERSECTED ) INTERSECTED.material.program = programStroke;

		INTERSECTED = null;
	}
}

function ParticleGroupIntro(positionCenter, flyer, name, id) 
{
	this.name = name;
	this.id = id;
	ParticleGroups[id] = this;

	this.particles = [];
	this.particlesToUpdate = [];

	this.cameraDistance = window.innerWidth * 0.27;
	this.cameraDistanceNormal = this.cameraDistance;
	this.positionCenter = positionCenter;
	var angleDecay = 2 * Math.PI / flyer.length + Math.random() * 0.2;

	for ( var i = 0; i < flyer.length; i ++ ) 
	{
		if(isdefined(flyer[i].target))
		{
			Organigram.Map(this.id, flyer[i].target);
		}
		if((isdefined(flyer[i].targetURL) || isdefined(flyer[i].targetHTML)) && !isdefined(flyer[i].addRandom))
		{
			sProjectsToRandom.push(flyer[i]);
		}
		// var particle = new THREE.Particle( new THREE.ParticleCanvasMaterial( { color: PickColor(), program: programStroke, transparent:true } ) );
		var lPosition = new THREE.Vector3();

		if(isdefined(flyer[i].position))
		{
			lPosition.x = positionCenter.x + flyer[i].position.x;
			lPosition.y = positionCenter.y + flyer[i].position.y;
			lPosition.z = positionCenter.z + flyer[i].position.z;
		}
		else
		{
			lPosition.x = positionCenter.x + 1.2 * sWIDTH * Math.sin( i * angleDecay + Math.PI + Math.random() * 1. / flyer.length);
			lPosition.y = positionCenter.y + 1.2 * sWIDTH * Math.sin( i * angleDecay + Math.random() * 2. / flyer.length);
			lPosition.z = positionCenter.z + 1.2 * sWIDTH * Math.cos( i * angleDecay + Math.PI+ Math.random() * 2. / flyer.length);
		}

		var particle = new ParticleCircleNavigate(lPosition, flyer[i]);
		this.particles.push(particle);
	}
}

ParticleGroupIntro.prototype.MouseDown = function()
{
	if(INTERSECTED)
	{
		if(isdefined(INTERSECTED.TargetObject.isAutonomous))
		{
			INTERSECTED.MyMouseDown();
			this.cameraDistance = INTERSECTED.MyCameraDistance();
			return;
		}

		INTERSECTED.material.program = programStroke;
		INTERSECTED.TargetObject.info.material.opacity = OPACITY_INFO;
		if(typeof INTERSECTED.TargetObject.target != "undefined")
		{
			GoToIndex(INTERSECTED.TargetObject.target);
		}
		else if(typeof INTERSECTED.TargetObject.targetHTML != "undefined")
		{
			CirclesToHtml(INTERSECTED.TargetObject.targetHTML);
		}
		else if(typeof INTERSECTED.TargetObject.targetURL != "undefined")
		{
			ImageFrontCtx.fillStyle = '#ffffff';
			var newURL = window.location.href.substring(0, window.location.href.indexOf('#')) + INTERSECTED.TargetObject.targetURL;
			GoToURL(newURL);
		}
	}
	else
	{
		this.cameraDistance = this.cameraDistanceNormal;
		if(SELECTED)
		{
			SELECTED.material.program = programStroke;
			SELECTED.TargetObject.info.material.opacity = OPACITY_INFO;
			SELECTED = null;
		}
	}
}

ParticleGroupIntro.prototype.AddParticle = function(aParticleObject)
{
	this.particles.push(aParticleObject.particle);
	this.particlesToUpdate.push(aParticleObject);
	if(isdefined(aParticleObject.target))
	{
		if(isdefined(aParticleObject.target.target))
		{
			Organigram.Map(this.id, aParticleObject.target.target);
		}
	}
}

ParticleGroupIntro.prototype.MouseUp = function()
{

}

ParticleGroupIntro.prototype.BackFromHTML = function()
{
	this.cameraDistance = this.cameraDistanceNormal;
}

ParticleGroupIntro.prototype.GetParticleThatLeadTo = function(aTarget)
{
	for(var i = 0; i< this.particles.length; i++)
	{
		if(this.particles[i].TargetObject.target == aTarget)
		{
			return this.particles[i];
		}
	}
}

ParticleGroupIntro.prototype.Init = function()
{
	for(var i in this.particles)
	{
		if(isdefined(this.particles[i].SetTextVisible))
		{
			this.particles[i].SetTextVisible(true);
		}
	}
};

ParticleGroupIntro.prototype.Terminate = function()
{
	if(INTERSECTED && !isdefined(INTERSECTED.TargetObject.isAutonomous))
	{
		INTERSECTED.material.program = programStroke;
	}
}

ParticleGroupIntro.prototype.Update = function()
{
	for(var i = 0; i < this.particlesToUpdate.length; i++)
	{
		this.particlesToUpdate[i].Update(0.02);
	}

	var vector = new THREE.Vector3( mouse.x, mouse.y, 0.5 );
	projector.unprojectVector( vector, camera );

	var ray = new THREE.Ray( camera.position, vector.subSelf( camera.position ).normalize() );

	var intersects = ray.intersectObjects( this.particles );

	if ( intersects.length > 0 ) 
	{
		if ( INTERSECTED != intersects[ 0 ].object ) {

			if ( INTERSECTED ) 
			{
				if(isdefined(INTERSECTED.TargetObject.isAutonomous))
				{
					INTERSECTED.MyMouseOff(intersects[ 0 ]);
				}
				else
				{
					INTERSECTED.material.program = programStroke;
				}

				INTERSECTED.TargetObject.info.material.opacity = OPACITY_INFO;
			}

			INTERSECTED = intersects[ 0 ].object;
			
			if(isdefined(INTERSECTED.TargetObject.isAutonomous))
			{
				INTERSECTED.MyMouseOn(intersects[ 0 ]);
				return;
			}
			else
			{
				sWaterHeight = 0.01;
				INTERSECTED.material.program = programFill;
			}
		}
		if(isdefined(INTERSECTED.TargetObject.info))
		{
			INTERSECTED.TargetObject.info.material.opacity += (1. - INTERSECTED.TargetObject.info.material.opacity) * 2. * 0.02;
		}
	}
	else 
	{
		if ( INTERSECTED ) 
		{
			if(isdefined(INTERSECTED.TargetObject.isAutonomous))
			{
				if(!IS_PHONE)
				{
					INTERSECTED.MyMouseOff(intersects[ 0 ]);
				}
				else
				{
					INTERSECTED.MyMouseOn(intersects[ 0 ]);
				}
			}
			else
			{
				INTERSECTED.material.program = programStroke;
			}
			INTERSECTED.TargetObject.info.material.opacity = OPACITY_INFO;
		}
		INTERSECTED = null;
	}
}
