/**
 * Interactive projects particle group: projects scattered at random positions.
 */
export function ParticleGroupInteractive(positionCenter, flyer, name, id) {
	var THREE = globalThis.THREE;
	var sTools = globalThis.sTools;
	var Organigram = globalThis.Organigram;
	var isdefined = globalThis.isdefined;
	var sProjectsToRandom = globalThis.sProjectsToRandom;
	var sWIDTH = globalThis.sWIDTH;
	var ParticleCircleNavigate = globalThis.ParticleCircleNavigate;

	this.name = name;
	this.id = id;
	sTools.ParticleGroups[id] = this;
	this.mAngleAmplitude = Math.PI * 0.5;

	this.particles = [];
	this.particlesToUpdate = [];

	this.SetShortDistance();

	this.positionCenter = positionCenter;
	var spread = sWIDTH * 2.5;

	for (var i = 0; i < flyer.length; i++) {
		if (isdefined(flyer[i].target)) {
			Organigram.Map(this.id, flyer[i].target);
		}
		if ((isdefined(flyer[i].targetURL) || isdefined(flyer[i].targetHTML)) && !isdefined(flyer[i].addRandom)) {
			sProjectsToRandom.push(flyer[i]);
		}

		var lPosition = new THREE.Vector3(
			positionCenter.x + (Math.random() - 0.5) * spread,
			positionCenter.y + (Math.random() - 0.5) * spread,
			positionCenter.z + (Math.random() - 0.5) * spread,
		);

		var particle = new ParticleCircleNavigate(lPosition, flyer[i]);
		this.particles.push(particle);
	}
}

ParticleGroupInteractive.prototype.SetShortDistance = function () {
	this.cameraDistance = window.innerWidth * 0.27;
	this.cameraDistanceNormal = this.cameraDistance;
};

ParticleGroupInteractive.prototype.MouseDown = function () {
	var INTERSECTED = globalThis.INTERSECTED;
	var isdefined = globalThis.isdefined;
	var programStroke = globalThis.programStroke;
	var OPACITY_INFO = globalThis.OPACITY_INFO;
	var GoToIndex = globalThis.GoToIndex;
	var CirclesToHtml = globalThis.CirclesToHtml;
	var ImageFrontCtx = globalThis.ImageFrontCtx;
	var GoToURL = globalThis.GoToURL;
	var SELECTED = globalThis.SELECTED;

	if (INTERSECTED) {
		if (isdefined(INTERSECTED.TargetObject.isAutonomous)) {
			INTERSECTED.MyMouseDown();
			this.cameraDistance = INTERSECTED.MyCameraDistance();
			return;
		}

		INTERSECTED.material.program = programStroke;
		INTERSECTED.TargetObject.info.material.opacity = OPACITY_INFO;
		if (typeof INTERSECTED.TargetObject.target != "undefined") {
			GoToIndex(INTERSECTED.TargetObject.target);
		} else if (typeof INTERSECTED.TargetObject.targetHTML != "undefined") {
			CirclesToHtml(INTERSECTED.TargetObject.targetHTML);
		} else if (typeof INTERSECTED.TargetObject.targetURL != "undefined") {
			ImageFrontCtx.fillStyle = '#ffffff';
			var newURL = window.location.href.substring(0, window.location.href.indexOf('#')) + INTERSECTED.TargetObject.targetURL;
			GoToURL(newURL);
		}
	} else {
		this.cameraDistance = this.cameraDistanceNormal;
		if (SELECTED) {
			SELECTED.material.program = programStroke;
			SELECTED.TargetObject.info.material.opacity = OPACITY_INFO;
			globalThis.SELECTED = null;
		}
	}
};

ParticleGroupInteractive.prototype.AddParticle = function (aParticleObject) {
	var Organigram = globalThis.Organigram;
	var isdefined = globalThis.isdefined;

	this.particles.push(aParticleObject.particle);
	this.particlesToUpdate.push(aParticleObject);
	if (isdefined(aParticleObject.target)) {
		if (isdefined(aParticleObject.target.target)) {
			Organigram.Map(this.id, aParticleObject.target.target);
		}
	}
};

