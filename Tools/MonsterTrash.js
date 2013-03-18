var programMonster4 = function(context)
{
	rotationThree += 0.02;
    var centerX = 0.;
    var centerY = 0.;

    drawOneArmThree(context, Math.PI * 0, sDistanceTwo );
    drawOneArmThree(context, Math.PI * 0.25, sDistanceTwo );
    drawOneArmThree(context, Math.PI * 0.5, sDistanceTwo );
    drawOneArmThree(context, Math.PI * 0.75, sDistanceTwo );
    drawOneArmThree(context, Math.PI * 1., sDistanceTwo );
    drawOneArmThree(context, Math.PI * 1.25, sDistanceTwo );
    drawOneArmThree(context, Math.PI * 1.5, sDistanceTwo );
    drawOneArmThree(context, Math.PI * 1.75, sDistanceTwo );

    drawInsideFour();

    context.beginPath();
    context.arc( centerX, centerY, 0.3, 0, PI2, true );
    context.closePath();
    context.stroke();
}

var rotationThree = 0;
var programMonster3 = function(context)
{
	rotationThree += 0.02;
    var centerX = 0.;
    var centerY = 0.;

    drawOneArmThree(context, Math.PI * 0, sDistanceTwo );
    drawOneArmThree(context, Math.PI * 0.25, sDistanceTwo );
    drawOneArmThree(context, Math.PI * 0.5, sDistanceTwo );
    drawOneArmThree(context, Math.PI * 0.75, sDistanceTwo );
    drawOneArmThree(context, Math.PI * 1., sDistanceTwo );
    drawOneArmThree(context, Math.PI * 1.25, sDistanceTwo );
    drawOneArmThree(context, Math.PI * 1.5, sDistanceTwo );
    drawOneArmThree(context, Math.PI * 1.75, sDistanceTwo );

    context.beginPath();
    context.arc( centerX, centerY, 0.3, 0, PI2, true );
    context.closePath();
    context.stroke();
}

var sCloseness = 0;
var positionClose = new THREE.Vector3();
function drawOneArmThree(context, angle, evolution)
{
	context.lineWidth = 0.01;
	var noiseElbow = Math.cos(-rotationThree + angle);
	var noiseHand = Math.sin(-rotationThree + angle * 2);

	size = evolution * 0.5;
	var evolution2NoPi = evolution * evolution * evolution * evolution;
	var evolution2 = evolution2NoPi * Math.PI;
	evolution = evolution * Math.PI;
	// context.setStrokeColor(0x0000f0);
	context.beginPath();
	var COS = Math.cos(angle + evolution + rotationThree);
	var SIN = Math.sin(angle + evolution + rotationThree);
	var posShoulderX =  COS * 0.3;
	var posShoulderY = SIN * 0.3;
	var posElbowX = posShoulderX + size * 0.5 * (COS * -Math.cos(evolution) + Math.sin(evolution + noiseElbow) * SIN);
	var posElbowY = posShoulderY + size * 0.5 * (SIN * -Math.cos(evolution) + Math.sin(evolution + noiseElbow) * COS);
	var posHandX = posShoulderX * (1. + 0.2 * evolution2) + size * (COS * -Math.cos(evolution2) + Math.sin(evolution2 + noiseHand) * SIN);
	var posHandY = posShoulderY * (1. + 0.2 * evolution2) + size * (SIN * -Math.cos(evolution2) + Math.sin(evolution2 + noiseHand) * COS);

	context.moveTo(posHandX, posHandY);
    context.quadraticCurveTo(posElbowX, posElbowY, posShoulderX, posShoulderY);
    context.stroke();

    context.beginPath();
    var rayLittle = 0.03 * evolution2NoPi;
    context.arc( posHandX + COS * rayLittle, posHandY+ SIN * rayLittle, rayLittle, 0, PI2, true );
    context.closePath();
    context.stroke();
}

var sDistanceTwo = 0;
var programMonster2 = function ( context ) 
{
	context.lineWidth = 0.01;

	var dataArms = [];

	drawOneArmTwo(context, sDistanceTwo, 1., 0, 0.2);
	drawOneArmTwo(context, sDistanceTwo, 1.5, Math.PI, 0.2, true);
	drawOneArmTwo(context, sDistanceTwo, 1.9, Math.PI * 0.5, 0.2);
	drawOneArmTwo(context, sDistanceTwo, 4.2, Math.PI * 1.5, 0.2);

	drawOneArmTwo(context, sDistanceTwo, 1., Math.PI * 0.25, 0.2);
	drawOneArmTwo(context, sDistanceTwo, 1.5, Math.PI * 1.25, 0.2);
	drawOneArmTwo(context, sDistanceTwo, 1.9, Math.PI * 0.75, 0.2);
	drawOneArmTwo(context, sDistanceTwo, 4.2, Math.PI * 1.75, 0.2);

    var centerX = 0.;
    var centerY = 0.;
    context.lineWidth = 0.02;
    context.beginPath();
    context.arc( centerX, centerY, 0.3, 0, PI2, true );
    context.closePath();
    context.stroke();
}

