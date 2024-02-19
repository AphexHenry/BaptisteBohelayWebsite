
var sAttractorPos = new THREE.Vector3();


function BehaviourVideo(aPart) 
{
	this.part = aPart;
	this.part.SetColor(.5 + Math.random() * 0.1, 0., 0.);
	this.part.mSize = 0.01;
}


BehaviourVideo.prototype.GlobalUpdate = function(aTimeInterval)
{	
	sAttractorPos = cameraManager.GetPosition();
}

BehaviourVideo.prototype.GlobalInit = function(aTimeInterval)
{
}

BehaviourVideo.prototype.GlobalMouseDown = function(aPosition)
{				

}

BehaviourVideo.prototype.GlobalMouseUp = function(aPosition)
{
	//SwitchState(Particle.StateEnum.STATE_SECOND);
}

BehaviourVideo.prototype.GlobalMouseMove = function(aPosition)
{

}

BehaviourVideo.prototype.InitShow = function() 
{
	return true;
}

BehaviourVideo.prototype.Init = function() 
{

}

BehaviourVideo.prototype.FadeIn = function(aTimeInterval) 
{
	return true;
}

BehaviourVideo.prototype.UpdateShow = function(aTimeInterval) 
{	

}

BehaviourVideo.prototype.Update = function(aTimeInterval) 
{	
	sAttractorPos = cameraManager.GetPosition();
	this.UpdateObject(this.part, aTimeInterval);
}

BehaviourVideo.prototype.UpdateObject = function(object, delta) 
{
    var lDistance;
	var lStrength = .6;
	var attractorPosition;
	var securityDistance;

	if(this.part.mIndex == 0)
	{
	 	attractorPosition = sAttractorPos;
	 	securityDistance = 0.1;
	}
	else
	{
		lStrength = 13;
		securityDistance = 0.01;
		attractorPosition = slugPart[this.part.mIndex - 1].mPosition;
	}

    lDistance = Math.max(attractorPosition.distanceTo(object.mPosition), 0.4) / 2.;

 	var strengthSize = 50;

	if(lDistance < securityDistance)
		lStrength *= -1;

	var lheight = -1;
    object.mVelocity.x += (attractorPosition.x - object.mPosition.x + myRandom() * 0.5) * lStrength * delta;		
	object.mVelocity.y += (lheight - object.mPosition.y) * lStrength * delta;		
	object.mVelocity.z += (attractorPosition.z - object.mPosition.z + myRandom() * 0.5) * lStrength * delta;
	// var cameraPosition = cameraManager.GetPosition();
	// var distanceCam = cameraPosition.distanceTo(object.mPosition);
	// object.mVelocity.x += -(cameraPosition.x - object.mPosition.x) * lStrength * delta / (lDistance * lDistance);		
}

BehaviourVideo.prototype.FadeOut = function(aTimeInterval) 
{
	return true;
}

// init pendulum.
BehaviourVideo.prototype.InitSnake = function()
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
BehaviourVideo.prototype.UpdateSnake = function(a_timeInterval)
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
