

function LightManager(a_light) 
{
	 this.light = a_light;
	// this.camera.position.z = 1000;
	scene.add( this.light );

	this.mLookAt = new THREE.Vector3(0., 0., 0.);
	this.mLookAtTarget = this.mLookAt.clone();
	this.mLookAtInit = this.mLookAt.clone();

	this.mTarget = this.light.position.clone();
	this.mSpeed = new THREE.Vector3(0., 0., 0.);
	this.mPosition = this.light.position.clone();

    this.mCameraMovementTimer = 0.;
	this.mCameraDuration = 1.;
	this.mBlock = false;
	this.mLightMove = 0.;
}

/*
 * Update camera.
 */
LightManager.prototype.Update = function(aTimeInterval)
{
	this.mLightMove += aTimeInterval;
	this.mCameraMovementTimer += aTimeInterval / this.mCameraDuration;
	var lCoeffMov = 1. - (1. + Math.cos(Math.min(1., this.mCameraMovementTimer) * Math.PI)) * 0.5;
	lCoeffMov *= lCoeffMov;

	this.mLookAt = this.mLookAtInit.clone().addSelf(this.mLookAtTarget.clone().subSelf(this.mLookAtInit).multiplyScalar(lCoeffMov));

	this.light.target.position = this.mLookAt;
	this.mSpeed.addSelf((this.mTarget.clone().subSelf(this.mPosition)).multiplyScalar(25 * aTimeInterval));
	this.mSpeed.multiplyScalar(0.95);
	this.mPosition.addSelf(this.mSpeed.clone().multiplyScalar(aTimeInterval));
	this.light.position = this.mPosition;
	// light.position.x += Math.cos(this.mLightMove);;
	// light.position.y += 900;
	// light.position.z = -1000 + 200 * Math.cos(this.mLightMove);
}

LightManager.prototype.GoTo = function(aPosition, aLookAt, aDuration)
{
	this.mTarget = RelativeToPixel(aPosition);
	this.mPositionInit = this.light.position.clone();
	this.mLookAtTarget = RelativeToPixel(aLookAt);
	this.mLookAtInit = this.mLookAt.clone();

	this.mCameraMovementTimer = 0.;
	this.mCameraDuration = Math.max(aDuration, 0.01);
}

LightManager.prototype.UpdateGoTo = function(aPosition, aLookAt)
{
	if(PixelToRelative(this.mTarget).distanceTo(aPosition) > 0.1)
	{
		this.GoTo(aPosition, aLookAt, 1.);
		return;
	}
	this.mTarget = RelativeToPixel(aPosition);
	if(aLookAt != undefined)
	{
		this.mLookAtTarget = RelativeToPixel(aLookAt);
	}
}

LightManager.prototype.LookAt = function(aPosition)
{
	this.mLookAtTarget = RelativeToPixel(aPosition);
}

LightManager.prototype.GetLight = function()
{
	return this.light;
}

LightManager.prototype.GetPosition = function()
{
	return PixelToRelative(this.light.position);
}

LightManager.prototype.GetPositionPixel = function()
{
	return this.light.position;
}


