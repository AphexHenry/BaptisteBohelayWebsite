/**
 * Intro monster: canvas-drawn creature that collects letter particles.
 *
 * Import named exports from this file in ES modules. For legacy pages that load
 * classic scripts in order, use registerParticleGroupMonsterGlobals.mjs (main site).
 */
import { LegStates, MonsterIntroLeg } from './MonsterIntroLeg.mjs';

export { LegStates } from './MonsterIntroLeg.mjs';

const PI2 = -Math.PI * 1.99;

function ensureMonsterIntroState() {
	if (globalThis.sPutALetter == null) globalThis.sPutALetter = 0;
	if (globalThis.sEnd == null) globalThis.sEnd = false;
	if (globalThis.sMonsterLineWidth == null) globalThis.sMonsterLineWidth = 0.01;
	if (globalThis.sTimerClose == null) globalThis.sTimerClose = 0;
	if (globalThis.sMonsterIntroMode == null) globalThis.sMonsterIntroMode = 'scratch';
	if (globalThis.sMonsterScratchTimer == null) globalThis.sMonsterScratchTimer = 0;
	if (globalThis.sMonsterScratchLegIndex == null) globalThis.sMonsterScratchLegIndex = 1;
}

ensureMonsterIntroState();

var lIndexStates = 0;
export var MonsterStates = {
	IN: lIndexStates++,
	IDLE: lIndexStates++,
	EAT_OUT: lIndexStates++,
	EAT_IN: lIndexStates++,
};

function drawHair(context, count) {
	var random = sfc32(1, 3, 4, 5);
	var sMonster = globalThis.sMonster;
	var sGeneralTimer = globalThis.sGeneralTimer;
	var sRayCircle = globalThis.sRayCircle;
	var lAngleSpeed = Math.atan2(sMonster.speed.y, sMonster.speed.x);
	var lAmplitudeFromSpeed = Math.min(
		0.3,
		0.5 * Math.sqrt(sMonster.speed.y * sMonster.speed.y + sMonster.speed.x * sMonster.speed.x) / window.innerWidth
	);
	for (var i = 0; i < count; i++) {
		context.beginPath();

		var lRadiusNorm = sRayCircle * random();
		lRadiusNorm *= 1.2;
		var lAngle = random() * Math.PI * 2 + sGeneralTimer * 0.2;
		var posStartX = lRadiusNorm * Math.cos(lAngle);
		var posStartY = lRadiusNorm * Math.sin(lAngle);

		var excitationLevel = Math.max(0, Math.cos(lAngle + sGeneralTimer * 0.8));
		var lEndAngle = (1 + random() * 0.5) * sGeneralTimer + random() * 4 * excitationLevel;

		var lAmplitude = 1.3 * (1.3 + excitationLevel * 0.2);
		var posEndX =
			lRadiusNorm * lAmplitude * Math.cos(lAngle) +
			lRadiusNorm * 0.2 * Math.sin(lEndAngle) -
			lAmplitudeFromSpeed * Math.cos(lAngleSpeed);
		var posEndY =
			lRadiusNorm * lAmplitude * Math.sin(lAngle) +
			lRadiusNorm * 0.2 * Math.cos(lEndAngle) -
			lAmplitudeFromSpeed * Math.sin(lAngleSpeed);

		var lInAngle = 1.6 * sGeneralTimer + random() * 3;
		var posInBetweenX = posStartX + (posEndX - posStartX) * 0.5 + lRadiusNorm * 0.2 * Math.sin(lInAngle);
		var posInBetweenY = posStartY + (posEndY - posStartY) * 0.5 + lRadiusNorm * 0.2 * Math.cos(lInAngle);
		context.lineWidth = 0.005;
		context.moveTo(posStartX, posStartY);
		context.quadraticCurveTo(posInBetweenX, posInBetweenY, posEndX, posEndY);
		context.stroke();
	}
}

function sfc32(a, b, c, d) {
	return function () {
		a |= 0;
		b |= 0;
		c |= 0;
		d |= 0;
		var t = (a + b | 0) + d | 0;
		d = d + 1 | 0;
		a = b ^ (b >>> 9);
		b = c + (c << 3) | 0;
		c = (c << 21 | c >>> 11);
		c = c + t | 0;
		return (t >>> 0) / 4294967296;
	};
}

