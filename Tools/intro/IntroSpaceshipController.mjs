/**
 * Single intro spaceship shared across particle groups.
 * On navigation: park at the previous group, then enter from bottom-left at 30° after the camera move.
 */
import { IntroSpaceship, getViewPlaneBasis } from './IntroSpaceship.mjs';
import {
	getPlanetCollidersFromGroup,
	maintainLandedSpaceship,
	updateSpaceshipPlanetLanding,
} from './IntroSpaceshipPlanetLanding.mjs';

var PLAYFIELD_CENTER_LERP_SPEED = 0.65;
var ENTRY_DURATION = 2.8;
var ENTRY_STOP_FROM_LEFT = 0.2;
var ENTRY_CRUISE_FRACTION = 0.72;
var ENTRY_APPROACH_ANGLE = Math.PI / 6;

var SpaceshipTransitionState = {
	IDLE: 'idle',
	PARKED_DURING_NAVIGATION: 'parkedDuringNavigation',
	ENTERING_GROUP: 'enteringGroup',
};

function smoothstep(t) {
	return t * t * (3 - 2 * t);
}

/** Slow cruise, then sharp ease-out for the final approach to the stop point. */
function entryEase(t) {
	if (t <= ENTRY_CRUISE_FRACTION) {
		return (t / ENTRY_CRUISE_FRACTION) * 0.82;
	}
	var u = (t - ENTRY_CRUISE_FRACTION) / (1 - ENTRY_CRUISE_FRACTION);
	return 0.82 + 0.18 * (1 - Math.pow(1 - u, 4));
}

function getEntryStopOffset(bounds) {
	return {
		right: -bounds.halfRight + bounds.halfRight * 2 * ENTRY_STOP_FROM_LEFT,
		up: 0,
	};
}

function getEntryStartOffset(bounds, target) {
	var cosA = Math.cos(ENTRY_APPROACH_ANGLE);
	var sinA = Math.sin(ENTRY_APPROACH_ANGLE);
	var margin = Math.max(window.innerWidth * 0.12, window.innerHeight * 0.1);
	var span = bounds.halfRight * 2 + bounds.halfUp + margin;
	return {
		right: target.right - span * cosA,
		up: target.up - span * sinA,
	};
}

