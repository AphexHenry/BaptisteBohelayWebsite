/**
 * Circle-surface collision between the intro spaceship and navigation planets.
 * Landing: engine (butt) toward planet center + low speed → stick.
 * Otherwise: bounce off the surface normal.
 */

var PLANET_STROKE_INSET = 0.05;
var SHIP_HULL_RADIUS_SCALE = 0.55;
var LANDING_ANGLE_DOT = 0.72;
var LANDING_SPEED_FACTOR = 0.38;
var SURFACE_EPSILON = 0.5;

function vec3Dot(a, b) {
	return a.x * b.x + a.y * b.y + a.z * b.z;
}

function worldToPlane(basis, anchor, worldPos) {
	var dx = worldPos.x - anchor.x;
	var dy = worldPos.y - anchor.y;
	var dz = worldPos.z - anchor.z;
	return {
		right: vec3Dot({ x: dx, y: dy, z: dz }, basis.right),
		up: vec3Dot({ x: dx, y: dy, z: dz }, basis.up),
	};
}

function planeToWorld(basis, anchor, planeRight, planeUp) {
	return {
		x: anchor.x + basis.right.x * planeRight + basis.up.x * planeUp,
		y: anchor.y + basis.right.y * planeRight + basis.up.y * planeUp,
		z: anchor.z + basis.right.z * planeRight + basis.up.z * planeUp,
	};
}

export function getPlanetWorldRadius(particle) {
	if (!particle) {
		return 0;
	}
	if (particle.planetParticle && typeof particle.planetParticle.getWorldRadius === 'function') {
		return particle.planetParticle.getWorldRadius();
	}
	if (!particle.scale) {
		return 0;
	}
	// Default ParticleCircleNavigate ring (programStroke arc at ~0.95 in local space).
	return particle.scale.x * (1 - PLANET_STROKE_INSET);
}

export function getShipHullRadius(spaceship) {
	var hullScale = spaceship.hullRadiusScale != null ? spaceship.hullRadiusScale : 0.7;
	return spaceship.size * SHIP_HULL_RADIUS_SCALE * hullScale;
}

function getShipButtDirection(spaceship) {
	return {
		right: -Math.sin(spaceship.angle),
		up: Math.cos(spaceship.angle),
	};
}

function getPlaneSpeed(spaceship) {
	return Math.sqrt(spaceship.speed.x * spaceship.speed.x + spaceship.speed.y * spaceship.speed.y);
}

function snapShipToPlanetSurface(spaceship, planetCollider, planeAnchor, basis) {
	var planetPos = planetCollider.particle.position;
	var planetPlane = worldToPlane(basis, planeAnchor, planetPos);
	var shipPlane = worldToPlane(basis, planeAnchor, spaceship.particle.position);
	var dx = shipPlane.right - planetPlane.right;
	var dy = shipPlane.up - planetPlane.up;
	var dist = Math.sqrt(dx * dx + dy * dy);
	var planetRadius = planetCollider.radius != null
		? planetCollider.radius
		: getPlanetWorldRadius(planetCollider.particle);
	var shipRadius = getShipHullRadius(spaceship);
	var surfaceDist = planetRadius + shipRadius;

	if (dist < 1e-6) {
		dx = 0;
		dy = 1;
		dist = 1;
	}

	var nx = dx / dist;
	var ny = dy / dist;
	var targetPlane = {
		right: planetPlane.right + nx * surfaceDist,
		up: planetPlane.up + ny * surfaceDist,
	};
	var world = planeToWorld(basis, planeAnchor, targetPlane.right, targetPlane.up);
	spaceship.particle.position.x = world.x;
	spaceship.particle.position.y = world.y;
	spaceship.particle.position.z = world.z;
	spaceship.snapToViewPlane(planeAnchor, basis);
}

function bounceOffPlanetSurface(spaceship, nx, ny) {
	var vx = spaceship.speed.x;
	var vy = spaceship.speed.y;
	var vDotN = vx * nx + vy * ny;
	if (vDotN >= 0) {
		return;
	}
	spaceship.speed.x = (vx - 2 * vDotN * nx) * spaceship.bounce;
	spaceship.speed.y = (vy - 2 * vDotN * ny) * spaceship.bounce;
}

