/**
 * Intro monster: canvas-drawn creature that collects letter particles.
 *
 * Import named exports from this file in ES modules. For legacy pages that load
 * classic scripts in order, use registerParticleGroupMonsterGlobals.mjs (main site).
 */
import { LegStates, MonsterIntroLeg } from './MonsterIntroLeg.mjs';

export { LegStates } from './MonsterIntroLeg.mjs';

const PI2 = -Math.PI * 1.99;
const DEFAULT_RAY_CIRCLE = 0.3;

function ensureMonsterIntroState() {
	if (globalThis.sPutALetter == null) globalThis.sPutALetter = 0;
	if (globalThis.sEnd == null) globalThis.sEnd = false;
	if (globalThis.sMonsterLineWidth == null) globalThis.sMonsterLineWidth = 0.01;
	if (globalThis.sTimerClose == null) globalThis.sTimerClose = 0;
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

function drawHair(context, count, particle, rayCircle) {
	var random = sfc32(1, 3, 4, 5);
	var sGeneralTimer = globalThis.sGeneralTimer;
	var speed = particle.speed || { x: 0, y: 0 };
	var lAngleSpeed = Math.atan2(speed.y, speed.x);
	var lAmplitudeFromSpeed = Math.min(
		0.3,
		0.5 * Math.sqrt(speed.y * speed.y + speed.x * speed.x) / window.innerWidth
	);
	for (var i = 0; i < count; i++) {
		context.beginPath();

		var lRadiusNorm = rayCircle * random();
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

export function MonsterIntro(positionCenter, width, particleGroupMonster) {
	var THREE = globalThis.THREE;
	var scene = globalThis.scene;

	this.particleGroupMonster = particleGroupMonster;
	this.rayCircle = DEFAULT_RAY_CIRCLE;
	this.rayCircleTarget = DEFAULT_RAY_CIRCLE;
	this.legs = [];
	for (var i = 0; i < 7; i++) {
		this.legs.push(new MonsterIntroLeg(this));
	}
	this.UpdateLegAngles();
	this.scratchLegIndex = 0;
	this.phaseScratchTimer = 0;
	this.scratchDuration = 1.0;
	this.minEatDuration = 1.0;
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
	this.SetIntroMode('scratching');
}

MonsterIntro.prototype.AreIntroLettersSettled = function () {
	return this.particleGroupMonster.AreIntroLettersSettled();
};

MonsterIntro.prototype.UpdateIntroPhase = function (delta) {
	if (globalThis.sEnd && this.introMode !== 'resting') {
		this.SetIntroMode('resting');
		return;
	}

	switch (this.introMode) {
		case 'scratching':
			if (this.phaseScratchTimer >= this.scratchDuration) {
				this.SetIntroMode('eating');
			}
			break;
		case 'eating':
			if (this.eatingTimer >= this.minEatDuration && this.AreIntroLettersSettled()) {
				this.SetIntroMode('resting');
			}
			break;
	}
};

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
	var blockedDestinationIndexes = this.GetBlockedDestinationIndexes();
	var lFoodArray = this.particleGroupMonster.foodArray;
	var sMonster = this.particle;
	var sizeLegsMax = this.legs.length > 0 ? this.legs[0].sizeMax : 0;

	for (var i = 0; i < lFoodArray.length; i++) {
		if (lFoodArray[i].isTarget) {
			continue;
		}
		var distance = lFoodArray[i].position.distanceTo(sMonster.position);
		if (distance < sMonster.scale.x * (this.rayCircle + 3.8 * sizeLegsMax)) {
			var angleClose = Math.atan(
				(sMonster.position.y - lFoodArray[i].position.y) / (sMonster.position.x - lFoodArray[i].position.x)
			);
			if (sMonster.position.x - lFoodArray[i].position.x > 0) {
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

			closeElements.push({
				pos: lFoodArray[i].position,
				indexLeg: index,
				particle: lFoodArray[i],
				freesBlockedDestination: !!blockedDestinationIndexes[lFoodArray[i].introOriginIndex],
			});
			globalThis.sTimerClose = 0.7;
		}
	}

	closeElements.sort(function (a, b) {
		if (a.freesBlockedDestination === b.freesBlockedDestination) {
			return 0;
		}
		return a.freesBlockedDestination ? -1 : 1;
	});
	return closeElements;
};

MonsterIntro.prototype.GetBlockedDestinationIndexes = function () {
	var blockedDestinationIndexes = {};
	for (var i = 0; i < this.legs.length; i++) {
		var gotObject = this.legs[i].gotObject;
		if (!gotObject || this.particleGroupMonster.CanPlaceIntroLetter(gotObject.particle)) {
			continue;
		}
		blockedDestinationIndexes[gotObject.particle.introDestinationIndex] = true;
	}
	return blockedDestinationIndexes;
};

MonsterIntro.prototype.CountActiveEatingLegs = function () {
	var count = 0;
	for (var i = 0; i < this.legs.length; i++) {
		if (this.legs[i].gotObject) {
			count++;
		}
	}
	return count;
};

MonsterIntro.prototype.SetIntroMode = function (mode) {
	this.introMode = mode;
	if (mode === 'scratching') {
		this.phaseScratchTimer = 0;
		this.scratchTimer = 0;
		globalThis.sMonsterScratchTimer = 0;
		if (this.legs.length > 0) {
			this.scratchLegIndex = Math.min(0, this.legs.length - 1);
			globalThis.sMonsterScratchLegIndex = this.scratchLegIndex;
			this.legs[this.scratchLegIndex].SetState(LegStates.SCRATCH);
		}
	}
	if (mode === 'resting') {
		for (var r = 0; r < this.legs.length; r++) {
			this.legs[r].SetState(LegStates.REST);
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
	return !((this.introMode === 'scratching' || this.introMode === 'eating' || sTimerClose > 0.) && !globalThis.sEnd);
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
	var activeEatingLegs = this.CountActiveEatingLegs();

	for (var i = 0; i < this.legs.length; i++) {
		if (this.introMode === 'scratching') {
			if (i === this.scratchLegIndex) {
				this.legs[i].SetState(LegStates.SCRATCH);
			} else {
				this.legs[i].SetState(LegStates.REST);
			}
		}
		else if (this.introMode === 'eating') {
			if (this.eatingTimer < this.eatingLegActivationDelays[i]) {
				this.legs[i].Update(delta, 0.2);
				continue;
			}
			if (this.legs[i].state === LegStates.REST || this.legs[i].state === LegStates.SCRATCH) {
				this.legs[i].SetState(LegStates.IDLE);
			}
			for (var j = 0; j < closeStuffs.length; j++) {
				if (activeEatingLegs >= this.legs.length - 1 && !closeStuffs[j].freesBlockedDestination) {
					continue;
				}
				if (closeStuffs[j].indexLeg == i && this.legs[i].TryGrabFood(closeStuffs[j])) {
					activeEatingLegs++;
					break;
				}
			}
		}
		else if (this.introMode === 'resting') {
			if (shouldRest && this.legs[i].state === LegStates.IDLE) {
				this.legs[i].SetState(LegStates.REST);
			} else if (!shouldRest && this.legs[i].state === LegStates.REST) {
				this.legs[i].SetState(LegStates.IDLE);
			}
		}

		this.legs[i].Update(delta, 0.2);
	}
};

MonsterIntro.prototype.Update = function (delta) {
	var sTimerClose = globalThis.sTimerClose;
	sTimerClose -= delta;
	globalThis.sTimerClose = sTimerClose;

	if (this.introMode === 'eating') {
		this.eatingTimer += delta;
	}
	if (this.introMode === 'scratching') {
		this.phaseScratchTimer += delta;
	}

	this.UpdateIntroPhase(delta);

	var animDelta = delta * 4.;
	globalThis.sTime1 += animDelta;
	globalThis.sTime2 += 1.5 * animDelta;
	if (this.introMode === 'scratching') {
		this.scratchTimer += animDelta;
		globalThis.sMonsterScratchTimer = this.scratchTimer;
	}

	this.rayCircle += (this.rayCircleTarget - this.rayCircle) * animDelta * 0.5;
	this.UpdateLegs(animDelta, sTimerClose);

	if (this.AreLegsResting() && globalThis.sPutALetter > 0 && !globalThis.sEnd) {
		globalThis.infoDisplay.SetSize(1.3);
		globalThis.infoDisplay.FadeIn();
	}
	globalThis.infoDisplay.SetPosition(this.particle.position, true);
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
	context.arc(centerX, centerY, this.rayCircle, 0, PI2, true);
	context.closePath();
	context.stroke();
};

MonsterIntro.prototype.monsterTouched = function (context) {
	context.beginPath();
	context.arc(0, 0, this.rayCircle, 0, PI2, true);
	context.closePath();
	context.fill();
};

MonsterIntro.prototype.setNormalDisplay = function () {
	this.particle.material.program = this.programMonster;
};

MonsterIntro.prototype.setMouseOverDisplay = function () {
	this.particle.material.program = this.monsterTouched;
};
