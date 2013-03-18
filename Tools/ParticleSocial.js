
var sSocialLeg = [];
var sSocialTarget = false;
var sSocialRadius = 0;
var sCoordSocialTouch;
var sIndexIconClose = -1;
var sCurrentStringInfoSocial = "social";

AddLegSocial("soundcloud", "textures/icons/soundcloud.png", "https://soundcloud.com/aphexhenry");
AddLegSocial("8tracks","textures/icons/8tracks.png", "http://8tracks.com/aphexhenry");
AddLegSocial("blogger","textures/icons/blogger.png", "http://aphexhenry.blogspot.com");
AddLegSocial("youtube","textures/icons/youtube.png", "http://www.youtube.com/user/AphexHenry/videos?flow=grid&view=15");
AddLegSocial("instructable","textures/icons/instructable.png", "http://www.instructables.com/member/AphexHenry/");

programSocial = function ( context ) 
{
	context.lineWidth = 0.015;
	for(var i = 0; i < sSocialLeg.length; i++)
	{
		drawArmSocial(context, 0.7, i, 0.6);
	}

    var centerX = 0.;
    var centerY = 0.;
    context.lineWidth = 0.015;
    context.beginPath();
    context.arc( 0, 0, sRayCircle * 1., 0, PI2, true );
    context.closePath();
    context.stroke();

    sSocialRadius += sSocialTarget ? 0.01 : -0.01;
    sSocialRadius = myClamp(sSocialRadius, 0., sRayCircle);

    if(sSocialRadius < sRayCircle * 0.99)
    {
	    context.beginPath();
	    context.arc( 0, 0, sSocialRadius * 1., 0, PI2, true );
	    context.closePath();
	    context.stroke();
	}
}

function AddLegSocial(aName, texturePath, aUrl)
{
	var canvas = document.createElement('img');
	canvas.src = texturePath;
	
	sSocialLeg.push({name:aName, url:aUrl, angle:0, speedMove: 1. + Math.random(), random:Math.random() * 1.5, posHands: new THREE.Vector2(), canvas:canvas, sizeHand:1.});
	
	for(var i = 0; i < sSocialLeg.length; i++)
	{
		sSocialLeg[i].angle = i * Math.PI * 2. / sSocialLeg.length;
		sSocialLeg[i].angle += Math.random() * 2. / sSocialLeg.length;
	}
}

function drawArmSocial(context, size , i, amp)
{
	var decay = sSocialLeg[i].random;
	var angle = sSocialLeg[i].angle;
	var canvas = sSocialLeg[i].canvas;
	var speedMove = sSocialLeg[i].speedMove;
	size *= 0.69;
	var COS = Math.cos(angle);
	var SIN = Math.sin(angle);
	var posShoulderX =  COS * sRayCircle;
	var posShoulderY = SIN * sRayCircle;
	var posElbowX = posShoulderX + size * (COS * 0.5 + amp * Math.cos(sTime2 + decay * 1.5) * SIN);
	var posElbowY = posShoulderY + size * (SIN * size * 0.5 + amp * Math.cos(sTime2 + decay * 1.5) * -COS);

	posHandX = (posShoulderX + 1. * size * (COS * size + .2 * amp * Math.sin(sTime1 * speedMove + decay * 2.)));
	posHandY = (posShoulderY + 1. * size * (SIN * size + .2 * amp * Math.cos(sTime1 * speedMove+ decay * 2.)));
	sSocialLeg[i].posHands.x = posHandX;
	sSocialLeg[i].posHands.y = posHandY;

	var sizeImage = 0.17;
	if(i == sIndexIconClose)
	{
		sSocialLeg[i].sizeHand += 0.02;
		if(sSocialLeg[i].sizeHand > 1.5)
		{
			sSocialLeg[i].sizeHand = 1.5;
			sCurrentStringInfoSocial = sSocialLeg[i].name;
		}
	}
	else
	{
		sSocialLeg[i].sizeHand -= 0.02;
		sSocialLeg[i].sizeHand = Math.max(1., sSocialLeg[i].sizeHand);	
	}
	sizeImage *= sSocialLeg[i].sizeHand;
	posHandX += (sizeImage * 0.5) * COS;
	posHandY += (sizeImage * 0.5) * SIN;
	context.drawImage(canvas, posHandX - sizeImage * 0.5,posHandY - sizeImage * 0.5, sizeImage, sizeImage);

    context.beginPath();
    context.arc( posHandX, posHandY, sizeImage * .5, 0, PI2, true );
    context.closePath();
    context.stroke();

	context.beginPath();
	context.moveTo(sSocialLeg[i].posHands.x, sSocialLeg[i].posHands.y);
    context.quadraticCurveTo(posElbowX, posElbowY, posShoulderX, posShoulderY);
    context.stroke();
}

