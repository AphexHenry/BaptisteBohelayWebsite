/**
 * Interactive projects particle group: a small 2D platformer.
 *
 * The camera stays fixed on the group center; the level, items, and background
 * scroll in world-space as the blob moves right and up.
 */
import { organigram } from '../Organigram.mjs';

export function ParticleGroupInteractive(positionCenter, flyer, name, id) {
	var THREE = globalThis.THREE;
	var scene = globalThis.scene;
	var sTools = globalThis.sTools;
	var isdefined = globalThis.isdefined;
	var sProjectsToRandom = globalThis.sProjectsToRandom;

	this.name = name;
	this.id = id;
	sTools.ParticleGroups[id] = this;

	this.positionCenter = positionCenter;
	this.particles = [];
	this.particlesToUpdate = [];
	this.levelObjects = [];
	this.backgroundObjects = [];
	this.items = [];
	this.keys = {
		left: false,
		right: false,
		up: false,
	};
	this.jumpQueued = false;
	this.collectionMessage = "";
	this.collectionMessageTimer = 0;
	this.scrollX = 0;
	this.scrollY = 0;

	this.SetShortDistance();
	this.UpdateViewMetrics();

	this.player = {
		x: -260,
		y: -118,
		vx: 0,
		vy: 0,
		width: 46,
		height: 58,
		grounded: false,
	};

	this.platforms = this.BuildPlatforms();
	this.BuildBackground();
	this.BuildPlatformsVisuals();
	this.BuildItems(flyer);
	this.BuildPlayer();
	this.BuildHud();

	this.scrollX = this.GetTargetScrollX();
	this.scrollY = this.GetTargetScrollY();
	this.UpdateVisuals();

	var self = this;
	this.onKeyDown = function (event) {
		self.SetKey(event, true);
	};
	this.onKeyUp = function (event) {
		self.SetKey(event, false);
	};
	window.addEventListener('keydown', this.onKeyDown, false);
	window.addEventListener('keyup', this.onKeyUp, false);

	for (var i = 0; i < flyer.length; i++) {
		if (isdefined(flyer[i].target)) {
			organigram.Map(this.id, flyer[i].target);
		}
		if ((isdefined(flyer[i].targetURL) || isdefined(flyer[i].targetHTML)) && !isdefined(flyer[i].addRandom)) {
			sProjectsToRandom.push(flyer[i]);
		}
	}
}

ParticleGroupInteractive.prototype.SetShortDistance = function () {
	this.cameraDistance = window.innerHeight * 0.74;
	this.cameraDistanceNormal = this.cameraDistance;
};

ParticleGroupInteractive.prototype.UpdateViewMetrics = function () {
	var fov = 70 * Math.PI / 180;
	this.viewHeight = 2 * this.cameraDistance * Math.tan(fov * 0.5);
	this.viewWidth = this.viewHeight * (window.innerWidth / window.innerHeight);
};

ParticleGroupInteractive.prototype.GetCameraPosition = function () {
	var THREE = globalThis.THREE;
	return new THREE.Vector3(
		this.positionCenter.x,
		this.positionCenter.y,
		this.positionCenter.z + this.cameraDistance
	);
};

ParticleGroupInteractive.prototype.BuildPlatforms = function () {
	return [
		{ x: 0, y: -190, width: 900, height: 80 },
		{ x: 700, y: -20, width: 360, height: 48 },
		{ x: 1160, y: 150, width: 340, height: 48 },
		{ x: 1650, y: 320, width: 420, height: 48 },
		{ x: 2210, y: 540, width: 330, height: 48 },
		{ x: 2690, y: 780, width: 380, height: 48 },
		{ x: 3260, y: 1040, width: 450, height: 48 },
		{ x: 3860, y: 1320, width: 360, height: 48 },
		{ x: 4390, y: 1620, width: 440, height: 48 },
		{ x: 5030, y: 1960, width: 520, height: 48 },
	];
};

ParticleGroupInteractive.prototype.MakeParticle = function (program, scaleX, scaleY, zOffset, opacity) {
	var THREE = globalThis.THREE;
	var scene = globalThis.scene;
	var particle = new THREE.Particle(
		new THREE.ParticleCanvasMaterial({
			color: 0xffffff,
			program: program,
			transparent: true,
			opacity: opacity == null ? 1 : opacity,
		})
	);
	particle.scale.x = scaleX;
	particle.scale.y = scaleY;
	particle.position = new THREE.Vector3(this.positionCenter.x, this.positionCenter.y, this.positionCenter.z + zOffset);
	scene.add(particle);
	return particle;
};

