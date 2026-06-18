/**
 * Small physics spaceship for the intro: left/right rotate, up fires the engine.
 * Physics and bounds run in the camera view plane so controls stay 2D while the camera orbits.
 */
function vec3Dot(a, b) {
	return a.x * b.x + a.y * b.y + a.z * b.z;
}

export function getViewPlaneBasis(anchor) {
	var THREE = globalThis.THREE;
	var camera = globalThis.camera;
	var mgr = globalThis.cameraManager;
	var viewDir = new THREE.Vector3();

	if (mgr && mgr.mCameraLookAt) {
		viewDir.copy(mgr.mCameraLookAt).subSelf(camera.position);
	} else if (globalThis.cameraTarget) {
		viewDir.copy(globalThis.cameraTarget).subSelf(camera.position);
	} else {
		viewDir.copy(anchor).subSelf(camera.position);
	}

	var viewLen = viewDir.length();
	if (viewLen < 0.001) {
		viewDir.set(0, 0, -1);
	} else {
		viewDir.multiplyScalar(1 / viewLen);
	}

	var worldUp = new THREE.Vector3(0, 1, 0);
	// viewDir × worldUp = camera screen-right (worldUp × viewDir is left)
	var right = new THREE.Vector3().cross(viewDir, worldUp);
	if (right.lengthSq() < 1e-6) {
		right.set(1, 0, 0);
	} else {
		right.normalize();
	}

	// right × viewDir = screen-up (viewDir × right is down); matches speed.y -= cos thrust
	var up = new THREE.Vector3().cross(right, viewDir).normalize();

	return { viewDir: viewDir, right: right, up: up };
}

/** Normalized canvas outline used for letter collision (matches programSpaceship). */
export const SPACESHIP_SHAPE_VERTICES = [
	{ x: 0, y: -0.55 },
	{ x: 0.36, y: 0.34 },
	{ x: 0.13, y: 0.22 },
	{ x: 0, y: 0.42 },
	{ x: -0.13, y: 0.22 },
	{ x: -0.36, y: 0.34 },
];

function programGravityDebugCross(context) {
	context.lineWidth = 0.1;
	context.beginPath();
	context.moveTo(-0.55, 0);
	context.lineTo(0.55, 0);
	context.moveTo(0, -0.55);
	context.lineTo(0, 0.55);
	context.stroke();
	context.beginPath();
	context.arc(0, 0, 0.18, 0, Math.PI * 2, true);
	context.stroke();
}

export function IntroSpaceship(position, size) {
	var THREE = globalThis.THREE;
	var scene = globalThis.scene;

	this.size = size;
	this.angle = 0;
	this.rotationSpeed = 3.4;
	this.thrust = size * 7.5;
	this.gravity = size * 20.3;
	this.planetGravity = size * window.innerWidth * 3650;
	this.drag = 0.993;
	this.bounce = 0.42;
	this.maxSpeed = size * 5;
	// speed.x / speed.y = velocity along camera right / up (screen plane)
	this.speed = { x: 0, y: 0 };
	this.landedPlanet = null;
	this._basisRight = null;
	this._basisUp = null;
	this.inputEnabled = true;
	this.autoThrustTimer = 0;
	this.controls = {
		left: false,
		right: false,
		up: false,
	};

	this.programSpaceship = this.programSpaceship.bind(this);
	this.onKeyDown = this.onKeyDown.bind(this);
	this.onKeyUp = this.onKeyUp.bind(this);

	this.material = new THREE.ParticleCanvasMaterial({
		color: 0xd8e7ff,
		program: this.programSpaceship,
		transparent: true,
		opacity: 0.95,
	});
	this.particle = new THREE.Particle(this.material);
	this.particle.position = position.clone();
	this.particle.scale.x = this.particle.scale.y = size;
	this.particle.rotation.z = 0;
	this.particle.boundRadiusScale = 0.7;
	this.hullRadiusScale = 0.7;
	scene.add(this.particle);

	// Console: DEBUG_SPACESHIP_GRAVITY = true to show gravity-body crosshairs on particles.
	// Console: DEBUG_SPACESHIP_LETTER_COLLISION = true to show ship/letter hit boxes.
	this.showGravityDebug = !!globalThis.DEBUG_SPACESHIP_GRAVITY;
	this.gravityDebugMarkers = [];

	window.addEventListener('keydown', this.onKeyDown, false);
	window.addEventListener('keyup', this.onKeyUp, false);
}

