
var Attractors = new Array();
Attractors[0] = new Attractor();

var touch = false;
// Attractors[1] = new Attractor();
// Attractors[2] = new Attractor();

var sTimerEnd = 0;
var ATTRACTOR_IDLE_SIZE = 1.;

function Attractor()
{
	this.position = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() * 0.2 - 1.);
	this.strengthCoeff = 0;
	this.timer = -1.;
}

Attractor.prototype.Update = function(aTimeInterval)
{
	if(touch)
	{
		this.strengthCoeff += aTimeInterval;
		this.strengthCoeff = Math.min(this.strengthCoeff, 1.);
	}
	else
	{
		this.strengthCoeff += -this.strengthCoeff * aTimeInterval;
	}

	this.strength = set.STRENGTH_ATTRACTOR;

 //    this.timer -= aTimeInterval;
	// this.strengthCoeff += aTimeInterval * 1.;
	// this.strengthCoeff = Math.min(this.strengthCoeff, 1.);
 //    if( this.timer <= 0.)
 //    {
	// 	this.position = new THREE.Vector3(1.5 * (Math.random() - 0.5), 1.5 * (Math.random() - 0.5), Math.random() * 0.4 - 0.8);
	// 	this.strength = ( Math.random() * set.STRENGTH_ATTRACTOR ) + set.STRENGTH_ATTRACTOR * 0.4;
	// 	if(Math.random() < 0.5)
	// 	{
	// 		this.strength *= -1;
	// 	}
	// //	 this.strength = 0.;
	// 	this.strengthCoeff = 0.2;
	// 	this.timer = 1.5 + Math.random() * 2.;
 //    }
}

function BehaviourIntro(aPart) 
{
	this.part = aPart;
	
	var area = 2.;
	this.mAttractorMatrix = new THREE.Vector3(0, 0, 0);
	var lNumPartX = Math.floor(Math.sqrt(NUM_PART * getRatio()));
	var lNumPartY = Math.floor(NUM_PART / lNumPartX);
	var decay = area * 2. / lNumPartX;
	var lPosXStart = -area;//lNumPartX * 0.5;
	var lPosYStart = lPosXStart /  getRatio();//-lNumPartY * 0.5;
	
	ATTRACTOR_IDLE_SIZE = 0.25 * decay * window.innerWidth / TEXTURE_SIZE;

	var lYposition = Math.floor(aPart.mIndex / lNumPartX);
	var lXposition = aPart.mIndex - (lYposition * lNumPartX);
	lYposition = (lYposition * decay) + lPosYStart;
	lXposition = (lXposition * decay) + lPosXStart;

	// this.part.mPosition.x = this.mAttractorMatrix.x = (lXposition ) + lPosXStart;
	this.mAttractorMatrix = new THREE.Vector3(lXposition, lYposition, -1.);//aPosition.clone().multiplyScalar(2.);
	// this.part.mPosition.y = this.mAttractorMatrix.y = (lYposition ) + lPosYStart;
	// this.part.mPosition.z = this.mAttractorMatrix.z = Math.random() * 0.01;
	this.part.mPosition = this.mAttractorMatrix.clone();
	this.mDelay = 4;
	this.mOutTimer = 3;

	lNumPartX = null;
	lNumPartY = null;
	lPosXStart = null;
	lPosYStart = null;
	lYposition = null;
	lXposition = null;
}

BehaviourIntro.prototype.GlobalUpdate = function(aTimeInterval)
{
	if(this.part.mStateUpdate == Particle.StateUpdate.UPDATE_FADE_OUT)
	{
		sTimerEnd -= aTimeInterval;
	}

	for(var i = 0; i < Attractors.length; i++)
	{
		Attractors[i].Update(aTimeInterval);
	}

	effectController.aperture *= 0.95;
	effectController.aperture = Math.max(effectController.aperture, 0.);
}

BehaviourIntro.prototype.GlobalInit = function(aTimeInterval)
{
	sTimerEnd = set.TIME_BEFORE_OUT;
	var lNumPartX = Math.floor(Math.sqrt(NUM_PART * getRatio()));
	ATTRACTOR_IDLE_SIZE = 2. - lNumPartX;
}