ParticleGroupInteractive.prototype.BuildBackground = function () {
	var drawFarBlock = function (context) {
		context.fillStyle = '#e7ddd1';
		context.fillRect(-1, -1, 2, 2);
		context.fillStyle = '#f2ebe3';
		context.fillRect(-1, 0.35, 2, 0.65);
	};
	var drawNearBlock = function (context) {
		context.fillStyle = '#d3c5b7';
		context.fillRect(-1, -1, 2, 2);
		context.fillStyle = '#e8ded2';
		context.fillRect(-1, 0.55, 2, 0.45);
	};
	var drawCloud = function (context) {
		context.fillStyle = '#ffffff';
		context.beginPath();
		context.arc(-0.45, 0.05, 0.35, 0, Math.PI * 2, true);
		context.arc(0, 0.18, 0.45, 0, Math.PI * 2, true);
		context.arc(0.45, 0.02, 0.32, 0, Math.PI * 2, true);
		context.fill();
	};

	for (var i = -2; i < 12; i++) {
		this.backgroundObjects.push({
			x: i * 620,
			y: 160 + i * 120,
			parallax: 0.18,
			particle: this.MakeParticle(drawFarBlock, 190, 130, -220, 0.55),
		});
		this.backgroundObjects.push({
			x: i * 620 + 270,
			y: -40 + i * 145,
			parallax: 0.32,
			particle: this.MakeParticle(drawNearBlock, 125, 95, -160, 0.45),
		});
		this.backgroundObjects.push({
			x: i * 760 + 160,
			y: 270 + i * 155,
			parallax: 0.1,
			particle: this.MakeParticle(drawCloud, 95, 42, -260, 0.8),
		});
	}
};

ParticleGroupInteractive.prototype.BuildPlatformsVisuals = function () {
	var drawPlatform = function (context) {
		context.fillStyle = '#2f2a2a';
		context.fillRect(-1, -1, 2, 2);
		context.fillStyle = '#f97316';
		context.fillRect(-1, 0.68, 2, 0.32);
		context.fillStyle = 'rgba(255,255,255,0.22)';
		context.fillRect(-0.95, 0.68, 1.9, 0.08);
	};

	for (var i = 0; i < this.platforms.length; i++) {
		var platform = this.platforms[i];
		platform.particle = this.MakeParticle(drawPlatform, platform.width * 0.5, platform.height * 0.5, 0, 1);
		this.levelObjects.push(platform);
	}
};

ParticleGroupInteractive.prototype.BuildItems = function (flyer) {
	var drawItem = function (context) {
		context.fillStyle = '#ffffff';
		context.fillRect(-0.68, -0.68, 1.36, 1.36);
		context.strokeStyle = '#f97316';
		context.lineWidth = 0.14;
		context.strokeRect(-0.68, -0.68, 1.36, 1.36);
		context.fillStyle = '#f97316';
		context.fillRect(-0.22, -0.22, 0.44, 0.44);
	};

	for (var i = 0; i < flyer.length; i++) {
		var platform = this.platforms[Math.min(i + 1, this.platforms.length - 1)];
		var item = {
			x: platform.x + (i % 2 === 0 ? -platform.width * 0.22 : platform.width * 0.22),
			y: platform.y + platform.height * 0.5 + 86,
			size: 30,
			collected: false,
			target: flyer[i],
			particle: this.MakeParticle(drawItem, 17, 17, 35, 1),
		};
		this.items.push(item);
	}
};

ParticleGroupInteractive.prototype.BuildPlayer = function () {
	var self = this;
	var drawBlob = function (context) {
		var squash = self.player.grounded ? Math.min(Math.abs(self.player.vx) / 900, 0.12) : -0.08;
		context.save();
		context.scale(1 + squash, 1 - squash);
		context.fillStyle = '#111111';
		context.beginPath();
		context.arc(0, -0.05, 0.82, 0, Math.PI * 2, true);
		context.fill();
		context.fillStyle = '#ffffff';
		context.beginPath();
		context.arc(-0.25, 0.18, 0.12, 0, Math.PI * 2, true);
		context.arc(0.25, 0.18, 0.12, 0, Math.PI * 2, true);
		context.fill();
		context.fillStyle = '#111111';
		context.beginPath();
		context.arc(-0.21, 0.17, 0.045, 0, Math.PI * 2, true);
		context.arc(0.29, 0.17, 0.045, 0, Math.PI * 2, true);
		context.fill();
		context.restore();
	};

	this.playerParticle = this.MakeParticle(drawBlob, this.player.width * 0.62, this.player.height * 0.58, 60, 1);
};

