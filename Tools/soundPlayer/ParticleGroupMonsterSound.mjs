/**
 * Sound-monster particle group: food bubbles + camera / interaction for the sound player scene.
 *
 * Import named exports from this file in ES modules. For legacy pages that load classic
 * scripts in order, use registerParticleGroupMonsterSoundGlobals.mjs (main site) or
 * ParticleGroupMonsterSound.js.
 */
import { programDoNothing } from '../Template.mjs';
import { ParticleSound } from './ParticleSound.mjs';

function ensureParticleGroupMonsterSoundState() {
	globalThis.sFoodArraySoundWait = [];
}

ensureParticleGroupMonsterSoundState();

export function AddLeg() {
	var THREE = globalThis.THREE;
	var myRandom = globalThis.myRandom;
	var sLegArray = globalThis.sLegArray;

	sLegArray.push({
		angle: 0,
		random: myRandom(),
		state: 0,
		posHandCurrent: new THREE.Vector2(),
		posHandTarget: new THREE.Vector2(),
		posHandInit: new THREE.Vector2(),
		coeffMove: 1,
		gotObject: null,
		speed: 0.9 + Math.random() * 0.2,
	});
	for (var i = 0; i < sLegArray.length; i++) {
		sLegArray[i].angle = (i * Math.PI * 2) / sLegArray.length;
	}
}

export function ParticleGroupMonsterSound(positionCenter, name) {
	var THREE = globalThis.THREE;
	var MonsterSound = globalThis.MonsterSound;

	this.width = window.innerWidth * 0.3;
	this.cameraDistance = this.width * 3.;
	this.positionCenter = positionCenter;
	this.name = name;
	this.timer = 0;

	this.monster = new MonsterSound(
		new THREE.Vector3(positionCenter.x, positionCenter.y - window.innerHeight * 1.05, positionCenter.z),
		this.width * 2
	);
	this.InitFood(this.width);
	this.InitSurface(this.width);
}

ParticleGroupMonsterSound.prototype.InitSurface = function (width) {
	var THREE = globalThis.THREE;
	var scene = globalThis.scene;

	var particleClear = new THREE.Particle(
		new THREE.ParticleCanvasMaterial({
			color: Math.random() * 0x808080 + 0x808080,
			program: programDoNothing,
			opacity: 0,
		})
	);
	var surfaceWidth = window.innerWidth * 1.3;
	particleClear.scale.x = particleClear.scale.y = surfaceWidth;
	particleClear.position = this.positionCenter.clone();
	scene.add(particleClear);

	this.plane = new THREE.Mesh(
		new THREE.PlaneGeometry(2000, 2000, 8, 8),
		new THREE.MeshBasicMaterial({ color: 0x000000, opacity: 0.25, transparent: true, wireframe: true })
	);
	this.plane.geometry.applyMatrix(new THREE.Matrix4().makeRotationX(Math.PI / 2));
	this.plane.visible = false;
	this.plane.position = this.positionCenter;
	scene.add(this.plane);
};

