export var LegStates = {
	REST: 0,
	IDLE: 1,
	GRABBING_FOOD: 2,
	PLACING_FOOD: 3,
	SCRATCH: 4,
};

globalThis.IntroLegStates = LegStates;

export function MonsterIntroLeg() {
	var THREE = globalThis.THREE;
	var myRandom = globalThis.myRandom;

	this.angle = 0;
	this.random = myRandom();
	this.state = LegStates.REST;
	this.size = 0;
	this.sizeMax = globalThis.sSizeLegsMax;
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
	this.state = state;
	this.posHandInit = this.posHandCurrent;
	this.coeffMove = 0.;
};

MonsterIntroLeg.prototype.TryGrabFood = function (closeStuff) {
	if (!closeStuff || closeStuff.particle.isTarget || this.state !== LegStates.IDLE) {
		return false;
	}

	closeStuff.particle.isTarget = true;
	this.gotObject = closeStuff;
	this.SetState(LegStates.GRABBING_FOOD);
	return true;
};

MonsterIntroLeg.prototype.Update = function (delta, amp, monster) {
	var sTime1 = globalThis.sTime1;
	var sTime2 = globalThis.sTime2;
	var sRayCircle = globalThis.sRayCircle;
	var decay = this.random;
	var angle = this.angle;
	var gotObject = this.gotObject;
	var sizeTarget = this.state === LegStates.REST ? 0 : this.sizeMax;

	this.size += (sizeTarget - this.size) * delta * 0.5;
	if (this.size < 0.05) {
		this.pose = null;
		return null;
	}

	var size = Math.max(sRayCircle, this.size) * 0.69;
	var COS = Math.cos(angle);
	var SIN = Math.sin(angle);
	var posShoulderX = COS * sRayCircle;
	var posShoulderY = SIN * sRayCircle;
	var posElbowX = posShoulderX + size * (COS * 0.5 + amp * Math.cos(sTime2 * 0.01 + decay * 1.5) * SIN);
	var posElbowY = posShoulderY + size * (SIN * size * 0.5 + amp * Math.cos(sTime2 * 0.01 + decay * 1.5) * -COS);

	this.coeffMove += 0.1 * this.speed * delta;
	this.coeffMove = Math.min(1.000001, this.coeffMove);

	switch (this.state) {
		case LegStates.IDLE:
			this.posHandTarget.x = posShoulderX + size * (COS * size + 1.5 * amp * Math.sin(sTime1 + decay * 2.) * SIN);
			this.posHandTarget.y = posShoulderY + size * (SIN * size + 1.5 * amp * Math.sin(sTime1 + decay * 2.) * COS);
			break;
		case LegStates.SCRATCH:
			this.scratchCoeff += delta;
			this.scratchCoeff = Math.min(1, this.scratchCoeff);
			var rub = Math.sin(globalThis.sMonsterScratchTimer * 2.);
			this.posHandTarget.x = sRayCircle * Math.cos(0.4 + rub * 0.2) * this.scratchCoeff + (1 - this.scratchCoeff) * (posElbowX + sRayCircle * 0.5);
			this.posHandTarget.y = sRayCircle * Math.sin(0.4 + rub * 0.2) * this.scratchCoeff + (1 - this.scratchCoeff) * (posElbowY + sRayCircle * Math.sin(this.scratchCoeff * Math.PI));
			break;
		case LegStates.GRABBING_FOOD:
			this.posHandTarget.x = (gotObject.particle.position.x - monster.position.x) / monster.scale.x;
			this.posHandTarget.y = (gotObject.particle.position.y - monster.position.y) / monster.scale.y;
			break;
		case LegStates.PLACING_FOOD:
			this.posHandTarget.x =
				(gotObject.particle.TargetObject.positionTarget.x - monster.position.x) / monster.scale.x;
			this.posHandTarget.y =
				(gotObject.particle.TargetObject.positionTarget.y - monster.position.y) / monster.scale.x;
			break;
	}

	var posHandX = this.posHandInit.x + this.coeffMove * (this.posHandTarget.x - this.posHandInit.x);
	var posHandY = this.posHandInit.y + this.coeffMove * (this.posHandTarget.y - this.posHandInit.y);
	this.posHandCurrent.x = posHandX;
	this.posHandCurrent.y = posHandY;

	switch (this.state) {
		case LegStates.IDLE:
		case LegStates.SCRATCH:
			break;
		case LegStates.GRABBING_FOOD:
			if (this.coeffMove >= 0.2) {
				gotObject.particle.isMovable = false;
				this.SetState(LegStates.PLACING_FOOD);
			}
			break;
		case LegStates.PLACING_FOOD:
			gotObject.particle.position.x = monster.position.x + posHandX * monster.scale.x;
			gotObject.particle.position.y = monster.position.y + posHandY * monster.scale.y;
			if (this.coeffMove >= 0.2) {
				gotObject.particle.position.x = gotObject.particle.TargetObject.positionTarget.x;
				gotObject.particle.position.y = gotObject.particle.TargetObject.positionTarget.y;
				gotObject.particle.isEaten = true;
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
