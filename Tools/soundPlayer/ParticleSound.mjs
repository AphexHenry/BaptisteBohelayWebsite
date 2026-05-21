/**
 * Sound particle: Web Audio playback + canvas visualization (replaces SoundManager2).
 *
 * Import named exports from this file in ES modules. For legacy pages that load classic
 * scripts in order, use registerParticleSoundGlobals.mjs (main site) or ParticleSound.classic.js.
 */
import {
	programDoNothing,
	programPauseStroke,
	programStroke,
	programTriangle,
	programTriangleStroke,
} from '../Template.mjs';

function ensureParticleSoundState() {
	if (!globalThis.sParticlesSound) globalThis.sParticlesSound = [];
	if (!globalThis.sWaveFormData) globalThis.sWaveFormData = [];
	if (!globalThis.sLengthLegsSound) globalThis.sLengthLegsSound = { left: 0, right: 0 };
	if (globalThis.sSoundAmplitude === undefined) globalThis.sSoundAmplitude = 0.;
}

ensureParticleSoundState();

export function getParticleSoundState() {
	return {
		sParticlesSound: globalThis.sParticlesSound,
		sWaveFormData: globalThis.sWaveFormData,
		sLengthLegsSound: globalThis.sLengthLegsSound,
		sSoundAmplitude: globalThis.sSoundAmplitude,
	};
}

function getSharedWebAudioContext() {
	var AC = window.AudioContext || window.webkitAudioContext;
	if (!AC) return null;
	if (!window.__lebaptisteAudioContext) {
		window.__lebaptisteAudioContext = new AC();
	}
	return window.__lebaptisteAudioContext;
}

/**
 * Playback + visualization without Flash: HTMLMediaElement + AnalyserNode (replaces SM2 waveformData / peakData).
 */
function createWebAudioSound(options) {
	var ctx = getSharedWebAudioContext();
	var audio = new Audio(options.url);
	/* Omit crossOrigin for same-origin files; set crossOrigin = 'anonymous' if URLs are on another origin with CORS. */
	audio.preload = 'auto';
	var vol = Math.min(1, Math.max(0, (options.volume * 120) / 100));
	audio.volume = vol;

	var analyser = null;
	var mediaSource = null;
	var graphConnected = false;
	var rafId = null;
	var playState = 0;
	var stopFired = false;

	function buildWaveformFromTimeData(dataArray, bufferLength) {
		var out = [];
		var leftAccum = 0;
		var rightAccum = 0;
		var useLeft = true;
		var i;
		for (i = 0; i < bufferLength; i += 2) {
			var v = (dataArray[i] - 128) / 128;
			out.push(v);
			if (useLeft) {
				leftAccum += Math.abs(v);
			} else {
				rightAccum += Math.abs(v);
			}
			useLeft = !useLeft;
		}
		var half = bufferLength / 2;
		return {
			waveform: out,
			left: leftAccum / half,
			right: rightAccum / half,
		};
	}

	function tickVisual() {
		if (playState !== 1 || !analyser) {
			return;
		}
		rafId = requestAnimationFrame(tickVisual);
		var bufferLength = analyser.fftSize;
		var dataArray = new Uint8Array(bufferLength);
		analyser.getByteTimeDomainData(dataArray);

		var nPeak = 0;
		for (var j = 0; j < 32; j++) {
			nPeak = Math.max(nPeak, Math.abs(dataArray[j] - 128) / 128);
		}
		globalThis.sSoundAmplitude = 0.9 + nPeak * 0.1;

		var packed = buildWaveformFromTimeData(dataArray, bufferLength);
		globalThis.sLengthLegsSound.left = globalThis.sLengthLegsSound.left * 0.9 + packed.left * 0.1;
		globalThis.sLengthLegsSound.right = globalThis.sLengthLegsSound.right * 0.9 + packed.right * 0.1;

		var w0 = parseFloat(dataArray[0]);
		var w10 = parseFloat(dataArray[10]);
		var w3 = parseFloat(dataArray[3]);
		if (Math.abs(w0 - 128) + Math.abs(w10 - 128) + Math.abs(w3 - 128) !== 0) {
			globalThis.sWaveFormData = packed.waveform;
		}
	}

	function connectGraph() {
		if (graphConnected || !ctx) return;
		mediaSource = ctx.createMediaElementSource(audio);
		analyser = ctx.createAnalyser();
		analyser.fftSize = 512;
		mediaSource.connect(analyser);
		analyser.connect(ctx.destination);
		graphConnected = true;
	}

	function cancelVisual() {
		if (rafId != null) {
			cancelAnimationFrame(rafId);
			rafId = null;
		}
	}

	function fireStopCallbacks() {
		if (stopFired) return;
		stopFired = true;
		if (typeof options.onPlaybackEnd === 'function') {
			options.onPlaybackEnd();
		}
	}

	function onPlaybackEnded() {
		playState = 0;
		cancelVisual();
		audio.removeEventListener('ended', onPlaybackEnded);
		fireStopCallbacks();
	}

	var sound = {
		play: function () {
			stopFired = false;
			playState = 1;
			audio.addEventListener('ended', onPlaybackEnded);
			if (ctx) {
				connectGraph();
				cancelVisual();
				rafId = requestAnimationFrame(tickVisual);
				ctx.resume().catch(function () {});
			}
			audio.play().catch(function () {});
			return sound;
		},
		stop: function () {
			audio.pause();
			audio.currentTime = 0;
			playState = 0;
			cancelVisual();
			audio.removeEventListener('ended', onPlaybackEnded);
			fireStopCallbacks();
			return sound;
		},
	};

	Object.defineProperty(sound, 'playState', {
		get: function () {
			return playState;
		},
	});

	return sound;
}

