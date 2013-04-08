
sFoodArraySound = [];
sLegArraySound = [];
sPlayingSound = null;
sRotationLegSound = 0.;

for(var i = 0; i < 9; i++)
{
	AddLegSound();
}

function AddLegSound()
{
	sLegArraySound.push({angle:0, random:myRandom(), state:0, posHandCurrent:new THREE.Vector2(), posHandTarget:new THREE.Vector2(), posHandInit:new THREE.Vector2(), coeffMove: 1, gotObject:null, speed:0.4 + Math.random() * 0.1});
	for(var i = 0; i < sLegArraySound.length; i++)
	{
		sLegArraySound[i].angle = i * Math.PI * 2. / sLegArraySound.length;
	}
}

function getCloseFoodSoundMonster()
{
	var closeElements = [];
	for(var i = 0; i < sFoodArraySound.length; i++)
	{
		if(sFoodArraySound[i].isTarget)
		{
			continue;
		}
		var distance = sFoodArraySound[i].position.distanceTo(sMonsterSound.position);
		if(isdefined(distance))
		{
			var angleClose = Math.atan((sMonsterSound.position.y - sFoodArraySound[i].position.y) / (sMonsterSound.position.x - sFoodArraySound[i].position.x));
			if((sMonsterSound.position.x - sFoodArraySound[i].position.x) > 0)
			{
				angleClose += Math.PI;
			}
			if(angleClose < 0.)
			{
				angleClose += 2. * Math.PI;	
			}
			index = Math.round((sLegArraySound.length - 1) * angleClose * 0.5 / Math.PI);

			if(sLegArraySound[index].gotObject)
			{
				index ++;
			}

			closeElements.push({pos:sFoodArraySound[i].position, indexLeg:index, particle:sFoodArraySound[i]});
			sTimerClose = 2.;
		}
	}

	return closeElements;
}

programMonsterSound = function ( context ) 
{
	var closeStuffs = getCloseFoodSoundMonster();

	context.lineWidth = 0.01;

	if(sSizeLegs > 0.05)
	{
		for(var i = 0; i < sLegArraySound.length; i++)
		{
			var pos = null;
			var partToMove = null;
			for(var j = 0; j < closeStuffs.length; j++)
			{
				if((closeStuffs[j].indexLeg == i) && !closeStuffs[j].particle.isTarget && (sLegArraySound[i].state == 0))
				{
					closeStuffs[j].particle.isTarget = true;
					partToMove = closeStuffs[j];
					sLegArraySound[i].gotObject = partToMove;
					SetStateLegSound(i, 1);
					break;
				}
			}

			drawArmTwoSound(context, sSizeLegs, i, 0.2);
		}
	}

	DrawBodySound(context);


}

DrawBodySound = function(context)
{
	context.beginPath();
	if(sWaveFormData.length == 0 || !sPlayingSound)
	{
		sRayCircle = 0.3;
	    var centerX = 0.;
	    var centerY = 0.;
	    context.lineWidth = 0.02;
	    context.arc( centerX, centerY, sRayCircle, 0, PI2, true );
	}
	else
	{
		sRayCircle = 0.3 + sLengthLegsSound.right * 0.3;
		var radius = sRayCircle;
		var lastradius = sRayCircle;
		var angleDecay = 2 * Math.PI / (sWaveFormData.length + 1);
		var firstpoint = 0.5 * 0.3 * (parseFloat(sWaveFormData[0]) + parseFloat(sWaveFormData[sWaveFormData.length - 1]))
		context.moveTo((firstpoint + 1) * sRayCircle, 0);
		for(var i = 0; i < sWaveFormData.length; i++)
		{
			radius = (parseFloat(sWaveFormData[i]) * 0.3 + 1.) * sRayCircle;
			context.lineTo( radius * Math.cos( angleDecay * i ), radius * Math.sin( angleDecay * i ));
		}
	}
	context.closePath();
	context.stroke();
}

