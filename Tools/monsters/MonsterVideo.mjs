/**
 * Comics navigation planet: circle with opening eyelids.
 */
import { PI2 } from '../Template.mjs';
import { PlanetParticle, inheritPlanetParticle } from './PlanetParticle.mjs';

export function MonsterVideo(aPosition, aSize, aTarget) {
	var that = this;
	that.timer = 0;

	PlanetParticle.call(this, aPosition, aSize, aTarget);

	var programThis = function (context) {
		context.lineWidth = 0.015 + that.distanceLastProject * 0.1;
		context.beginPath();

		var centerX = 0.;
		var centerY = 0.;
		context.lineWidth = 0.02 + that.distanceLastProject * 0.01;
		context.arc(centerX, centerY, that.size, 0, PI2, true);
		context.closePath();
		context.stroke();
		if (that.distanceLastProject > 0.01) {
			context.beginPath();
			var lY = 0.;
			var coeffOpen = (1.0 - (that.distanceLastProject * 0.5));
			context.moveTo(-that.size, -lY);
			context.bezierCurveTo(-0.7 * that.size, that.size * 1.4 - lY, 0.7 * that.size, that.size * 1.4 - lY, that.size, -lY);
			context.bezierCurveTo(0.7 * that.size, that.size * 1.4 * coeffOpen, -0.7 * that.size, that.size * 1.4 * coeffOpen, -that.size, 0);

			context.closePath();
			context.fill();

			context.moveTo(-that.size, lY);
			context.bezierCurveTo(-0.7 * that.size, -that.size * 1.4 + lY, 0.7 * that.size + lY, -that.size * 1.4, that.size, lY);
			context.bezierCurveTo(0.7 * that.size, -that.size * 1.4 * coeffOpen, -0.7 * that.size, -that.size * 1.4 * coeffOpen, -that.size, lY);

			context.closePath();
			context.fill();
			that.timer += 0.01 * (0.5 + Math.abs(Math.sin(globalThis.sGeneralTimer)) * Math.abs(Math.sin(globalThis.sGeneralTimer * 0.1)));
			var xmove = Math.cos(that.timer * 2.) * Math.sin(globalThis.sGeneralTimer);
			// xmove *= xmove * xmove;
			centerX = 0.17 * xmove;
			centerY = - 0.1 * (1 + Math.sin(that.timer)) * 0.5 - 0.01;

			context.beginPath();
			context.arc(centerX, centerY, that.size * aSize * that.distanceLastProject, 0, PI2, true);
			context.closePath();
			context.fill();
		}
	};

	this.particle.material.program = programThis;
}

inheritPlanetParticle(MonsterVideo);

MonsterVideo.prototype.Update = function (delta) {
	if (this.mouseOn) {
		this.distanceLastProject += 0.07;
		this.distanceLastProject = Math.min(1., this.distanceLastProject);
		this.info.material.opacity += 0.01;
		this.info.material.opacity = Math.min(1., this.info.material.opacity);
	} else {
		this.currentLastProjectString = this.target.name;
		this.distanceLastProject -= 0.05;
		this.distanceLastProject = Math.max(0, this.distanceLastProject);
		this.info.material.opacity -= 0.01;
		this.info.material.opacity = Math.max(globalThis.OPACITY_INFO, this.info.material.opacity);
	}
};

globalThis.MonsterVideo = MonsterVideo;
