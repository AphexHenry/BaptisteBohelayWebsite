/**
 * Interactive projects navigation planet: circle with horizontal slices.
 */
import { PI2 } from '../Template.mjs';
import { PlanetParticle, inheritPlanetParticle } from './PlanetParticle.mjs';

export function MonsterProjects(aPosition, aSize, aTarget) {
	var that = this;

	PlanetParticle.call(this, aPosition, aSize, aTarget, { scaleParticle: false });

	this.circleArray = [];
	for (var i = 0; i < 6; i++) {
		this.circleArray.push(i / 8);
	}

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
			for (var i = 0; i < that.circleArray.length; i++) {
				var advance = (that.circleArray[i] * globalThis.sGeneralTimer * 0.7 % 1);
				var y = advance * that.size;
				var width = Math.sqrt((that.size * that.size) - (y * y));
				width *= that.distanceLastProject;

				context.beginPath();
				context.moveTo(-width, y);
				context.lineTo(width, y);
				context.stroke();

				context.beginPath();
				context.moveTo(-width, -y);
				context.lineTo(width, -y);
				context.stroke();
			}
		}
	};

	this.particle.material.program = programThis;
}

inheritPlanetParticle(MonsterProjects);

MonsterProjects.prototype.Update = function (delta) {
	if (this.mouseOn) {
		this.distanceLastProject += 0.04;
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

globalThis.MonsterProjects = MonsterProjects;
