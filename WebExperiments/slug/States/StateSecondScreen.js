

var AttractorSecond = new Attractor();
var SECOND_POS_MOUSE_X = 0.1;
var SECOND_POS_MOUSE_Y = 0.;
var ColorSecondLetter = {r:.2, g:0.1, b:0.55};
var SECOND_POSITION_SURFACE = new THREE.Vector3(0, 0 , -1.);
var SECOND_SIZE_SURFACE = 0.;
var SECOND_TIME = 0.;

function BehaviourSecond(aPart) 
{
	this.part = aPart;

	this.goRight = true;

	this.ATTRACTOR_IDLE_SIZE = 1.;
	this.isLetter = false;
	this.mumLetter = NUM_PART - 75;
	this.coeff = (this.part.mIndex - this.mumLetter) / (NUM_PART - this.mumLetter);

	if(this.part.mIndex < this.mumLetter)
	{
		this.isLetter = true;
	}
	
	this.mAttractorMatrix = new THREE.Vector3(0, 0, 0);
	if(this.isLetter)
	{
		this.ATTRACTOR_IDLE_SIZE2 = 1.;
		this.mAttractorMatrix2 = new THREE.Vector3(0, 0, 0);
		this.InitAsLogo();
	}
	else
	{
		this.InitAsBack();
	}

	if(this.mAttractorMatrix.x < 0.)
	{
		this.goRight = false;
	}

	this.mSpeed = (0.75 + Math.random() * 0.5) * 10.;
	this.mOutTimer = 3;
}

BehaviourSecond.prototype.InitAsBack = function(aTimeInterval)
{
	if(this.part.mIndex % 2 == 0)
	{
		this.goRight = false;
	}

	var x = this.goRight ? 0.5 : -0.5;
	this.mAttractorMatrix = new THREE.Vector3(x, 0, -1. + 0.5 * this.coeff);
	this.ATTRACTOR_IDLE_SIZE = ((1. - this.coeff) + .08) * 2.5;
}

BehaviourSecond.prototype.InitAsLogo = function()
{
	this.mIsReady = true;
	var i = this.part.mIndex;
	var l_positionList = m_informationOutVect[1];
	i = i % l_positionList.length;
	this.mAttractorMatrix = new THREE.Vector3(l_positionList[i].x, -l_positionList[i].y, 0.05);
	this.ATTRACTOR_IDLE_SIZE = l_positionList[i].size * 2.4 * (1. + 0.5 * Math.random()) / 1.5;
	this.part.mSize = this.ATTRACTOR_IDLE_SIZE;

	l_positionList = m_informationOutVect[2];
	i = i % l_positionList.length;
	this.mAttractorMatrix2 = new THREE.Vector3(l_positionList[i].x, -l_positionList[i].y, 0.05);
	this.ATTRACTOR_IDLE_SIZE2 = l_positionList[i].size * 2.4 * (1. + 0.5 * Math.random()) / 1.5;

}

BehaviourSecond.prototype.GlobalUpdate = function(aTimeInterval)
{
	SECOND_TIME += aTimeInterval;
}

BehaviourSecond.prototype.GlobalInit = function(aTimeInterval)
{
	window.location.hash = "/Menu/";
	sTimerEnd = set.TIME_BEFORE_OUT;
	var lNumPartX = Math.floor(Math.sqrt(NUM_PART * getRatio()));
}

BehaviourSecond.prototype.GlobalMouseDown = function(aPosition)
{			
	if(SECOND_POS_MOUSE_X < 0.)
	{
		window.location = "./LensFlare.html"
	}
	
}

BehaviourSecond.prototype.GlobalMouseUp = function(aPosition)
{
	Attractors[0].strengthCoeff = -1;
	touch = false;
	SwitchState(1);
}

BehaviourSecond.prototype.GlobalMouseMove = function(aPosition)
{
	SECOND_POS_MOUSE_X = aPosition.x;
	SECOND_POS_MOUSE_Y = aPosition.y;
}

BehaviourSecond.prototype.InitShow = function() 
{
	return true;
}

BehaviourSecond.prototype.Init = function() 
{
  	this.mDelay = 4.;//min(4.f, 1.f * mAttractorMatrix.y / getWindowHeight());
	mOutTimer = 3.;
	mTimerShow = 0.;
	sShowPartPosition = new THREE.Vector3(0.5, 0.5, -1.);
	this.part.mVelocity.z = 0.;
}

BehaviourSecond.prototype.FadeIn = function(aTimeInterval) 
{
	return true;
}

BehaviourSecond.prototype.UpdateShow = function(aTimeInterval) 
{	

}

BehaviourSecond.prototype.Update = function(aTimeInterval) 
{	
	if(this.isLetter)
	{
		this.UpdateLetter(aTimeInterval);
	}
	else
	{
		this.UpdateNotLetter(aTimeInterval);
	}



//	this.part.mRotationSpeed.y += 20. * (Math.max(1. - (absX + 0.3) * 1.5, -0.1) * Math.PI * 0.5 - this.part.mRotation.y) * aTimeInterval;
}

