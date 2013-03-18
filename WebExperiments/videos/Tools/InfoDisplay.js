

var sInfoText = [];

var programText = function ( context ) 
{
	SetTextInCanvas(sInfoText, context.canvas)
}

function InfoDisplay(aCanvas, aSize, aSpeedFade) 
{
	// this.canvas = aCanvas;
	this.fadeIn = false;
	this.speedFade = aSpeedFade;
	this.aimed = false;

	this.particle = new THREE.Particle( new THREE.ParticleCanvasMaterial( { color: Math.random() * 0x808080 + 0x808080, program: programText, transparent: true
 } ) );
	this.particle.position.x = Math.random() * 800 - 400;
	this.particle.position.y = Math.random() * 800 - 400;
	this.particle.position.z = Math.random() * 800 - 400;
	this.particle.scale.x = window.innerWidth * 0.015;
	this.particle.scale.y = -this.particle.scale.x;
	sceneInfo.add( this.particle );
}

/*
 * Update camera.
 */
InfoDisplay.prototype.Update = function(aTimeInterval)
{
	if(this.fadeIn)
	{
		this.particle.material.opacity += aTimeInterval * this.speedFade;
		this.particle.material.opacity = Math.min(1, this.particle.material.opacity);
	}
	else
	{
		this.particle.material.opacity -= aTimeInterval * this.speedFade;
		if(this.particle.material.opacity < 0.01)
		{
			this.particle.material.visible = false;
			this.particle.material.opacity = Math.max(0, this.particle.material.opacity);
		}
	}
}

InfoDisplay.prototype.GetCanvas = function()
{
	// this.canvas.width = this.canvas.width;
	// return this.canvas;
}

InfoDisplay.prototype.SetPosition = function(aPosition)
{
	this.particle.position = aPosition.clone();
	// this.canvas.style.left= aPosition.x + "px";
	// this.canvas.style.top= aPosition.y + "px";
}

InfoDisplay.prototype.SetText = function(aText)
{
	sInfoText = aText;
	this.particle.material.program = programText
}

InfoDisplay.prototype.FadeIn = function()
{
	this.fadeIn = true;
	this.particle.material.visible = true;
}

InfoDisplay.prototype.FadeOut = function()
{
	this.fadeIn = false;
	// this.canvas.hidden = true;
}