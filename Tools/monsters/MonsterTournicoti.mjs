/**
 * Tournicoti navigation planet: rotating arms around a circle.
 */
import { PI2 } from '../Template.mjs';
import { PlanetParticle, inheritPlanetParticle } from './PlanetParticle.mjs';

export function MonsterTournicoti(aPosition, aSize, aTarget, aDrawParam, aStayAwake, aColor) {
	var that = this;
	var isdefined = globalThis.isdefined;

	PlanetParticle.call(this, aPosition, aSize, aTarget, {
		color: aColor,
		infoCircleRadius: aSize,
		distanceLastProject: 1.,
	});

	this.drawParam = aDrawParam;
	this.stayAwake = isdefined(aStayAwake) ? aStayAwake : false;

	var programLastProject = function (context) {
		var centerX = 0.;
		var centerY = 0.;
		context.lineWidth = 0.01;
		if (that.distanceLastProject > 0.01) {
			drawOneArmLastProject(context, Math.PI * 0);
			drawOneArmLastProject(context, Math.PI * 0.5);
			drawOneArmLastProject(context, Math.PI * 1.);
			drawOneArmLastProject(context, Math.PI * 1.5);
		}

		context.beginPath();
		context.arc(centerX, centerY, that.size, 0, PI2, true);
		context.closePath();
		context.stroke();
	};

	function drawOneArmLastProject(context, angle) {
		var px = Math.cos(angle) * that.size;
		var py = Math.sin(angle) * that.size;
		var lNumPt = 100;
		var theta = 0;
		context.beginPath();
		context.moveTo(px, py);

		for (var i = 0; i < lNumPt; i++) {
			theta += Math.sin(globalThis.sGeneralTimer * 1. + i / lNumPt * Math.PI * 2.227217823) * i * 0.01;

			var cos_t = Math.cos(theta + angle);
			var sin_t = Math.sin(theta + angle);

			px += cos_t * 0.02 * that.distanceLastProject * that.drawParam;
			py += sin_t * 0.02 * that.distanceLastProject * that.drawParam;

			context.lineTo(px, py);
		}
		context.stroke();
	}

	this.particle.material.program = programLastProject;
}

inheritPlanetParticle(MonsterTournicoti);

MonsterTournicoti.prototype.goToTarget = function () {
	var lProject = this.target;
	var isdefined = globalThis.isdefined;

	if (typeof lProject.targetHTML != 'undefined') {
		globalThis.CirclesToHtml(lProject.targetHTML);
	} else if (typeof lProject.targetURL != 'undefined') {
		globalThis.ImageFrontCtx.fillStyle = '#ffffff';
		var newURL = window.location.href.substring(0, window.location.href.indexOf('#')) + lProject.targetURL;
		globalThis.open_in_new_tab(newURL);
		if (isdefined(globalThis.ParticleGroups[globalThis.sGroupCurrent].BackFromHTML)) {
			globalThis.ParticleGroups[globalThis.sGroupCurrent].BackFromHTML();
		}
	} else if (typeof lProject.targetHTMLOpen != 'undefined') {
		globalThis.open_in_new_tab(lProject.targetHTMLOpen);
	} else if (isdefined(lProject.target)) {
		globalThis.GoToIndex(lProject.target);
	}
};

MonsterTournicoti.prototype.onMouseDown = function () {
	this.goToTarget();
};

MonsterTournicoti.prototype.Update = function (delta) {
	if (this.mouseOn) {
		this.distanceLastProject += 0.03;
		this.distanceLastProject = Math.min(1., this.distanceLastProject);
	} else {
		this.currentLastProjectString = this.target.name;
		if (!this.stayAwake) {
			this.distanceLastProject -= 0.005;
			this.distanceLastProject = Math.max(0, this.distanceLastProject);
		}
	}
};

globalThis.MonsterTournicoti = MonsterTournicoti;
