
var Attractors = new Array();
Attractors[0] = new Attractor();
var touch = false;
var m_pendulumHeadSpeed;
var m_pendulumHead;
var cameraPosWhenTouch = new THREE.Vector3(0,0, 0.7);
var sTitle;
// Attractors[1] = new Attractor();
// Attractors[2] = new Attractor();

var sTimerEnd = 0;
var sTimerSlugMove = 0;
var sPositionLight = new THREE.Vector3();
var sTimerLight = 0;
var sTransitionState;

function Attractor()
{
	this.position = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, -1.4);
	this.strengthCoeff = 0;
	this.timer = -1.;
	this.strength = 0.;
}

Attractor.prototype.Init = function(aTimeInterval)
{
	this.strength = set.STRENGTH_ATTRACTOR;
}

Attractor.prototype.Update = function(aTimeInterval)
{
	// if(touch)
	// {
	// 	this.strengthCoeff = 0.;
	// 	this.strength = 0.;
	// }
	// else
	// {
		this.strengthCoeff += -this.strengthCoeff * aTimeInterval;
	// }
}

function BehaviourIntro(aPart) 
{
	this.part = aPart;
	this.ATTRACTOR_IDLE_SIZE = 1.;
	this.isLetter = false;
	this.mumLetter = 0;
	if(this.part.mIndex < this.mumLetter)
	{
		this.isLetter = true;
	}
	
	var coeffOut = this.part.mIndex / NUM_PART;
	this.mOutTimer = 1. + 1. * coeffOut;
	if(this.isLetter)
	{
		this.mOutTimer += 2.5;
	}
	this.mAttractorMatrix = new THREE.Vector3(0, 0, 0);
	if(this.isLetter)
	{
		this.InitAsLogo();
	}
	else
	{
		this.InitAsBack();
	}
	//aPosition.clone().multiplyScalar(2.);
	// this.part.mPosition.y = this.mAttractorMatrix.y = (lYposition ) + lPosYStart;
	// this.part.mPosition.z = this.mAttractorMatrix.z = Math.random() * 0.01;
	this.part.mPosition = this.mAttractorMatrix.clone();
	this.mAttractorMatrixInit = this.mAttractorMatrix.clone();
	// this.part.mPosition.y -= 3.;
	this.part.mRotationSpeed.set(0., 0., 0.);
	this.mDelay = this.part.mPosition.length();
}

BehaviourIntro.prototype.InitAsBack = function(aTimeInterval)
{
	var area = 2.;
	
	var lActualNumPart = NUM_PART - this.mumLetter;
	var ratio = 3.;//getRatio();
	this.mNumPartX = Math.floor(Math.sqrt(lActualNumPart * ratio));
	this.mNumPartY = Math.floor(lActualNumPart / this.mNumPartX);
	var decay = area * 2. / this.mNumPartX;
	var lPosXStart = -area;//this.mNumPartX * 0.5;
	// this.part.SetColor(15 / 255, 57 / 255, 90 / 255);
	this.part.SetColor(.6 + Math.random() * 0.1, 0. + Math.random() * 0., 0.);
	
	this.ATTRACTOR_IDLE_SIZE = (1. + 0.05 * (Math.random() - 0.5)) * 0.35 * decay * window.innerWidth / TEXTURE_SIZE;
	var lPosYStart = FLOOR;

	var lYposition = Math.floor(this.part.mIndex / this.mNumPartX);
	this.mYposition = lYposition;
	
	var coeffY = lYposition / this.mNumPartY;

	var lXposition = this.part.mIndex - (lYposition * this.mNumPartX);
	this.mXposition = lXposition;

	if(lYposition >= this.mNumPartY)
	{
		lYposition = Math.floor(Math.random() *this.mNumPartY);
		this.part.SetColor(0. + Math.random() * 0., 0.9 + Math.random() * 0., 0.5);
		this.part.mVisible = false;
	}
	var squishRatio = (Math.cos(((lXposition / this.mNumPartX) - 0.5) * Math.PI * 0.9));

	var coeffHeight = Math.sin((this.mNumPartY - lYposition) * Math.PI * 0.5 / this.mNumPartY);
	lYposition = (squishRatio * coeffHeight * decay * this.mNumPartY) + lPosYStart;
	//lYposition = (lYposition * decay) + lPosYStart;
	lXposition = (lXposition * decay) + lPosXStart;
	this.mAngle = 0.;
	// this.part.mPosition.x = this.mAttractorMatrix.x = (lXposition ) + lPosXStart;
	//var distanceCenter = Math.sqrt((lXposition * lXposition) + (lYposition * lYposition));
	lXposition += (Math.random() - 0.5) * area * 0.02;
	lYposition += (Math.random() - 0.5) * area * 0.02;
	this.mAttractorMatrix = new THREE.Vector3(lXposition, lYposition, set.DISTANCE_SLUG + 0.0015 * this.part.mIndex);
}

