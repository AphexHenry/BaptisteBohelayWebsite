/**
 * Intro monster: canvas-drawn creature that collects letter particles.
 *
 * Import named exports from this file in ES modules. For legacy pages that load
 * classic scripts in order, use registerParticleGroupMonsterGlobals.mjs (main site).
 */
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

export var LegStates = {
	IDLE: 0,
	GRABBING_FOOD: 1,
	PLACING_FOOD: 2,
};
globalThis.IntroLegStates = globalThis.IntroLegStates || LegStates;

function getCloseFood() {
	if (globalThis.sEnd || globalThis.sMonsterIntroMode !== 'eating') {
		return [];
	}
	var closeElements = [];
	var sFoodArray = globalThis.sFoodArray;
	var sMonster = globalThis.sMonster;
	var sRayCircle = globalThis.sRayCircle;
	var sSizeLegsMax = globalThis.sSizeLegsMax;
	var sLegArray = globalThis.sLegArray;

	for (var i = 0; i < sFoodArray.length; i++) {
		if (sFoodArray[i].isTarget) {
			continue;
		}
		var distance = sFoodArray[i].position.distanceTo(sMonster.position);
		if (distance < sMonster.scale.x * (sRayCircle + 3.8 * sSizeLegsMax)) {
			var angleClose = Math.atan(
				(sMonster.position.y - sFoodArray[i].position.y) / (sMonster.position.x - sFoodArray[i].position.x)
			);
			if (sMonster.position.x - sFoodArray[i].position.x > 0) {
				angleClose += Math.PI;
			}
			if (angleClose < 0.) {
				angleClose += 2. * Math.PI;
			}
			var index = Math.round((sLegArray.length - 1) * angleClose * 0.5 / Math.PI);

			if (sLegArray[index].gotObject) {
				index++;
				index = index % sLegArray.length;
				if (sLegArray[index].gotObject) {
					index -= 2;
					index = Math.abs(index % sLegArray.length);
				}
			}

			closeElements.push({ pos: sFoodArray[i].position, indexLeg: index, particle: sFoodArray[i] });
			globalThis.sTimerClose = 0.7;
		}
	}

	return closeElements;
}

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

function drawArm(context, size, i, amp) {
	var sLegArray = globalThis.sLegArray;
	var sMonster = globalThis.sMonster;
	var sTime1 = globalThis.sTime1;
	var sTime2 = globalThis.sTime2;
	var sRayCircle = globalThis.sRayCircle;
	var decay = sLegArray[i].random;
	var angle = sLegArray[i].angle;
	var gotObject = sLegArray[i].gotObject;

	context.beginPath();
	size *= 0.69;
	var COS = Math.cos(angle);
	var SIN = Math.sin(angle);
	var posShoulderX = COS * sRayCircle;
	var posShoulderY = SIN * sRayCircle;
	var posElbowX = posShoulderX + size * (COS * 0.5 + amp * Math.cos(sTime2 + decay * 1.5) * SIN);
	var posElbowY = posShoulderY + size * (SIN * size * 0.5 + amp * Math.cos(sTime2 + decay * 1.5) * -COS);

	var posHandX = 0;
	var posHandY = 0;

	sLegArray[i].coeffMove += 0.02 * sLegArray[i].speed;
	sLegArray[i].coeffMove = Math.min(1.000001, sLegArray[i].coeffMove);

	if (globalThis.sMonsterIntroMode === 'scratch' && i === globalThis.sMonsterScratchLegIndex) {
		var rub = Math.sin(globalThis.sMonsterScratchTimer * 2.);
		sLegArray[i].posHandTarget.x = sRayCircle * 1.08;
		sLegArray[i].posHandTarget.y = sRayCircle * 0.2 * rub;
	} else {
		switch (sLegArray[i].state) {
			case LegStates.IDLE:
				sLegArray[i].posHandTarget.x = posShoulderX + size * (COS * size + 1.5 * amp * Math.sin(sTime1 + decay * 2.) * SIN);
				sLegArray[i].posHandTarget.y = posShoulderY + size * (SIN * size + 1.5 * amp * Math.sin(sTime1 + decay * 2.) * COS);
				break;
			case LegStates.GRABBING_FOOD:
				sLegArray[i].posHandTarget.x = (gotObject.particle.position.x - sMonster.position.x) / sMonster.scale.x;
				sLegArray[i].posHandTarget.y = (gotObject.particle.position.y - sMonster.position.y) / sMonster.scale.y;
				break;
			case LegStates.PLACING_FOOD:
				sLegArray[i].posHandTarget.x =
					(gotObject.particle.TargetObject.positionTarget.x - sMonster.position.x) / sMonster.scale.x;
				sLegArray[i].posHandTarget.y =
					(gotObject.particle.TargetObject.positionTarget.y - sMonster.position.y) / sMonster.scale.x;
				break;
		}
	}

	posHandX = sLegArray[i].posHandInit.x + sLegArray[i].coeffMove * (sLegArray[i].posHandTarget.x - sLegArray[i].posHandInit.x);
	posHandY = sLegArray[i].posHandInit.y + sLegArray[i].coeffMove * (sLegArray[i].posHandTarget.y - sLegArray[i].posHandInit.y);
	sLegArray[i].posHandCurrent.x = posHandX;
	sLegArray[i].posHandCurrent.y = posHandY;

	switch (sLegArray[i].state) {
		case LegStates.IDLE:
			break;
		case LegStates.GRABBING_FOOD:
			if (sLegArray[i].coeffMove >= 0.5) {
				gotObject.particle.isMovable = false;
				SetStateLeg(i, LegStates.PLACING_FOOD);
			}
			break;
		case LegStates.PLACING_FOOD:
			gotObject.particle.position.x = sMonster.position.x + posHandX * sMonster.scale.x;
			gotObject.particle.position.y = sMonster.position.y + posHandY * sMonster.scale.y;
			if (sLegArray[i].coeffMove >= 0.5) {
				gotObject.particle.position.x = gotObject.particle.TargetObject.positionTarget.x;
				gotObject.particle.position.y = gotObject.particle.TargetObject.positionTarget.y;
				gotObject.particle.isEaten = true;
				sLegArray[i].gotObject = null;
				globalThis.sPutALetter++;
				if (globalThis.sPutALetter == 20) {
					$('#githubButton').slideDown(300);
					$('#contactButton').slideDown(200);
				}
				SetStateLeg(i, LegStates.IDLE);
			}
			break;
	}

	context.moveTo(posHandX, posHandY);
	context.quadraticCurveTo(posElbowX, posElbowY, posShoulderX, posShoulderY);
	context.stroke();
}