ParticleGroupMonsterSound.prototype.InitFood = function (aName, position, size, url) {
	var THREE = globalThis.THREE;

	var rowSpacing = window.innerHeight * 0.2;
	var colTopY = this.positionCenter.y + window.innerHeight * 0.8;
	var leftX = this.positionCenter.x - window.innerWidth * 1;
	var rightX = this.positionCenter.x - window.innerWidth * .5;
	var z = this.positionCenter.z;

	this.positionHomeMonsters = [];
	this.positionHomeMonsters[0] = {
		pos: new THREE.Vector3(leftX, colTopY, z),
		name: 'sound monsters',
	};
	this.AddFood('tripouille', new THREE.Vector3(leftX, colTopY, z), 1., 'data/sound/Monsters/Tripouille.mp3', 0.7);
	this.AddFood('elevator song', new THREE.Vector3(leftX, colTopY - rowSpacing, z), 1., 'data/sound/Monsters/ElevatorSong.mp3', 1.);
	this.AddFood('raw cut', new THREE.Vector3(leftX, colTopY - rowSpacing * 2, z), 1., 'data/sound/Monsters/RawCut.mp3', 0.4);
	this.AddFood('good bye Rowan', new THREE.Vector3(leftX, colTopY - rowSpacing * 3, z), 1., 'data/sound/Monsters/GoodByeRowan.mp3', 1.2);

	this.positionHomeMonsters[1] = {
		pos: new THREE.Vector3(rightX, colTopY, z),
		name: "lulu's soundtrack",
	};
	this.AddFood('bycicle', new THREE.Vector3(rightX, colTopY, z), 1., 'data/sound/Lulu/bycicle.mp3', 1.);
	this.AddFood('theatre', new THREE.Vector3(rightX, colTopY - rowSpacing, z), 1., 'data/sound/Lulu/intro.mp3', 1.);
	this.AddFood('love', new THREE.Vector3(rightX, colTopY - rowSpacing * 2, z), 1., 'data/sound/Lulu/love.mp3', 1.);
	this.AddFood('morvan', new THREE.Vector3(rightX, colTopY - rowSpacing * 3, z), 1., 'data/sound/Lulu/morvan.mp3', 1.);
	this.AddFood('yokais', new THREE.Vector3(rightX, colTopY - rowSpacing * 4, z), 1., 'data/sound/Lulu/musicAphex3.mp3', 1.);
	this.AddFood('raclement', new THREE.Vector3(rightX, colTopY - rowSpacing * 5, z), 1., 'data/sound/Lulu/raclement.mp3', 1.);
	this.AddFood('scutigerus', new THREE.Vector3(rightX, colTopY - rowSpacing * 6, z), 1., 'data/sound/Lulu/tripouille.mp3', 1.);
};

ParticleGroupMonsterSound.prototype.AddFood = function (aName, position, size, url, volume) {
	var THREE = globalThis.THREE;
	var scene = globalThis.scene;
	var sFoodArraySoundWait = globalThis.sFoodArraySoundWait;

	var lPosition = position.clone();
	lPosition.z = this.positionCenter.z;
	var targetObject = { name: aName, url: url };
	var particle = new ParticleSound(lPosition, volume, targetObject);

	particle.scaleInit = particle.scale.x;
	particle.isMovable = true;
	particle.isEaten = false;
	particle.mSpeed = new THREE.Vector3();
	scene.add(particle);
	sFoodArraySoundWait.push(particle);
	return particle;
};

ParticleGroupMonsterSound.prototype.Init = function () {
	var sFoodArraySoundWait = globalThis.sFoodArraySoundWait;

	for (var i = 0; i < sFoodArraySoundWait.length; i++) {
		sFoodArraySoundWait[i].SetTextEnabled(true);
	}
};

ParticleGroupMonsterSound.prototype.MouseUp = function () {
	globalThis.SELECTED = false;
};

ParticleGroupMonsterSound.prototype.MouseDown = function () {
	var THREE = globalThis.THREE;
	var projector = globalThis.projector;
	var camera = globalThis.camera;
	var mouse = globalThis.mouse;
	var sFoodArraySound = globalThis.sFoodArraySound;
	var sPlayingSound = globalThis.sPlayingSound;

	if (globalThis.INTERSECTED) {
		globalThis.INTERSECTED.MyMouseDown();
		globalThis.SELECTED = globalThis.INTERSECTED;
	} else {
		globalThis.SELECTED = null;
	}

	if (sFoodArraySound.length > 0 && sPlayingSound) {
		var vector = new THREE.Vector3(mouse.x, mouse.y, 0.5);
		projector.unprojectVector(vector, camera);

		var ray = new THREE.Ray(camera.position, vector.subSelf(camera.position).normalize());

		if (ray.intersectObject(sFoodArraySound[0]).length > 0) {
			sPlayingSound.particle.MyMouseDown();
			return;
		}
	}
};

