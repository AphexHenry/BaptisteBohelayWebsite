/**
 * Navigate bubble with ring + floating label (THREE.CanvasRenderer particles).
 * Template programs come from ES modules; Three / scene / helpers stay on globalThis for now.
 */
import { programDoNothing, programStroke } from './Template.mjs';

export function ParticleCircleNavigate(position, aTargetObject, aColor, putInfoInBack = false) {
	var THREE = globalThis.THREE;
	var scene = globalThis.scene;
	var sWIDTH = globalThis.sWIDTH;
	var OPACITY_INFO = globalThis.OPACITY_INFO;
	var PickColor = globalThis.PickColor;
	var isdefined = globalThis.isdefined;

	this.name = aTargetObject.name;
	this.subTitle = aTargetObject.subTitle;

	var strokeColor = isdefined(aColor) ? aColor : PickColor();
	var particle = new THREE.Particle(
		new THREE.ParticleCanvasMaterial({ color: strokeColor, program: programStroke, transparent: true })
	);

	particle.position = position;

	var size = 1;
	if (aTargetObject.size) {
		size = aTargetObject.size;
	} else {
		aTargetObject.size = 1.;
	}

	var lScaleCoeff = 1.;
	if (isdefined(aTargetObject.scale)) {
		lScaleCoeff = aTargetObject.scale;
	}

	var BuildInfoText = function (aName, aSubTitle) {
		var text = [];
		text.push({ string: aName, size: 2 });
		if (isdefined(aSubTitle) && String(aSubTitle).length > 0) {
			text.push({ string: aSubTitle, size: 1.15 });
		}
		return text;
	};

	var infoText = BuildInfoText(this.name, this.subTitle);

	var DrawInfoText = function (context, text) {
		var totalHeight = 0;
		var lineHeights = [];
		for (var lineIndex = 0; lineIndex < text.length; lineIndex++) {
			if (!isdefined(text[lineIndex].size)) {
				return;
			}
			lineHeights[lineIndex] = text[lineIndex].size * 1.6;
			totalHeight += lineHeights[lineIndex];
		}

		context.fillStyle = '#000000';
		context.textAlign = 'left';
		context.textBaseline = 'middle';

		var y = -totalHeight * 0.5;
		for (var drawIndex = 0; drawIndex < text.length; drawIndex++) {
			y += lineHeights[drawIndex] * 0.5;
			context.font = text[drawIndex].size + 'pt TitleText';
			context.fillText(text[drawIndex].string, 4, y);
			y += lineHeights[drawIndex] * 0.5;
		}
	};

	var programText = function (context) {
		DrawInfoText(context, infoText);
	};

	var infoColor = isdefined(aColor) ? aColor : PickColor();
	var info = new THREE.Particle(
		new THREE.ParticleCanvasMaterial({
			color: infoColor,
			program: programText,
			transparent: true,
			opacity: OPACITY_INFO,
		})
	);
	info.position = new THREE.Vector3(particle.position.x, particle.position.y, particle.position.z + (putInfoInBack ? -10.5 : 0));

	particle.scale.x = particle.scale.y = 3 * sWIDTH * 0.07 * size * lScaleCoeff;
	info.scale.x = particle.scale.x * 0.3;
	info.scale.y = -info.scale.x;
	aTargetObject.info = info;
	particle.TargetObject = aTargetObject;

	this.particleClear = new THREE.Particle(
		new THREE.ParticleCanvasMaterial({
			color: Math.random() * 0x808080 + 0x808080,
			program: programDoNothing,
			opacity: 0,
		})
	);
	var width = window.innerWidth * 1.5;
	this.particleClear.scale.x = this.particleClear.scale.y = 4 * width * 0.05 * lScaleCoeff;
	scene.add(this.particleClear);
	this.particleClear.position = info.position;
	particle.TargetObject.particleClear = this.particleClear;

	particle.SetPosition = function (aPosition) {
		particle.position = aPosition;
		particle.TargetObject.particleClear.position = aPosition;
		particle.TargetObject.info.position = new THREE.Vector3(aPosition.x, aPosition.y, aPosition.z + (putInfoInBack ? -10.5 : 0));
	};

	particle.SetName = function (aName, aSubTitle) {
		infoText = BuildInfoText(aName, aSubTitle);
	};

	particle.SetAutonomous = function (aValue) {
		particle.TargetObject.isAutonomous = aValue;
	};

	particle.Delete = function () {
		scene.remove(particle);
		scene.remove(particle.TargetObject.particleClear);
		scene.remove(particle.TargetObject.info);
		delete this;
	};

	particle.GetInfo = function () {
		return particle.TargetObject.info;
	};

	particle.SetTextVisible = function (aVisible) {
		this.TargetObject.info.visible = aVisible;
		this.TargetObject.info.particleClear = aVisible;
	};

	scene.add(particle);
	scene.add(info);
	particle.SetTextVisible(false);
	return particle;
}

globalThis.ParticleCircleNavigate = ParticleCircleNavigate;