function drawArm(context, leg) {
	var legPose = leg.pose;
	if (!legPose) {
		return;
	}

	context.beginPath();
	context.moveTo(legPose.posHandX, legPose.posHandY);
	context.quadraticCurveTo(legPose.posElbowX, legPose.posElbowY, legPose.posShoulderX, legPose.posShoulderY);
	context.stroke();
}

export function MonsterIntro(positionCenter, width) {
	var THREE = globalThis.THREE;
	var scene = globalThis.scene;

	this.legs = [];
	for (var i = 0; i < 7; i++) {
		this.legs.push(new MonsterIntroLeg());
	}
	this.UpdateLegAngles();
	this.scratchLegIndex = 0;
	this.eatingTimer = 0;
	this.eatingLegActivationDelays = [];
	this.programMonster = this.programMonster.bind(this);
	this.monsterTouched = this.monsterTouched.bind(this);

	this.particle = new THREE.Particle(
		new THREE.ParticleCanvasMaterial({ color: 0xd5675a, program: this.programMonster, transparent: true })
	);

	this.particle.position.x = positionCenter.x - window.innerWidth * 0.2;
	this.particle.position.y = positionCenter.y - window.innerHeight * 0.2;
	this.particle.position.z = positionCenter.z;

	var size = 1;
	this.particle.scale.x = this.particle.scale.y = 3 * width * 0.28 * size;
	scene.add(this.particle);

	globalThis.sTime1 = 0;
	globalThis.sTime2 = 0;
	globalThis.sMonster = this.particle;
	this.SetIntroMode('scratch');
}

MonsterIntro.prototype.UpdateLegAngles = function () {
	for (var i = 0; i < this.legs.length; i++) {
		this.legs[i].SetAngle(i * Math.PI * 2. / this.legs.length);
	}
};

MonsterIntro.prototype.GetCloseFood = function () {
	if (globalThis.sEnd || this.introMode !== 'eating') {
		return [];
	}
	var closeElements = [];
	var sFoodArray = globalThis.sFoodArray;
	var sMonster = this.particle;
	var sRayCircle = globalThis.sRayCircle;
	var sizeLegsMax = this.legs.length > 0 ? this.legs[0].sizeMax : 0;

	for (var i = 0; i < sFoodArray.length; i++) {
		if (sFoodArray[i].isTarget) {
			continue;
		}
		var distance = sFoodArray[i].position.distanceTo(sMonster.position);
		if (distance < sMonster.scale.x * (sRayCircle + 3.8 * sizeLegsMax)) {
			var angleClose = Math.atan(
				(sMonster.position.y - sFoodArray[i].position.y) / (sMonster.position.x - sFoodArray[i].position.x)
			);
			if (sMonster.position.x - sFoodArray[i].position.x > 0) {
				angleClose += Math.PI;
			}
			if (angleClose < 0.) {
				angleClose += 2. * Math.PI;
			}
			var index = Math.round((this.legs.length - 1) * angleClose * 0.5 / Math.PI);

			if (this.legs[index].gotObject) {
				index++;
				index = index % this.legs.length;
				if (this.legs[index].gotObject) {
					index -= 2;
					index = Math.abs(index % this.legs.length);
				}
			}

			closeElements.push({ pos: sFoodArray[i].position, indexLeg: index, particle: sFoodArray[i] });
			globalThis.sTimerClose = 0.7;
		}
	}

	return closeElements;
};

MonsterIntro.prototype.SetIntroMode = function (mode) {
	this.introMode = mode;
	globalThis.sMonsterIntroMode = mode;
	if (mode === 'scratch') {
		this.scratchTimer = 0;
		globalThis.sMonsterScratchTimer = 0;
		if (this.legs.length > 0) {
			this.scratchLegIndex = Math.min(0, this.legs.length - 1);
			globalThis.sMonsterScratchLegIndex = this.scratchLegIndex;
			this.legs[this.scratchLegIndex].SetState(LegStates.SCRATCH);
		}
	}
	if (mode === 'eating') {
		this.eatingTimer = 0;
		for (var i = 0; i < this.legs.length; i++) {
			this.eatingLegActivationDelays[i] = Math.random() * 0.5;
		}
		globalThis.sTimerClose = Math.max(globalThis.sTimerClose, 0.8);
	}
};