BehaviourIntro.prototype.GlobalMouseDown = function(aPosition)
{				 
	touch = true;
}

BehaviourIntro.prototype.GlobalMouseUp = function(aPosition)
{
	Attractors[0].strengthCoeff = -1;
	touch = false;
	SwitchState(1);
}

BehaviourIntro.prototype.GlobalMouseMove = function(aPosition)
{
	Attractors[0].position =  aPosition.clone();
	Attractors[0].position.z =  this.part.mPosition.z - set.DISTANCE_ATTRACTOR
	Attractors[0].strengthCoeff += .015;
	Attractors[0].strengthCoeff = Math.min(1., Attractors[0].strengthCoeff);
}

BehaviourIntro.prototype.InitShow = function() 
{
	return true;
}

BehaviourIntro.prototype.Init = function() 
{
  	this.mDelay = 4.;//min(4.f, 1.f * mAttractorMatrix.y / getWindowHeight());
	mOutTimer = 3.;
	mTimerShow = 0.;
	sShowPartPosition = new THREE.Vector3(0.5, 0.5, -1.);
}

BehaviourIntro.prototype.FadeIn = function(aTimeInterval) 
{
	this.mDelay -= aTimeInterval;
	this.part.mRotationSpeed = this.part.mRotation.clone().negate().multiplyScalar(1.);
//	part->mVelocity.z += (-1500 - part->mPosition.z) * aTimeInterval;
	var lAttractorMatrix = this.GetResized();
	var lDistance = lAttractorMatrix.distanceTo(this.part.mPosition);
	lDistance = Math.max(lDistance, 0.02);
	this.part.mVelocity.addSelf(MinusMult(lAttractorMatrix, this.part.mPosition, 15.5 * aTimeInterval / lDistance));
	this.part.mVelocity.multiplyScalar(0.95);
	this.part.mSizeSpeed = 1. * (0.5 * ATTRACTOR_IDLE_SIZE - this.part.mSize) * aTimeInterval;
	
	if(this.part.mRotation.lengthSq() <= 0.04)
	{
		this.part.mRotation.set(0., 0., 0.);
		this.part.mRotationSpeed.set(0., 0., 0.);
		return true;
	}
	return false;
}

BehaviourIntro.prototype.UpdateShow = function(aTimeInterval) 
{	

}

BehaviourIntro.prototype.Update = function(aTimeInterval) 
{	
	this.UpdateObject(this.part, aTimeInterval);
 //    var lDistance;
	// var lStrength;
	// for(var i = 0; i < Attractors.length; i++)
 //    {
 //        lDistance = Math.max(Attractors[i].position.distanceTo(this.part.mPosition), 0.15);
	// 	lStrength = Attractors[i].strength * Attractors[i].strengthCoeff;
 //        this.part.mVelocity.addSelf(MinusMult(Attractors[i].position, this.part.mPosition, 1. * lStrength * aTimeInterval / (lDistance * lDistance)));
 //    }
	
	// // lDistance = Math.max(sShowPartPosition.distanceTo(this.part.mPosition), 0.1);
	// // if(lDistance < 0.5)
	// // {
	// // 	this.part.mVelocity.addSelf(MinusMult(sShowPartPosition, this.part.mPosition, -set.STRENGTH_SHOW * aTimeInterval / (lDistance * lDistance)));
	// // }
	
	// var lAttractorMatrix = this.GetResized();
	// this.part.mVelocity.addSelf(new THREE.Vector3().sub(lAttractorMatrix, this.part.mPosition).multiplyScalar( set.STRENGTH_SPRING * aTimeInterval));
	// this.part.mVelocity.multiplyScalar(0.97);
	// this.part.mSizeSpeed = 0.;//1.f * (set.ATTRACTOR_IDLE_SIZE - part->mSize) * aTimeInterval;
	// var lSizeCoeff = 1. + ((this.part.mPosition.z - lAttractorMatrix.z) / 0.2);
	// lSizeCoeff = myClamp(lSizeCoeff, 0.1, 2.);
	// //this.part.mSizeSpeed = 30. * (lSizeCoeff * ATTRACTOR_IDLE_SIZE - this.part.mSize) * aTimeInterval;
	// this.part.mSize = ATTRACTOR_IDLE_SIZE;
}