IntroSpaceship.prototype.isControlKey = function (event) {
	return event.keyCode === 37 || event.keyCode === 38 || event.keyCode === 39;
};

IntroSpaceship.prototype.onKeyDown = function (event) {
	if (!this.isControlKey(event)) {
		return;
	}
	event.preventDefault();
	if (!this.inputEnabled) {
		return;
	}
	if (event.keyCode === 37) this.controls.left = true;
	if (event.keyCode === 39) this.controls.right = true;
	if (event.keyCode === 38) this.controls.up = true;
};

IntroSpaceship.prototype.onKeyUp = function (event) {
	if (!this.isControlKey(event)) {
		return;
	}
	event.preventDefault();
	if (event.keyCode === 37) this.controls.left = false;
	if (event.keyCode === 39) this.controls.right = false;
	if (event.keyCode === 38) this.controls.up = false;
};

IntroSpaceship.prototype.resetControls = function () {
	this.controls.left = false;
	this.controls.right = false;
	this.controls.up = false;
};

IntroSpaceship.prototype.snapToViewPlane = function (anchor, basis) {
	var pos = this.particle.position;
	var dx = pos.x - anchor.x;
	var dy = pos.y - anchor.y;
	var dz = pos.z - anchor.z;
	var alongView = vec3Dot({ x: dx, y: dy, z: dz }, basis.viewDir);
	pos.x -= basis.viewDir.x * alongView;
	pos.y -= basis.viewDir.y * alongView;
	pos.z -= basis.viewDir.z * alongView;
};

IntroSpaceship.prototype.setPlaneOffset = function (anchor, basis, offsetRight, offsetUp) {
	var pos = this.particle.position;
	pos.x = anchor.x + basis.right.x * offsetRight + basis.up.x * offsetUp;
	pos.y = anchor.y + basis.right.y * offsetRight + basis.up.y * offsetUp;
	pos.z = anchor.z + basis.right.z * offsetRight + basis.up.z * offsetUp;
	this.snapToViewPlane(anchor, basis);
};

IntroSpaceship.prototype.getPlaneCoords = function (anchor, basis) {
	var pos = this.particle.position;
	var dx = pos.x - anchor.x;
	var dy = pos.y - anchor.y;
	var dz = pos.z - anchor.z;
	return {
		right: vec3Dot({ x: dx, y: dy, z: dz }, basis.right),
		up: vec3Dot({ x: dx, y: dy, z: dz }, basis.up),
	};
};

IntroSpaceship.prototype.applyPlaneBounds = function (anchor, basis, bounds) {
	var coords = this.getPlaneCoords(anchor, basis);
	var pos = this.particle.position;

	if (coords.right < -bounds.halfRight) {
		this.setPlaneOffset(anchor, basis, -bounds.halfRight, coords.up);
		this.speed.x = Math.abs(this.speed.x) * this.bounce;
	}
	else if (coords.right > bounds.halfRight) {
		this.setPlaneOffset(anchor, basis, bounds.halfRight, coords.up);
		this.speed.x = -Math.abs(this.speed.x) * this.bounce;
	}

	coords = this.getPlaneCoords(anchor, basis);
	if (coords.up < -bounds.halfUp) {
		this.setPlaneOffset(anchor, basis, coords.right, -bounds.halfUp);
		this.speed.y = Math.abs(this.speed.y) * this.bounce;
	}
	else if (coords.up > bounds.halfUp) {
		this.setPlaneOffset(anchor, basis, coords.right, bounds.halfUp);
		this.speed.y = -Math.abs(this.speed.y) * this.bounce;
	}
};

