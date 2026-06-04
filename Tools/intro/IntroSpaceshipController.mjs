/**
 * Single intro spaceship shared across particle groups.
 * On navigation: stash off-screen during the camera move, then enter from bottom-left at the group's z.
 */
import { IntroSpaceship, getViewPlaneBasis } from './IntroSpaceship.mjs';

var REVEAL_DELAY = 1.5;
var PLAYFIELD_CENTER_LERP_SPEED = 0.65;

function smoothstep(t) {
	return t * t * (3 - 2 * t);
}

function getPlayfieldCenter(group) {
	if (!group) {
		return null;
	}
	if (typeof group.GetSpaceshipPlayfieldCenter === 'function') {
		return group.GetSpaceshipPlayfieldCenter();
	}
	if (group.NavigatorsCenter) {
		return group.NavigatorsCenter.clone();
	}
	if (typeof group.GetMenuPositionCenter === 'function') {
		return group.GetMenuPositionCenter();
	}
	return group.positionCenter.clone();
}

function getPlayfieldZ(group, center) {
	if (typeof group.GetSpaceshipPlayfieldZ === 'function') {
		return group.GetSpaceshipPlayfieldZ();
	}
	return center.z;
}

function getGravityBodies(group) {
	if (!group) {
		return [];
	}
	if (typeof group.GetSpaceshipGravityBodies === 'function') {
		return group.GetSpaceshipGravityBodies();
	}
	var bodies = [];
	if (!group.particles) {
		return bodies;
	}
	for (var i = 0; i < group.particles.length; i++) {
		var particle = group.particles[i];
		var target = particle.TargetObject || {};
		bodies.push({
			x: particle.position.x,
			y: particle.position.y,
			z: particle.position.z,
			mass: target.size || 1,
		});
	}
	return bodies;
}

export const introSpaceshipController = {
	spaceship: null,
	activeGroup: null,
	playfieldCenter: null,
	playfieldCenterTarget: null,
	playfieldCenterFrom: null,
	playfieldLerp: 1,
	hidden: false,
	revealTimer: 0,

	init(introGroup) {
		var THREE = globalThis.THREE;
		var size = introGroup.width * 0.18;
		this.spaceship = new IntroSpaceship(new THREE.Vector3(), size);
		this.activeGroup = introGroup;
	},

	onGroupWillChange(group) {
		if (!this.spaceship) {
			return;
		}
		this.stashOffScreen(group);
		this.hidden = true;
		this.revealTimer = REVEAL_DELAY;
	},

	onGroupDidChange(group, immediate) {
		this.activeGroup = group;
		this.playfieldCenterTarget = getPlayfieldCenter(group);
		if (!this.playfieldCenterTarget) {
			return;
		}
		this.playfieldCenterFrom = this.playfieldCenterTarget.clone();
		this.playfieldCenterFrom.x -= window.innerWidth * 0.12;
		this.playfieldCenterFrom.y += window.innerHeight * 0.05;
		this.playfieldCenter = this.playfieldCenterFrom.clone();
		this.playfieldLerp = 0;

		if (immediate) {
			this.hidden = false;
			this.revealTimer = 0;
			this.playfieldLerp = 1;
			this.playfieldCenter = this.playfieldCenterTarget.clone();
			this.placeAtBottomLeft(group);
			return;
		}
		this.hidden = true;
		this.revealTimer = REVEAL_DELAY;
		this.stashOffScreen(group);
	},

	stashOffScreen(group) {
		var center = getPlayfieldCenter(group);
		if (!center) {
			return;
		}
		var anchor = center.clone();
		anchor.z = getPlayfieldZ(group, center);
		var basis = getViewPlaneBasis(anchor);
		this.spaceship.setPlaneOffset(anchor, basis, -window.innerWidth * 0.95, -window.innerHeight * 0.55);
		this.spaceship.speed = { x: 0, y: 0 };
		this.spaceship._basisRight = null;
		this.spaceship._basisUp = null;
	},

	placeAtBottomLeft(group) {
		var center = this.playfieldCenter || getPlayfieldCenter(group);
		if (!center) {
			return;
		}
		var anchor = center.clone();
		anchor.z = getPlayfieldZ(group, center);
		var basis = getViewPlaneBasis(anchor);
		this.spaceship.setPlaneOffset(anchor, basis, -window.innerWidth * 0.28, -window.innerHeight * 0.12);
		this.spaceship.speed = { x: 0, y: 0 };
		this.spaceship._basisRight = null;
		this.spaceship._basisUp = null;
	},

	getBounds() {
		return {
			halfRight: window.innerWidth * 0.48,
			halfUp: window.innerHeight * 0.42,
		};
	},

	update(delta) {
		if (!this.spaceship || !this.activeGroup || !globalThis.sDrawScene) {
			return;
		}

		if (this.hidden) {
			this.revealTimer -= delta;
			if (this.revealTimer > 0) {
				return;
			}
			this.hidden = false;
			this.playfieldLerp = 0;
			this.playfieldCenter = this.playfieldCenterFrom.clone();
			this.placeAtBottomLeft(this.activeGroup);
		}

		if (this.playfieldCenterTarget && this.playfieldCenterFrom && this.playfieldLerp < 1) {
			this.playfieldLerp = Math.min(1, this.playfieldLerp + delta * PLAYFIELD_CENTER_LERP_SPEED);
			var t = smoothstep(this.playfieldLerp);
			var from = this.playfieldCenterFrom;
			var to = this.playfieldCenterTarget;
			this.playfieldCenter.x = from.x + (to.x - from.x) * t;
			this.playfieldCenter.y = from.y + (to.y - from.y) * t;
			this.playfieldCenter.z = from.z + (to.z - from.z) * t;
		}

		var anchor = this.playfieldCenter || getPlayfieldCenter(this.activeGroup);
		if (!anchor) {
			return;
		}
		this.spaceship.Update(delta, this.getBounds(), getGravityBodies(this.activeGroup), anchor);
	},
};