function drawOneArmTwo(context, size, decay, angle, amp, isClosest)
{
	// context.setStrokeColor(0x0000f0);
	context.beginPath();
	size *= 0.69;
	var COS = Math.cos(angle);
	var SIN = Math.sin(angle);
	var posShoulderX =  COS * 0.3;
	var posShoulderY = SIN * 0.3;
	var posElbowX = posShoulderX + size * (COS * 0.5 + amp * Math.cos(time2 + decay * 1.5) * SIN);
	var posElbowY = posShoulderY + size * (SIN * size * 0.5 + amp * Math.cos(time2 + decay * 1.5) * -COS);
	var lCloseness =  isClosest ? sCloseness : 0;
	var posHandX = (posShoulderX + size * (COS * size + 1.5 * amp * Math.sin(time1 + decay * 2.) * SIN)) * (1. - lCloseness);
	var posHandY = (posShoulderY + size * (SIN * size + 1.5 * amp * Math.sin(time1 + decay * 2.) * COS)) * (1. - lCloseness);
	if(lCloseness > 0)
	{
	  posHandX += (positionClose.x - sMonsterResume.position.x) / sMonsterResume.scale.x * lCloseness;
	  posHandY += (positionClose.y - sMonsterResume.position.y) / sMonsterResume.scale.y * lCloseness;
	}

	context.moveTo(posHandX, posHandY);
    context.quadraticCurveTo(posElbowX, posElbowY, posShoulderX, posShoulderY);
    context.stroke();
}

var programMonster1 = function ( context ) 
{
	context.lineWidth = 0.01;

    // drawOneArm(context, 0.7, true, false, sDistanceTwo);
    drawOneArm(context, 0.7, false, true, sDistanceTwo);
    drawOneArm(context, 0.7, true, true, sDistanceTwo);
    // drawOneArm(context, 0.7, false, false, sDistanceTwo);

    var centerX = 0.;
    var centerY = 0.;
    context.beginPath();
    context.arc( centerX, centerY, 0.3 - context.lineWidth, 0, PI2, true );
    context.closePath();
    context.stroke();

    drawOneArm(context, 1, true, true, sDistanceTwo);
    // drawOneArm(context, 1., false, false, sDistanceTwo);
    // drawOneArm(context, 1., true, false, sDistanceTwo);
    drawOneArm(context, 1., false, true, sDistanceTwo);
}

function drawOneArm(context, positionY, isTop, isRight, size)
{
	// context.setStrokeColor(0x000f00);
	context.beginPath();
	var timer = -monsterTimer * Math.PI;
	var noiseElbow = 0;
	var noiseHand = 0;
	if(sUp == 3)
	{
		noiseElbow = myRandom() * 0.1;
		noiseHand = myRandom() * 0.1;
	}
	var posShoulderX = 0.;
	var posShoulderY = 0.1 * positionY;
	var posElbowX = posShoulderX + size * (-0.2 + .8 * Math.cos(timer));
	var posElbowY = posShoulderY + size * (0.2 * positionY + .3 * Math.sin(timer - 0.5) + 0.3 * Math.abs(Math.cos(timer)) + noiseElbow - waitTimer * 0.2);
	var posHandX = posShoulderX + size * (0.3 + .7 * Math.cos(timer));
	var posHandY = posShoulderY + size * (0.6 * positionY + .3 * Math.sin(timer) + noiseHand - waitTimer * 0.2);
	if(!isTop)
	{
		posElbowY *= -1;
		posShoulderY *= -1;
		posHandY *= -1;
	}
	if(!isRight)
	{
		posElbowX *= -1;
		posShoulderX *= -1;
		posHandX *= -1;
	}

	context.moveTo(posHandX, posHandY);
    context.quadraticCurveTo(posElbowX, posElbowY, posShoulderX, posShoulderY);
    context.stroke();
}

var monsterTimer = 0.;
var monsterHandTimer = 0;
var waitTimer = 0;
var sUp = 0;
function UpdateMovement(delta)
{
	switch(sUp)
	{
		case 0:
			waitTimer *= 0.97;
			monsterHandTimer += delta * 4;
			monsterHandTimer = Math.min(1., monsterHandTimer);
			monsterTimer += delta;
			if(monsterTimer >= 1.)
			{
				monsterTimer = 1;
				sUp = 1;
			}
			break;
		case 1:
			monsterTimer += 4. * delta;
			if(monsterTimer >= 2.)
			{
				monsterTimer = 0;
				sUp = 3;
			}
			break;
		// case 2:
		// 	monsterHandTimer -= 6. * delta;
		// 	if(monsterHandTimer <= 0.)
		// 	{
		// 		sUp = 3;
		// 	}
		// 	break;
		case 3:
			waitTimer += 1. * delta;
			if(waitTimer >= 1.5)
			{
				sUp = 0;
			}
			break;
	}
}