function SetStateLeg(i, state) {
	var sLegArray = globalThis.sLegArray;
	sLegArray[i].state = state;
	sLegArray[i].posHandInit = sLegArray[i].posHandCurrent;
	sLegArray[i].coeffMove = 0.;
}

function Attack(part, indexLeg) {
	var sChallenge = globalThis.sChallenge;
	if (sChallenge.particle === part.particle) {
		sChallenge.SetAttacked(1);
	}
}

export function MonsterIntro(positionCenter, width) {
	var THREE = globalThis.THREE;
	var scene = globalThis.scene;
	var AddLeg = globalThis.AddLeg;

	for (var i = 0; i < 7; i++) {
		AddLeg();
	}

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

MonsterIntro.prototype.SetIntroMode = function (mode) {
	this.introMode = mode;
	globalThis.sMonsterIntroMode = mode;
	if (mode === 'scratch') {
		this.scratchTimer = 0;
		globalThis.sMonsterScratchTimer = 0;
		if (globalThis.sLegArray.length > 0) {
			globalThis.sMonsterScratchLegIndex = Math.min(0, globalThis.sLegArray.length - 1);
			SetStateLeg(globalThis.sMonsterScratchLegIndex, LegStates.IDLE);
		}
	}
	if (mode === 'eating') {
		globalThis.sTimerClose = Math.max(globalThis.sTimerClose, 0.8);
	}
};

MonsterIntro.prototype.WakeUp = function (duration) {
	globalThis.sTimerClose = Math.max(duration, globalThis.sTimerClose);
};

MonsterIntro.prototype.Update = function (delta) {
	var sTimerClose = globalThis.sTimerClose;
	sTimerClose -= delta;
	globalThis.sTimerClose = sTimerClose;

	delta *= 4.;
	globalThis.sTime1 += delta;
	globalThis.sTime2 += 1.5 * delta;
	if (this.introMode === 'scratch') {
		this.scratchTimer += delta;
		globalThis.sMonsterScratchTimer = this.scratchTimer;
	}

	if ((this.introMode === 'scratch' || this.introMode === 'eating' || sTimerClose > 0.) && !globalThis.sEnd) {
		globalThis.sSizeLegsTarget = globalThis.sSizeLegsMax;
	} else {
		globalThis.sSizeLegsTarget = 0;
	}

	var strength = 0.1;
	if (globalThis.sSizeLegsTarget - globalThis.sSizeLegs > 0) {
		strength = 1.;
	}
	globalThis.sSizeLegs += (globalThis.sSizeLegsTarget - globalThis.sSizeLegs) * delta * 0.5;

	globalThis.sRayCircle += (globalThis.sRayCircleTarget - globalThis.sRayCircle) * delta * 0.5;

	if (globalThis.sSizeLegs < 0.52 && globalThis.sPutALetter > 0 && !globalThis.sEnd) {
		globalThis.infoDisplay.SetSize(1.3);
		globalThis.infoDisplay.FadeIn();
	}
	globalThis.infoDisplay.SetPosition(globalThis.sMonster.position, true);
};

MonsterIntro.prototype.programMonster = function (context) {
	var closeStuffs = globalThis.sMonsterIntroMode === 'eating' ? getCloseFood() : [];
	var sLegArray = globalThis.sLegArray;
	var sSizeLegs = globalThis.sSizeLegs;

	context.lineWidth = globalThis.sMonsterLineWidth;

	if (sSizeLegs > 0.05) {
		for (var i = 0; i < sLegArray.length; i++) {
			if (globalThis.sMonsterIntroMode === 'eating') {
				for (var j = 0; j < closeStuffs.length; j++) {
					if (closeStuffs[j].indexLeg == i && !closeStuffs[j].particle.isTarget && sLegArray[i].state == LegStates.IDLE) {
						closeStuffs[j].particle.isTarget = true;
						sLegArray[i].gotObject = closeStuffs[j];
						SetStateLeg(i, LegStates.GRABBING_FOOD);
						break;
					}
				}
			}

			drawArm(context, sSizeLegs, i, 0.2);
		}
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
