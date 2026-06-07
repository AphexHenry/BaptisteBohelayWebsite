/**
 * View-plane collision between the intro spaceship outline and letter particles.
 * Ship hull matches SPACESHIP_SHAPE_VERTICES in IntroSpaceship.mjs.
 */
import { SPACESHIP_SHAPE_VERTICES } from './IntroSpaceship.mjs';

var programMetricsCache = {};
var measureCtx = null;
var DEBUG_STROKE = 'rgba(0, 255, 0, 0.95)';

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

export function planeNormalToWorld(basis, nx, ny) {
	return {
		x: basis.right.x * nx + basis.up.x * ny,
		y: basis.right.y * nx + basis.up.y * ny,
		z: basis.right.z * nx + basis.up.z * ny,
	};
}

export function planeVelocityToWorld(basis, vx, vy) {
	return planeNormalToWorld(basis, vx, vy);
}

function rotateShipVertex(lx, ly, angle) {
	var cosA = Math.cos(angle);
	var sinA = Math.sin(angle);
	return {
		right: lx * cosA - ly * sinA,
		up: lx * sinA + ly * cosA,
	};
}

function buildShipPolygon(spaceship, planeAnchor, basis) {
	var shipPlane = worldToPlane(basis, planeAnchor, spaceship.particle.position);
	var size = spaceship.size;
	var angle = spaceship.angle;
	var vertices = [];

	for (var i = 0; i < SPACESHIP_SHAPE_VERTICES.length; i++) {
		var local = SPACESHIP_SHAPE_VERTICES[i];
		var rotated = rotateShipVertex(local.x, local.y, angle);
		vertices.push({
			right: shipPlane.right + rotated.right * size,
			up: shipPlane.up + rotated.up * size,
		});
	}
	return vertices;
}

function pointInPolygon(px, py, vertices) {
	var inside = false;
	for (var i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
		var xi = vertices[i].right;
		var yi = vertices[i].up;
		var xj = vertices[j].right;
		var yj = vertices[j].up;
		var intersects = (yi > py) !== (yj > py)
			&& px < ((xj - xi) * (py - yi)) / (yj - yi + 1e-12) + xi;
		if (intersects) {
			inside = !inside;
		}
	}
	return inside;
}

function closestPointOnSegment(px, py, ax, ay, bx, by) {
	var abx = bx - ax;
	var aby = by - ay;
	var lenSq = abx * abx + aby * aby;
	if (lenSq < 1e-12) {
		return { right: ax, up: ay, distSq: (px - ax) * (px - ax) + (py - ay) * (py - ay) };
	}
	var t = ((px - ax) * abx + (py - ay) * aby) / lenSq;
	t = Math.max(0, Math.min(1, t));
	var cx = ax + abx * t;
	var cy = ay + aby * t;
	var dx = px - cx;
	var dy = py - cy;
	return { right: cx, up: cy, distSq: dx * dx + dy * dy };
}

function closestPointOnPolygon(px, py, vertices) {
	var best = null;
	for (var i = 0; i < vertices.length; i++) {
		var a = vertices[i];
		var b = vertices[(i + 1) % vertices.length];
		var candidate = closestPointOnSegment(px, py, a.right, a.up, b.right, b.up);
		if (!best || candidate.distSq < best.distSq) {
			best = candidate;
		}
	}
	return best;
}

/** ParticleLetter draws at local canvas (-1, 1): horizontal center + alphabetic baseline. */
export var LETTER_GLYPH_LOCAL = { x: -1, y: 1 };

function getMeasureContext() {
	if (!measureCtx) {
		var canvas = document.createElement('canvas');
		measureCtx = canvas.getContext('2d');
	}
	return measureCtx;
}

function getLetterProgramMetrics(char) {
	if (programMetricsCache[char]) {
		return programMetricsCache[char];
	}
	var ctx = getMeasureContext();
	ctx.setTransform(1, 0, 0, 1, 0, 0);
	ctx.font = '2pt TitleText';
	ctx.textAlign = 'center';
	ctx.textBaseline = 'alphabetic';
	var metrics = ctx.measureText(char);
	programMetricsCache[char] = {
		halfWidthProg: metrics.width * 0.5,
		ascentProg: metrics.actualBoundingBoxAscent || 1.2,
		descentProg: metrics.actualBoundingBoxDescent || 0.35,
	};
	return programMetricsCache[char];
}

function getLetterWorldMetrics(particle) {
	var char = particle.introLetterChar || 'A';
	var programMetrics = getLetterProgramMetrics(char);
	var sx = Math.abs(particle.scale.x);
	var sy = Math.abs(particle.scale.y);
	return {
		halfWidthWorld: programMetrics.halfWidthProg * sx,
		ascentWorld: programMetrics.ascentProg * sy,
		descentWorld: programMetrics.descentProg * sy,
	};
}

