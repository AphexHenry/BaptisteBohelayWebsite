/**
 * Sounds navigation planet: noisy circle outline.
 */
import { PI2 } from '../Template.mjs';
import { PlanetParticle, inheritPlanetParticle } from './PlanetParticle.mjs';

export function MonsterNoise(aPosition, aSize, aTarget) {
	var that = this;

	PlanetParticle.call(this, aPosition, aSize, aTarget);

	var programThis = function (context) {
		context.lineWidth = 0.015;
		context.beginPath();
		if (that.distanceLastProject < 0.01) {
			var centerX = 0.;
			var centerY = 0.;
			context.lineWidth = 0.01;
			context.arc(centerX, centerY, that.size, 0, PI2, true);
		} else {
			var nunPt = 100;
			var radius = that.size;
			var angleDecay = 2 * Math.PI / (nunPt + 1);
			context.moveTo(that.distanceLastProject * (myRandom() * 0.01 + Math.cos(globalThis.sGeneralTimer * 20) * 0.015) + that.size, 0);
			for (var i = 0; i < nunPt; i++) {
				radius = that.distanceLastProject * (myRandom() * 0.01 + Math.cos(globalThis.sGeneralTimer * 20 + angleDecay * i * 16 * Math.cos(globalThis.sGeneralTimer)) * 0.015) + that.size;
				context.lineTo(radius * Math.cos(angleDecay * i), radius * Math.sin(angleDecay * i));
			}
		}
		context.closePath();
		context.stroke();
	};

	this.particle.material.program = programThis;
}

inheritPlanetParticle(MonsterNoise);

MonsterNoise.prototype.Update = function (delta) {
	if (this.mouseOn) {
		this.distanceLastProject += 0.03;
		this.distanceLastProject = Math.min(1., this.distanceLastProject);
		this.info.material.opacity += 0.01;
		this.info.material.opacity = Math.min(1., this.info.material.opacity);
	} else {
		this.currentLastProjectString = this.target.name;
		this.distanceLastProject -= 0.01;
		this.distanceLastProject = Math.max(0, this.distanceLastProject);
		this.info.material.opacity -= 0.01;
		this.info.material.opacity = Math.max(globalThis.OPACITY_INFO, this.info.material.opacity);
	}
};

globalThis.MonsterNoise = MonsterNoise;