IntroSpaceship.prototype.limitSpeed = function () {
	var speedLength = Math.sqrt(this.speed.x * this.speed.x + this.speed.y * this.speed.y);
	if (speedLength <= this.maxSpeed) {
		return;
	}
	var ratio = this.maxSpeed / speedLength;
	this.speed.x *= ratio;
	this.speed.y *= ratio;
};

IntroSpaceship.prototype.updateGravityDebugMarkers = function (gravityBodies) {
	this.showGravityDebug = !!globalThis.DEBUG_SPACESHIP_GRAVITY;
	if (!this.showGravityDebug || !globalThis.scene) {
		while (this.gravityDebugMarkers.length > 0) {
			globalThis.scene.remove(this.gravityDebugMarkers.pop());
		}
		return;
	}

	var THREE = globalThis.THREE;
	var scene = globalThis.scene;
	var markerSize = this.size * 0.35;

	// while (this.gravityDebugMarkers.length < gravityBodies.length) {
	// 	var marker = new THREE.Particle(
	// 		new THREE.ParticleCanvasMaterial({
	// 			color: 0xff3dff,
	// 			program: programGravityDebugCross,
	// 			transparent: true,
	// 			opacity: 0.95,
	// 		})
	// 	);
	// 	marker.scale.x = marker.scale.y = markerSize;
	// 	scene.add(marker);
	// 	this.gravityDebugMarkers.push(marker);
	// }

	while (this.gravityDebugMarkers.length > gravityBodies.length) {
		scene.remove(this.gravityDebugMarkers.pop());
	}

	for (var i = 0; i < gravityBodies.length; i++) {
		var body = gravityBodies[i];
		var marker = this.gravityDebugMarkers[i];
		marker.position.x = body.x;
		marker.position.y = body.y;
		marker.position.z = body.z + 1;
		marker.scale.x = marker.scale.y = markerSize * (0.6 + body.mass * 0.35);
	}
};

IntroSpaceship.prototype.applyPlanetGravity = function (delta, gravityBodies, basis) {
	if (!gravityBodies || gravityBodies.length === 0) {
		return;
	}

	var softening = this.size * 20.2;
	var softeningSq = softening;
	var maxBodyAcceleration = this.gravity * 2.4;
	var pos = this.particle.position;
	for (var i = 0; i < gravityBodies.length; i++) {
		var body = gravityBodies[i];
		var wx = body.x - pos.x;
		var wy = body.y - pos.y;
		var wz = body.z - pos.z;
		var planeR = vec3Dot({ x: wx, y: wy, z: wz }, basis.right);
		var planeU = vec3Dot({ x: wx, y: wy, z: wz }, basis.up);
		var distanceSq = planeR * planeR + planeU * planeU + softeningSq;
		var distance = distanceSq;
		if (distance < 0.001) {
			continue;
		}
		var acceleration = this.planetGravity * body.mass / distanceSq;
		acceleration = Math.min(acceleration, maxBodyAcceleration);

		this.speed.x += planeR / distance * acceleration * delta;
		this.speed.y += planeU / distance * acceleration * delta;
	}
};

IntroSpaceship.prototype.reprojectSpeedToBasis = function (basis) {
	if (!this._basisRight || !this._basisUp) {
		this._basisRight = basis.right.clone();
		this._basisUp = basis.up.clone();
		return;
	}

	var vx = this._basisRight.x * this.speed.x + this._basisUp.x * this.speed.y;
	var vy = this._basisRight.y * this.speed.x + this._basisUp.y * this.speed.y;
	var vz = this._basisRight.z * this.speed.x + this._basisUp.z * this.speed.y;
	this.speed.x = vec3Dot({ x: vx, y: vy, z: vz }, basis.right);
	this.speed.y = vec3Dot({ x: vx, y: vy, z: vz }, basis.up);
	this._basisRight.copy(basis.right);
	this._basisUp.copy(basis.up);
};