BehaviourIntro.prototype.InitAsLogo = function()
{
	this.mIsReady = true;
	var i = this.part.mIndex;
	var l_positionList = m_informationOutVect[0];
	i = i % l_positionList.length;
	this.mAttractorMatrix = new THREE.Vector3(l_positionList[i].x, -l_positionList[i].y, Math.random() * .01 - 0.5);
	this.ATTRACTOR_IDLE_SIZE = l_positionList[i].size * 2.4;
	this.part.mSize = this.ATTRACTOR_IDLE_SIZE;
}

BehaviourIntro.prototype.GlobalUpdate = function(aTimeInterval)
{	
	var newPos = sPositionLight.clone();
	sTimerLight += aTimeInterval;
	newPos.z -=  1. + 1. * Math.cos(sTimerLight);
	lightManager.UpdateGoTo(newPos, Attractors[0].position);
	environment.Update(aTimeInterval);
	


	if(touch)
	{
		document.getElementById("info").innerHTML = "";
		sTitle.Update(aTimeInterval);
	// 	Attractors[0].strengthCoeff = 1.;
	// 	Attractors[0].position.x = sTimerSlugMove * 0.3 + Math.cos(sTimerSlugMove) * 2.;
	// 	Attractors[0].position.y = (1. + Math.sin(sTimerSlugMove)) * .25 + FLOOR;
	// 	this.part.mPosition = Attractors[0].position.clone();
		sTimerSlugMove += aTimeInterval * 1.2;

		if((sTimerSlugMove > 11.) && !sTransitionState)
		{
			sTransitionState = new TransitionVideo();
			sTitle.FadeOut();
			sTitle.Kill();
		}

		if(sTransitionState)
		{
			sTransitionState.Update(aTimeInterval);
		}

		var cameraPosition = cameraManager.GetPosition();
		cameraManager.UpdateGoTo(new THREE.Vector3(sTimerSlugMove, cameraPosWhenTouch.y, cameraPosWhenTouch.z), new THREE.Vector3(sTimerSlugMove,cameraPosWhenTouch.y,set.DISTANCE_SLUG));
	 }
	 else
	 {
 		if(sTimerLight > 4.)
		{
			document.getElementById("info").innerHTML = "click to wake it up";
		}
	 }

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
	this.UpdateSnake(aTimeInterval);
}

BehaviourIntro.prototype.GlobalInit = function(aTimeInterval)
{
	Attractors[0].Init();
	this.InitSnake();
	sTimerEnd = set.TIME_BEFORE_OUT;
	var lNumPartX = Math.floor(Math.sqrt(NUM_PART * getRatio()));
	var posLight = cameraManager.GetPosition().clone();
	 posLight.x += -0.6;
	 posLight.z -= .3;
	lightManager.GoTo(posLight, new THREE.Vector3(0,0,0), 4.);
	var titleArray = [];
	titleArray.push("why?");
	// titleArray.push("bilabial trill");
	// titleArray.push("alveolar clicks");
	// titleArray.push("pharyngeal fricative");
	// titleArray.push("labialized palatal");
	// titleArray.push("palato-alveolar affricate");
	sTitle = new Button(GetTextInBox(titleArray[Math.floor(Math.random() * titleArray.length)], 960, 540, 300, 45), new THREE.Vector3(-.2,-0.17,-0.4), 0.15, 0.4);
	//ATTRACTOR_IDLE_SIZE = 2. - lNumPartX;
}