ParticleGroupInteractive.prototype.MouseUp = function () {
};

ParticleGroupInteractive.prototype.BackFromHTML = function () {
	this.cameraDistance = this.cameraDistanceNormal;
};

ParticleGroupInteractive.prototype.GetParticleThatLeadTo = function (aTarget) {
	for (var i = 0; i < this.particles.length; i++) {
		if (this.particles[i].TargetObject.target == aTarget) {
			return this.particles[i];
		}
	}
};

ParticleGroupInteractive.prototype.Init = function () {
	var isdefined = globalThis.isdefined;

	for (var i in this.particles) {
		if (isdefined(this.particles[i].SetTextVisible)) {
			this.particles[i].SetTextVisible(true);
		}
	}
};

ParticleGroupInteractive.prototype.Terminate = function () {
	var INTERSECTED = globalThis.INTERSECTED;
	var isdefined = globalThis.isdefined;
	var programStroke = globalThis.programStroke;

	if (INTERSECTED && !isdefined(INTERSECTED.TargetObject.isAutonomous)) {
		INTERSECTED.material.program = programStroke;
	}
};

ParticleGroupInteractive.prototype.Update = function () {
	var THREE = globalThis.THREE;
	var mouse = globalThis.mouse;
	var projector = globalThis.projector;
	var camera = globalThis.camera;
	var isdefined = globalThis.isdefined;
	var programStroke = globalThis.programStroke;
	var programFill = globalThis.programFill;
	var OPACITY_INFO = globalThis.OPACITY_INFO;
	var IS_PHONE = globalThis.IS_PHONE;
	var sTools = globalThis.sTools;
	var cameraManager = globalThis.cameraManager;

	if (cameraManager.controlMode !== sTools.CameraControlType.MOUSE_MOVE) {
		cameraManager.SetControlMode(sTools.CameraControlType.MOUSE_MOVE);
	}

	for (var i = 0; i < this.particlesToUpdate.length; i++) {
		if (isdefined(this.particlesToUpdate[i].Update)) {
			this.particlesToUpdate[i].Update(0.02);
		}
	}

	var vector = new THREE.Vector3(mouse.x, mouse.y, 0.5);
	projector.unprojectVector(vector, camera);

	var ray = new THREE.Ray(camera.position, vector.subSelf(camera.position).normalize());

	var intersects = ray.intersectObjects(this.particles);

	if (intersects.length > 0) {
		if (globalThis.INTERSECTED != intersects[0].object) {
			if (globalThis.INTERSECTED) {
				if (isdefined(globalThis.INTERSECTED.TargetObject.isAutonomous)) {
					globalThis.INTERSECTED.MyMouseOff(intersects[0]);
				} else {
					globalThis.INTERSECTED.material.program = programStroke;
				}

				globalThis.INTERSECTED.TargetObject.info.material.opacity = OPACITY_INFO;
			}

			globalThis.INTERSECTED = intersects[0].object;

			if (isdefined(globalThis.INTERSECTED.TargetObject.isAutonomous)) {
				globalThis.INTERSECTED.MyMouseOn(intersects[0]);
				return;
			}
			globalThis.sWaterHeight = 0.01;
			globalThis.INTERSECTED.material.program = programFill;
		}
		if (isdefined(globalThis.INTERSECTED.TargetObject.info)) {
			globalThis.INTERSECTED.TargetObject.info.material.opacity +=
				(1. - globalThis.INTERSECTED.TargetObject.info.material.opacity) * 2. * 0.02;
		}
	} else {
		if (globalThis.INTERSECTED) {
			if (isdefined(globalThis.INTERSECTED.TargetObject.isAutonomous)) {
				if (!IS_PHONE) {
					globalThis.INTERSECTED.MyMouseOff(intersects[0]);
				} else {
					globalThis.INTERSECTED.MyMouseOn(intersects[0]);
				}
			} else {
				globalThis.INTERSECTED.material.program = programStroke;
			}
			globalThis.INTERSECTED.TargetObject.info.material.opacity = OPACITY_INFO;
		}
		globalThis.INTERSECTED = null;
	}
};
