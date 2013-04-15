

var sParticlesBubbles = [];
for(var x = 0; x < 4; x++)
{
	for(var y = 0; y < 3; y++)
	{
		var positionEnd = new THREE.Vector3((x / 3.) * 0.7 + myRandom() * 0.02, (y / 3.) * 0.7 + myRandom() * 0.02, 0.);
		sParticlesBubbles.push({strength:1., size: 0.3,speed:new THREE.Vector3(), position:positionEnd.clone(), positionEnd:positionEnd});
	}
}

var positionEnd = new THREE.Vector3(-0.2, 0.8, 0.);
sParticlesBubbles.push({strength:0.6, size: 0.15,speed:new THREE.Vector3(), position:positionEnd.clone(), positionEnd:positionEnd});
positionEnd = new THREE.Vector3(-0.1, 0.7, 0.);
sParticlesBubbles.push({strength:0.8, size: 0.2,speed:new THREE.Vector3(), position:positionEnd.clone(), positionEnd:positionEnd});
positionEnd = new THREE.Vector3(-0.35, 0.81, 0.);
sParticlesBubbles.push({strength:0.2, size: 0.09,speed:new THREE.Vector3(), position:positionEnd.clone(), positionEnd:positionEnd});
positionEnd = new THREE.Vector3(-0.41, 0.87, 0.);
sParticlesBubbles.push({strength:0.15, size: 0.07,speed:new THREE.Vector3(), position:positionEnd.clone(), positionEnd:positionEnd});
positionEnd = new THREE.Vector3(-0.46, 0.9, 0.);
sParticlesBubbles.push({strength:0.08, size: 0.04,speed:new THREE.Vector3(), position:positionEnd.clone(), positionEnd:positionEnd});

var sInfoText = [];

var programTextInfo = function ( context ) 
{
	SetTextInCanvas(sInfoText, context.canvas);
}

var programBubbles = function(context)
{
	for(var i = 0; i < sParticlesBubbles.length; i++)
	{
	    context.beginPath();
	    context.arc( sParticlesBubbles[i].position.x, sParticlesBubbles[i].position.y, sParticlesBubbles[i].size, 0, PI2, true );
	    context.closePath();
	    context.fill();
	}
}

function InfoDisplay(aSize, aSpeedFade) 
{
	// this.canvas = aCanvas;
	this.fadeIn = false;
	this.speedFade = aSpeedFade;
	this.aimed = false;
	this.targetOpacity = 0.;

	this.particle = new THREE.Particle( new THREE.ParticleCanvasMaterial( { color: 0xffffff, program: programBubbles, transparent: true
 } ) );
	this.particle.position.x = Math.random() * 800 - 400;
	this.particle.position.y = Math.random() * 800 - 400;
	this.particle.position.z = Math.random() * 800 - 400;
	this.particle.scale.x = window.innerWidth * 0.015;
	this.particle.scale.y = -this.particle.scale.x;
	scene.add( this.particle );

	this.particleBack = new THREE.Particle( new THREE.ParticleCanvasMaterial( { color: 0x000000, program: programBubbles, transparent: true
 } ) );
	this.particleBack.position.x = Math.random() * 800 - 400;
	this.particleBack.position.y = Math.random() * 800 - 400;
	this.particleBack.position.z = Math.random() * 800 - 400;
	this.particleBack.scale.x = this.particle.scale.x * 1.02;
	this.particleBack.scale.y = -this.particleBack.scale.x;
	scene.add( this.particleBack );

	this.particleText = new THREE.Particle( new THREE.ParticleCanvasMaterial( { color: 0x000000, program: programTextInfo, transparent: true
 } ) );
	this.particleText.position.x = Math.random() * 800 - 400;
	this.particleText.position.y = Math.random() * 800 - 400;
	this.particleText.position.z = Math.random() * 800 - 400;
	this.particleText.scale.x = this.particle.scale.x * 0.1;
	this.particleText.scale.y = -this.particleText.scale.x;
	scene.add( this.particleText );

	this.particle.material.opacity = this.targetOpacity;
	this.particleBack.material.opacity = this.particle.material.opacity;
	this.particleText.material.opacity = this.particle.material.opacity;
}