ParticleGroupInteractive.prototype.BuildHud = function () {
	var self = this;
	var drawHud = function (context) {
		context.fillStyle = '#111111';
		context.textAlign = 'left';
		context.textBaseline = 'middle';
		context.font = '0.2pt TitleText';
		context.fillText(self.GetHudText(), -1, 0);
	};
	this.hudParticle = this.MakeParticle(drawHud, 260, 260, 80, 1);
};

ParticleGroupInteractive.prototype.GetHudText = function () {
	var collected = 0;
	for (var i = 0; i < this.items.length; i++) {
		if (this.items[i].collected) {
			collected++;
		}
	}
	if (this.collectionMessageTimer > 0 && this.collectionMessage) {
		return this.collectionMessage;
	}
	return 'items ' + collected + '/' + this.items.length + '   arrows: left right up';
};

ParticleGroupInteractive.prototype.SetKey = function (event, isDown) {
	if (+globalThis.sGroupCurrent !== +this.id) {
		return;
	}
	var key = event.key || '';
	var code = event.keyCode;
	var handled = false;
	if (key === 'ArrowLeft' || key === 'Left' || code === 37) {
		this.keys.left = isDown;
		handled = true;
	}
	else if (key === 'ArrowRight' || key === 'Right' || code === 39) {
		this.keys.right = isDown;
		handled = true;
	}
	else if (key === 'ArrowUp' || key === 'Up' || code === 38 || key === ' ') {
		if (isDown && !this.keys.up) {
			this.jumpQueued = true;
		}
		this.keys.up = isDown;
		handled = true;
	}
	if (handled) {
		event.preventDefault();
	}
};

ParticleGroupInteractive.prototype.GetTargetScrollX = function () {
	return this.player.x + this.viewWidth * 0.22;
};

ParticleGroupInteractive.prototype.GetTargetScrollY = function () {
	return this.player.y + this.viewHeight * 0.18;
};

ParticleGroupInteractive.prototype.MouseDown = function () {
};

ParticleGroupInteractive.prototype.AddParticle = function (aParticleObject) {
	this.particlesToUpdate.push(aParticleObject);
};

ParticleGroupInteractive.prototype.MouseUp = function () {
};

ParticleGroupInteractive.prototype.BackFromHTML = function () {
	this.cameraDistance = this.cameraDistanceNormal;
};

ParticleGroupInteractive.prototype.GetParticleThatLeadTo = function () {
	return null;
};

ParticleGroupInteractive.prototype.Init = function () {
	if (globalThis.cameraManager) {
		globalThis.cameraManager.SetControlMode(globalThis.sTools.CameraControlType.NONE);
		globalThis.cameraPosition = this.GetCameraPosition();
		globalThis.cameraTarget = this.positionCenter.clone();
	}
	globalThis.INTERSECTED = null;
};

ParticleGroupInteractive.prototype.Terminate = function () {
	this.keys.left = false;
	this.keys.right = false;
	this.keys.up = false;
	this.jumpQueued = false;
	globalThis.INTERSECTED = null;
};

ParticleGroupInteractive.prototype.Update = function (delta) {
	var sTools = globalThis.sTools;
	var cameraManager = globalThis.cameraManager;

	if (cameraManager && cameraManager.controlMode !== sTools.CameraControlType.NONE) {
		cameraManager.SetControlMode(sTools.CameraControlType.NONE);
	}

	this.UpdateViewMetrics();
	this.UpdatePhysics(delta);
	this.UpdateItems(delta);
	this.scrollX += (this.GetTargetScrollX() - this.scrollX) * Math.min(delta * 6, 1);
	this.scrollY += (this.GetTargetScrollY() - this.scrollY) * Math.min(delta * 6, 1);
	this.UpdateVisuals();
};

