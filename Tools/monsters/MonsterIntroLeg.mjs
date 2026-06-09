import { setIntroLetterRotationZ } from '../intro/IntroSpaceshipLetterCollision.mjs';

export var LegStates = {
	REST: 0,
	IDLE: 1,
	GRABBING_FOOD: 2,
	LIFTING_FOOD: 3,
	CHECKING_FOOD_DESTINATION: 4,
	PLACING_FOOD: 5,
	SCRATCH: 6,
};

globalThis.IntroLegStates = LegStates;

export function MonsterIntroLeg(monsterIntro) {
	this.monsterIntro = monsterIntro;
	var THREE = globalThis.THREE;

	this.angle = 0;
	this.random = myRandom();
	this.state = LegStates.REST;
	this.size = 0;
	this.sizeMax = 2.;
	this.posHandCurrent = new THREE.Vector2();
	this.posHandTarget = new THREE.Vector2();
	this.posHandInit = new THREE.Vector2();
	this.coeffMove = 1;
	this.gotObject = null;
	this.speed = 0.9 + Math.random() * 0.2;
	this.pose = null;
	this.scratchCoeff = 0;
}

MonsterIntroLeg.prototype.SetAngle = function (angle) {
	this.angle = angle;
};

MonsterIntroLeg.prototype.SetState = function (state) {
	if (this.state === state) {
		return;
	}
	var lRayCircle = this.monsterIntro.rayCircle;
	this.posHandInit.x = this.posHandCurrent.x;
	this.posHandInit.y = this.posHandCurrent.y;
	// REST legs shrink away during scratch and skip Update, so posHandCurrent stays at (0,0).
	// Start the next transition on the body circle (shoulder) to avoid a pop at the center.
	if (this.posHandInit.lengthSq() < 1e-8) {
		this.posHandInit.x = Math.cos(this.angle) * lRayCircle;
		this.posHandInit.y = Math.sin(this.angle) * lRayCircle;
		this.posHandCurrent.x = this.posHandInit.x;
		this.posHandCurrent.y = this.posHandInit.y;
	}
	this.state = state;
	this.coeffMove = 0.;
	if (state === LegStates.SCRATCH) {
		this.scratchCoeff = 0;
	}
};

MonsterIntroLeg.prototype.TryGrabFood = function (closeStuff) {
	if (!closeStuff || closeStuff.particle.isTarget || closeStuff.particle.introLifted || this.state !== LegStates.IDLE) {
		return false;
	}

	closeStuff.particle.isTarget = true;
	this.gotObject = closeStuff;
	this.SetState(LegStates.GRABBING_FOOD);
	return true;
};

MonsterIntroLeg.prototype.GetParticleHandPosition = function (particle, monster) {
	var THREE = globalThis.THREE;
	return new THREE.Vector2(
		(particle.position.x - monster.position.x) / monster.scale.x,
		(particle.position.y - monster.position.y) / monster.scale.y
	);
};

MonsterIntroLeg.prototype.GetLiftHandPosition = function (particle, monster, lRayCircle) {
	var THREE = globalThis.THREE;
	var originPosition = particle.introOriginPosition || particle.position;
	var destinationPosition = particle.TargetObject.positionTarget;
	var middleX = (originPosition.x + destinationPosition.x) * 0.5;
	return new THREE.Vector2(
		(middleX - monster.position.x) / monster.scale.x,
		lRayCircle * 1.75
	);
};

MonsterIntroLeg.prototype.GetTargetHandPosition = function (particle, monster) {
	var THREE = globalThis.THREE;
	return new THREE.Vector2(
		(particle.TargetObject.positionTarget.x - monster.position.x) / monster.scale.x,
		(particle.TargetObject.positionTarget.y - monster.position.y) / monster.scale.y
	);
};

MonsterIntroLeg.prototype.moveHeldParticleToHand = function (particle, posHandX, posHandY, monster) {
	if (!particle || !particle.introDirectPlacement) {
		this.MoveHeldParticleToHand(posHandX, posHandY, monster);
		return;
	}
	// Lift/check only move position; rotation eases during placement.
	this.MoveHeldParticleToHand(posHandX, posHandY, monster, null);
};

MonsterIntroLeg.prototype.MoveHeldParticleToHand = function (posHandX, posHandY, monster, moveProgress) {
	if (!this.gotObject) {
		return;
	}
	var particle = this.gotObject.particle;
	particle.position.x = monster.position.x + posHandX * monster.scale.x;
	particle.position.y = monster.position.y + posHandY * monster.scale.y;
	if (moveProgress == null || particle.introPlacementRotationStart == null) {
		return;
	}

	setIntroLetterRotationZ(
		particle,
		particle.introPlacementRotationStart * (1 - moveProgress)
	);
};