ParticleGroupMonsterSound.prototype.UpdateCamera = function (delta) {
	var sPlayingSound = globalThis.sPlayingSound;

	// if (sPlayingSound) {
		// this.timer += delta * 0.2;
		// this.cameraDistance = window.innerWidth * 0.4;
	// } else {
		this.timer = 0.;
		this.cameraDistance = window.innerWidth * 0.99;
	// }
	globalThis.cameraTarget = this.positionCenter;
	globalThis.cameraPosition.x = this.positionCenter.x + Math.sin(this.timer) * this.cameraDistance;
	globalThis.cameraPosition.y = this.positionCenter.y + Math.sin(this.timer) * this.cameraDistance;
	globalThis.cameraPosition.z = this.positionCenter.z + this.cameraDistance * Math.cos(this.timer);
};

ParticleGroupMonsterSound.prototype.UpdateFood = function (delta) {
	var sFoodArraySoundWait = globalThis.sFoodArraySoundWait;
	var sFoodArraySound = globalThis.sFoodArraySound;

	for (var i = 0; i < sFoodArraySoundWait.length; i++) {
		sFoodArraySoundWait[i].Update(delta);
	}

	for (var i = 0; i < sFoodArraySound.length; i++) {
		sFoodArraySound[i].Update(delta);
	}
};

ParticleGroupMonsterSound.prototype.SwitchNextState = function () {
	globalThis.sCurrentResumeSate = globalThis.ResumeStates.IDLE;
};

ParticleGroupMonsterSound.prototype.Update = function (delta) {
	var THREE = globalThis.THREE;
	var projector = globalThis.projector;
	var camera = globalThis.camera;
	var mouse = globalThis.mouse;
	var sFoodArraySoundWait = globalThis.sFoodArraySoundWait;
	var sFoodArraySound = globalThis.sFoodArraySound;
	var sPlayingSound = globalThis.sPlayingSound;

	globalThis.cameraManager.SetControlMode(globalThis.sTools.CameraControlType.NONE);
	this.UpdateCamera(delta);

	this.UpdateFood(delta);

	this.monster.Update(delta);

	this.UpdateIntersectPlane();

	var vector = new THREE.Vector3(mouse.x, mouse.y, 0.5);
	projector.unprojectVector(vector, camera);

	var ray = new THREE.Ray(camera.position, vector.subSelf(camera.position).normalize());

	var intersects = ray.intersectObjects(sFoodArraySoundWait);

	if (intersects.length > 0) {
		globalThis.INTERSECTED = intersects[0].object;
		globalThis.INTERSECTED.MyMouseOn();
	} else {
		if (sFoodArraySound.length > 0 && sPlayingSound) {
			if (ray.intersectObject(sFoodArraySound[0]).length > 0) {
				sPlayingSound.particle.MyMouseOn();
				return;
			}
		}
		if (sPlayingSound) {
			sPlayingSound.particle.MyMouseOff();
		}
		if (globalThis.INTERSECTED) {
			globalThis.INTERSECTED.MyMouseOff();
			globalThis.INTERSECTED = null;
		}
	}
};

ParticleGroupMonsterSound.prototype.Terminate = function () {
	var sFoodArraySoundWait = globalThis.sFoodArraySoundWait;

	globalThis.infoDisplay.FadeOut();
	setTimeout(function () {
		for (var i = 0; i < sFoodArraySoundWait.length; i++) {
			sFoodArraySoundWait[i].SetTextEnabled(false);
		}
	}, 1000);
};

ParticleGroupMonsterSound.prototype.UpdateIntersectPlane = function () {
	var THREE = globalThis.THREE;
	var mouse = globalThis.mouse;

	var i = mouse.x < 0 ? 0 : 1;
	if (Math.abs(mouse.x) < 0.3) {
		globalThis.infoDisplay.FadeOut();
		return;
	}

	globalThis.infoDisplay.SetSize(4.5);
	globalThis.infoDisplay.SetText([{ string: this.positionHomeMonsters[i].name, size: 2 }]);
	globalThis.infoDisplay.SetPosition(
		new THREE.Vector3(
			this.positionHomeMonsters[i].pos.x - innerWidth * 0.3,
			this.positionHomeMonsters[i].pos.y + innerWidth * 0.2,
			this.positionHomeMonsters[i].pos.z
		),
		true
	);
	globalThis.infoDisplay.FadeTo(0.1);
};