ParticleGroupInteractive.prototype.UpdatePhysics = function (delta) {
	var player = this.player;
	var move = (this.keys.right ? 1 : 0) - (this.keys.left ? 1 : 0);
	var acceleration = 1800;
	var maxSpeed = 360;
	var friction = Math.pow(0.0015, delta);
	var gravity = -1550;
	var jumpSpeed = 930;

	if (move !== 0) {
		player.vx += move * acceleration * delta;
	} else {
		player.vx *= friction;
	}
	player.vx = Math.max(Math.min(player.vx, maxSpeed), -maxSpeed);

	if (this.jumpQueued && player.grounded) {
		player.vy = jumpSpeed;
		player.grounded = false;
	}
	this.jumpQueued = false;

	player.vy += gravity * delta;

	var previousY = player.y;
	player.x += player.vx * delta;
	player.y += player.vy * delta;
	player.grounded = false;

	var halfWidth = player.width * 0.5;
	var halfHeight = player.height * 0.5;
	for (var i = 0; i < this.platforms.length; i++) {
		var platform = this.platforms[i];
		var platformTop = platform.y + platform.height * 0.5;
		var previousBottom = previousY - halfHeight;
		var currentBottom = player.y - halfHeight;
		var overlapsX =
			player.x + halfWidth > platform.x - platform.width * 0.5 &&
			player.x - halfWidth < platform.x + platform.width * 0.5;
		if (overlapsX && previousBottom >= platformTop && currentBottom <= platformTop && player.vy <= 0) {
			player.y = platformTop + halfHeight;
			player.vy = 0;
			player.grounded = true;
		}
	}

	if (player.y < this.scrollY - this.viewHeight) {
		this.ResetPlayer();
	}
};

ParticleGroupInteractive.prototype.ResetPlayer = function () {
	var firstPlatform = this.platforms[0];
	this.player.x = -260;
	this.player.y = firstPlatform.y + firstPlatform.height * 0.5 + this.player.height * 0.5;
	this.player.vx = 0;
	this.player.vy = 0;
	this.player.grounded = true;
	this.collectionMessage = 'try again';
	this.collectionMessageTimer = 1.2;
};

ParticleGroupInteractive.prototype.UpdateItems = function (delta) {
	if (this.collectionMessageTimer > 0) {
		this.collectionMessageTimer -= delta;
	}

	var player = this.player;
	var halfWidth = player.width * 0.5;
	var halfHeight = player.height * 0.5;
	for (var i = 0; i < this.items.length; i++) {
		var item = this.items[i];
		if (item.collected) {
			continue;
		}
		var halfItem = item.size * 0.5;
		var overlaps =
			player.x + halfWidth > item.x - halfItem &&
			player.x - halfWidth < item.x + halfItem &&
			player.y + halfHeight > item.y - halfItem &&
			player.y - halfHeight < item.y + halfItem;
		if (overlaps) {
			item.collected = true;
			item.particle.visible = false;
			this.collectionMessage = 'collected ' + item.target.name;
			this.collectionMessageTimer = 1.8;
		}
	}
};

ParticleGroupInteractive.prototype.UpdateVisuals = function () {
	var center = this.positionCenter;

	for (var i = 0; i < this.backgroundObjects.length; i++) {
		var back = this.backgroundObjects[i];
		back.particle.position.x = center.x + back.x - this.scrollX * back.parallax;
		back.particle.position.y = center.y + back.y - this.scrollY * back.parallax;
	}

	for (var p = 0; p < this.platforms.length; p++) {
		var platform = this.platforms[p];
		platform.particle.position.x = center.x + platform.x - this.scrollX;
		platform.particle.position.y = center.y + platform.y - this.scrollY;
	}

	for (var itemIndex = 0; itemIndex < this.items.length; itemIndex++) {
		var item = this.items[itemIndex];
		item.particle.visible = !item.collected;
		item.particle.position.x = center.x + item.x - this.scrollX;
		item.particle.position.y = center.y + item.y - this.scrollY;
	}

	this.playerParticle.position.x = center.x + this.player.x - this.scrollX;
	this.playerParticle.position.y = center.y + this.player.y - this.scrollY;

	this.hudParticle.position.x = center.x - this.viewWidth * 0.5 + 46;
	this.hudParticle.position.y = center.y + this.viewHeight * 0.5 - 48;
};