BehaviourIntro.prototype.GlobalMouseDown = function(aPosition)
{				
	if(!touch)
	{
		document.getElementById("info").innerHTML = "";
		sTitle.FadeIn();
		cameraManager.GoTo(cameraPosWhenTouch, new THREE.Vector3(0,cameraPosWhenTouch.y,cameraPosWhenTouch.z), 5.); 
		touch = true;
	}
	else
	{
		// for(var i = 0; i < sButtons.length; i++)
		// {
			// if(sButtons[i].position.distanceTo(aPosition) < 0.4)
			// {
				// sButtons[0].GoAway();

				sTransitionState.MouseDown(aPosition);
			// }
		// }
	}
}

// BehaviourIntro.prototype.SwitchNextState = function()
// {
// 	if(!sIsNextPage)
// 	{
// 		FadeTo(0, 1.);
// 		setTimeout(function() {document.location.href += "videos.html";}, 1250);
// 		sIsNextPage = true;
// 	}
// }

BehaviourIntro.prototype.GlobalMouseUp = function(aPosition)
{
	Attractors[0].strengthCoeff = -0.2;
	//SwitchState(Particle.StateEnum.STATE_SECOND);
}

BehaviourIntro.prototype.GlobalMouseMove = function(aPosition)
{
	if(!touch)
	{
		Attractors[0].position =  aPosition.clone();
		Attractors[0].position.x += sTimerSlugMove;
		Attractors[0].position.z =  this.part.mPosition.z - set.DISTANCE_ATTRACTOR
		Attractors[0].strengthCoeff += .015;
		Attractors[0].strengthCoeff = Math.min(1., Attractors[0].strengthCoeff);
	 }
	var posLight = aPosition.clone();
	posLight.x = 2. * posLight.x - 2.;
	 posLight.z = 0.9 + 0.5 * aPosition.clone().x;
	 sPositionLight = posLight;
	 if(sTransitionState)
	 {
	 	sTransitionState.MouseMove(aPosition);
	 }
	 // posLight.x += sTimerSlugMove;
}

BehaviourIntro.prototype.InitShow = function() 
{
	return true;
}

BehaviourIntro.prototype.Init = function() 
{
  	this.mDelay = this.part.mPosition.length();
	mOutTimer = 3.;
	mTimerShow = 0.;
	sShowPartPosition = new THREE.Vector3(0.5, 0.5, -1.);
	if(this.isLetter)
	{
		this.part.SetColor(.2, 0.1, 0.55);
	}
	else
	{
//		this.part.SetColor(1., 0.8, 0.15);
	}
}

BehaviourIntro.prototype.FadeIn = function(aTimeInterval) 
{
// 	this.mDelay -= aTimeInterval;
// 	this.part.mRotationSpeed = this.part.mRotation.clone().negate().multiplyScalar(1.);
// //	part->mVelocity.z += (-1500 - part->mPosition.z) * aTimeInterval;
// 	var lAttractorMatrix = this.GetResized();
// 	var lDistance = lAttractorMatrix.distanceTo(this.part.mPosition);
// 	lDistance = Math.max(lDistance, 0.02);
// 	this.part.mVelocity.addSelf(MinusMult(lAttractorMatrix, this.part.mPosition, 15.5 * aTimeInterval / lDistance));
// 	this.part.mVelocity.multiplyScalar(0.95);
// 	this.part.mVelocity.z = 0.;
// 	this.part.mSizeSpeed = 1. * (0.5 * this.ATTRACTOR_IDLE_SIZE - this.part.mSize) * aTimeInterval;
	
// 	if(this.mDelay <= 0.0)
// 	{
// 		this.part.mPosition = lAttractorMatrix.clone();
// 		this.part.mRotation.set(0., 0., 0.);
// 		this.part.mRotationSpeed.set(0., 0., 0.);
// 		return true;
// 	}
// 	return false;
return true;
}

BehaviourIntro.prototype.UpdateShow = function(aTimeInterval) 
{	

}