MonsterIntro.prototype.WakeUp = function (duration) {
	globalThis.sTimerClose = Math.max(duration, globalThis.sTimerClose);
};

MonsterIntro.prototype.ShouldLegsRest = function (sTimerClose) {
	return !((this.introMode === 'scratch' || this.introMode === 'eating' || sTimerClose > 0.) && !globalThis.sEnd);
};

MonsterIntro.prototype.AreLegsResting = function () {
	for (var i = 0; i < this.legs.length; i++) {
		if (this.legs[i].size >= 0.52) {
			return false;
		}
	}
	return true;
};

MonsterIntro.prototype.UpdateLegs = function (delta, sTimerClose) {
	var shouldRest = this.ShouldLegsRest(sTimerClose);
	var closeStuffs = this.introMode === 'eating' ? this.GetCloseFood() : [];

	for (var i = 0; i < this.legs.length; i++) {
		if(this.introMode === 'scratch') {
			if (i === this.scratchLegIndex) {
				this.legs[i].SetState(LegStates.SCRATCH);
			} else {
				this.legs[i].SetState(LegStates.REST);
			}
		}	
		else if (this.introMode === 'eating') {
			if (this.eatingTimer < this.eatingLegActivationDelays[i]) {
				this.legs[i].Update(delta, 0.2, this.particle);
				continue;
			}
			if (this.legs[i].state === LegStates.REST || this.legs[i].state === LegStates.SCRATCH) {
				this.legs[i].SetState(LegStates.IDLE);
			}
			for (var j = 0; j < closeStuffs.length; j++) {
				if (closeStuffs[j].indexLeg == i && this.legs[i].TryGrabFood(closeStuffs[j])) {
					break;
				}
			}
		}
		else {
			if (shouldRest && this.legs[i].state === LegStates.IDLE) {
				this.legs[i].SetState(LegStates.REST);
			} else if (!shouldRest && this.legs[i].state === LegStates.REST) {
				this.legs[i].SetState(LegStates.IDLE);
			}
		}

		this.legs[i].Update(delta, 0.2, this.particle);
	}
};

MonsterIntro.prototype.Update = function (delta) {
	var sTimerClose = globalThis.sTimerClose;
	sTimerClose -= delta;
	globalThis.sTimerClose = sTimerClose;

	if (this.introMode === 'eating') {
		this.eatingTimer += delta;
	}

	delta *= 4.;
	globalThis.sTime1 += delta;
	globalThis.sTime2 += 1.5 * delta;
	if (this.introMode === 'scratch') {
		this.scratchTimer += delta;
		globalThis.sMonsterScratchTimer = this.scratchTimer;
	}

	globalThis.sRayCircle += (globalThis.sRayCircleTarget - globalThis.sRayCircle) * delta * 0.5;
	this.UpdateLegs(delta, sTimerClose);

	if (this.AreLegsResting() && globalThis.sPutALetter > 0 && !globalThis.sEnd) {
		globalThis.infoDisplay.SetSize(1.3);
		globalThis.infoDisplay.FadeIn();
	}
	globalThis.infoDisplay.SetPosition(globalThis.sMonster.position, true);
};

MonsterIntro.prototype.programMonster = function (context) {
	context.lineWidth = globalThis.sMonsterLineWidth;

	for (var i = 0; i < this.legs.length; i++) {
		drawArm(context, this.legs[i]);
	}

	var centerX = 0.;
	var centerY = 0.;
	context.lineWidth = context.lineWidth * 2;
	context.beginPath();
	context.arc(centerX, centerY, globalThis.sRayCircle, 0, PI2, true);
	context.closePath();
	context.stroke();
};

MonsterIntro.prototype.monsterTouched = function (context) {
	context.beginPath();
	context.arc(0, 0, globalThis.sRayCircle, 0, PI2, true);
	context.closePath();
	context.fill();
};

MonsterIntro.prototype.SetFood = function (foodArray) {
	globalThis.sFoodArray = foodArray;
};

MonsterIntro.prototype.setNormalDisplay = function () {
	this.particle.material.program = this.programMonster;
};

MonsterIntro.prototype.setMouseOverDisplay = function () {
	this.particle.material.program = this.monsterTouched;
};
