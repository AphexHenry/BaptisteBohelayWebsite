

var sInfoText = [];

var programTextInfo = function ( context ) 
{
	SetTextInCanvas(sInfoText, context.canvas)
}

function InfoDisplay(aSize, aSpeedFade) 
{
	// this.canvas = aCanvas;
	this.fadeIn = false;
	this.speedFade = aSpeedFade;
	this.aimed = false;
	this.targetOpacity = 1.;

	this.particle = new THREE.Particle( new THREE.ParticleCanvasMaterial( { color: Math.random() * 0x808080 + 0x808080, program: programTextInfo, transparent: true
 } ) );
	this.particle.position.x = Math.random() * 800 - 400;
	this.particle.position.y = Math.random() * 800 - 400;
	this.particle.position.z = Math.random() * 800 - 400;
	this.particle.scale.x = window.innerWidth * 0.015;
	this.particle.scale.y = -this.particle.scale.x;
	scene.add( this.particle );

	this.particleClear = new THREE.Particle( new THREE.ParticleCanvasMaterial( { color: Math.random() * 0x808080 + 0x808080, program: programDoNothing, opacity:0 } ) );
	var width = window.innerWidth * 1.5;
	this.particleClear.scale.x = this.particleClear.scale.y = 4 * width * 0.05;
	scene.add( this.particleClear );
	// this.particleClear = new THREE.Particle( new THREE.ParticleCanvasMaterial( { color: Math.random() * 0x808080 + 0x808080, program: programText, transparent: true
 // } ) );
	// this.particleClear.scale.x = window.innerWidth * 0.05;
	// this.particleClear.scale.y = -this.particle.scale.x;
	// sceneInfo.add( this.particleClear );
}

InfoDisplay.prototype.SetSize = function(size)
{
	this.particle.scale.x = window.innerWidth * 0.015 * size;
	this.particle.scale.y = -this.particle.scale.x;
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
		if(this.particle.material.opacity < 0.01)
		{
			this.particle.material.visible = false;
			this.particle.material.opacity = Math.max(0, this.particle.material.opacity);
		}
	}
	// this.particleClear.position = 
}

InfoDisplay.prototype.GetCanvas = function()
{
	// this.canvas.width = this.canvas.width;
	// return this.canvas;
}

InfoDisplay.prototype.SetPosition = function(aPosition, dontFade)
{
	if((aPosition.x != this.particle.position.x) && !isdefined(dontFade))
	{
		this.particle.material.opacity = 0;
		this.FadeIn();
	}
	this.particle.position = aPosition.clone();
	this.particleClear.position = aPosition.clone();
	// this.canvas.style.left= aPosition.x + "px";
	// this.canvas.style.top= aPosition.y + "px";
}

InfoDisplay.prototype.UpdatePosition = function(aPosition)
{
	this.particle.position = aPosition.clone();
	this.particleClear.position = aPosition.clone();
}

InfoDisplay.prototype.SetText = function(aText)
{
	sInfoText = aText;
	this.particle.material.program = programTextInfo
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