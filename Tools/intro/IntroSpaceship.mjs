/**
 * Small physics spaceship for the intro: left/right rotate, up fires the engine.
 */
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
	this.maxSpeed = size * 4.5;
	this.speed = { x: 0, y: 0 };
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
	scene.add(this.particle);

	this.showGravityDebug = true;
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

IntroSpaceship.prototype.applyBounds = function (bounds) {
	var particle = this.particle;
	if (particle.position.x < bounds.minX) {
		particle.position.x = bounds.minX;
		this.speed.x = Math.abs(this.speed.x) * this.bounce;
	}
	else if (particle.position.x > bounds.maxX) {
		particle.position.x = bounds.maxX;
		this.speed.x = -Math.abs(this.speed.x) * this.bounce;
	}

	if (particle.position.y < bounds.minY) {
		particle.position.y = bounds.minY;
		this.speed.y = Math.abs(this.speed.y) * this.bounce;
	}
	else if (particle.position.y > bounds.maxY) {
		particle.position.y = bounds.maxY;
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
	if (!this.showGravityDebug || !globalThis.scene) {
		return;
	}

	var THREE = globalThis.THREE;
	var scene = globalThis.scene;
	var markerSize = this.size * 0.35;

	while (this.gravityDebugMarkers.length < gravityBodies.length) {
		var marker = new THREE.Particle(
			new THREE.ParticleCanvasMaterial({
				color: 0xff3dff,
				program: programGravityDebugCross,
				transparent: true,
				opacity: 0.95,
			})
		);
		marker.scale.x = marker.scale.y = markerSize;
		scene.add(marker);
		this.gravityDebugMarkers.push(marker);
	}

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

IntroSpaceship.prototype.applyPlanetGravity = function (delta, gravityBodies) {
	if (!gravityBodies || gravityBodies.length === 0) {
		return;
	}

	var softening = this.size * 20.2;
	var softeningSq = softening;
	var maxBodyAcceleration = this.gravity * 2.4;
	for (var i = 0; i < gravityBodies.length; i++) {
		var body = gravityBodies[i];
		var dx = body.x - this.particle.position.x;
		var dy = body.y - this.particle.position.y;
		var distanceSq = dx * dx + dy * dy + softeningSq;
		var distance = distanceSq;
		if (distance < 0.001) {
			continue;
		}
		var acceleration = this.planetGravity * body.mass / distanceSq;
		acceleration = Math.min(acceleration, maxBodyAcceleration);

		this.speed.x += dx / distance * acceleration * delta;
		this.speed.y += dy / distance * acceleration * delta;
	}
};

IntroSpaceship.prototype.Update = function (delta, bounds, gravityBodies) {
	delta = Math.min(delta, 0.05);

	if (gravityBodies) {
		this.updateGravityDebugMarkers(gravityBodies);
	}

	var turn = 0;
	if (this.controls.left) turn += 1;
	if (this.controls.right) turn -= 1;
	this.angle += turn * this.rotationSpeed * delta;

	// this.speed.y -= this.gravity * delta;
	this.applyPlanetGravity(delta, gravityBodies);
	if (this.controls.up) {
		this.speed.x += Math.sin(this.angle) * this.thrust * delta;
		this.speed.y -= Math.cos(this.angle) * this.thrust * delta;
	}

	this.speed.x *= Math.pow(this.drag, delta * 60);
	this.speed.y *= Math.pow(this.drag, delta * 60);
	this.limitSpeed();

	this.particle.position.x += this.speed.x * delta;
	this.particle.position.y += this.speed.y * delta;
	this.particle.rotation.z = -this.angle;

	if (bounds) {
		this.applyBounds(bounds);
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

	if (this.controls.up) {
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
