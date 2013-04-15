
var sParticleSoundPlayed = null;

function SoundPlayerCanvas(position, name, id) 
{
	this.name = name;
	var aTargetObject = {isAutonomous:true};
	var canvasPlayer = document.getElementById(id);
	canvasPlayer.playSound = false;
	canvasPlayer.style.display = "";
	// $(canvasPlayer).addClass("ui360 ui360-vis");
	// $(canvasPlayer).attr('href',"data/sound/music.mp3");
	// document.body.appendChild(canvasPlayer);
	var thisInstance = this;
	this.coeffPlayPause = 0;

	var programPlayer = function ( context ) 
	{
		if(canvasPlayer.playSound && (sParticleSoundPlayed == thisInstance))
		{
			thisInstance.coeffPlayPause += 0.03;
			if(thisInstance.coeffPlayPause > 1.)
			{
				thisInstance.coeffPlayPause = 1.;
			}
		}
		else
		{
			thisInstance.coeffPlayPause -= 0.03;
			if(thisInstance.coeffPlayPause < 0.)
			{
				thisInstance.coeffPlayPause = 0;
			}
		}

		if(thisInstance.coeffPlayPause > 0.01)
		{
			var lsize = thisInstance.coeffPlayPause * 4.;
			context.drawImage(canvasPlayer.children[0].children[0], -lsize * 0.5,-lsize * 0.5, lsize, lsize);	
		}

		if(thisInstance.coeffPlayPause < 0.99)
		{
		    context.lineWidth = 0.05;
		    context.beginPath();
		    context.arc( 0, 0, 1. - thisInstance.coeffPlayPause - context.lineWidth, 0, PI2, true );
		    context.closePath();
		    context.stroke();
		}
		



		// context.drawImage(canvasPlayer.children[0].children[1], -1,-0, 1, 1);
		// context.drawImage(canvasPlayer.children[0].children[2], -1,-0, 1, 1);
		// context.drawImage(canvasPlayer.children[0].children[3], -1,-0, 1, 1);
	}

	this.particle = new THREE.Particle( new THREE.ParticleCanvasMaterial( { color: PickColor(), program: programPlayer, transparent:true } ) );

	this.particle.position = position;

	this.particle.MyMouseOn = function(intersect)
	{
		if(!canvasPlayer.playSound)
		{
			this.material.program = programTriangle;
		}
	}

	this.particle.MyMouseOff = function(intersect)
	{
		if(!canvasPlayer.playSound)
		{
			this.material.program = programPlayer;
		}
	}

	this.particle.MyMouseDown = function()
	{
		$(canvasPlayer).fadeIn();
		var tableCells = canvasPlayer.childNodes;
		var returnObject = null;
		for(var i = 0, l = tableCells.length; i < l; i++) 
		{
		   if(tableCells[i].className === 'sm2_link') 
		   {
		      returnObject = tableCells[i];
		      break;
		   }
		}

		// threeSixtyPlayer.playObject(returnObject);
		var sound = threeSixtyPlayer.getSoundByURL(returnObject.href);
		threeSixtyPlayer.handleClick({'target':returnObject});
		this.material.program = programPlayer;
		sound = threeSixtyPlayer.getSoundByURL(returnObject.href);
		canvasPlayer.playSound = !sound.paused;
		if(sound.paused)
		{
			sound.stop();
		}
		else
		{
			sParticleSoundPlayed = thisInstance;
		}
		// threeSixtyPlayer.getSoundByURL('data/sound/music.mp3');
		// soundManager.play('soundCanvas','data/sound/music.mp3');
		// SELECTED = this;
	}

	this.particle.MyCameraDistance= function()
	{
		return window.innerWidth * 0.15;
	}

	var size = 1;

	var infoText = [];
	infoText.push({string:this.name, size: 2});
	var programText = function ( context ) 
	{
		SetTextInCanvas(infoText, context.canvas)
	}

	var info = new THREE.Particle( new THREE.ParticleCanvasMaterial( { color: PickColor(), program: programText, transparent:true, opacity:OPACITY_INFO } ) );
	info.position = this.particle.position;

	this.particle.scale.x = this.particle.scale.y = 3 * sWIDTH * 0.07 * size;
	info.scale.x = this.particle.scale.x * 0.3;
	info.scale.y = -info.scale.x;
	aTargetObject.info = info;
	this.particle.TargetObject = aTargetObject;

	this.particleClear = new THREE.Particle( new THREE.ParticleCanvasMaterial( { color: Math.random() * 0x808080 + 0x808080, program: programStroke, opacity:0 } ) );
	var width = window.innerWidth * 1.5;
	this.particleClear.scale.x = this.particleClear.scale.y = 4 * width * 0.05;
	scene.add( this.particleClear );
	this.particleClear.position = info.position;
	this.particle.TargetObject.particleClear = this.particleClear;
	
	this.particle.SetPosition = function(aPosition)
	{
		this.position = aPosition;
		this.TargetObject.particleClear.position = aPosition;
		this.TargetObject.info.position = aPosition;
	};

	this.particle.Delete = function()
	{
		scene.remove(this);
		scene.remove(this.TargetObject.particleClear);
		scene.remove(this.TargetObject.info);
		delete this;
	};

	scene.add( this.particle );
	scene.add(info);
}

SoundPlayerCanvas.prototype.Update = function()
{

}