export function getLetterGlyphWorldPosition(particle) {
	return {
		x: particle.position.x + LETTER_GLYPH_LOCAL.x * particle.scale.x,
		y: particle.position.y + LETTER_GLYPH_LOCAL.y * particle.scale.y,
		z: particle.position.z,
	};
}

export function getLetterPlaneAabb(particle, basis, planeAnchor) {
	var metrics = getLetterWorldMetrics(particle);
	var baselineX = particle.position.x + LETTER_GLYPH_LOCAL.x * particle.scale.x;
	var baselineY = particle.position.y + LETTER_GLYPH_LOCAL.y * particle.scale.y;
	var z = particle.position.z;
	var corners = [
		{ x: baselineX - metrics.halfWidthWorld, y: baselineY - metrics.descentWorld, z: z },
		{ x: baselineX + metrics.halfWidthWorld, y: baselineY - metrics.descentWorld, z: z },
		{ x: baselineX + metrics.halfWidthWorld, y: baselineY + metrics.ascentWorld, z: z },
		{ x: baselineX - metrics.halfWidthWorld, y: baselineY + metrics.ascentWorld, z: z },
	];

	var minR = Infinity;
	var maxR = -Infinity;
	var minU = Infinity;
	var maxU = -Infinity;
	for (var i = 0; i < corners.length; i++) {
		var plane = worldToPlane(basis, planeAnchor, corners[i]);
		minR = Math.min(minR, plane.right);
		maxR = Math.max(maxR, plane.right);
		minU = Math.min(minU, plane.up);
		maxU = Math.max(maxU, plane.up);
	}

	return {
		minR: minR,
		maxR: maxR,
		minU: minU,
		maxU: maxU,
		centerR: (minR + maxR) * 0.5,
		centerU: (minU + maxU) * 0.5,
		halfR: (maxR - minR) * 0.5,
		halfU: (maxU - minU) * 0.5,
	};
}

function projectPolygon(vertices, axisR, axisU) {
	var min = Infinity;
	var max = -Infinity;
	for (var i = 0; i < vertices.length; i++) {
		var projection = vertices[i].right * axisR + vertices[i].up * axisU;
		min = Math.min(min, projection);
		max = Math.max(max, projection);
	}
	return { min: min, max: max };
}

function projectAabb(aabb, axisR, axisU) {
	var corners = [
		{ right: aabb.minR, up: aabb.minU },
		{ right: aabb.maxR, up: aabb.minU },
		{ right: aabb.maxR, up: aabb.maxU },
		{ right: aabb.minR, up: aabb.maxU },
	];
	var min = Infinity;
	var max = -Infinity;
	for (var i = 0; i < corners.length; i++) {
		var projection = corners[i].right * axisR + corners[i].up * axisU;
		min = Math.min(min, projection);
		max = Math.max(max, projection);
	}
	return { min: min, max: max };
}

function getPolygonAxes(vertices) {
	var axes = [
		{ right: 1, up: 0 },
		{ right: 0, up: 1 },
	];
	for (var i = 0; i < vertices.length; i++) {
		var a = vertices[i];
		var b = vertices[(i + 1) % vertices.length];
		var edgeR = b.right - a.right;
		var edgeU = b.up - a.up;
		var len = Math.sqrt(edgeR * edgeR + edgeU * edgeU);
		if (len < 1e-8) {
			continue;
		}
		axes.push({ right: -edgeU / len, up: edgeR / len });
	}
	return axes;
}

function testPolygonAabbCollision(polygon, aabb, shipCenterR, shipCenterU) {
	var axes = getPolygonAxes(polygon);
	var minOverlap = Infinity;
	var bestAxis = null;

	for (var i = 0; i < axes.length; i++) {
		var axis = axes[i];
		var polyProj = projectPolygon(polygon, axis.right, axis.up);
		var aabbProj = projectAabb(aabb, axis.right, axis.up);
		var overlap = Math.min(polyProj.max, aabbProj.max) - Math.max(polyProj.min, aabbProj.min);
		if (overlap <= 0) {
			return null;
		}
		if (overlap < minOverlap) {
			minOverlap = overlap;
			bestAxis = axis;
		}
	}

	var toLetterR = aabb.centerR - shipCenterR;
	var toLetterU = aabb.centerU - shipCenterU;
	var dot = toLetterR * bestAxis.right + toLetterU * bestAxis.up;
	var nx = dot >= 0 ? bestAxis.right : -bestAxis.right;
	var ny = dot >= 0 ? bestAxis.up : -bestAxis.up;

	return {
		nx: nx,
		ny: ny,
		depth: Math.max(minOverlap, 0.01),
	};
}

function programShipHitbox(context) {
	var verts = SPACESHIP_SHAPE_VERTICES;
	context.strokeStyle = DEBUG_STROKE;
	context.lineWidth = 0.04;
	context.lineJoin = 'round';
	context.lineCap = 'round';
	context.beginPath();
	context.moveTo(verts[0].x, verts[0].y);
	for (var i = 1; i < verts.length; i++) {
		context.lineTo(verts[i].x, verts[i].y);
	}
	context.closePath();
	context.stroke();
}