function getEntryHeadingAngle() {
	var cosA = Math.cos(ENTRY_APPROACH_ANGLE);
	var sinA = Math.sin(ENTRY_APPROACH_ANGLE);
	return Math.atan2(cosA, -sinA);
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

var LOOK_INPUT_MOVE_EPS = 1e-8;

export const introSpaceshipController = {
	spaceship: null,
	activeGroup: null,
	transitionState: SpaceshipTransitionState.IDLE,
	playfieldCenter: null,
	playfieldCenterTarget: null,
	playfieldCenterFrom: null,
	playfieldLerp: 1,
	entryStartOffset: null,
	entryTargetOffset: null,
	entryTimer: 0,
	entryDuration: ENTRY_DURATION,
	entryHeadingAngle: 0,
	_lookInputLastMouseX: null,
	_lookInputLastMouseY: null,
	_lookInputLastShipX: null,
	_lookInputLastShipY: null,
	_lookInputSource: 'mouse',

	init(introGroup) {
		var THREE = globalThis.THREE;
		var size = introGroup.width * 0.18;
		this.spaceship = new IntroSpaceship(new THREE.Vector3(), size);
		this.activeGroup = introGroup;
	},

	resetLookInputTracking() {
		this._lookInputLastMouseX = null;
		this._lookInputLastMouseY = null;
		this._lookInputLastShipX = null;
		this._lookInputLastShipY = null;
		this._lookInputSource = 'mouse';
	},

	onNavigationStart(group) {
		if (!this.spaceship) {
			return;
		}
		this.resetLookInputTracking();
		this.transitionState = SpaceshipTransitionState.PARKED_DURING_NAVIGATION;
		this.spaceship.inputEnabled = false;
		this.spaceship.resetControls();
		this.spaceship.autoThrustTimer = 0;
		this.spaceship.scriptedThrust = false;
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
		this.entryTargetOffset = getEntryStopOffset(bounds);
		this.entryStartOffset = getEntryStartOffset(bounds, this.entryTargetOffset);
		this.entryHeadingAngle = getEntryHeadingAngle();
		this.entryTimer = 0;
		this.entryDuration = ENTRY_DURATION;

		this.spaceship.setPlaneOffset(anchor, basis, this.entryStartOffset.right, this.entryStartOffset.up);
		this.spaceship.angle = this.entryHeadingAngle;
		this.spaceship.particle.rotation.z = -this.spaceship.angle;
		this.spaceship.speed = { x: 0, y: 0 };
		this.spaceship.autoThrustTimer = 0;
		this.spaceship.scriptedThrust = true;
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

	getMouseMoveLookInput(mouse) {
		if (!mouse || !this.spaceship || this.isParkedDuringNavigation() || this.isEnteringGroup()) {
			return { x: mouse ? mouse.x : 0, y: mouse ? mouse.y : 0 };
		}

		var anchor = this.playfieldCenter || getPlayfieldCenter(this.activeGroup);
		if (!anchor) {
			return { x: mouse.x, y: mouse.y };
		}

		var basis = getViewPlaneBasis(anchor);
		var bounds = this.getBounds();
		var coords = this.spaceship.getPlaneCoords(anchor, basis);
		var halfRight = bounds.halfRight || 1;
		var halfUp = bounds.halfUp || 1;
		var shipX = globalThis.myClamp(coords.right / halfRight, -1, 1);
		var shipY = globalThis.myClamp(coords.up / halfUp, -1, 1);

		var lastMouseX = this._lookInputLastMouseX;
		var lastMouseY = this._lookInputLastMouseY;
		var lastShipX = this._lookInputLastShipX;
		var lastShipY = this._lookInputLastShipY;
		this._lookInputLastMouseX = mouse.x;
		this._lookInputLastMouseY = mouse.y;
		this._lookInputLastShipX = shipX * 0.5;
		this._lookInputLastShipY = shipY * 0.5;

		if (lastMouseX === null || lastMouseY === null || lastShipX === null || lastShipY === null) {
			return { x: mouse.x, y: mouse.y };
		}

		var mouseDx = mouse.x - lastMouseX;
		var mouseDy = mouse.y - lastMouseY;
		var shipDx = shipX - lastShipX;
		var shipDy = shipY - lastShipY;
		var mouseMove = mouseDx * mouseDx + mouseDy * mouseDy;
		var shipMove = shipDx * shipDx + shipDy * shipDy;
		var shipControls = this.spaceship.controls.left
			|| this.spaceship.controls.right
			|| this.spaceship.controls.up;

		if (shipControls || shipMove > mouseMove + LOOK_INPUT_MOVE_EPS) {
			this._lookInputSource = 'spaceship';
		} else if (mouseMove > shipMove + LOOK_INPUT_MOVE_EPS) {
			this._lookInputSource = 'mouse';
		}

		if (this._lookInputSource === 'spaceship') {
			return { x: shipX, y: shipY };
		}
		return { x: mouse.x, y: mouse.y };
	},

	finishEntry(anchor, basis) {
		if (this.entryTargetOffset) {
			this.spaceship.setPlaneOffset(anchor, basis, this.entryTargetOffset.right, this.entryTargetOffset.up);
		}
		this.spaceship.speed = { x: 0, y: 0 };
		this.spaceship.autoThrustTimer = 0;
		this.spaceship.scriptedThrust = false;
		this.spaceship.inputEnabled = true;
		this.transitionState = SpaceshipTransitionState.IDLE;
		this.resetLookInputTracking();
		this.entryStartOffset = null;
		this.entryTargetOffset = null;
		this.entryTimer = 0;
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
			this.entryTimer += delta;
			var progress = Math.min(1, this.entryTimer / this.entryDuration);
			var eased = entryEase(progress);
			var from = this.entryStartOffset;
			var to = this.entryTargetOffset;
			var right = from.right + (to.right - from.right) * eased;
			var up = from.up + (to.up - from.up) * eased;
			this.spaceship.scriptedThrust = progress < 1;
			this.spaceship.setPlaneOffset(anchor, basis, right, up);
			this.spaceship.angle = this.entryHeadingAngle;
			this.spaceship.particle.rotation.z = -this.spaceship.angle;
			if (progress >= 1) {
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
