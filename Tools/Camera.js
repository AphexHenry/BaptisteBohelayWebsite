
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

	this.mSecurityDistance = CAMERA_DISTANCE_SECURITY;
	this.rotationAdd = new THREE.Vector3();
}

/*
 * Update camera.
 */
CameraManager.prototype.Update = function(aTimeInterval)
{
	this.mLightMove += aTimeInterval;
	this.mCameraMovementTimer += aTimeInterval / this.mCameraDuration;
	var lCoeffMov = 1. - (1. + Math.cos(Math.min(1., this.mCameraMovementTimer) * Math.PI)) * 0.5;
	lCoeffMovPos = 1. - (1. + Math.cos(Math.min(1., lCoeffMov * 0.95) * Math.PI)) * 0.5;
	// lCoeffMovPos *= lCoeffMovPos;

	lCoeffMovLook = 1. - (1. + Math.cos(Math.min(1., lCoeffMov) * Math.PI)) * 0.5;
	// lCoeffMovLook *= lCoeffMovLook;

	this.camera.position = this.mPositionInit.clone().addSelf(this.mTarget.clone().subSelf(this.mPositionInit).multiplyScalar(lCoeffMovPos));
	var width = getWidth() * 0.1;
	this.camera.position.x += this.noise * myRandom() * width;
	this.camera.position.y += this.noise * myRandom() * width;
	this.camera.position.z += this.noise * myRandom() * width;
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
