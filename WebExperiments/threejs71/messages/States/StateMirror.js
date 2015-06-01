
var ATTRACTOR_IDLE_SIZE = 1.;
var LIMIT_LEFT = -200;
var sTimerBehaviourMirror = 0.;

function BehaviourMirror(aPart, aPosition) 
{
	this.part = aPart;
	this.elementTarget = -1;
	var lspeed = Math.random() * 1.5 + 0.5;
	this.angleSpeed = Math.random() * Math.PI;
	this.speed = new THREE.Vector3(lspeed, Math.sin(this.angleSpeed), 0.);
	this.disapear = false;
	this.mTimer = Math.random() * 5.;
	this.rotationSpeed = Math.random() * 1;
	this.showRotationAmplitude = 0;
	this.isSmall = false;//Math.random() > 0.4;

	this.Reset();
	this.part.mPosition.x =  (-0.5 + Math.random()) * 0.75;

}

BehaviourMirror.prototype.GlobalUpdate = function(aTimeInterval)
{
	sTimerBehaviourMirror += aTimeInterval;
}

BehaviourMirror.prototype.GlobalInit = function(aTimeInterval)
{

}

BehaviourMirror.prototype.GlobalMouseDown = function(aPosition)
{				 
}

BehaviourMirror.prototype.GlobalMouseUp = function(aPosition)
{
}

BehaviourMirror.prototype.GlobalMouseMove = function(aPosition)
{

}

BehaviourMirror.prototype.InitShow = function() 
{
	this.disapear = true;
	this.showRotationAmplitude = 1;
	return true;
}

BehaviourMirror.prototype.Init = function() 
{
	this.elementTarget = -1;
}

BehaviourMirror.prototype.FadeIn = function(aTimeInterval) 
{
	return true;
}

BehaviourMirror.prototype.UpdateShow = function(aTimeInterval) 
{
	this.part.mSizeSpeed += (set.cards.sizeShow - this.part.mSize) * aTimeInterval * 10;
	this.mTimer += aTimeInterval;
	this.part.mVelocity.multiplyScalar(0.98);
	if(this.disapear) {
		this.UpdateDisapear(aTimeInterval);
	}
	else {
		this.part.mAlpha += ( 1 - this.part.mAlpha ) * aTimeInterval;
		var lTimeLeft = sParticlesManager.GetTimeBeforeNextShow();
		if(lTimeLeft < 2) {
			this.part.mVelocity.x += -2 * (this.part.mPosition.x - 0.3) * aTimeInterval;
			this.part.mVelocity.x *= 0.98;
			this.part.mRotation.y = 0;
		}
		else {
			this.part.mVelocity.x += -5 * this.part.mPosition.x * aTimeInterval;
			this.part.mVelocity.x *= 0.98;
		}

		this.part.mRotation.y = Math.cos(this.mTimer) * 0.07 * this.showRotationAmplitude;

		if(lTimeLeft < 8) {
			this.showRotationAmplitude *= 0.995;
			this.showRotationAmplitude = Math.max(0.2, this.showRotationAmplitude);
		}
	}
}

BehaviourMirror.prototype.UpdateDisapear = function(aTimeInterval) {
	this.part.mAlpha -= aTimeInterval;
	if(this.part.mAlpha < 0) {
		this.Reset();
	}
}

BehaviourMirror.prototype.Reset = function() {
	if(sParticlesManager.GetParticleShow() === this.part) {
		this.part.mPosition.x = -0.15;
		this.part.mPosition.z = 0.11;//LIMIT_DEPTH;
		this.part.mPosition.y = 0;//LIMIT_DEPTH;
		this.disapear = false;
		this.part.mRotation = new THREE.Vector3();
	}
	else {
		this.part.mPosition.x = -0.25 + Math.random() * 0.05;
		this.part.mPosition.z = 0.105 - Math.random() * 0.15;//LIMIT_DEPTH;
		this.part.mPosition.y = 1 * (Math.random() - 0.5);//LIMIT_DEPTH;
		this.disapear = false;
	}
}

BehaviourMirror.prototype.Update = function(aTimeInterval) 
{
	this.part.mSizeSpeed += (1 - this.part.mSize) * aTimeInterval;
	this.mTimer += aTimeInterval * this.rotationSpeed;

	var lWindStrength = 0.;
	var lWindPos = 0.2;// * ((sTimerBehaviourMirror % 1) - 1);// + Math.sin(this.part.mPosition.x * 22 + 0.5 * sTimerBehaviourMirror)
	var lStrength = (lWindPos - this.part.mPosition.x);
	var labs = Math.abs(Math.max(lStrength, 0.01));

	var lWind = lWindStrength * lStrength / (labs);// + Math.max((1 - lWindStrength), -10);

	lWind *= 100.1;

	if(this.isSmall) {
		//lWind *= 10.;
		this.part.mSize = 0.1;
	}

	//this.speed.x = 20;

	var lStrength = lWind + this.speed.x * 10;
	var lVelocityTarget = new THREE.Vector3(0.03 * lStrength,0);
	this.part.mVelocity.add(lVelocityTarget.sub(this.part.mVelocity).multiplyScalar(aTimeInterval));
//	this.part.mVelocity.x *= 0.99;
	this.part.mVelocity = lVelocityTarget;
	this.part.mRotation.y = Math.cos(this.mTimer) * 0.07;
	this.part.mRotation.x = Math.cos(this.mTimer * 0.7) * 0.07;
	this.part.mRotation.x = Math.cos(this.mTimer * 1.3) * 0.07;

	this.part.mSizeSpeed += (set.cards.sizeNormal - this.part.mSize) * aTimeInterval * 10;


	if(this.part.mPosition.x > .8) {
		this.UpdateDisapear(aTimeInterval);
	}
	else {
		this.part.mAlpha += ( 1 - this.part.mAlpha ) * aTimeInterval;
	}
}

BehaviourMirror.prototype.FadeOut = function(aTimeInterval) 
{

}