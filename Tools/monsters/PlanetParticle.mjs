/**
 * Base class for navigation planet particles (menu monsters).
 */
export function PlanetParticle(aPosition, aSize, aTarget, particleOptions = {}) {
	var that = this;

	this.target = aTarget;
	this.size = aSize;
	this.mouseOn = false;
	this.touched = false;
	this.distanceLastProject = particleOptions.distanceLastProject ?? 0.;
	this.currentLastProjectString = aTarget.name;

	var ParticleCircleNavigate = globalThis.ParticleCircleNavigate;
	var color = particleOptions.color;
	var putInfoInBack = particleOptions.putInfoInBack ?? false;
	var infoCircleRadius = particleOptions.infoCircleRadius ?? aSize;

	this.particle = new ParticleCircleNavigate(aPosition, aTarget, color, putInfoInBack, infoCircleRadius);

	if (particleOptions.scaleParticle !== false) {
		this.particle.scale.x *= 3.;
		this.particle.scale.y *= 3.;
	}

	this.particle.planetParticle = this;

	if (particleOptions.autonomous !== false) {
		this.particle.SetAutonomous(true);
	}

	this.particle.MyMouseOn = function () {
		that.onMouseOn();
	};

	this.particle.MyMouseOff = function () {
		that.onMouseOff();
	};

	this.particle.MyMouseDown = function () {
		that.onMouseDown();
	};

	this.particle.MyCameraDistance = function () {
		return window.innerWidth * 0.2;
	};

	this.info = this.particle.TargetObject.info;
}

/** World-space display radius (local canvas size × particle scale). */
PlanetParticle.prototype.getWorldRadius = function () {
	return this.size * this.particle.scale.x;
};

PlanetParticle.prototype.onMouseOn = function () {
	this.mouseOn = true;
};

PlanetParticle.prototype.onMouseOff = function () {
	this.mouseOn = false;
};

PlanetParticle.prototype.onMouseDown = function () {
	this.goToTarget();
};

PlanetParticle.prototype.goToTarget = function () {
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
		this.particle.MyMouseOff();
	}
};

export function inheritPlanetParticle(Child) {
	Child.prototype = Object.create(PlanetParticle.prototype);
	Child.prototype.constructor = Child;
}