BehaviourIntro.prototype.UpdateObject = function(object, delta) 
{
    var lDistance;
	var lStrength = Attractors[0].strength;
	var lStrengthSpring = set.STRENGTH_SPRING;
	var lAttractorMatrix = this.GetResized();
	var attractorPosition = Attractors[0].position;

    lDistance = Math.max(attractorPosition.distanceTo(object.mPosition), 0.4) / 2.;

 	object.mVelocity.addSelf(new THREE.Vector3().sub(lAttractorMatrix, object.mPosition).multiplyScalar( lStrengthSpring * delta));
 	object.mSizeSpeed += 50 * (ATTRACTOR_IDLE_SIZE * Math.min(lDistance * 3., 1.) - object.mSize) * delta;
 	object.mSizeSpeed *= 0.95;

	 // compute strength from attractor.
    object.mVelocity.addSelf(MinusMult(attractorPosition, object.mPosition, 1. * lStrength * Attractors[0].strengthCoeff * delta / (lDistance * lDistance)));		

	var rotTarget = new THREE.Vector3(-(1 / yRel ) * rotSpeed, (1 / xRel ) * rotSpeed, 0/*(Math.random() - 0.5) * rotSpeed*/);

	var ampRot = 1.;
	var xRel = THREE.Math.clamp(ampRot * (lAttractorMatrix.x - object.mPosition.x), -1., 1);
	var yRel = THREE.Math.clamp(ampRot * (lAttractorMatrix.y - object.mPosition.y), -1, 1);
	var zRel = THREE.Math.clamp(ampRot * (lAttractorMatrix.z - object.mPosition.z), -1, 1);
	var rotSpeed = Math.PI / 2;
	object.mRotationSpeed = new THREE.Vector3(0, 0, 0);
	object.mRotation.x = -yRel  * rotSpeed / 5;
	object.mRotation.y = -xRel * rotSpeed + zRel * rotSpeed;
	object.mRotation.z = 0;
	
	// object.scaleSpeed *= 0.95;
}

BehaviourIntro.prototype.FadeOut = function(aTimeInterval) 
{
	var lStrengthAtt = (1. - (sTimerEnd / set.TIME_BEFORE_OUT)) * set.STRENGTH_ATTRACTOR * 3.;
    lDistance = Math.max(this.part.mPosition.length(), 0.15);
    this.part.mVelocity.addSelf(MinusMult(Vec3f(0., 0., -1.), this.part.mPosition, 1. * lStrengthAtt * aTimeInterval / (lDistance * lDistance)));
    var lAttractorMatrix = this.GetResized();

    if(sTimerEnd < 0.)
    {
		var lStrength = 4. * (0.75 + (Math.random() * 0.75));
		var lXrelative = (lAttractorMatrix.x - 0.5);
		var lYrelative = (lAttractorMatrix.y - 0.5) / (0.5);
		this.part.mVelocity.x	= lXrelative * lStrength;
		this.part.mVelocity.y	= lYrelative * lStrength;
		this.part.mVelocity.z	= -2. * Math.cos(Math.PI * lXrelative) * Math.sin(Math.PI * lYrelative) * lStrength;
		this.part.mSizeSpeed	= (ATTRACTOR_IDLE_SIZE * 0.5 - this.part.mSize) * aTimeInterval;

		this.part.mRotationSpeed.addSelf( new THREE.Vector3().sub( new THREE.Vector3(0., lXrelative * 90, 0.), this.part.mRotation).multiplyScalar(aTimeInterval));

		return true;
	}

	 return false;
}

BehaviourIntro.prototype.GetResized = function()
{
	var ATTRACTOR_SPACE = 1.;
    return Vec3f(this.mAttractorMatrix.x * ATTRACTOR_SPACE, this.mAttractorMatrix.y * ATTRACTOR_SPACE, this.mAttractorMatrix.z);
}
