var lIndexStates = 0;
var sPutALetter = 0;
var sEnd = false;
var sPointer = null;

var MonsterStates =
{
	IN:lIndexStates++,
	IDLE:lIndexStates++,
	EAT_OUT:lIndexStates++,
	EAT_IN:lIndexStates++,
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
		var distance = sFoodArray[i].position.distanceTo(sMonster.position);
		if(distance < sMonster.scale.x * (sRayCircle + 1.2 * sSizeLegsMax))
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



// programMonster = function ( context ) 
// {
// 	var closeStuffs = getCloseFood();

// 	context.lineWidth = 0.01;

// 	if(sSizeLegs > 0.05)
// 	{
// 		for(var i = 0; i < sLegArray.length; i++)
// 		{
// 			var pos = null;
// 			var partToMove = null;
// 			for(var j = 0; j < closeStuffs.length; j++)
// 			{
// 				if((closeStuffs[j].indexLeg == i) && !closeStuffs[j].particle.isTarget && (sLegArray[i].state == 0))
// 				{
// 					closeStuffs[j].particle.isTarget = true;
// 					partToMove = closeStuffs[j];
// 					sLegArray[i].gotObject = partToMove;
// 					SetStateLeg(i, 1);
// 					break;
// 				}
// 			}

// 			drawOneArmTwo(context, sSizeLegs, i, 0.2);
// 		}
// 	}

//     var centerX = 0.;
//     var centerY = 0.;
//     context.lineWidth = 0.02;
//     context.beginPath();
//     context.arc( centerX, centerY, sRayCircle, 0, PI2, true );
//     context.closePath();
//     context.stroke();
// }

drawHair = function (context, count) {
	sMonster.parentMonster.drawHairs(context);
	// var random = sfc32(1, 3, 4, 5);
	// var lAngleSpeed = Math.atan2(sMonster.speed.y , sMonster.speed.x);
	// var lAmplitudeFromSpeed = Math.min(0.3, 0.5 * Math.sqrt(sMonster.speed.y * sMonster.speed.y + sMonster.speed.x * sMonster.speed.x) / window.innerWidth);
	// for (var i = 0; i < count; i++) {
	// 	context.beginPath();
		
	// 	var lRadiusNorm = sRayCircle * random();
	// 	lRadiusNorm *= 1.2;
	// 	var lAngle = random() * Math.PI * 2 + sGeneralTimer * 0.2;
	// 	var posStartX = lRadiusNorm * Math.cos(lAngle);
	// 	var posStartY = lRadiusNorm * Math.sin(lAngle);

	// 	var excitationLevel = Math.max(0, Math.cos(lAngle + sGeneralTimer * 0.8));
	// 	var lEndAngle = (1 + random() * 0.5) * sGeneralTimer + random() * 4 * excitationLevel;

	// 	var lAmplitude = (1.3 + excitationLevel * 0.2);
	// 	var posEndX = lRadiusNorm * lAmplitude * Math.cos(lAngle) + lRadiusNorm * 0.2 * Math.sin(lEndAngle) - lAmplitudeFromSpeed * Math.cos(lAngleSpeed);
	// 	var posEndY = lRadiusNorm * lAmplitude * Math.sin(lAngle) + lRadiusNorm * 0.2 * Math.cos(lEndAngle) - lAmplitudeFromSpeed * Math.sin(lAngleSpeed);

	// 	var lInAngle = 1.6 * sGeneralTimer + random() * 3;
	// 	var posInBetweenX = posStartX + (posEndX - posStartX) * 0.5 + lRadiusNorm * 0.2 * Math.sin(lInAngle);
	// 	var posInBetweenY = posStartY + (posEndY - posStartY) * 0.5 + lRadiusNorm * 0.2 * Math.cos(lInAngle);
	// 	context.lineWidth = 0.005;
	// 	context.moveTo(posStartX, posStartY);
	// 	context.quadraticCurveTo(posInBetweenX, posInBetweenY, posEndX, posEndY);
	// 	context.stroke();
	// }
}

function sfc32(a, b, c, d) {
    return function() {
      a |= 0; b |= 0; c |= 0; d |= 0; 
      var t = (a + b | 0) + d | 0;
      d = d + 1 | 0;
      a = b ^ b >>> 9;
      b = c + (c << 3) | 0;
      c = (c << 21 | c >>> 11);
      c = c + t | 0;
      return (t >>> 0) / 4294967296;
    }
}

drawArm = function (context, size, i, amp)
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
		 	sLegArray[i].posHandTarget.x = (gotObject.particle.position.x - sMonster.position.x) / sMonster.scale.x;
	  		sLegArray[i].posHandTarget.y = (gotObject.particle.position.y - sMonster.position.y) / sMonster.scale.y;
		break;
		case 2: // go put
		 	sLegArray[i].posHandTarget.x = (gotObject.particle.TargetObject.positionTarget.x - sMonster.position.x) / sMonster.scale.x;
	  		sLegArray[i].posHandTarget.y = (gotObject.particle.TargetObject.positionTarget.y - sMonster.position.y) / sMonster.scale.x;
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
			gotObject.particle.position.x = sMonster.position.x + posHandX * sMonster.scale.x;
			gotObject.particle.position.y = sMonster.position.y + posHandY * sMonster.scale.y;
			if(sLegArray[i].coeffMove >= .5)
			{
				gotObject.particle.position.x = gotObject.particle.TargetObject.positionTarget.x;
				gotObject.particle.position.y = gotObject.particle.TargetObject.positionTarget.y;
				sLegArray[i].gotObject = null;
				sPutALetter++;
				// we display the github button at the 20th letter.
				if(sPutALetter == 20)
				{
					$('#githubButton').slideDown(300);
					$('#contactButton').slideDown(200);
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

function MonsterIntro(positionCenter, width)
{
	for(var i = 0; i < 9; i++)
	{
		AddLeg();
	}

	this.particle = new THREE.Particle( new THREE.ParticleCanvasMaterial( { color: PickColor() * 0.3, program: this.programMonster, transparent:true } ) );

	this.particle.position.x = positionCenter.x - 2. * window.innerWidth; 
	this.particle.position.y = positionCenter.y - window.innerHeight * 1.; 
	this.particle.position.z = positionCenter.z;

	var size = 1;
	this.particle.scale.x = this.particle.scale.y = 3 * width * 0.28 * size;
	scene.add( this.particle );

	sTime1 = 0;
	sTime2 = 0;
	sMonster = this.particle;
	this.particle.parentMonster = this;

	this.hairs = [];

	for (var i = 0; i < 2000; i++) {
		this.hairs.push(new MonsterHair());
	}
}

MonsterIntro.prototype.WakeUp = function(duration)
{
	sTimerClose = Math.max(duration, sTimerClose);
}

var sTimerClose = 0;
MonsterIntro.prototype.Update = function(delta)
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

	if(sSizeLegs < 0.52 && (sPutALetter > 0) && !sEnd)
	{
		infoDisplay.SetSize(1.3);
		// infoDisplay.SetText([{string:"enter", size: 2}]);
		infoDisplay.FadeIn();	
		// sEnd = true;
	}
	infoDisplay.SetPosition(sMonster.position, true);

	for (var index in this.hairs) {
		this.hairs[index].update(delta);
	}
}

MonsterIntro.prototype.programMonster = function ( context ) 
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

			drawArm(context, sSizeLegs, i, 0.2);
		}
	}

    var centerX = 0.;
    var centerY = 0.;
    context.lineWidth = 0.02;
    // context.beginPath();
    // context.arc( centerX, centerY, sRayCircle, 0, PI2, true );
    // context.closePath();
	// context.stroke();
	drawHair(context);
}