MonsterIntroLeg.prototype.Update = function (delta, amp) {
	var lTime1 = globalThis.sTime1;
	var lTime2 = globalThis.sTime2;
	var monster = this.monsterIntro.particle;
	var lRayCircle = this.monsterIntro.rayCircle;
	var decay = this.random;
	var angle = this.angle;
	var gotObject = this.gotObject;
	var isRest = this.state === LegStates.REST;
	var sizeTarget = isRest ? 0 : this.sizeMax;

	this.size += (sizeTarget - this.size) * delta * 0.5;
	if (this.size < 0.05) {
		this.pose = null;
		return null;
	}

	var armLength = isRest ? this.size : Math.max(lRayCircle, this.size);
	var size = armLength * 0.69;
	var COS = Math.cos(angle);
	var SIN = Math.sin(angle);
	var posShoulderX = COS * lRayCircle;
	var posShoulderY = SIN * lRayCircle;
	var posElbowX = posShoulderX + size * (COS * 0.5 + amp * Math.cos(lTime2 * 0.01 + decay * 1.5) * SIN);
	var posElbowY = posShoulderY + size * (SIN * size * 0.5 + amp * Math.cos(lTime2 * 0.01 + decay * 1.5) * -COS);

	this.coeffMove += 0.6 * this.speed * delta;
	this.coeffMove = Math.min(1.000001, this.coeffMove);

	function smoothstep(t) {
		return t * t * t * (t * (t * 6 - 15) + 10);
	}

	var actualCoeffMove = smoothstep(this.coeffMove);

	switch (this.state) {
		case LegStates.REST:
			posElbowX = posShoulderX + size * (COS * 0.5 + amp * Math.cos(lTime2 * 0.01 + decay * 1.5) * SIN);
			posElbowY = posShoulderY + size * (SIN * 0.5 + amp * Math.cos(lTime2 * 0.01 + decay * 2.1) * -COS);
			this.posHandTarget.x = posShoulderX + size * (COS * 0.6 + amp * Math.sin(lTime1 + decay * 2.) * SIN);
			this.posHandTarget.y = posShoulderY + size * (SIN * 0.6 + amp * Math.sin(lTime1 + decay * 2.3) * COS);
			break;
		case LegStates.IDLE:
			this.posHandTarget.x = posShoulderX + size * (COS * size + 1.5 * amp * Math.sin(lTime1 + decay * 2.) * SIN);
			this.posHandTarget.y = posShoulderY + size * (SIN * size + 1.5 * amp * Math.sin(lTime1 + decay * 2.) * COS);
			break;
		case LegStates.SCRATCH:
			this.scratchCoeff += delta;
			this.scratchCoeff = Math.min(1, this.scratchCoeff);
			var rub = Math.sin(this.monsterIntro.scratchTimer * 2.);
			this.posHandTarget.x = lRayCircle * Math.cos(0.4 + rub * 0.2) * this.scratchCoeff + (1 - this.scratchCoeff) * (posElbowX + lRayCircle * 0.5);
			this.posHandTarget.y = lRayCircle * Math.sin(0.4 + rub * 0.2) * this.scratchCoeff + (1 - this.scratchCoeff) * (posElbowY + lRayCircle * Math.sin(this.scratchCoeff * Math.PI));
			break;
		case LegStates.GRABBING_FOOD:
			var grabPosition = this.GetParticleHandPosition(gotObject.particle, monster);
			this.posHandTarget.x = grabPosition.x;
			this.posHandTarget.y = grabPosition.y;
			break;
		case LegStates.LIFTING_FOOD:
		case LegStates.CHECKING_FOOD_DESTINATION:
			var liftPosition = this.GetLiftHandPosition(gotObject.particle, monster, lRayCircle);
			this.posHandTarget.x = liftPosition.x;
			this.posHandTarget.y = liftPosition.y;
			break;
		case LegStates.PLACING_FOOD:
			var targetPosition = this.GetTargetHandPosition(gotObject.particle, monster);
			this.posHandTarget.x = targetPosition.x;
			this.posHandTarget.y = targetPosition.y;
			break;
	}

	var posHandX = this.posHandInit.x + actualCoeffMove * (this.posHandTarget.x - this.posHandInit.x);
	var posHandY = this.posHandInit.y + actualCoeffMove * (this.posHandTarget.y - this.posHandInit.y);
	this.posHandCurrent.x = posHandX;
	this.posHandCurrent.y = posHandY;

	switch (this.state) {
		case LegStates.IDLE:
		case LegStates.SCRATCH:
			break;
		case LegStates.GRABBING_FOOD:
			if (this.coeffMove >= 1) {
				this.monsterIntro.particleGroupMonster.CaptureIntroLetter(gotObject.particle);
				if (this.monsterIntro.particleGroupMonster.ShouldSkipIntroLetterLift(gotObject.particle)) {
					if (this.monsterIntro.particleGroupMonster.CanPlaceIntroLetter(gotObject.particle)) {
						this.SetState(LegStates.PLACING_FOOD);
					} else {
						this.SetState(LegStates.CHECKING_FOOD_DESTINATION);
					}
				} else {
					this.SetState(LegStates.LIFTING_FOOD);
				}
			}
			break;
		case LegStates.LIFTING_FOOD:
			this.moveHeldParticleToHand(gotObject.particle, posHandX, posHandY, monster);
			if (this.coeffMove >= 1) {
				this.SetState(LegStates.CHECKING_FOOD_DESTINATION);
			}
			break;
		case LegStates.CHECKING_FOOD_DESTINATION:
			this.moveHeldParticleToHand(gotObject.particle, posHandX, posHandY, monster);
			if (this.monsterIntro.particleGroupMonster.CanPlaceIntroLetter(gotObject.particle)) {
				this.SetState(LegStates.PLACING_FOOD);
			}
			break;
		case LegStates.PLACING_FOOD:
			this.MoveHeldParticleToHand(posHandX, posHandY, monster, actualCoeffMove);
			if (this.coeffMove >= 1) {
				this.monsterIntro.particleGroupMonster.PlaceIntroLetter(gotObject.particle);
				this.gotObject = null;
				globalThis.sPutALetter++;
				if (globalThis.sPutALetter == 20) {
					$('#githubButton').slideDown(300);
					$('#contactButton').slideDown(200);
				}
				this.SetState(LegStates.IDLE);
			}
			break;
	}

	this.pose = {
		posHandX: posHandX,
		posHandY: posHandY,
		posElbowX: posElbowX,
		posElbowY: posElbowY,
		posShoulderX: posShoulderX,
		posShoulderY: posShoulderY,
	};
	return this.pose;
};
