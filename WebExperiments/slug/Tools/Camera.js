
var CAMERA_DISTANCE_SECURITY = 0.4;
var CAMERA_DEPTH = 3000;

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
	this.mCameraDuration = 1.;
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
	lCoeffMov *= lCoeffMov;

	this.camera.position = this.mPositionInit.clone().addSelf(this.mTarget.clone().subSelf(this.mPositionInit).multiplyScalar(lCoeffMov));
	var width = getWidth() * 0.1;
	this.camera.position.x += this.noise * myRandom() * width;
	this.camera.position.y += this.noise * myRandom() * width;
	this.camera.position.z += this.noise * myRandom() * width;
	this.mCameraLookAt = this.mCameraLookAtInit.clone().addSelf(this.mCameraLookAtTarget.clone().subSelf(this.mCameraLookAtInit).multiplyScalar(lCoeffMov));

	this.camera.lookAt( this.mCameraLookAt );
	this.camera.rotation.y -= this.rotationAdd.y;
	this.camera.updateMatrix();
	this.camera.rotation.x += this.rotationAdd.x;
}

CameraManager.prototype.GoTo = function(aPosition, aLookAt, aDuration)
{
	this.mTarget = RelativeToPixel(aPosition);
	this.mPositionInit = this.camera.position.clone();
	this.mCameraLookAtTarget = RelativeToPixel(aLookAt);
	this.mCameraLookAtInit = this.mCameraLookAt.clone();

	this.mCameraMovementTimer = 0.;
	this.mCameraDuration = Math.max(aDuration, 0.01);
}

CameraManager.prototype.UpdateGoTo = function(aPosition, aLookAt)
{
	var relTarget = PixelToRelative(this.mTarget);
	// relTarget = RelativeToPixel(relTarget);
	if(relTarget.distanceTo(aPosition) > 0.1)
	{
		this.GoTo(aPosition, aLookAt, 1.);
	}
	this.mTarget = RelativeToPixel(aPosition);
	if(aLookAt != undefined)
	{
		this.mCameraLookAtTarget = RelativeToPixel(aLookAt);
	}
}

CameraManager.prototype.LookAt = function(aPosition)
{
	this.mCameraLookAtTarget = RelativeToPixel(aPosition);
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
	return PixelToRelative(cameraManager.camera.position);
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
