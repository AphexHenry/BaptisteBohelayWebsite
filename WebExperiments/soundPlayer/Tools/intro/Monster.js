var lIndexStates = 0;
var sPutALetter = 0;
var sEnd = false;

var MonsterStates =
{
	IN:lIndexStates++,
	IDLE:lIndexStates++,
	EAT_OUT:lIndexStates++,
	EAT_IN:lIndexStates++,
}

for(var i = 0; i < 9; i++)
{
	AddLeg();
}

function getCloseFood()
{
	if(sEnd)
	{
		return [];
	}
	var closeElements = [];
	for(var i = 0; i < sFoodArray.length; i++)
	{
		if(sFoodArray[i].isTarget)
		{
			continue;
		}
		var distance = sFoodArray[i].position.distanceTo(sMonsterIntro.position);
		if(distance < sMonsterIntro.scale.x * (sRayCircle + 1.2 * sSizeLegsMax))
		{
			var angleClose = Math.atan((sMonsterIntro.position.y - sFoodArray[i].position.y) / (sMonsterIntro.position.x - sFoodArray[i].position.x));
			if((sMonsterIntro.position.x - sFoodArray[i].position.x) > 0)
			{
				angleClose += Math.PI;
			}
			if(angleClose < 0.)
			{
				angleClose += 2. * Math.PI;	
			}
			index = Math.round((sLegArray.length - 1) * angleClose * 0.5 / Math.PI);

			if(sLegArray[index].gotObject)
			{
				index ++;
				index = index % sLegArray.length;
				if(sLegArray[index].gotObject)
				{
					index -= 2;
					index = Math.abs(index % sLegArray.length);
				}
			}

			closeElements.push({pos:sFoodArray[i].position, indexLeg:index, particle:sFoodArray[i]});
			sTimerClose = 0.7;
		}
	}

	return closeElements;
}

monsterTouched = function(context)
{
	context.beginPath();
    context.arc( 0, 0, sRayCircle, 0, PI2, true );
    context.closePath();
    context.fill();
}

programMonster = function ( context ) 
{
	var closeStuffs = getCloseFood();

	context.lineWidth = 0.01;

	if(sSizeLegs > 0.05)
	{
		for(var i = 0; i < sLegArray.length; i++)
		{
			var pos = null;
			var partToMove = null;
			for(var j = 0; j < closeStuffs.length; j++)
			{
				if((closeStuffs[j].indexLeg == i) && !closeStuffs[j].particle.isTarget && (sLegArray[i].state == 0))
				{
					closeStuffs[j].particle.isTarget = true;
					partToMove = closeStuffs[j];
					sLegArray[i].gotObject = partToMove;
					SetStateLeg(i, 1);
					break;
				}
			}

			drawOneArmTwo(context, sSizeLegs, i, 0.2);
		}
	}

    var centerX = 0.;
    var centerY = 0.;
    context.lineWidth = 0.02;
    context.beginPath();
    context.arc( centerX, centerY, sRayCircle, 0, PI2, true );
    context.closePath();
    context.stroke();
}

drawOneArmTwo = function (context, size, i, amp)
{
	var decay = sLegArray[i].random;
	var angle = sLegArray[i].angle;
	var gotObject = sLegArray[i].gotObject;

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

	sLegArray[i].coeffMove += 0.02 * sLegArray[i].speed;
	sLegArray[i].coeffMove = Math.min(1.000001, sLegArray[i].coeffMove);

	switch(sLegArray[i].state)
	{
		case 0: // idle
			sLegArray[i].posHandTarget.x = (posShoulderX + size * (COS * size + 1.5 * amp * Math.sin(sTime1 + decay * 2.) * SIN));
			sLegArray[i].posHandTarget.y = (posShoulderY + size * (SIN * size + 1.5 * amp * Math.sin(sTime1 + decay * 2.) * COS));
			break;
		case 1: // go catch
		 	sLegArray[i].posHandTarget.x = (gotObject.particle.position.x - sMonsterIntro.position.x) / sMonsterIntro.scale.x;
	  		sLegArray[i].posHandTarget.y = (gotObject.particle.position.y - sMonsterIntro.position.y) / sMonsterIntro.scale.y;
		break;
		case 2: // go put
		 	sLegArray[i].posHandTarget.x = (gotObject.particle.TargetObject.positionTarget.x - sMonsterIntro.position.x) / sMonsterIntro.scale.x;
	  		sLegArray[i].posHandTarget.y = (gotObject.particle.TargetObject.positionTarget.y - sMonsterIntro.position.y) / sMonsterIntro.scale.x;
		break;
	}

	posHandX = sLegArray[i].posHandInit.x + sLegArray[i].coeffMove * (sLegArray[i].posHandTarget.x - sLegArray[i].posHandInit.x);
	posHandY = sLegArray[i].posHandInit.y + sLegArray[i].coeffMove * (sLegArray[i].posHandTarget.y - sLegArray[i].posHandInit.y);
	sLegArray[i].posHandCurrent.x = posHandX;
	sLegArray[i].posHandCurrent.y = posHandY;

	switch(sLegArray[i].state)
	{
		case 0: // idle
			break;
		case 1: // go catch
			if(sLegArray[i].coeffMove >= .5)
			{
				gotObject.particle.isMovable = false;
				SetStateLeg(i, 2);
			}
		break;
		case 2: // go put
			gotObject.particle.position.x = sMonsterIntro.position.x + posHandX * sMonsterIntro.scale.x;
			gotObject.particle.position.y = sMonsterIntro.position.y + posHandY * sMonsterIntro.scale.y;
			if(sLegArray[i].coeffMove >= .5)
			{
				gotObject.particle.position.x = gotObject.particle.TargetObject.positionTarget.x;
				gotObject.particle.position.y = gotObject.particle.TargetObject.positionTarget.y;
				sLegArray[i].gotObject = null;
				sPutALetter++;
				// we display the github button at the 20th letter.
				if(sPutALetter == 20)
				{
					$('#githubButton').slideDown();
				}
				SetStateLeg(i, 0);
			}
		break;
	}

	context.moveTo(posHandX, posHandY);
    context.quadraticCurveTo(posElbowX, posElbowY, posShoulderX, posShoulderY);
    context.stroke();
}

function SetStateLeg(i, state)
{
	sLegArray[i].state = state;
	sLegArray[i].posHandInit = sLegArray[i].posHandCurrent;
	sLegArray[i].coeffMove = 0.;
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
	this.particle = new THREE.Particle( new THREE.ParticleCanvasMaterial( { color: PickColor() * 0.3, program: programMonster, transparent:true } ) );

	this.particle.position.x = positionCenter.x - 2. * window.innerWidth; 
	this.particle.position.y = positionCenter.y - window.innerHeight * 1.; 
	this.particle.position.z = positionCenter.z;

	var size = 1;
	this.particle.scale.x = this.particle.scale.y = 3 * width * 0.28 * size;
	scene.add( this.particle );

	sTime1 = 0;
	sTime2 = 0;
	sMonsterIntro = this.particle;
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

	if(sTimerClose > 0. && !sEnd)
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

