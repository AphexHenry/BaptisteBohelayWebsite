
var s_pendulumArray = new Array();
var PENDULUM_TEXTURE_SIZE = 300;

function Pendulum(a_pendulePosition, a_basePosition, a_z, a_mass, a_gravity, a_friction, a_gravityAngle, a_size, aCanvas, a_isHead)
{
	this.m_isHead = a_isHead;
	this.m_z = a_z;
	this.m_pendulumPosition = a_pendulePosition.clone();			// view of the attractor (vortex)
	this.m_basePosition = a_basePosition.clone();
	this.m_baseSpeed = new THREE.Vector2(0., 0.);
	this.m_angleSpeed = 0.;
	this.m_angle = Math.atan((a_pendulePosition.x - this.m_basePosition.x) / (a_pendulePosition.y - this.m_basePosition.y));
	this.m_angle = (a_pendulePosition.y - this.m_basePosition.y) > 0. ? this.m_angle + Math.PI : this.m_angle;
	this.m_penduleSpeed = CGPointMake(0., 0.);
	this.m_lengthSquare = a_pendulePosition.distanceToSquared(this.m_basePosition);
	this.m_length = Math.sqrt(this.m_lengthSquare);
	this.m_childList = new Array();
	this.m_mass = a_mass;
	this.m_gravity = a_gravity;
	this.m_frictionCoefficient = a_friction;
	this.m_gravityAngle = a_gravityAngle;

	// set texture
	if(aCanvas != null)
	{
		var lTexture = new THREE.Texture( aCanvas, THREE.UVMapping );
		lTexture.needsUpdate = true;
		var parameters = { map:lTexture, transparent:true };
		var materialPend = new THREE.MeshBasicMaterial( parameters );
		materialPend.color.setRGB(1., 1., 1.);
		materialPend.depthTest = false;
		var geometryPend = new THREE.PlaneGeometry( PENDULUM_TEXTURE_SIZE, PENDULUM_TEXTURE_SIZE );
		this.mesh = new THREE.Mesh( geometryPend, materialPend );
		this.mesh.doubleSided = true;
		this.mesh.up = new THREE.Vector3(0,0,1);
		this.mSize = a_size;
		scene.add(this.mesh);
	}
	else
	{
		this.mesh = null;
	}

	this.m_index = s_pendulumArray.length;
	s_pendulumArray.push(this);
	
	this.m_angleSpeedLimit = 1.;
}

Pendulum.prototype.Update = function(aTimeInterval, a_basePosition)
{
    // Process the movement of the base.
	var l_baseMovement = CGPointMake(0,0);
	l_baseMovement.x = (a_basePosition.x - this.m_basePosition.x);
	l_baseMovement.y = (a_basePosition.y - this.m_basePosition.y);

	var l_angleSpeedChildInfluence = 0.;
	var l_brakeCoefficient = 1.0;
	var l_childCount = this.m_childList.length;
	
    // Process the influence of the child on the mass.
	for(var i = 0; i < l_childCount; i++)
	{
		var l_currentChild = this.m_childList[i];
		var l_childInteractionParameter = l_currentChild.GetInteractionParameters();
		var l_angleInfluence = Math.sin(this.m_angle - l_childInteractionParameter.m_angle);
		l_angleSpeedChildInfluence = l_angleInfluence * (l_childInteractionParameter.m_centrifugal * l_childInteractionParameter.m_mass / (this.m_mass * -400.));
		l_brakeCoefficient = 1. - Math.pow(( l_childInteractionParameter.m_mass * Math.abs(l_angleInfluence) / (l_childInteractionParameter.m_mass + this.m_mass)), 2.);
	}

    // Update the speed and the position of the pendulum.
	var l_baseAngleSpeed = -Math.atan((l_baseMovement.x * Math.cos(this.m_angle) + l_baseMovement.y * Math.sin(this.m_angle)) / this.m_length);
	l_baseAngleSpeed += l_angleSpeedChildInfluence;
	this.m_angleSpeed += ((-this.m_gravity * Math.sin(this.m_angle + this.m_gravityAngle)) + l_baseAngleSpeed ) / this.m_length;
	this.m_angleSpeed = this.m_angleSpeed / (1. + (this.m_frictionCoefficient * aTimeInterval));
	this.m_angleSpeed *= l_brakeCoefficient;
	if(this.m_angleSpeedLimit > 0.)
	{
		if(Math.abs(this.m_angleSpeed) >  this.m_angleSpeedLimit)
			this.m_angleSpeed *= 0.9;
	}
	
	this.m_angle += (this.m_angleSpeed * aTimeInterval) + l_baseAngleSpeed;
	
	this.m_baseSpeed = l_baseMovement;
	this.m_basePosition = a_basePosition.clone();

	var l_newPosX = this.m_basePosition.x + Math.sin(this.m_angle) * this.m_length;
	var l_newPosY = this.m_basePosition.y - Math.cos(this.m_angle) * this.m_length;
	
	this.m_penduleSpeed.x = (l_newPosX - this.m_pendulumPosition.x) / aTimeInterval;
	this.m_penduleSpeed.y = (l_newPosY - this.m_pendulumPosition.y) / aTimeInterval;
	
	this.m_pendulumPosition.x = l_newPosX;
	this.m_pendulumPosition.y = l_newPosY;

	var l_decay = CGPointMake(this.m_pendulumPosition.x + (l_childCount - 1) * 0.01, this.m_pendulumPosition.y);
	for(var i = 0; i < l_childCount; i++)
	{
		var l_currentChild = this.m_childList[i];
		l_currentChild.Update(aTimeInterval, l_decay);
		l_decay.x += 0.01;
	}

	if(this.mesh != null)
	{
//		this.m_angle = this.m_angle % (Math.PI * 2.);
//		var lAngle = this.m_isHead ? 0.5 * (this.m_angle + this.m_childList[0].m_angle) : this.m_angle;
		var lAngle = this.m_angle;
		this.mesh.position =  RelativeToPixel(new THREE.Vector3(this.m_pendulumPosition.x, this.m_pendulumPosition.y, this.m_z));
		this.mesh.rotation.x = 0.5 * Math.PI;
		this.mesh.rotation.y = lAngle;//0;//0.5 * Math.PI;
		this.mesh.rotation.z = 0;//0.5 * Math.PI;

		// var xAxis = new THREE.Vector3(0,1,0);
		// rotateAroundObjectAxis(this.mesh, xAxis, this.m_angle * Math.PI / 180.);
		// xAxis = new THREE.Vector3(0,0,1);
		// rotateAroundObjectAxis(this.mesh, xAxis, Math.PI * 0.5);

		this.mesh.scale.x = this.mSize *  window.innerWidth / PENDULUM_TEXTURE_SIZE;
		this.mesh.scale.y = this.mSize *  window.innerWidth / PENDULUM_TEXTURE_SIZE;
		this.mesh.scale.z = this.mSize *  window.innerWidth / PENDULUM_TEXTURE_SIZE;
	}

	return this.m_pendulumPosition;
}