drawArmTwoSound = function (context, size, i, amp)
{
	var decay = sLegArraySound[i].random;
	var angle = sLegArraySound[i].angle + sRotationLegSound * 0.3;
	var gotObject = sLegArraySound[i].gotObject;

	context.beginPath();
	size *= 0.69;
	var COS = Math.cos(angle);
	var SIN = Math.sin(angle);
	var posShoulderX =  COS * sRayCircle;
	var posShoulderY = SIN * sRayCircle;
	var posElbowX = posShoulderX + size * (COS * 0.5 + amp * Math.cos(sTime2 + decay * 1.5) * SIN);
	var posElbowY = posShoulderY + size * (SIN * size * 0.5 + amp * Math.cos(sTime2 + decay * 1.5) * -COS);

	var posHandX = 0;
	var posHandY = 0;

	sLegArraySound[i].coeffMove += 0.02 * sLegArraySound[i].speed;
	sLegArraySound[i].coeffMove = Math.min(1.000001, sLegArraySound[i].coeffMove);

	switch(sLegArraySound[i].state)
	{
		case 0: // idle
			sLegArraySound[i].posHandTarget.x = (posShoulderX + size * (COS * size + 1.5 * amp * Math.sin(sTime1 + decay * 2.) * SIN));
			sLegArraySound[i].posHandTarget.y = (posShoulderY + size * (SIN * size + 1.5 * amp * Math.sin(sTime1 + decay * 2.) * COS));
			break;
		case 1: // go catch
		 	sLegArraySound[i].posHandTarget.x = (gotObject.particle.position.x - sMonsterSound.position.x) / sMonsterSound.scale.x;
	  		sLegArraySound[i].posHandTarget.y = (gotObject.particle.position.y - sMonsterSound.position.y) / sMonsterSound.scale.y;
		break;
		case 2: // go put
		 	sLegArraySound[i].posHandTarget.x = 0;
	  		sLegArraySound[i].posHandTarget.y = 0;
		break;
		case 3:
			coeffSound = 2.5 * (COS * COS * sLengthLegsSound.left + SIN * SIN * sLengthLegsSound.right) * size;
			lenght = 0.2 + coeffSound;
			coeffRandom = coeffSound * coeffSound * 0.3;
			posElbowX = posShoulderX + lenght * (COS * 0.5 + amp * Math.cos(sTime2 + decay * 1.5) * SIN) + myRandom() * coeffRandom;
			posElbowY = posShoulderY + lenght * (SIN * lenght * 0.5 + amp * Math.cos(sTime2 + decay * 1.5) * -COS) + myRandom() * coeffRandom;
			sLegArraySound[i].posHandTarget.x = (posShoulderX + lenght * (COS * lenght + 1.5 * amp * Math.sin(sTime1 + decay * 2.) * SIN))+ myRandom() * coeffRandom * 0.5;
			sLegArraySound[i].posHandTarget.y = (posShoulderY + lenght * (SIN * lenght + 1.5 * amp * Math.sin(sTime1 + decay * 2.) * COS)) + myRandom() * coeffRandom;
			break;
		case 4:
			sLegArraySound[i].posHandTarget.x = (gotObject.particle.position.x - sMonsterSound.position.x) / sMonsterSound.scale.x;
	  		sLegArraySound[i].posHandTarget.y = (gotObject.particle.position.y - sMonsterSound.position.y) / sMonsterSound.scale.y;
	  		break;
	  	case 5:
		  	sLegArraySound[i].posHandTarget.x = (sLegArraySound[i].gotObject.particle.mParent.mPositionCenter.x - sMonsterSound.position.x) / sMonsterSound.scale.x;
	  		sLegArraySound[i].posHandTarget.y = (sLegArraySound[i].gotObject.particle.mParent.mPositionCenter.y - sMonsterSound.position.y) / sMonsterSound.scale.y;
		  	break;
	}

	posHandX = sLegArraySound[i].posHandInit.x + sLegArraySound[i].coeffMove * (sLegArraySound[i].posHandTarget.x - sLegArraySound[i].posHandInit.x);
	posHandY = sLegArraySound[i].posHandInit.y + sLegArraySound[i].coeffMove * (sLegArraySound[i].posHandTarget.y - sLegArraySound[i].posHandInit.y);
	sLegArraySound[i].posHandCurrent.x = posHandX;
	sLegArraySound[i].posHandCurrent.y = posHandY;

	switch(sLegArraySound[i].state)
	{
		case 0: // idle
			break;
		case 1: // go catch
			if(sLegArraySound[i].coeffMove >= .5)
			{
				gotObject.particle.isMovable = false;
				SetStateLegSound(i, 2);
			}
		break;
		case 2: // go put
			gotObject.particle.position.x = sMonsterSound.position.x + posHandX * sMonsterSound.scale.x;
			gotObject.particle.position.y = sMonsterSound.position.y + posHandY * sMonsterSound.scale.y;
			if(sLegArraySound[i].coeffMove >= .5)
			{
				gotObject.particle.position.x = sMonsterSound.position.x;
				gotObject.particle.position.y = sMonsterSound.position.y;
				sPlayingSound = sLegArraySound[i].gotObject;
				sPlayingSound.particle.play();
				sLegArraySound[i].gotObject = null;
				for(var j = 0; j < sLegArraySound.length; j++)
				{
					SetStateLegSound(j, 3);
				}
			}
		break;
		case 4:
			if(sLegArraySound[i].coeffMove >= .5)
			{
				gotObject.particle.isMovable = false;
				SetStateLegSound(i, 5);
			}
			break;
		case 5: // go put
			gotObject.particle.position.x = sMonsterSound.position.x + posHandX * sMonsterSound.scale.x;
			gotObject.particle.position.y = sMonsterSound.position.y + posHandY * sMonsterSound.scale.y;
			if(sLegArraySound[i].coeffMove >= .5)
			{
				sLegArraySound[i].gotObject.particle.isTarget = false;
				sLegArraySound[i].gotObject = null;
				SetStateLegSound(i, 0);
			}
			break;
	}

	context.moveTo(posHandX, posHandY);
    context.quadraticCurveTo(posElbowX, posElbowY, posShoulderX, posShoulderY);
    context.stroke();
}