export function ParticleSound(aPositionHome, volume, aTargetObject) {
	var THREE = globalThis.THREE;
	var scene = globalThis.scene;
	var sWIDTH = globalThis.sWIDTH;
	var OPACITY_INFO = globalThis.OPACITY_INFO;
	var PickColor = globalThis.PickColor;
	var myRandom = globalThis.myRandom;
	var isdefined = globalThis.isdefined;

	this.name = aTargetObject.name;
	this.url = aTargetObject.url;

	var particle = new THREE.Particle(
		new THREE.ParticleCanvasMaterial({ color: PickColor(), program: programStroke, transparent: true })
	);
	particle.mParent = this;
	particle.position = aPositionHome.clone();
	particle.position.x += myRandom() * window.innerWidth * 0.05;
	particle.position.y += myRandom() * window.innerHeight * 0.05;

	this.mPositionCenter = particle.position.clone();

	var size = 2;
	if (aTargetObject.size) {
		size = aTargetObject.size;
	} else {
		aTargetObject.size = size;
	}

	var infoText = [];
	infoText.push({ string: this.name, size: 2 });
	var drawInfoText = function (context, text) {
		context.fillStyle = '#000000';
		context.textAlign = 'left';
		context.textBaseline = 'middle';

		for (var lineIndex = 0; lineIndex < text.length; lineIndex++) {
			if (!isdefined(text[lineIndex].size)) {
				return;
			}
			context.font = text[lineIndex].size + 'pt TitleText';
			context.fillText(text[lineIndex].string, 1.25, 0);
		}
	};
	var programText = function (context) {
		drawInfoText(context, infoText);
	};

	var info = new THREE.Particle(
		new THREE.ParticleCanvasMaterial({
			color: PickColor(),
			program: programText,
			transparent: true,
			opacity: OPACITY_INFO,
		})
	);
	info.position = new THREE.Vector3(particle.position.x + sWIDTH, particle.position.y, particle.position.z);
	info.visible = false;

	particle.scale.x = particle.scale.y = 3 * sWIDTH * 0.07 * size;
	info.scale.x = particle.scale.x * 0.3;
	info.scale.y = -info.scale.x;
	aTargetObject.info = info;
	particle.TargetObject = aTargetObject;
	this.mParticle = particle;

	this.particleClear = new THREE.Particle(
		new THREE.ParticleCanvasMaterial({
			color: Math.random() * 0x808080 + 0x808080,
			program: programDoNothing,
			opacity: 0,
		})
	);
	var width = window.innerWidth * 1.5;
	this.particleClear.scale.x = this.particleClear.scale.y = 4 * width * 0.05;
	scene.add(this.particleClear);
	this.particleClear.position = info.position;
	particle.TargetObject.particleClear = this.particleClear;

	this.mPosition = particle.position;
	this.mSpeed = new THREE.Vector2();
	this.mSpeedTimer = 0.;
	this.mAngleDecay = Math.random() * Math.PI * 2.;

	this.amplifier = 0.;

	globalThis.sParticlesSound.push(this);
	this.volume = volume;

	particle.play = function () {
		this.mParent.sound.play();
		this.material.program = programPauseStroke;
	};

	particle.stop = function () {
		this.mParent.sound.stop();
		this.material.program = programTriangleStroke;
	};

	particle.MyMouseOn = function (intersect) {
		if (isdefined(this.mParent.sound)) {
			if (this.mParent.sound.playState == 0) {
				this.material.program = programTriangle;
			} else {
				this.material.program = programPauseStroke;
			}
		} else {
			this.material.program = programTriangle;
		}
	};

	particle.MyMouseOff = function (intersect) {
		this.material.program = programTriangleStroke;
	};

	particle.MyMouseDown = function () {
		var sFoodArraySound = globalThis.sFoodArraySound;
		var sFoodArraySoundWait = globalThis.sFoodArraySoundWait;
		var sPlayingSound = globalThis.sPlayingSound;

		if (!isdefined(this.mParent.sound)) {
			this.mParent.InitSound();
		}
		if (this.mParent.sound.playState == 0) {
			sFoodArraySound.push(this);
			for (var i = 0; i < sFoodArraySoundWait.length; i++) {
				if (sFoodArraySoundWait[i] == this) {
					sFoodArraySoundWait.splice(i, 1);
				}
			}
			if (sPlayingSound) {
				sPlayingSound.particle.stop();
			}
		} else {
			this.mParent.sound.stop();
		}
	};

	particle.SetPosition = function (aPosition) {
		particle.position = aPosition;
		particle.TargetObject.particleClear.position = aPosition;
		particle.TargetObject.info.position = new THREE.Vector3(aPosition.x + sWIDTH * 0.3, aPosition.y, aPosition.z);
	};

	particle.SetTextEnabled = function (aIsEnabled) {
		if (aIsEnabled) {
			this.material.program = programTriangleStroke;
			this.TargetObject.info.visible = true;
		} else {
			this.material.program = programStroke;
			this.TargetObject.info.visible = false;
		}
	};

	particle.Update = function (delta) {
		particle.mParent.Update(delta);
	};

	particle.Delete = function () {
		scene.remove(particle);
		scene.remove(particle.TargetObject.particleClear);
		scene.remove(particle.TargetObject.info);
		delete this;
	};

	scene.add(particle);
	scene.add(info);
	return particle;
}