InfoDisplay.prototype.SetSize = function(size)
{
	this.particle.scale.x = window.innerWidth * 0.015 * size;
	this.particle.scale.y = -this.particle.scale.x;
	this.particleBack.scale.x = this.particle.scale.x * 1.05;
	this.particleBack.scale.y = this.particle.scale.y * 1.05;
	this.particleText.scale.x = this.particle.scale.x * 0.07;
	this.particleText.scale.y = this.particle.scale.y * 0.07;
}

/*
 * Update camera.
 */
InfoDisplay.prototype.Update = function(aTimeInterval)
{
	if(this.fadeIn)
	{
		this.particle.material.opacity += aTimeInterval * this.speedFade * this.targetOpacity;
		this.particle.material.opacity = Math.min(this.targetOpacity, this.particle.material.opacity);
	}
	else
	{
		this.particle.material.opacity -= aTimeInterval * this.speedFade * this.targetOpacity;
		this.particleBack.material.opacity = this.particle.material.opacity;
		this.particleText.material.opacity = this.particle.material.opacity;

		if(this.particle.material.opacity < 0.01)
		{
			this.particle.material.visible = false;
			this.particle.material.opacity = Math.max(0, this.particle.material.opacity);
		}
	}
	
	this.particleBack.material.opacity = this.particle.material.opacity;
	this.particleText.material.opacity = this.particle.material.opacity;

	for(var i = 0; i < sParticlesBubbles.length; i++)
	{
		sParticlesBubbles[i].speed.x += (myRandom() * sParticlesBubbles[i].strength + sParticlesBubbles[i].positionEnd.x - sParticlesBubbles[i].position.x) * aTimeInterval * 0.5;
		sParticlesBubbles[i].speed.y += (myRandom() * sParticlesBubbles[i].strength + sParticlesBubbles[i].positionEnd.y - sParticlesBubbles[i].position.y) * aTimeInterval * 0.5;
		sParticlesBubbles[i].position.x += sParticlesBubbles[i].speed.x * aTimeInterval;
		sParticlesBubbles[i].position.y += sParticlesBubbles[i].speed.y * aTimeInterval;
		sParticlesBubbles[i].speed.multiplyScalar(0.99);
	}
}

InfoDisplay.prototype.GetCanvas = function()
{
	// this.canvas.width = this.canvas.width;
	// return this.canvas;
}

InfoDisplay.prototype.SetPosition = function(aPosition, dontFade)
{
	// if((aPosition.x != this.particle.position.x) && !isdefined(dontFade))
	// {
	// 	this.particle.material.opacity = 0;
	// 	this.FadeIn();
	// }
	this.particle.position = aPosition.clone();
	this.particleBack.position = aPosition.clone();
	this.particleBack.position.z -= 2;
	this.particleBack.position.x -= 3;
	this.particleBack.position.y += 3;
	this.particleText.position = aPosition.clone();
	this.particleText.position.z += 2;
	this.particleText.position.x -= this.particleText.scale.x * 7.;
	// this.canvas.style.left= aPosition.x + "px";
	// this.canvas.style.top= aPosition.y + "px";
}

InfoDisplay.prototype.UpdatePosition = function(aPosition)
{
	this.particle.position = aPosition.clone();
	this.particleClear.position = aPosition.clone();
}

InfoDisplay.prototype.SetText = function(aText, size)
{
	sInfoText = aText;
	// this.particle.material.program = programTextInfo
}

InfoDisplay.prototype.FadeIn = function()
{
	this.fadeIn = true;
	this.targetOpacity = 1.;
	this.particle.material.visible = true;
}

InfoDisplay.prototype.FadeOut = function()
{
	this.fadeIn = false;
	// this.canvas.hidden = true;
}

InfoDisplay.prototype.FadeTo = function(aOpactity)
{
	this.particle.material.visible = true;
	this.fadeIn = true;
	this.targetOpacity = aOpactity;
	// this.canvas.hidden = true;
}