function SetStateLegSound(i, state)
{
	sLegArraySound[i].state = state;
	sLegArraySound[i].posHandInit = sLegArraySound[i].posHandCurrent;
	sLegArraySound[i].coeffMove = 0.;
}

function MonsterSound(positionCenter, width)
{
	this.particle = new THREE.Particle( new THREE.ParticleCanvasMaterial( { color: PickColor() * 0.3, program: programMonsterSound, transparent:true } ) );

	this.particle.position.x = positionCenter.x; 
	this.particle.position.y = positionCenter.y; 
	this.particle.position.z = positionCenter.z;

	var size = 1;
	this.particle.scale.x = this.particle.scale.y = 3 * width * 0.28 * size;
	scene.add( this.particle );

	sTime1 = 0;
	sTime2 = 0;
	sMonsterSound = this.particle;
	sMonsterSound.mParent = this;
}

MonsterSound.prototype.RemoveSound = function()
{
	var indexChosen = Math.floor(Math.random() * sLegArraySound.length);
	for(var j = 0; j < sLegArraySound.length; j++)
	{
		if(indexChosen == j)
		{
			sLegArraySound[j].gotObject = sPlayingSound;
			sPlayingSound = null;
			SetStateLegSound(j, 4);
		}
		else
		{
			SetStateLegSound(j, 0);
		}
	}
	this.WakeUp(6.);
	sWaveFormData = [];
	sLengthLegsSound.left = 0.;
	sLengthLegsSound.right = 0.;
}

MonsterSound.prototype.WakeUp = function(duration)
{
	sTimerClose = Math.max(duration, sTimerClose);
}

var sTimerClose = 0;
MonsterSound.prototype.Update = function(delta)
{
	if(sPlayingSound)
	{
		sRotationLegSound += delta;
	}

	sTimerClose -= delta;

	delta *= 4.;
	sTime1 += delta;
	sTime2 += 1.5 * delta;

	if(sTimerClose > 0. || sPlayingSound)
	{
		sSizeLegsTarget = sSizeLegsMax;
	}
	else
	{
		sSizeLegsTarget = 0.4;
	}

	var strength = 0.1;
	if((sSizeLegsTarget - sSizeLegs) > 0)
	{
		strength = 1.;
	}
	sSizeLegs += (sSizeLegsTarget - sSizeLegs) * delta * 0.5;

}

MonsterSound.prototype.SetFood = function(foodArray)
{
	sFoodArraySound = foodArray;
}

