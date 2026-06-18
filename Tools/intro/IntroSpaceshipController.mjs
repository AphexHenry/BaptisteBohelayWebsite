/**
 * Single intro spaceship shared across particle groups.
 * On navigation: park at the previous group, then enter from left of the new group after the camera move.
 */
import { IntroSpaceship, getViewPlaneBasis } from './IntroSpaceship.mjs';
import {
	getPlanetCollidersFromGroup,
	maintainLandedSpaceship,
	updateSpaceshipPlanetLanding,
} from './IntroSpaceshipPlanetLanding.mjs';

var PLAYFIELD_CENTER_LERP_SPEED = 0.65;
var ENTER_STOP_DISTANCE = 24;

var SpaceshipTransitionState = {
	IDLE: 'idle',
	PARKED_DURING_NAVIGATION: 'parkedDuringNavigation',
	ENTERING_GROUP: 'enteringGroup',
};

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

function getSpawnPlaneOffset(group) {
	if (group && typeof group.GetSpaceshipSpawnPlaneOffset === 'function') {
		return group.GetSpaceshipSpawnPlaneOffset();
	}
	return {
		right: -window.innerWidth * 0.28,
		up: -window.innerHeight * 0.12,
	};
}

function getPlayfieldBounds(group) {
	if (group && typeof group.GetSpaceshipPlayfieldBounds === 'function') {
		return group.GetSpaceshipPlayfieldBounds();
	}
	return {
		halfRight: window.innerWidth * 0.48,
		halfUp: window.innerHeight * 0.42,
	};
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
		var planetParticle = particle.planetParticle;
		if (planetParticle && planetParticle.spaceshipCollides === false) {
			continue;
		}
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
	transitionState: SpaceshipTransitionState.IDLE,
	playfieldCenter: null,
	playfieldCenterTarget: null,
	playfieldCenterFrom: null,
	playfieldLerp: 1,
	entryTargetOffset: null,

	init(introGroup) {
		var THREE = globalThis.THREE;
		var size = introGroup.width * 0.18;
		this.spaceship = new IntroSpaceship(new THREE.Vector3(), size);
		this.activeGroup = introGroup;
	},

	onNavigationStart(group) {
		if (!this.spaceship) {
			return;
		}
		this.transitionState = SpaceshipTransitionState.PARKED_DURING_NAVIGATION;
		this.spaceship.inputEnabled = false;
		this.spaceship.resetControls();
		this.spaceship.autoThrustTimer = 0;
		this.spaceship.speed = { x: 0, y: 0 };
		this.spaceship.landedPlanet = null;
		this.activeGroup = group || this.activeGroup;
	},

	onGroupWillChange(group) {
		this.onNavigationStart(group);
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
			this.transitionState = SpaceshipTransitionState.IDLE;
			this.spaceship.inputEnabled = true;
			this.playfieldLerp = 1;
			this.playfieldCenter = this.playfieldCenterTarget.clone();
			this.placeAtSpawn(group);
			return;
		}
		this.startGroupEntry(group);
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
		this.spaceship.landedPlanet = null;
		this.spaceship._basisRight = null;
		this.spaceship._basisUp = null;
	},

	placeAtSpawn(group) {
		var center = this.playfieldCenter || getPlayfieldCenter(group);
		if (!center) {
			return;
		}
		var anchor = center.clone();
		anchor.z = getPlayfieldZ(group, center);
		var basis = getViewPlaneBasis(anchor);
		var offset = getSpawnPlaneOffset(group);
		this.spaceship.setPlaneOffset(anchor, basis, offset.right, offset.up);
		this.spaceship.speed = { x: 0, y: 0 };
		this.spaceship.landedPlanet = null;
		this.spaceship._basisRight = null;
		this.spaceship._basisUp = null;
	},

	startGroupEntry(group) {
		if (!this.spaceship) {
			return;
		}
		this.activeGroup = group;
		this.playfieldCenterTarget = getPlayfieldCenter(group);
		if (!this.playfieldCenterTarget) {
			return;
		}
		this.playfieldCenterFrom = this.playfieldCenterTarget.clone();
		this.playfieldCenter = this.playfieldCenterFrom.clone();
		this.playfieldLerp = 1;

		var anchor = this.playfieldCenterTarget.clone();
		anchor.z = getPlayfieldZ(group, this.playfieldCenterTarget);
		var basis = getViewPlaneBasis(anchor);
		var bounds = getPlayfieldBounds(group);
		var leftMargin = Math.max(window.innerWidth * 0.08, this.spaceship.size * 2.2);
		var startOffset = {
			right: -bounds.halfRight - leftMargin,
			up: 0,
		};
		this.entryTargetOffset = {
			right: 0,
			up: 0,
		};

		this.spaceship.setPlaneOffset(anchor, basis, startOffset.right, startOffset.up);
		var targetDx = this.entryTargetOffset.right - startOffset.right;
		var targetDy = this.entryTargetOffset.up - startOffset.up;
		var len = Math.max(0.001, Math.sqrt(targetDx * targetDx + targetDy * targetDy));
		var dirX = targetDx / len;
		var dirY = targetDy / len;
		this.spaceship.angle = Math.atan2(dirX, -dirY);
		this.spaceship.particle.rotation.z = -this.spaceship.angle;
		this.spaceship.speed = {
			x: dirX * this.spaceship.maxSpeed * 0.62,
			y: dirY * this.spaceship.maxSpeed * 0.62,
		};
		this.spaceship.autoThrustTimer = 0.5;
		this.spaceship.landedPlanet = null;
		this.spaceship._basisRight = null;
		this.spaceship._basisUp = null;
		this.spaceship.inputEnabled = false;
		this.transitionState = SpaceshipTransitionState.ENTERING_GROUP;
	},

	getBounds() {
		return getPlayfieldBounds(this.activeGroup);
	},

	isParkedDuringNavigation() {
		return this.transitionState === SpaceshipTransitionState.PARKED_DURING_NAVIGATION;
	},

	isEnteringGroup() {
		return this.transitionState === SpaceshipTransitionState.ENTERING_GROUP;
	},

	isEntryComplete() {
		return this.transitionState === SpaceshipTransitionState.IDLE;
	},

	finishEntry(anchor, basis) {
		if (this.entryTargetOffset) {
			this.spaceship.setPlaneOffset(anchor, basis, this.entryTargetOffset.right, this.entryTargetOffset.up);
		}
		this.spaceship.speed = { x: 0, y: 0 };
		this.spaceship.autoThrustTimer = 0;
		this.spaceship.inputEnabled = true;
		this.transitionState = SpaceshipTransitionState.IDLE;
		this.entryTargetOffset = null;
	},

	update(delta) {
		if (!this.spaceship || !this.activeGroup || !globalThis.sDrawScene) {
			return;
		}

		if (this.isParkedDuringNavigation()) {
			return;
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
		var basis = getViewPlaneBasis(anchor);
		var planetColliders = getPlanetCollidersFromGroup(this.activeGroup);

		if (this.spaceship.landedPlanet && !this.spaceship.controls.up) {
			maintainLandedSpaceship(this.spaceship, anchor, basis);
		}

		if (this.isEnteringGroup()) {
			this.spaceship.Update(delta, this.getBounds(), [], anchor);
			var coords = this.spaceship.getPlaneCoords(anchor, basis);
			var target = this.entryTargetOffset || { right: 0, up: 0 };
			var dx = target.right - coords.right;
			var dy = target.up - coords.up;
			if (Math.sqrt(dx * dx + dy * dy) < ENTER_STOP_DISTANCE || coords.right >= target.right) {
				this.finishEntry(anchor, basis);
			}
			return;
		}

		this.spaceship.Update(delta, this.getBounds(), getGravityBodies(this.activeGroup), anchor);
		updateSpaceshipPlanetLanding(this.spaceship, planetColliders, anchor, basis);

		if (typeof this.activeGroup.UpdateSpaceshipLetterInteractions === 'function') {
			this.activeGroup.UpdateSpaceshipLetterInteractions(this.spaceship, anchor, delta);
		}
	},
};
