/**
 * Programming menu navigator: tentacled circle particle.
 */
import { drawWavyBottomHalfFill, PI2 } from '../Template.mjs';

var rotationThree = 0;
var pickCircleRadius = 0;
var sDistanceTwo = 0.5;

function drawOneArmThree(context, angle, evolution) {
	context.lineWidth = 0.01;
	var noiseElbow = Math.cos(-rotationThree + angle);
	var noiseHand = Math.sin(-rotationThree + angle * 2);

	var size = evolution * 0.5;
	var evolution2NoPi = evolution * evolution * evolution * evolution;
	var evolution2 = evolution2NoPi * Math.PI;
	evolution = evolution * Math.PI;
	context.beginPath();
	var COS = Math.cos(angle + evolution + rotationThree);
	var SIN = Math.sin(angle + evolution + rotationThree);
	var posShoulderX = COS * 0.3;
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
	context.arc(posHandX + COS * rayLittle, posHandY + SIN * rayLittle, rayLittle, 0, PI2, true);
	context.closePath();
	context.stroke();
}

function programMonster3(context) {
	rotationThree += 0.02;
	var centerX = 0.;
	var centerY = 0.;

	// drawWavyBottomHalfFill(context, 0.3);

	drawOneArmThree(context, Math.PI * 0, sDistanceTwo);
	drawOneArmThree(context, Math.PI * 0.25, sDistanceTwo);
	drawOneArmThree(context, Math.PI * 0.5, sDistanceTwo);
	drawOneArmThree(context, Math.PI * 0.75, sDistanceTwo);
	drawOneArmThree(context, Math.PI * 1., sDistanceTwo);
	drawOneArmThree(context, Math.PI * 1.25, sDistanceTwo);
	drawOneArmThree(context, Math.PI * 1.5, sDistanceTwo);
	drawOneArmThree(context, Math.PI * 1.75, sDistanceTwo);

	context.beginPath();
	context.arc(centerX, centerY, 0.3, 0, PI2, true);
	context.closePath();
	context.stroke();

	if (pickCircleRadius > 0.0001) {
		context.beginPath();
		context.arc(centerX, centerY, pickCircleRadius * pickCircleRadius * 0.3, 0, PI2, true);
		context.closePath();
		context.fill();
	}
}

export function MonsterRandom(aPosition, aSize, aTarget) {
	var that = this;
	this.target = aTarget;

	this.particle = new ParticleCircleNavigate(aPosition, aTarget);
	this.particle.material.program = programMonster3;
	this.particle.scale.x *= 3.;
	this.particle.scale.y *= 3.;

	this.particle.TargetObject.isAutonomous = true;

	this.particle.MyMouseOn = function () {
		that.mouseOn = true;
	};

	this.particle.MyMouseOff = function () {
		that.mouseOn = false;
	};

	this.particle.MyMouseDown = function () {
		that.GoToTarget();
	};

	this.particle.MyCameraDistance = function () {
		return window.innerWidth * 0.2;
	};

	this.info = this.particle.TargetObject.info;
	this.mouseOn = false;
	this.isPicking = false;
}

MonsterRandom.prototype.GoToTarget = function () {
	if (isdefined(this.target.target)) {
		GoToIndex(this.target.target);
	}
};

MonsterRandom.prototype.Update = function (delta) {
	if (this.isPicking) {
		// pickCircleRadius += 0.01;
		// if(pickCircleRadius > 0.75)
		// {
		// pickCircleRadius = 1.;
		// sDistanceTwo = pickCircleRadius;
		// this.isPicking = false;
		// this.GoToTarget();
		// }
	} else {
		pickCircleRadius -= 0.05;
		pickCircleRadius = Math.max(0., pickCircleRadius);
	}

	if (this.mouseOn || this.isPicking) {
		this.particle.SetName(this.target.name);
		sDistanceTwo += 0.03;
		sDistanceTwo = Math.min(1., sDistanceTwo);
		this.info.material.opacity += 0.01;
		this.info.material.opacity = Math.min(1., this.info.material.opacity);
	} else {
		this.particle.SetName(this.target.name);
		sDistanceTwo -= 0.005;
		sDistanceTwo = Math.max(0., sDistanceTwo);
		this.info.material.opacity -= 0.01;
		this.info.material.opacity = Math.max(OPACITY_INFO, this.info.material.opacity);
	}
};

globalThis.MonsterRandom = MonsterRandom;