function programLetterHitbox(context) {
	context.strokeStyle = DEBUG_STROKE;
	context.lineWidth = 0.05;
	context.strokeRect(-0.5, -0.5, 1, 1);
}

function ensureCollisionDebugState(introGroup) {
	if (!introGroup._letterCollisionDebug) {
		introGroup._letterCollisionDebug = {
			shipMarker: null,
			letterMarkers: [],
		};
	}
	return introGroup._letterCollisionDebug;
}

function createDebugMarker(program) {
	var THREE = globalThis.THREE;
	var scene = globalThis.scene;
	var marker = new THREE.Particle(
		new THREE.ParticleCanvasMaterial({
			color: 0x00ff00,
			program: program,
			transparent: true,
			opacity: 0.95,
		})
	);
	marker.scale.x = marker.scale.y = 1;
	scene.add(marker);
	return marker;
}

function removeDebugMarker(marker) {
	if (marker && globalThis.scene) {
		globalThis.scene.remove(marker);
	}
}

function clearCollisionDebug(introGroup) {
	var state = introGroup._letterCollisionDebug;
	if (!state) {
		return;
	}
	removeDebugMarker(state.shipMarker);
	state.shipMarker = null;
	while (state.letterMarkers.length > 0) {
		removeDebugMarker(state.letterMarkers.pop());
	}
}

function getLetterWorldAabb(particle) {
	var metrics = getLetterWorldMetrics(particle);
	var baselineX = particle.position.x + LETTER_GLYPH_LOCAL.x * particle.scale.x;
	var baselineY = particle.position.y + LETTER_GLYPH_LOCAL.y * particle.scale.y;
	var minY = baselineY - metrics.descentWorld;
	var maxY = baselineY + metrics.ascentWorld;
	return {
		centerX: baselineX,
		centerY: (minY + maxY) * 0.5,
		halfWidth: metrics.halfWidthWorld,
		halfHeight: (maxY - minY) * 0.5,
	};
}

function syncShipCollisionDebugMarker(state, spaceship) {
	if (!state.shipMarker) {
		state.shipMarker = createDebugMarker(programShipHitbox);
	}
	var shipParticle = spaceship.particle;
	var marker = state.shipMarker;
	marker.position.x = shipParticle.position.x;
	marker.position.y = shipParticle.position.y;
	marker.position.z = shipParticle.position.z + 1;
	marker.scale.x = shipParticle.scale.x;
	marker.scale.y = shipParticle.scale.y;
	marker.rotation.z = shipParticle.rotation.z;
	marker.visible = true;
}

function syncLetterCollisionDebugMarkers(state, foodArray) {
	while (state.letterMarkers.length < foodArray.length) {
		state.letterMarkers.push(createDebugMarker(programLetterHitbox));
	}
	while (state.letterMarkers.length > foodArray.length) {
		removeDebugMarker(state.letterMarkers.pop());
	}
	for (var i = 0; i < foodArray.length; i++) {
		var particle = foodArray[i];
		var marker = state.letterMarkers[i];
		var aabb = getLetterWorldAabb(particle);
		marker.position.x = aabb.centerX;
		marker.position.y = aabb.centerY;
		marker.position.z = particle.position.z + 1;
		marker.scale.x = Math.max(aabb.halfWidth * 2, 1);
		marker.scale.y = Math.max(aabb.halfHeight * 2, 1);
		marker.rotation.z = 0;
		marker.visible = true;
	}
}

/** Console: DEBUG_SPACESHIP_LETTER_COLLISION = true */
export function updateIntroLetterCollisionDebug(introGroup, spaceship, planeAnchor, basis) {
	if (!globalThis.DEBUG_SPACESHIP_LETTER_COLLISION) {
		clearCollisionDebug(introGroup);
		return;
	}
	if (!spaceship || !introGroup || !introGroup.foodArray) {
		return;
	}

	var state = ensureCollisionDebugState(introGroup);
	syncShipCollisionDebugMarker(state, spaceship);
	syncLetterCollisionDebugMarkers(state, introGroup.foodArray);
}

/**
 * @returns {{ nx: number, ny: number, depth: number } | null}
 * Plane normal (nx, ny) points from the ship toward the letter (push direction).
 */
export function testSpaceshipLetterCollision(spaceship, particle, planeAnchor, basis) {
	var polygon = buildShipPolygon(spaceship, planeAnchor, basis);
	var aabb = getLetterPlaneAabb(particle, basis, planeAnchor);
	var shipPlane = worldToPlane(basis, planeAnchor, spaceship.particle.position);
	return testPolygonAabbCollision(polygon, aabb, shipPlane.right, shipPlane.up);
}