MonsterIntro.prototype.drawHairs = function (context) {
	for (var index in this.hairs) {
		this.hairs[index].draw(context);
	}
}

MonsterIntro.prototype.monsterTouched = function(context)
{
	context.beginPath();
    context.arc( 0, 0, sRayCircle, 0, PI2, true );
    context.closePath();
    context.fill();
}

MonsterIntro.prototype.SetFood = function(foodArray)
{
	sFoodArray = foodArray;
}

MonsterIntro.prototype.setNormalDisplay = function() {
	this.particle.material.program = this.programMonster;
}

MonsterIntro.prototype.setMouseOverDisplay = function() {
	this.particle.material.program = this.monsterTouched;
}

MonsterIntro.prototype.setPointer = function (aPosition) {
	sPointer = aPosition;
}

function MonsterHair() {
	this.angle = Math.random() * 2 * Math.PI;
	this.radius = Math.random();
	
	var lRadiusNorm = sRayCircle * this.radius;
	var lAngle = this.angle + sGeneralTimer * 0.2;
	this.positionEnd = { x: lRadiusNorm * Math.cos(lAngle), y: lRadiusNorm * Math.sin(lAngle) };
	this.positionEndSpeed = { x: 0, y: 0 };
	this.speedEnd = { x: 0, y: 0 };
	this.posInBetween = { x: 0, y: 0 };
	this.posStart = { x: 0, y: 0 };
	this.randomValue = Math.random();

	this.magnetPosition = { x: 0, y: 0 };
	this.magnetSpeed = { x: 0, y: 0 };
	// 	var random = sfc32(1, 3, 4, 5);
	// var lAngleSpeed = Math.atan2(sMonster.speed.y , sMonster.speed.x);
	// var lAmplitudeFromSpeed = Math.min(0.3, 0.5 * Math.sqrt(sMonster.speed.y * sMonster.speed.y + sMonster.speed.x * sMonster.speed.x) / window.innerWidth);
}

