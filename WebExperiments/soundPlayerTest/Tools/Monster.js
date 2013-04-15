var lIndexStates = 0;
var MonsterStates =
{
	IN:lIndexStates++,
	IDLE:lIndexStates++,
	EAT_OUT:lIndexStates++,
	EAT_IN:lIndexStates++,
}

for(var i = 0; i < 2; i++)
{
	AddLeg();
}

function getCloseChallenge()
{
	var closeElements = [];
	if(isdefined(sChallenge))
	{
		part = sChallenge.particle;
		if(!isdefined(part))
		{
			return closeElements;
		}
		var distance = part.position.distanceTo(sMonster.position);
		if(distance < (sMonster.scale.x * (sRayCircle + 1. * sSizeLegsMax) + part.scale.x) * 0.25)
		{
			var angleClose = Math.atan((sMonster.position.y - part.position.y) / (sMonster.position.x - part.position.x));
			if((sMonster.position.x - part.position.x) > 0)
			{
				angleClose += Math.PI;
			}
			if(angleClose < 0.)
			{
				angleClose += 2. * Math.PI;	
			}
			index = Math.round((sLegArray.length - 1) * angleClose * 0.5 / Math.PI);
			closeElements.push({pos:part.position, indexLeg:index, particle:part, type:"challenge"});
			sTimerClose = 3.;
		}
	}

	return closeElements;
}

function getCloseFood()
{
	var closeElements = [];
	for(var i = 0; i < sFoodArray.length; i++)
	{
		if(sFoodArray[i].isEaten)
		{
			continue;
		}
		var distance = sFoodArray[i].position.distanceTo(sMonster.position);
		if(distance < sMonster.scale.x * (sRayCircle + 0.5 * sSizeLegsMax))
		{
			var angleClose = Math.atan((sMonster.position.y - sFoodArray[i].position.y) / (sMonster.position.x - sFoodArray[i].position.x));
			if((sMonster.position.x - sFoodArray[i].position.x) > 0)
			{
				angleClose += Math.PI;
			}
			if(angleClose < 0.)
			{
				angleClose += 2. * Math.PI;	
			}
			index = Math.round((sLegArray.length - 1) * angleClose * 0.5 / Math.PI);
			if(distance < sMonster.scale.x * 0.05)
			{
				Eat(sFoodArray[i], index);
				continue;
			}
			closeElements.push({pos:sFoodArray[i].position, indexLeg:index, particle:sFoodArray[i], type:"food"});
			sTimerClose = 3.;
		}
	}

	return closeElements;
}

programMonster = function ( context ) 
{
	var closeFood = getCloseFood();
	var closeChallenges = getCloseChallenge();
	closeStuffs = closeFood.concat(closeChallenges);

	context.lineWidth = 0.01;

	for(var i = 0; i < sLegArray.length; i++)
	{
		var isClose = false;
		var pos = null;
		var partToMove = null;
		for(var j = 0; j < closeStuffs.length; j++)
		{
			if(closeStuffs[j].indexLeg == i && !sLegArray[i].needToCalmDown)
			{
				isClose = true;
				sLegArray[i].posClose = closeStuffs[j]. 	pos.clone();
				var isChallenge = closeStuffs[j].type == "challenge";
				sLegArray[i].closeness += isChallenge ? 0.05 : 0.02;

				if(sLegArray[i].closeness >= 0.99)
				{
					closeStuffs[j].particle.isMovable = false;
					partToMove = closeStuffs[j];
				}
			}
		}
		if(!isClose)
		{
			sLegArray[i].closeness -= 0.02;
			if(sLegArray[i].closeness <= 0.)
			{
				sLegArray[i].needToCalmDown = false;
				sLegArray[i].closeness = 0;
			}
		}

		drawOneArmTwo(context, sSizeLegs, i, 0.2, partToMove);
	}

    var centerX = 0.;
    var centerY = 0.;
    context.lineWidth = 0.02;
    context.beginPath();
    context.arc( centerX, centerY, sRayCircle, 0, PI2, true );
    context.closePath();
    context.stroke();
}