BehaviourIntro.prototype.Update = function(aTimeInterval) 
{	
	if(touch)
	{
		var amp = 0.2;
		var yCoeff = 1. - (this.mYposition / this.mNumPartY);
		this.mAttractorMatrix.x = this.mAttractorMatrixInit.x + amp * Math.sin((this.mXposition / this.mNumPartX) * Math.PI * 2. + sTimerSlugMove * 7.) + sTimerSlugMove + yCoeff * 0.5;
	}
	this.UpdateObject(this.part, aTimeInterval);
}

BehaviourIntro.prototype.UpdateObject = function(object, delta) 
{
    var lDistance;
	var lStrength = Attractors[0].strength * 3.;
	var lStrengthSpring = set.STRENGTH_SPRING;
	var lAttractorMatrix = this.GetResized();
	var attractorPosition = Attractors[0].position;

    lDistance = Math.max(attractorPosition.distanceTo(object.mPosition), 0.4) / 2.;

 	object.mVelocity.addSelf(new THREE.Vector3().sub(lAttractorMatrix, object.mPosition).multiplyScalar( lStrengthSpring * delta));
 	var strengthSize = 50;
 	if(this.isLetter)
	{
		strengthSize *= 0.3;
		object.mSizeSpeed += strengthSize * (this.ATTRACTOR_IDLE_SIZE * Math.min(lDistance * 10., 1.) - object.mSize) * delta;
	}
	else
	{
		object.mSizeSpeed += strengthSize * (this.ATTRACTOR_IDLE_SIZE * Math.min(lDistance * 10., 1.) - object.mSize) * delta;
	}
 	
 	object.mSizeSpeed *= 0.95;

	if(this.isLetter)
	{
		lStrength *= 0.2;
	}
	 // compute strength from attractor.

	var strengthX = lStrength;
	var strengthY = 1.; 

	if(touch)
	{
		// if(attractorPosition.x < object.mPosition.x)
		// {
		// 	strengthX = 0.;
		// }
		strengthY = 0.1;
		// this.mAttractorMatrix.x += (object.mPosition.x - this.mAttractorMatrix.x) * delta * 0.9;

	}
    object.mVelocity.x += (attractorPosition.x - object.mPosition.x) * strengthX * Attractors[0].strengthCoeff * delta / (lDistance * lDistance);		

	object.mVelocity.y += (attractorPosition.y - object.mPosition.y) * strengthY * lStrength * Attractors[0].strengthCoeff * delta / (lDistance * lDistance);		
	object.mVelocity.z = 0.;

	var rotTarget = new THREE.Vector3(-(1 / yRel ) * rotSpeed, (1 / xRel ) * rotSpeed, 0/*(Math.random() - 0.5) * rotSpeed*/);

	var ampRot = 1.;
	var xRel = THREE.Math.clamp(ampRot * (lAttractorMatrix.x - object.mPosition.x), -1., 1);
	var yRel = THREE.Math.clamp(ampRot * (lAttractorMatrix.y - object.mPosition.y), -1, 1);
	var zRel = THREE.Math.clamp(ampRot * (lAttractorMatrix.z - object.mPosition.z), -1, 1);
	var rotSpeed = Math.PI / 2;
	object.mRotationSpeed = new THREE.Vector3(0, 0, 0);
	object.mRotation.x = this.mAngle * Math.PI * 0.5;
}

BehaviourIntro.prototype.FadeOut = function(aTimeInterval) 
{
	// if(this.isLetter)
	// {
	// 	this.part.mVelocity = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5);
	// 	return true;
	// }
	// else
	// {
	// 	this.part.mSizeSpeed += (this.ATTRACTOR_IDLE_SIZE * 0.1 - this.part.mSize) * aTimeInterval

	// 	if(this.part.mSize < this.ATTRACTOR_IDLE_SIZE * 0.15)
	// 		return true;
	// 	else
	// 		return false;
	// }
	// this.mOutTimer -= aTimeInterval;
	// aTimeInterval *= 10.;
	// this.part.mSizeSpeed += (0.02 + 0.1 * this.part.mPosition.lengthSq() - this.part.mSize) * aTimeInterval;;
	// this.part.mVelocity.x += -this.part.mPosition.x * aTimeInterval;
	// this.part.mVelocity.y += -this.part.mPosition.y * aTimeInterval;
	// this.part.mVelocity.z += (-0.5 - this.part.mSize - this.part.mPosition.z) * aTimeInterval;
	// this.part.mVelocity.multiplyScalar(0.9);
	
	// if(this.mOutTimer < 0.)
		return true;
	// else
	// 	return false;
}