//
// Add a child to this pendulum node.
//
Pendulum.prototype.AddChild = function(a_child)
{
	this.m_childList.push(a_child);
	a_child.m_z = this.m_z + 0.0001;
}

// 
//  Return the list of his childs.
//
Pendulum.prototype.GetChildList = function()
{
	return this.m_childList;
}

//
//  Return his parameters, in a structure.
//
Pendulum.prototype.GetInteractionParameters = function(a_child)
{
	var r_parameters = {m_mass:this.m_mass, m_angle:this.m_angle, m_centrifugal:this.m_angleSpeed * this.m_angleSpeed * this.m_length};
	return r_parameters;
}

//
// Set the position of the base of the pendulum.
//
Pendulum.prototype.SetCenter = function(a_center)
{
	this.m_basePosition = a_center.clone();
}

//
//  Set the position of the mass.
//
Pendulum.prototype.SetPosition = function(a_center)
{
	this.m_angle = atan((a_center.x - this.m_basePosition.x) / (a_center.y - this.m_basePosition.y));
	this.m_lengthSquare = DistancePointSquare(a_center, this.m_basePosition);
	this.m_length = sqrt(this.m_lengthSquare);
}

//
// Change his distance between the mass and the base.
//
Pendulum.prototype.SetLength = function(a_length)
{
	this.m_length = a_length;
	this.m_lengthSquare = Math.pow(m_length, 2.);
}

//
//  Get the position of the mass.
//
Pendulum.prototype.GetPosition = function()
{
	return this.m_pendulumPosition;
}

//
//  Set his rotation speed.
//
Pendulum.prototype.SetAngleSpeed = function(a_angleSpeed)
{
	this.m_angleSpeed = a_angleSpeed;
}

// 
//  Change randomly the gravity.
//
Pendulum.prototype.ChangeGravity = function()
{
	this.SetGravityDegree(myRandom() * 180.);
}

//
//  Change the angle of the gravity strength.
//
Pendulum.prototype.SetGravityDegree = function(a_angle)
{
	for(var i = 0; i < this.m_childList.length; i++)
	{
		this.m_childList[i].SetGravityDegree(a_angle);
	}
	this.m_gravityAngle = a_angle * Math.PI / 180.;
}

//
//  Set a new gravity strength.
//
Pendulum.prototype.SetGravityCoefficient = function(a_gravityCoeff)
{
	for(var i = 0; i < this.m_childList.length; i++)
	{
		this.m_childList[i].SetGravityCoefficient(a_gravityCoeff);
	}
	this.m_gravity = a_gravityCoeff;
}

//
//  Set the new friction coefficient.
//
Pendulum.prototype.SetFriction = function(a_friction)
{
	this.m_frictionCoefficient = a_friction;
}

//
//  Add it in the list.
//  Used for pendulum with a lot of parts.
//
function AddInTheList(a_pendulum)
{
	s_pendulumArray.push(a_pendulum);
}

//
// Get the list of all the pendulum node (static).
//
function GetList()
{
	return s_pendulumArray;
}