drawOneArmTwo = function (context, size, i, amp, aPartToMove)
{
	var decay = sLegArray[i].random;
	var angle = sLegArray[i].angle;
	var aCloseness = sLegArray[i].closeness;
	var posClose = sLegArray[i].posClose;
	// context.setStrokeColor(0x0000f0);
	context.beginPath();
	size *= 0.69;
	var COS = Math.cos(angle);
	var SIN = Math.sin(angle);
	var posShoulderX =  COS * sRayCircle;
	var posShoulderY = SIN * sRayCircle;
	var posElbowX = posShoulderX + size * (COS * 0.5 + amp * Math.cos(sTime2 + decay * 1.5) * SIN);
	var posElbowY = posShoulderY + size * (SIN * size * 0.5 + amp * Math.cos(sTime2 + decay * 1.5) * -COS);
	var lCloseness =  Math.min(aCloseness, 1.);
	var posHandX = (posShoulderX + size * (COS * size + 1.5 * amp * Math.sin(sTime1 + decay * 2.) * SIN)) * (1. - lCloseness);
	var posHandY = (posShoulderY + size * (SIN * size + 1.5 * amp * Math.sin(sTime1 + decay * 2.) * COS)) * (1. - lCloseness);
	if(lCloseness > 0)
	{
	  posHandX += (posClose.x - sMonster.position.x) / sMonster.scale.x * lCloseness;
	  posHandY += (posClose.y - sMonster.position.y) / sMonster.scale.y * lCloseness;
	}
	if(aPartToMove && aCloseness >= 1.)
	{
		if(aPartToMove.type == "challenge")
		{
			Attack(aPartToMove);
			sLegArray[i].needToCalmDown = true;
			return;
		}
		var closnessBack = aCloseness - 1.;
		posHandX = sLegArray[i].posHandX * (1. - closnessBack);
		posHandY = sLegArray[i].posHandY * (1. - closnessBack);
		aPartToMove.particle.position.x = sMonster.position.x + posHandX * sMonster.scale.x;
		aPartToMove.particle.position.y = sMonster.position.y + posHandY * sMonster.scale.y;
		if(closnessBack >= 0.9)
		{
			Eat(aPartToMove, i);
		}
	}

	sLegArray[i].posHandX = posHandX;
	sLegArray[i].posHandY = posHandY;

	context.moveTo(posHandX, posHandY);
    context.quadraticCurveTo(posElbowX, posElbowY, posShoulderX, posShoulderY);
    context.stroke();
}

function Eat(part, indexLeg)
{
	sTimerClose = 5.;
	if(sLegArray.length > 0)
	{
		sLegArray[indexLeg].needToCalmDown = true;
	}
	part.isEaten = true;
	part.isMovable = false;

	EvolutionParseObject(part.TargetObject);
}

function Attack(part, indexLeg)
{
	if(sChallenge.particle === part.particle)
	{
		sChallenge.SetAttacked(1);
		return;
	}
}

function Monster(positionCenter, width)
{
	this.particle = new THREE.Particle( new THREE.ParticleCanvasMaterial( { color: PickColor() * 0.6, program: programMonster, transparent:true } ) );

	this.particle.position.x = positionCenter.x + width * 0.3 * (1. + myRandom() * 0.3) * Math.sin(myRandom() * 0.7 );
	this.particle.position.y = positionCenter.y + width *  0.3 * (1. + myRandom() * 0.3) * Math.sin(myRandom() * 0.7 );
	this.particle.position.z = positionCenter.z;

	var size = 1;
	this.particle.scale.x = this.particle.scale.y = 3 * width * 0.28 * size;
	scene.add( this.particle );

	sTime1 = 0;
	sTime2 = 0;
	sMonster = this.particle;
}

Monster.prototype.WakeUp = function(duration)
{
	sTimerClose = Math.max(duration, sTimerClose);
}

var sTimerClose = 0;
Monster.prototype.Update = function(delta)
{
	sTimerClose -= delta;

	delta *= 4.;
	sTime1 += delta;
	sTime2 += 1.5 * delta;

	if(sTimerClose > 0.)
	{
		sSizeLegsTarget = sSizeLegsMax;
	}
	else
	{
		sSizeLegsTarget = 0;
	}

	var strength = 0.1;
	if((sSizeLegsTarget - sSizeLegs) > 0)
	{
		strength = 1.;
	}
	sSizeLegs += (sSizeLegsTarget - sSizeLegs) * delta * 0.5;

	sRayCircle += (sRayCircleTarget - sRayCircle) * delta * 0.5;
}

Monster.prototype.SetFood = function(foodArray)
{
	sFoodArray = foodArray;
}

