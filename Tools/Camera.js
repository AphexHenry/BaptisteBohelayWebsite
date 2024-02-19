
var CAMERA_DISTANCE_SECURITY = 0.4;
var CAMERA_DEPTH = 3000;
var DefaultDuration = 1.5;

function CameraManager(a_camera) 
{
	 this.camera = a_camera;
	 // this.camera.matrixAutoUpdate = false;
	// this.camera.position.z = 1000;
	scene.add( this.camera );

	this.mCameraLookAt = new THREE.Vector3(0., 0., 0.);
	this.mCameraLookAtTarget = this.mCameraLookAt.clone();
	this.mCameraLookAtInit = this.mCameraLookAt.clone();

	this.mTarget = this.camera.position.clone();
	this.mPositionInit = this.camera.position.clone();

    this.mCameraMovementTimer = 0.;
	this.mCameraDuration = 1.2;
	this.mBlock = false;
	this.mLightMove = 0.;
	this.noise = 0;

	this.movementTypeCoeff = 0.;

	this.mSecurityDistance = CAMERA_DISTANCE_SECURITY;
	this.rotationAdd = new THREE.Vector3();

	this.movementTypeGroup = 
	{
		INTERPOLATION : 0,
		PHYSICS : 1
	};
	this.movementType = this.movementTypeGroup.INTERPOLATION;
	this.movementTypeCoeff = 0.;
}

/*
 * Update camera.
 */
CameraManager.prototype.Update = function(aTimeInterval)
{
	this.mLightMove += aTimeInterval;
	this.mCameraMovementTimer += aTimeInterval / this.mCameraDuration;
	var lCoeffMov = 1. - (1. + Math.cos(Math.min(1., this.mCameraMovementTimer) * Math.PI)) * 0.5;

	// lCoeffMovPos *= lCoeffMovPos;

	lCoeffMovLook = 1. - (1. + Math.cos(Math.min(1., lCoeffMov) * Math.PI)) * 0.5;
	// lCoeffMovLook *= lCoeffMovLook;

	if(this.camera.position.distanceTo(this.mTarget) > 1500)
	{
		this.movementType = this.movementTypeGroup.INTERPOLATION;
	}

	var lCamPosINTER;
	var lCamPosPHY;

	switch(this.movementType)
	{
		case this.movementTypeGroup.INTERPOLATION:
			this.movementTypeCoeff = 1;
		break;
		case this.movementTypeGroup.PHYSICS:
			this.movementTypeCoeff -= aTimeInterval;
		break;
	}

	lCamPosPHY = this.camera.position.clone().addSelf(this.mTarget.clone().subSelf(this.camera.position).multiplyScalar(2. * aTimeInterval));

	lCoeffMovPos = 1. - (1. + Math.cos(Math.min(1., lCoeffMov * 0.95) * Math.PI)) * 0.5;
	lCamPosINTER = this.mPositionInit.clone().addSelf(this.mTarget.clone().subSelf(this.mPositionInit).multiplyScalar(lCoeffMovPos));

	this.movementTypeCoeff = myClamp(this.movementTypeCoeff,0,1)
	this.camera.position = lCamPosINTER.multiplyScalar(this.movementTypeCoeff).addSelf(lCamPosPHY.multiplyScalar(1 - this.movementTypeCoeff));

	this.mCameraLookAt = this.mCameraLookAtInit.clone().addSelf(this.mCameraLookAtTarget.clone().subSelf(this.mCameraLookAtInit).multiplyScalar(lCoeffMovLook));

	this.camera.lookAt( this.mCameraLookAt );
	this.camera.rotation.y -= this.rotationAdd.y;
	this.camera.updateMatrix();
	this.camera.rotation.x += this.rotationAdd.x;
}

CameraManager.prototype.GoTo = function(aPosition, aLookAt, aDuration)
{
	this.mTarget = aPosition;
	this.mPositionInit = this.camera.position.clone();
	this.mCameraLookAtTarget = aLookAt;
	this.mCameraLookAtInit = this.mCameraLookAt.clone();

	this.mCameraMovementTimer = 0.;
	this.mCameraDuration = Math.max(aDuration, 0.01);
}

CameraManager.prototype.UpdateGoTo = function(aPosition, aLookAt)
{
	aPosition = aPosition.clone();
	aLookAt = aLookAt.clone();
	var relTarget = this.mTarget;
	// relTarget = RelativeToPixel(relTarget);
	if(relTarget.distanceTo(aPosition) > 40)
	{
		this.GoTo(aPosition, aLookAt, DefaultDuration);
	}
	this.mTarget = aPosition;
	if(aLookAt != undefined)
	{
		this.mCameraLookAtTarget = aLookAt;
	}
}

CameraManager.prototype.LookAt = function(aPosition)
{
	this.mCameraLookAtInit = aPosition;
	this.mCameraLookAtTarget = aPosition;
	this.mCameraLookAt = aPosition;
}

CameraManager.prototype.GetCamera = function()
{
	return this.camera;
}

function GetCamera()
{
	return cameraManager.camera;
}

CameraManager.prototype.GetPosition = function()
{
	return cameraManager.camera.position;
}

CameraManager.prototype.GetPositionPixel = function()
{
	return cameraManager.camera.position;
}

CameraManager.prototype.SetSecurityDistance = function(aDistance)
{
	this.mSecurityDistance = aDistance;
}

CameraManager.prototype.SetAngleDecay = function(x, y, z)
{
	this.rotationAdd = new THREE.Vector3(x, y, z);
}

CameraManager.prototype.SetNoise = function(aCoeff)
{
	this.noise = aCoeff;
}

CameraManager.prototype.SetPositionPixel = function(position)
{
	this.mTarget = position.clone();
	this.mPositionInit = position.clone();
	this.camera.position = position.clone();
}

CameraManager.prototype.SetMovementType = function(aType)
{
	this.movementType = aType;
}
