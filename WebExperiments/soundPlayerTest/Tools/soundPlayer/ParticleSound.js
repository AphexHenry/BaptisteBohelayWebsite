
var sParticlesSound = [];
var sWaveFormData = [];

function ParticleSound(aPositionHome, volume, aTargetObject) 
{
	this.name = aTargetObject.name;
	this.url = aTargetObject.url;

	var particle = new THREE.Particle( new THREE.ParticleCanvasMaterial( { color: PickColor(), program: programStroke, transparent:true } ) );
	particle.mParent = this;
	particle.position = aPositionHome.clone();
	particle.position.x += myRandom() * window.innerWidth * 0.05;
	particle.position.y += myRandom() * window.innerHeight * 0.05;

	this.mPositionCenter = particle.position.clone();

	var size = 2;
	if(aTargetObject.size)
	{
		size = aTargetObject.size;
	}
	else
	{
		aTargetObject.size = size;
	}

	var infoText = [];
	infoText.push({string:this.name, size: 2});
	var programText = function ( context ) 
	{
		SetTextInCanvas(infoText, context.canvas)
	}

	var info = new THREE.Particle( new THREE.ParticleCanvasMaterial( { color: PickColor(), program: programText, transparent:true, opacity:OPACITY_INFO } ) );
	info.position = particle.position;
	info.visible = false;

	particle.scale.x = particle.scale.y = 3 * sWIDTH * 0.07 * size;
	info.scale.x = particle.scale.x * 0.3;
	info.scale.y = -info.scale.x;
	aTargetObject.info = info;
	particle.TargetObject = aTargetObject;
	this.mParticle = particle;

	this.particleClear = new THREE.Particle( new THREE.ParticleCanvasMaterial( { color: Math.random() * 0x808080 + 0x808080, program: programDoNothing, opacity:0 } ) );
	var width = window.innerWidth * 1.5;
	this.particleClear.scale.x = this.particleClear.scale.y = 4 * width * 0.05;
	scene.add( this.particleClear );
	this.particleClear.position = info.position;
	particle.TargetObject.particleClear = this.particleClear;

	this.mPosition = particle.position;
	this.mSpeed = new THREE.Vector2();
	this.mSpeedTimer = 0.;
	this.mAngleDecay = Math.random() * Math.PI * 2.;

	this.amplifier = 0.;

	sParticlesSound.push(this);
	this.volume = volume;

	particle.play = function()
	{
		this.mParent.sound.play();
		this.material.program = programPauseStroke;
	}

	particle.stop = function()
	{
		this.mParent.sound.stop();
		this.material.program = programTriangleStroke;
	}
	
	particle.MyMouseOn = function(intersect)
	{
		if(isdefined(this.mParent.sound))
		{
			if(this.mParent.sound.playState == 0)
			{
				this.material.program = programTriangle;
			}
			else
			{
				this.material.program = programPauseStroke;
			}
		}
		else
		{
			this.material.program = programTriangle;
		}

	}

	particle.MyMouseOff = function(intersect)
	{
		this.material.program = programTriangleStroke;
	}

	particle.MyMouseDown = function()
	{
		if(!isdefined(this.mParent.sound))
		{
			this.mParent.InitSound();	
		}
		if((this.mParent.sound.playState == 0))
		{
			sFoodArraySound.push(this);
			for(var i = 0; i < sFoodArraySoundWait.length; i++)
			{
				if(sFoodArraySoundWait[i] == this)
				{
					sFoodArraySoundWait.splice(i,1);				
				}
			}
			if(sPlayingSound)
			{
				sPlayingSound.particle.stop();
			}
		}
		else
		{
			this.mParent.sound.stop();
		}
	}

	particle.SetPosition = function(aPosition)
	{
		particle.position = aPosition;
		particle.TargetObject.particleClear.position = aPosition;
		particle.TargetObject.info.position = aPosition;
	};

	particle.SetTextEnabled = function(aIsEnabled)
	{
		if(aIsEnabled)	
		{
			this.material.program = programTriangleStroke;
			this.TargetObject.info.visible = true;
		}
		else
		{
			this.material.program = programStroke;
			this.TargetObject.info.visible = false;
		}
	}

	particle.Update = function(delta)
	{
		// if(this.mParent.sound.playState > 0)
		// {
		// 	particle.rotation.z += delta;
		// }
		particle.mParent.Update(delta);
	};

	particle.Delete = function()
	{
		scene.remove(particle);
		scene.remove(particle.TargetObject.particleClear);
		scene.remove(particle.TargetObject.info);
		delete this;
	};

	scene.add( particle );
	scene.add(info);
	return particle;
}

ParticleSound.prototype.Update = function(delta)
{
	if(isdefined(this.sound))
	{
		if(this.sound.playState > 0)
		{
			return;
		}		
	}

	this.mSpeedTimer += delta * 0.5;
	this.mParticle.position.x += this.mSpeed.x * delta;
	this.mParticle.position.y += this.mSpeed.y * delta;
	this.mSpeed.x += myRandom() * delta + Math.cos(this.mSpeedTimer + this.mAngleDecay) * 0.2 + 3.5 * (this.mPositionCenter.x - this.mParticle.position.x) / window.innerWidth;
	this.mSpeed.y += myRandom() * delta + Math.sin(this.mSpeedTimer + this.mAngleDecay) * 0.2 + 3.5 * (this.mPositionCenter.y - this.mParticle.position.y) / window.innerWidth;
	this.mSpeed.multiplyScalar(0.98);

	this.mParticle.SetPosition(this.mPosition);
}

var sSoundAmplitude = 0.;

ParticleSound.prototype.InitSound = function()
{
	InitAudio(this.url);
	 // soundManager.defaultOptions.usePeakData = true;
	 // soundManager.useFlashBlock = true;
  //    // create sound
  // 	this.sound = soundManager.createSound({
  //  	id:'sound' + this.name,
  //  	url:this.url,
  //  	useWaveformData:true,
  //  	useEQData:false,
  //  	usePeakData:true,
  //  	volume:this.volume * 120,
  //  	whileplaying:self.eventsSound.whileplaying,
  //  	onstop:self.eventsSound.stop,
  //  	onfinish:self.eventsSound.stop,
  // });



  	


  // 	soundManager.defaultOptions.whileplaying = function()
  // 	{
	 //  	var nPeak = (this.peakData.left||this.peakData.right);
	 //    // GIANT HACK: use EQ spectrum data for bass frequencies
	 //    var eqSamples = 3;
	 //    for (i=0; i<eqSamples; i++) 
	 //    {
	 //      nPeak = (nPeak||this.eqData[i]);
		// }
	 //   	thisInstance.amplifier = (0.9+(nPeak*0.1));
	 //   	soundManager._writeDebug('Peaks, L/R: '+this.peakData.left+'/'+this.peakData.right);
  // 	}
}