MonsterHair.prototype.draw = function (context) {
	context.beginPath();
	context.lineWidth = 0.005;
	context.moveTo(this.posStart.x, this.posStart.y);
	context.quadraticCurveTo(this.posInBetween.x, this.posInBetween.y, this.positionEnd.x, this.positionEnd.y);
	context.stroke();
}

MonsterHair.prototype.update = function (aDelta) {

	// update the movement due to parent movement.

	
	var lRadiusNorm = sRayCircle * this.radius;
	lRadiusNorm *= 1.2;
	var lAngle = this.angle + sGeneralTimer * 0.2;
	this.posStart.x = lRadiusNorm * Math.cos(lAngle);
	this.posStart.y = lRadiusNorm * Math.sin(lAngle);

	var excitationLevel = Math.max(0, Math.cos(lAngle + sGeneralTimer * 0.8));
	var lEndAngle = (1 + this.randomValue * 0.5) * sGeneralTimer + this.randomValue * 4 * excitationLevel;

	var lHairLength = (1.6 + this.randomValue * 0.5);

	var posEndTargetX = lHairLength * lRadiusNorm * Math.cos(lAngle) + lRadiusNorm * 0.1 * excitationLevel * Math.cos(lEndAngle);
	var posEndTargetY = lHairLength * lRadiusNorm * Math.sin(lAngle) + lRadiusNorm * 0.1 * excitationLevel * Math.sin(lEndAngle);

	var lDistance = Math.sqrt((this.positionEnd.x - this.posStart.x) * (this.positionEnd.x - this.posStart.x) + (this.positionEnd.y - this.posStart.y) * (this.positionEnd.y - this.posStart.y));
	var distanceMiddle = 0.2; // to simulate the curvature of the hair.
	var distanceTarget = 1 * lHairLength * lRadiusNorm;
	if (lDistance > distanceTarget) {
		this.positionEnd.x -= 0.8 * sMonster.speed.x / window.innerWidth * aDelta;
		this.positionEnd.y -= 0.8 * sMonster.speed.y / window.innerWidth * aDelta;
		// this.positionEndSpeed.x += 1 * (posEndTargetX - this.positionEnd.x) * aDelta;
		// this.positionEndSpeed.y += 1 * (posEndTargetY - this.positionEnd.y) * aDelta;
	}
	else {
		this.positionEnd.x -= 1 * sMonster.speed.x / window.innerWidth * aDelta;
		this.positionEnd.y -= 1 * sMonster.speed.y / window.innerWidth * aDelta;
		distanceMiddle = Math.max(0.2, 2 * (lDistance - distanceTarget));
		// this.positionEndSpeed.x += 1 * (posEndTargetX - this.positionEnd.x) * aDelta;
		// this.positionEndSpeed.y += 1 * (posEndTargetY - this.positionEnd.y) * aDelta;
	}

	this.positionEndSpeed.x += 0.5 * (posEndTargetX - this.positionEnd.x) * aDelta;
	this.positionEndSpeed.y += 0.5 * (posEndTargetY - this.positionEnd.y) * aDelta;

	this.positionEndSpeed.x *= 0.97;
	this.positionEndSpeed.y *= 0.97;

	this.positionEnd.x += this.positionEndSpeed.x * aDelta;
	this.positionEnd.y += this.positionEndSpeed.y * aDelta;

	this.positionEndX += this.speedEnd.x * aDelta;
	this.positionEndY += this.speedEnd.y * aDelta;

	var lInAngle = 1.6 * sGeneralTimer + this.randomValue * 3;
	this.posInBetween.x = this.posStart.x + (this.positionEnd.x - this.posStart.x) * 0.5 + distanceMiddle * Math.sin(lInAngle);
	this.posInBetween.y = this.posStart.y + (this.positionEnd.y - this.posStart.y) * 0.5 + distanceMiddle * Math.cos(lInAngle);


	// var lEndAngle = (1 + random() * 0.5) * sGeneralTimer + random() * 4 * excitationLevel;
	
	// var posEndX = lRadiusNorm * lAmplitude * Math.cos(lAngle) + lRadiusNorm * 0.2 * Math.sin(lEndAngle) - lAmplitudeFromSpeed * Math.cos(lAngleSpeed);
	// var posEndY = lRadiusNorm * lAmplitude * Math.sin(lAngle) + lRadiusNorm * 0.2 * Math.cos(lEndAngle) - lAmplitudeFromSpeed * Math.sin(lAngleSpeed);
}