IntroSpaceship.prototype.Update = function (delta, planeBounds, gravityBodies, planeAnchor) {
	delta = Math.min(delta, 0.05);

	if (!planeAnchor) {
		return;
	}

	var basis = getViewPlaneBasis(planeAnchor);

	if (this.landedPlanet && !this.controls.up) {
		var turn = 0;
		if (this.controls.left) turn += 1;
		if (this.controls.right) turn -= 1;
		this.angle += turn * this.rotationSpeed * delta;
		this.speed.x = 0;
		this.speed.y = 0;
		this.particle.rotation.z = -this.angle;
		return;
	}

	this.reprojectSpeedToBasis(basis);

	if (gravityBodies) {
		this.updateGravityDebugMarkers(gravityBodies);
	}

	var turn = 0;
	if (this.controls.left) turn += 1;
	if (this.controls.right) turn -= 1;
	this.angle += turn * this.rotationSpeed * delta;

	this.applyPlanetGravity(delta, gravityBodies, basis);
	var thrusting = this.controls.up || this.autoThrustTimer > 0;
	if (this.autoThrustTimer > 0) {
		this.autoThrustTimer = Math.max(0, this.autoThrustTimer - delta);
	}
	if (thrusting) {
		this.speed.x += Math.sin(this.angle) * this.thrust * delta;
		this.speed.y -= Math.cos(this.angle) * this.thrust * delta;
	}

	this.speed.x *= Math.pow(this.drag, delta * 60);
	this.speed.y *= Math.pow(this.drag, delta * 60);
	this.limitSpeed();

	var pos = this.particle.position;
	pos.x += basis.right.x * this.speed.x * delta + basis.up.x * this.speed.y * delta;
	pos.y += basis.right.y * this.speed.x * delta + basis.up.y * this.speed.y * delta;
	pos.z += basis.right.z * this.speed.x * delta + basis.up.z * this.speed.y * delta;
	this.snapToViewPlane(planeAnchor, basis);

	// CanvasRenderer applies rotation in screen space; angle is heading in the view plane.
	this.particle.rotation.z = -this.angle;

	if (planeBounds) {
		this.applyPlaneBounds(planeAnchor, basis, planeBounds);
		this.snapToViewPlane(planeAnchor, basis);
	}
};

IntroSpaceship.prototype.Destroy = function () {
	window.removeEventListener('keydown', this.onKeyDown, false);
	window.removeEventListener('keyup', this.onKeyUp, false);
	if (globalThis.scene) {
		globalThis.scene.remove(this.particle);
		for (var i = 0; i < this.gravityDebugMarkers.length; i++) {
			globalThis.scene.remove(this.gravityDebugMarkers[i]);
		}
	}
	this.gravityDebugMarkers = [];
};

IntroSpaceship.prototype.programSpaceship = function (context) {
	context.lineWidth = 0.035;
	context.lineJoin = 'round';
	context.lineCap = 'round';

	if (this.controls.up || this.autoThrustTimer > 0) {
		var flamePulse = 0.9 + 0.25 * Math.sin(globalThis.sGeneralTimer * 30);
		context.beginPath();
		context.moveTo(-0.16, 0.28);
		context.lineTo(0, 0.72 * flamePulse);
		context.lineTo(0.16, 0.28);
		context.closePath();
		context.fillStyle = 'rgba(255, 164, 65, 0.85)';
		context.fill();
		context.strokeStyle = 'rgba(255, 235, 135, 0.9)';
		context.stroke();
	}

	context.beginPath();
	context.moveTo(0, -0.55);
	context.lineTo(0.36, 0.34);
	context.lineTo(0.13, 0.22);
	context.lineTo(0, 0.42);
	context.lineTo(-0.13, 0.22);
	context.lineTo(-0.36, 0.34);
	context.closePath();
	context.fillStyle = 'rgba(18, 22, 34, 0.9)';
	context.fill();
	context.strokeStyle = 'rgba(216, 231, 255, 0.96)';
	context.stroke();

	context.beginPath();
	context.arc(0, -0.14, 0.12, 0, Math.PI * 2, true);
	context.fillStyle = 'rgba(120, 220, 255, 0.72)';
	context.fill();
	context.strokeStyle = 'rgba(240, 255, 255, 0.9)';
	context.stroke();
};