function ParticleSocial(aPosition, aSize)
{
	this.particle = new THREE.Particle( new THREE.ParticleCanvasMaterial( { color: '#285cb1', program: programSocial, transparent:true } ) );

	this.particle.position = aPosition.clone();

	this.particle.scale.x = this.particle.scale.y = aSize;
	scene.add( this.particle );


	var programText = function ( context ) 
	{
		var infoText = [];
		infoText.push({string:sCurrentStringInfoSocial, size: 2});
		SetTextInCanvas(infoText, context.canvas)
	}

	this.info = new THREE.Particle( new THREE.ParticleCanvasMaterial( { color: PickColor(), program: programText, transparent:true, opacity:0.4 } ) );
	this.info.position = aPosition.clone();
	this.info.scale.x = this.particle.scale.x * 0.07;
	this.info.scale.y = -this.info.scale.x;
	scene.add( this.info );

	// create the mesh's material
	this.plane = new THREE.Mesh( new THREE.PlaneGeometry( this.particle.scale.x * 1.5, this.particle.scale.x * 1.5, 8, 8 ), new THREE.MeshBasicMaterial( { color: 0x000000, opacity: 0.25, transparent: true, wireframe: true } ) );
	this.plane.geometry.applyMatrix( new THREE.Matrix4().makeRotationX( Math.PI / 2 ) );
	this.plane.visible = false;
	this.plane.position = aPosition.clone();
	scene.add( this.plane );

	this.particleClear = new THREE.Particle( new THREE.ParticleCanvasMaterial( { color: Math.random() * 0x808080 + 0x808080, program: programStroke, opacity:0 } ) );
	var width = window.innerWidth * 1.5;
	this.particleClear.scale.x = this.particleClear.scale.y = this.particle.scale.x * 2.;
	scene.add( this.particleClear );
	this.particleClear.position = this.particle.position;

	this.touched = false;
}

ParticleSocial.prototype.Update = function(delta)
{
	sTime2 += delta * 3;
	sTime1 += delta * 1;
	if(this.touched && (sIndexIconClose <= -1))
	{
		this.info.material.opacity *= 0.9;
	}
	else if(this.touched)
	{
		this.info.material.opacity += delta;
		this.info.material.opacity = Math.min(this.info.material.opacity, 1.);
	}

	this.plane.lookAt(cameraManager.GetPosition());

	// for(var i = 0; i < sSocialLeg.length; i++)
	// {
	// 	sSocialLeg[i].particle.position.x = sSocialLeg[i].posHands * this.particle.scale.y;
	// }
}

ParticleSocial.prototype.SetTouched = function(aTouched)
{
	if(aTouched)
	{
		if(this.touched && (sIndexIconClose >= 0))
		{
			open_in_new_tab(sSocialLeg[sIndexIconClose].url);
		}
		this.touched = true;
		// SELECTED = this.particle;
		// cameraTarget = this.particle.position.clone();
		// cameraPosition = cameraTarget.clone();
		// cameraPosition.z += window.innerWidth * 0.2;
		// cameraTarget.x += window.innerWidth * 0.01;
	}
	else
	{
		sCurrentStringInfoSocial = "social";
		sIndexIconClose = -1;
		this.touched = false;
	}
}

ParticleSocial.prototype.SetTarget = function(aTarget, aNum)
{
	if(this.touched)
	{
		if(aTarget)
		{
			aNum -= (Math.floor(aNum / 9));
			sCoordSocialTouch = new THREE.Vector2(aNum - (Math.floor(aNum / 8) * 8), Math.floor(aNum / 8));
			sCoordSocialTouch.x = -1 + sCoordSocialTouch.x / 4;
			sCoordSocialTouch.y = 1 - sCoordSocialTouch.y / 4;
			console.log(aNum);

			var distanceMin = 2.;
			var distance = 0;
			for(var i = 0; i < sSocialLeg.length; i++)
			{
				distance = sCoordSocialTouch.distanceToSquared(sSocialLeg[i].posHands);
				if(distance < distanceMin)
				{
					distanceMin = distance;
					sIndexIconClose = i;
				}
			}
		}
		else
		{
			sIndexIconClose = -1;
		}
		return;
	}
	if(aTarget)
	{
		sSocialTarget = true;
		this.info.material.opacity += 0.02;
		this.info.material.opacity = Math.min(1., this.info.material.opacity);
	}
	else
	{
		sSocialTarget = false;
		this.info.material.opacity -= 0.02;
		this.info.material.opacity = Math.max(OPACITY_INFO, this.info.material.opacity);
	}
}