function tryLandOrBounce(spaceship, planetCollider, planeAnchor, basis) {
	var planetPos = planetCollider.particle.position;
	var planetPlane = worldToPlane(basis, planeAnchor, planetPos);
	var shipPlane = worldToPlane(basis, planeAnchor, spaceship.particle.position);
	var dx = shipPlane.right - planetPlane.right;
	var dy = shipPlane.up - planetPlane.up;
	var dist = Math.sqrt(dx * dx + dy * dy);
	var planetRadius = planetCollider.radius != null
		? planetCollider.radius
		: getPlanetWorldRadius(planetCollider.particle);
	var shipRadius = getShipHullRadius(spaceship);
	var surfaceDist = planetRadius + shipRadius;

	if (dist >= surfaceDist - SURFACE_EPSILON) {
		return false;
	}

	if (dist < 1e-6) {
		dx = 0;
		dy = 1;
		dist = 1;
	}

	var nx = dx / dist;
	var ny = dy / dist;
	var toPlanet = { right: -nx, up: -ny };
	var butt = getShipButtDirection(spaceship);
	var buttAlignment = butt.right * toPlanet.right + butt.up * toPlanet.up;
	var speed = getPlaneSpeed(spaceship);
	var landingSpeed = spaceship.maxSpeed * LANDING_SPEED_FACTOR;

	snapShipToPlanetSurface(spaceship, planetCollider, planeAnchor, basis);

	if (buttAlignment >= LANDING_ANGLE_DOT && speed <= landingSpeed) {
		spaceship.speed.x = 0;
		spaceship.speed.y = 0;
		spaceship.landedPlanet = planetCollider;
		return true;
	}

	bounceOffPlanetSurface(spaceship, nx, ny);
	return true;
}

export function maintainLandedSpaceship(spaceship, planeAnchor, basis) {
	if (!spaceship.landedPlanet) {
		return;
	}
	snapShipToPlanetSurface(spaceship, spaceship.landedPlanet, planeAnchor, basis);
	spaceship.speed.x = 0;
	spaceship.speed.y = 0;
}

export function updateSpaceshipPlanetLanding(spaceship, planetColliders, planeAnchor, basis) {
	if (!spaceship || !planetColliders || planetColliders.length === 0) {
		return;
	}

	if (spaceship.landedPlanet) {
		if (spaceship.controls.up) {
			spaceship.landedPlanet = null;
			return;
		}
		maintainLandedSpaceship(spaceship, planeAnchor, basis);
		return;
	}

	for (var i = 0; i < planetColliders.length; i++) {
		if (tryLandOrBounce(spaceship, planetColliders[i], planeAnchor, basis)) {
			break;
		}
	}
}

function colliderFromPlanetOwner(owner) {
	if (!owner || !owner.particle) {
		return null;
	}
	var target = owner.target || owner.particle.TargetObject || {};
	return {
		particle: owner.particle,
		name: target.name || 'planet',
		radius: typeof owner.getWorldRadius === 'function'
			? owner.getWorldRadius()
			: getPlanetWorldRadius(owner.particle),
	};
}

export function getPlanetCollidersFromGroup(group) {
	if (!group) {
		return [];
	}
	if (typeof group.GetSpaceshipPlanetColliders === 'function') {
		return group.GetSpaceshipPlanetColliders();
	}
	var owners = group.menuParticlesToUpdate || group.particlesToUpdate;
	if (owners) {
		var fromOwners = [];
		for (var i = 0; i < owners.length; i++) {
			var collider = colliderFromPlanetOwner(owners[i]);
			if (collider) {
				fromOwners.push(collider);
			}
		}
		if (fromOwners.length > 0) {
			return fromOwners;
		}
	}
	var colliders = [];
	if (!group.particles) {
		return colliders;
	}
	for (var j = 0; j < group.particles.length; j++) {
		var particle = group.particles[j];
		if (!particle || !particle.position) {
			continue;
		}
		colliders.push({
			particle: particle,
			name: (particle.TargetObject && particle.TargetObject.name) || 'planet',
			radius: getPlanetWorldRadius(particle),
		});
	}
	return colliders;
}