ParticleSound.prototype.Update = function (delta) {
	var isdefined = globalThis.isdefined;

	if (isdefined(this.sound)) {
		if (this.sound.playState > 0) {
			return;
		}
	}

	this.mSpeedTimer += delta * 0.5;
	this.mParticle.position.x += this.mSpeed.x * delta;
	this.mParticle.position.y += this.mSpeed.y * delta;
	this.mSpeed.x +=
		globalThis.myRandom() * delta +
		Math.cos(this.mSpeedTimer + this.mAngleDecay) * 0.2 +
		(3.5 * (this.mPositionCenter.x - this.mParticle.position.x)) / window.innerWidth;
	this.mSpeed.y +=
		globalThis.myRandom() * delta +
		Math.sin(this.mSpeedTimer + this.mAngleDecay) * 0.2 +
		(3.5 * (this.mPositionCenter.y - this.mParticle.position.y)) / window.innerWidth;
	this.mSpeed.multiplyScalar(0.98);

	this.mParticle.SetPosition(this.mPosition);
};

ParticleSound.prototype.InitSound = function () {
	var sFoodArraySoundWait = globalThis.sFoodArraySoundWait;
	var sFoodArraySound = globalThis.sFoodArraySound;
	var sPlayingSound = globalThis.sPlayingSound;
	var sMonsterSound = globalThis.sMonsterSound;

	this.sound = createWebAudioSound({
		url: this.url,
		volume: this.volume,
		onPlaybackEnd: function () {
			sFoodArraySoundWait.push(sPlayingSound.particle);
			sFoodArraySound.splice(0, 1);
			sMonsterSound.mParent.RemoveSound();
		},
	});
};
