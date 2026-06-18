/**
 * Camera movement, look-at, and auto-control for the main 3D scene.
 * Uses globalThis for shared app state (scene, sTools, cameraManager, etc.).
 */

var CAMERA_DISTANCE_SECURITY = 0.4;
var CAMERA_DEPTH = 3000;
var DefaultDuration = 1.5;

function formatCameraVec(v) {
	if (!v || typeof v.x !== 'number') {
		return String(v);
	}
	return '(' + v.x.toFixed(1) + ', ' + v.y.toFixed(1) + ', ' + v.z.toFixed(1) + ')';
}

function shouldLogCamera(tag) {
	if (globalThis.DEBUG_CAMERA) {
		return true;
	}
	var t = tag || '';
	return /^nav\//.test(t) || /intro|home|hashchange|syncCamera/i.test(t);
}

/**
 * @constructor
 * @param {THREE.Camera} a_camera
 */
export function CameraManager(a_camera) {
	 this.camera = a_camera;
	 // this.camera.matrixAutoUpdate = false;
	// this.camera.position.z = 1000;
	globalThis.scene.add( this.camera );

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

	this.controlMode = globalThis.sTools.CameraControlType.SATTELITE;
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

	var lCoeffMovLook = 1. - (1. + Math.cos(Math.min(1., lCoeffMov) * Math.PI)) * 0.5;
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

	var lCoeffMovPos = 1. - (1. + Math.cos(Math.min(1., lCoeffMov * 0.95) * Math.PI)) * 0.5;
	lCamPosINTER = this.mPositionInit.clone().addSelf(this.mTarget.clone().subSelf(this.mPositionInit).multiplyScalar(lCoeffMovPos));

	this.movementTypeCoeff = globalThis.myClamp(this.movementTypeCoeff,0,1)
	this.camera.position = lCamPosINTER.multiplyScalar(this.movementTypeCoeff).addSelf(lCamPosPHY.multiplyScalar(1 - this.movementTypeCoeff));

	this.mCameraLookAt = this.mCameraLookAtInit.clone().addSelf(this.mCameraLookAtTarget.clone().subSelf(this.mCameraLookAtInit).multiplyScalar(lCoeffMovLook));

	this.camera.lookAt( this.mCameraLookAt );
	this.camera.rotation.y -= this.rotationAdd.y;
	this.camera.updateMatrix();
	this.camera.rotation.x += this.rotationAdd.x;
}

CameraManager.prototype.logState = function(tag) {
	if (!shouldLogCamera(tag)) {
		return;
	}
	var g = globalThis;
	var groupIndex = g.Navigation ? g.Navigation.groupCurrent : g.sGroupCurrent;
	var groupName = groupIndex;
	if (g.sTools && g.sTools.ParticleGroups && g.sTools.ParticleGroups[groupIndex]) {
		groupName = g.sTools.ParticleGroups[groupIndex].name + ' (' + groupIndex + ')';
	}
	console.log('[Camera]', tag, {
		group: groupName,
		controlMode: this.controlMode,
		cameraPosition: formatCameraVec(g.cameraPosition),
		cameraTarget: formatCameraVec(g.cameraTarget),
		camera_position: formatCameraVec(this.camera.position),
		mgr_mTarget: formatCameraVec(this.mTarget),
		mgr_lookAt: formatCameraVec(this.mCameraLookAt),
		mgr_lookAtTarget: formatCameraVec(this.mCameraLookAtTarget),
	});
};

CameraManager.prototype.GoTo = function(aPosition, aLookAt, aDuration)
{
	this.mTarget = aPosition;
	this.mPositionInit = this.camera.position.clone();
	this.mCameraLookAtTarget = aLookAt;
	this.mCameraLookAtInit = this.mCameraLookAt.clone();

	this.mCameraMovementTimer = 0.;
	this.mCameraDuration = Math.max(aDuration, 0.01);
	if (globalThis.DEBUG_CAMERA) {
		this.logState('GoTo duration=' + aDuration);
	}
}

CameraManager.prototype.IsMovementComplete = function()
{
	if (this.mCameraMovementTimer < 1) {
		return false;
	}
	var posDist = this.camera.position.distanceTo(this.mTarget);
	var lookDist = this.mCameraLookAt.distanceTo(this.mCameraLookAtTarget);
	var initDist = this.mPositionInit.distanceTo(this.mTarget);
	// Interpolation uses lCoeffMov * 0.95, so position can stop ~5% short of mTarget.
	var tolerance = Math.max(2, initDist * 0.06);
	return posDist < tolerance && lookDist < tolerance;
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
	if (globalThis.DEBUG_CAMERA) {
		this.logState('LookAt');
	}
}

CameraManager.prototype.GetCamera = function()
{
	return this.camera;
}

CameraManager.prototype.GetPosition = function()
{
	return globalThis.cameraManager.camera.position;
}

CameraManager.prototype.GetPositionPixel = function()
{
	return globalThis.cameraManager.camera.position;
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
	if (globalThis.DEBUG_CAMERA) {
		this.logState('SetPositionPixel');
	}
}

CameraManager.prototype.SetMovementType = function(aType)
{
	this.movementType = aType;
}

CameraManager.prototype.SetControlMode = function(aMode)
{
	this.controlMode = aMode;
	if (globalThis.DEBUG_CAMERA) {
		this.logState('SetControlMode=' + aMode);
	}
}

CameraManager.prototype.UpdateAutoControl = function(particleGroup, radius, generalTimer, mouse, cameraPosition, cameraTarget)
{
	var sTools = globalThis.sTools;
	if (this.controlMode === sTools.CameraControlType.NONE) {
		return;
	}

	var center = particleGroup.positionCenter;

	if (this.controlMode === sTools.CameraControlType.SATTELITE) {
		cameraTarget.copy(center);
		cameraPosition.x = center.x + radius * Math.sin(generalTimer * Math.PI / 40);
		cameraPosition.y = center.y + radius * 0.;
		cameraPosition.z = center.z + radius * Math.cos(generalTimer * Math.PI / 40);
		this.SetMovementType(this.movementTypeGroup.INTERPOLATION);
	}
	else if (this.controlMode === sTools.CameraControlType.MOUSE_MOVE) {
		cameraTarget.copy(center);
		var isdefined = globalThis.isdefined;
		var lAngleAmp = isdefined(particleGroup.mAngleAmplitude) ? particleGroup.mAngleAmplitude : Math.PI / 2.;
		var lVerticalAmp = isdefined(particleGroup.mVerticalAngleAmplitude) ? particleGroup.mVerticalAngleAmplitude : 0.;
		var theta = mouse.x * lAngleAmp;
		var phi = mouse.y * lVerticalAmp;
		var phiClamp = Math.PI * 0.42;
		if (phi > phiClamp) phi = phiClamp;
		if (phi < -phiClamp) phi = -phiClamp;
		var cp = Math.cos(phi);
		cameraPosition.x = center.x + radius * cp * Math.sin(theta);
		cameraPosition.y = center.y + radius * Math.sin(phi);
		cameraPosition.z = center.z + radius * cp * Math.cos(theta);
		this.SetMovementType(this.movementTypeGroup.PHYSICS);
	}
}

/** Console: logCameraState('my tag') or DEBUG_CAMERA = true for all transitions */
globalThis.logCameraState = function (tag) {
	if (globalThis.cameraManager) {
		globalThis.cameraManager.logState(tag);
	}
};