BehaviourIntro.prototype.GetResized = function()
{
	var ATTRACTOR_SPACE = 1.;
    return Vec3f(this.mAttractorMatrix.x * ATTRACTOR_SPACE, this.mAttractorMatrix.y * ATTRACTOR_SPACE, this.mAttractorMatrix.z);
}

// init pendulum.
BehaviourIntro.prototype.InitSnake = function()
{
	// init the snake.
	// m_pendulumHeadSpeed = CGPointMake(.0, 0.);
	// var l_basePosition = CGPointMake(.2, 2.);
	// var l_length = 0.04;
	// var l_friction = 0.01;
	// var l_gravity = 0.2;
	// var l_size = 0.13;
	// var l_distance = -0.72	;
	// var l_mass = 0.2;
	// var partCount = 20;
	// var l_pendulumPosition = CGPointMake(l_basePosition.x, l_basePosition.y + l_length * 3.);
	// //m_changeSnakeGravityTimer = 0.;

	// m_pendulumHead = new Pendulum(l_pendulumPosition, l_basePosition, l_distance, 100.1, l_gravity, l_friction * 0.1, 0., l_size, TEXTURE_SNAKE_BODY);
	// var l_currentPendulum = m_pendulumHead; 
	// var l_childPendulum = null;
	
	// var l_count = 0;
	// var texture;// = GetCircleColor(1, 1, 1, 0, 0, 0);

	// texture = TEXTURE_SNAKE_HEAD;
	// l_childPendulum = new Pendulum(l_pendulumPosition, l_basePosition, l_distance, l_mass, l_gravity * 0.5, l_friction, 1.5, l_size * 2., texture, true);
	// l_currentPendulum.AddChild(l_childPendulum);
	// l_currentPendulum = l_childPendulum;
	// l_basePosition = l_pendulumPosition.clone();
	// l_pendulumPosition.y += 1. * l_length;

	// texture = TEXTURE_SNAKE_BODY;
	// // Creation of the elmeents of the snake.
	// for(var i = 1; i < partCount; i++)
	// {
	// 	var sizeCoeff = 1. - 0.5 * (i / 15);
	// 	l_childPendulum = new Pendulum(l_pendulumPosition, l_basePosition, l_distance, l_mass, l_gravity * 0.5, l_friction, 0.9, l_size * sizeCoeff, texture, false);
	// 	l_currentPendulum.AddChild(l_childPendulum);
	// 	l_currentPendulum = l_childPendulum;
	// 	l_basePosition = l_pendulumPosition.clone();
	// 	l_pendulumPosition.y += l_length;
	// }
}

// updtate the positions of the snake parts and draw them.
BehaviourIntro.prototype.UpdateSnake = function(a_timeInterval)
{
	// smooth the base speed.
	// var l_speedMax = 1.8;
	// var l_animationInterval = a_timeInterval;
	// var l_fingerPositionScaled = CGPointMake(Attractors[0].position.x * 1., Attractors[0].position.y * 1.);
	// var nextPendulumPos = m_pendulumHead.m_basePosition.clone();
	// if(touch)
	// {
	// 	var strength = 11;
	// 	m_pendulumHeadSpeed.x += strength * (l_fingerPositionScaled.x - m_pendulumHead.m_pendulumPosition.x) * a_timeInterval;
	// 	m_pendulumHeadSpeed.y += strength * (l_fingerPositionScaled.y - m_pendulumHead.m_pendulumPosition.y) * a_timeInterval;
	// 	m_pendulumHeadSpeed.multiplyScalar(0.95);
	// 	nextPendulumPos.x += m_pendulumHeadSpeed.x * a_timeInterval;
	// 	nextPendulumPos.y += m_pendulumHeadSpeed.y * a_timeInterval;
	// }
	
	// m_pendulumHead.Update(a_timeInterval, nextPendulumPos);

	// return;
}