BehaviourSecond.prototype.UpdateLetter = function(aTimeInterval)
{
	var sizeText = 0.7;
	var lMatrixLetter = (SECOND_POS_MOUSE_X < 0.) ? this.mAttractorMatrix : this.mAttractorMatrix2;
	var sizeTarget = (SECOND_POS_MOUSE_X < 0.) ? this.ATTRACTOR_IDLE_SIZE : this.ATTRACTOR_IDLE_SIZE2;
	sizeTarget *= 1.;

	lMatrixLetter = lMatrixLetter.clone().multiplyScalar(sizeText);
	sizeTarget *= sizeText;

	var speed = this.goRight ? this.mSpeed : -this.mSpeed;
	this.part.mVelocity.x += 20 * (SECOND_POSITION_SURFACE.x + lMatrixLetter.x - this.part.mPosition.x) * aTimeInterval;	
	this.part.mVelocity.y += 20 * (SECOND_POSITION_SURFACE.y + lMatrixLetter.y - this.part.mPosition.y) * aTimeInterval;	
	this.part.mVelocity.z += 20 * (SECOND_POSITION_SURFACE.z + lMatrixLetter.z - this.part.mPosition.z) * aTimeInterval;	
	this.part.mVelocity.multiplyScalar(0.9);

	var Attractor = new THREE.Vector3(0,0,-0.01);
	var lDistance = lMatrixLetter.distanceTo(Attractor);
	var lStrength = -3.;
	this.part.mVelocity.addSelf(MinusMult(Attractor, lMatrixLetter, 1. * lStrength * SECOND_SIZE_SURFACE * aTimeInterval / (lDistance)));		
	
	this.part.mSizeSpeed += 10 * (sizeTarget  - this.part.mSize) * aTimeInterval;
	this.part.mSizeSpeed *= 0.9;

	this.part.mColorSpeed.r += 20. * (ColorSecondLetter.r -  this.part.mColor.r) * aTimeInterval;
	this.part.mColorSpeed.g += 20. * (ColorSecondLetter.g -  this.part.mColor.g) * aTimeInterval;
	this.part.mColorSpeed.b += 20. * (ColorSecondLetter.b -  this.part.mColor.b) * aTimeInterval;
}

BehaviourSecond.prototype.UpdateNotLetter = function(aTimeInterval)
{
	// if((SECOND_POS_MOUSE_X < 0.4) && (SECOND_POS_MOUSE_X > 0.))
	// {
	// 	SECOND_POS_MOUSE_X = 0.4;
	// }
	// else if((SECOND_POS_MOUSE_X > -0.4) && (SECOND_POS_MOUSE_X <= 0.))
	// {
	// 	SECOND_POS_MOUSE_X = -0.4;
	// }
	var decayX;
	if(SECOND_POS_MOUSE_X > 0.)
	{
		decayX = -0.25;
	}
	else
	{
		decayX = 0.25;
	}
	var speed = this.goRight ? this.mSpeed : -this.mSpeed;
	this.part.mVelocity.x += 4 * ((decayX + -.5 * this.coeff * SECOND_POS_MOUSE_X + this.mAttractorMatrix.x) - this.part.mPosition.x) * aTimeInterval;	
	this.part.mVelocity.y += 4 * ((0.2 * this.coeff * SECOND_POS_MOUSE_Y + this.mAttractorMatrix.y) - this.part.mPosition.y) * aTimeInterval;	
	this.part.mVelocity.z += 4 * (this.mAttractorMatrix.z - this.part.mPosition.z) * aTimeInterval;	
	this.part.mVelocity.multiplyScalar(0.95);
	
	var sizeTarget = this.ATTRACTOR_IDLE_SIZE;
	if(((SECOND_POS_MOUSE_X < 0.) && !this.goRight) || ((SECOND_POS_MOUSE_X > 0.) && this.goRight))
	{
		var sizeCoeffCycle = (1. + 0.1 * Math.cos(SECOND_TIME + this.coeff * Math.PI * 5.));
		if(this.part.mIndex > NUM_PART - 3)
		{
			SECOND_POSITION_SURFACE = this.part.mPosition;
			SECOND_SIZE_SURFACE = sizeCoeffCycle - 0.92;
		}

		sizeTarget *= (1. + this.coeff * this.coeff * this.coeff * 1.5) * sizeCoeffCycle;
	}
	else
	{
		sizeTarget *=  (1. + 0.1 * Math.sin(SECOND_TIME + this.coeff * Math.PI * 5.));
	}
	this.part.mSizeSpeed += 5 * (sizeTarget  - this.part.mSize) * aTimeInterval;
	this.part.mSizeSpeed *= 0.9;
}

BehaviourSecond.prototype.FadeOut = function(aTimeInterval) 
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

BehaviourSecond.prototype.GetResized = function()
{
	var ATTRACTOR_SPACE = 1.;
    return Vec3f(this.mAttractorMatrix.x * ATTRACTOR_SPACE, this.mAttractorMatrix.y * ATTRACTOR_SPACE, this.mAttractorMatrix.z);
}
