/**
 * Programming navigation planet: pixelated circle with glitching branches.
 */
import { PI2 } from '../Template.mjs';
import { PlanetParticle, inheritPlanetParticle } from './PlanetParticle.mjs';

const PIXEL_GRID_RATIO = 1 / 6; // grid cell vs radius -> ~12 pixels across the diameter
const BRANCH_ROOT_COUNT = 24;
const BRANCH_MAX_DEPTH = 1;
const BRANCH_FORK_ANGLES = [
	[-0.9, -0.6, -0.3, 0, 0.3], // depth 0: 7 forks
	[-0.78, -0.39, 0],         // depth 1: 5 forks
	[-0.62],                       // depth 2: 3 forks
	[0],                                    // depth 3+: straight continuation
];
const BRANCH_GROW_MAX = 2.7;

function clamp01(value) {
	return Math.max(0, Math.min(1, value));
}

function clampBranchGrow(value) {
	return Math.max(0, Math.min(BRANCH_GROW_MAX, value));
}

function quantize(value, grid) {
	return Math.round(value / grid) * grid;
}

function glitchValue(seed, scale) {
	return Math.sin(seed * 12.9898) * Math.cos(seed * 78.233) * scale;
}

function pixelLineTo(context, fromX, fromY, toX, toY, grid) {
	fromX = quantize(fromX, grid);
	fromY = quantize(fromY, grid);
	toX = quantize(toX, grid);
	toY = quantize(toY, grid);

	if (fromX !== toX) {
		context.lineTo(toX, fromY);
	}
	if (toY !== fromY) {
		context.lineTo(toX, toY);
	}

	return { x: toX, y: toY };
}

function strokePixelEdge(context, fromX, fromY, toX, toY, grid) {
	context.moveTo(fromX * grid, fromY * grid);
	context.lineTo(toX * grid, toY * grid);
}

function strokePixelOutlineCell(context, cellX, cellY, grid, hasCell) {
	var left = cellX - 0.5;
	var right = cellX + 0.5;
	var top = cellY - 0.5;
	var bottom = cellY + 0.5;

	if (cellX < 0) {
		if (!hasCell(cellX - 1, cellY)) {
			strokePixelEdge(context, left, top, left, bottom, grid);
		}
	} else if (cellX > 0) {
		if (!hasCell(cellX + 1, cellY)) {
			strokePixelEdge(context, right, top, right, bottom, grid);
		}
	} else {
		if (!hasCell(cellX - 1, cellY)) {
			strokePixelEdge(context, left, top, left, bottom, grid);
		}
		if (!hasCell(cellX + 1, cellY)) {
			strokePixelEdge(context, right, top, right, bottom, grid);
		}
	}

	if (cellY < 0) {
		if (!hasCell(cellX, cellY - 1)) {
			strokePixelEdge(context, left, top, right, top, grid);
		}
	} else if (cellY > 0) {
		if (!hasCell(cellX, cellY + 1)) {
			strokePixelEdge(context, left, bottom, right, bottom, grid);
		}
	} else {
		if (!hasCell(cellX, cellY - 1)) {
			strokePixelEdge(context, left, top, right, top, grid);
		}
		if (!hasCell(cellX, cellY + 1)) {
			strokePixelEdge(context, left, bottom, right, bottom, grid);
		}
	}
}

/**
 * Midpoint (Bresenham) circle in integer grid-cell space: gives a perfectly
 * symmetrical ring of grid-aligned pixels. Each cell contributes only its
 * outward-facing edges, skipping edges when a neighboring cell continues the row
 * or column, so the circle reads as one thin, axis-aligned pixel outline. Glitch
 * shifts whole rows by an integer number of cells, keeping everything snapped to
 * the grid.
 */
function drawPixelCircle(context, radius, grid, glitchIntensity, timer) {
	var cellRadius = Math.max(2, Math.round(radius / grid));
	var seen = {};
	var cells = [];

	function plot(cellX, cellY) {
		var key = cellX + ':' + cellY;
		if (!seen[key]) {
			seen[key] = true;
			cells.push({ x: cellX, y: cellY });
		}
	}

	var x = cellRadius;
	var y = 0;
	var err = 1 - cellRadius;

	while (x >= y) {
		plot(x, y);
		plot(-x, y);
		plot(x, -y);
		plot(-x, -y);
		plot(y, x);
		plot(-y, x);
		plot(y, -x);
		plot(-y, -x);

		y++;
		if (err < 0) {
			err += 2 * y + 1;
		} else {
			x--;
			err += 2 * (y - x) + 1;
		}
	}

	var glitching = glitchIntensity > 0.01;
	var glitchSeed = Math.floor(timer * 9);
	var outlinedCells = [];
	var cellMap = {};

	function hasCell(cellX, cellY) {
		return cellMap[cellX + ':' + cellY] === true;
	}

	for (var i = 0; i < cells.length; i++) {
		var sourceCell = cells[i];
		var rowShift = 0;

		if (glitching) {
			rowShift = Math.round(glitchValue(sourceCell.y + glitchSeed, glitchIntensity * 2.2));
		}

		var outlineCell = { x: sourceCell.x + rowShift, y: sourceCell.y };
		var key = outlineCell.x + ':' + outlineCell.y;
		if (!cellMap[key]) {
			cellMap[key] = true;
			outlinedCells.push(outlineCell);
		}
	}

	context.beginPath();

	for (var j = 0; j < outlinedCells.length; j++) {
		var cell = outlinedCells[j];
		strokePixelOutlineCell(context, cell.x, cell.y, grid, hasCell);
	}

	context.stroke();
}

function drawBranch(context, startX, startY, angle, branchLength, grow, branchIndex, depth, grid, glitchIntensity, timer) {
	if (depth > BRANCH_MAX_DEPTH) {
		return;
	}

	var depthGrow = clamp01((grow - depth * 0.16) / 0.34);
	if (depthGrow <= 0) {
		return;
	}

	var directionX = Math.cos(angle);
	var directionY = Math.sin(angle);
	var sideX = -directionY;
	var sideY = directionX;
	var segmentCount = Math.max(3, 6 - depth);
	var lengthScale = 1 + Math.max(0, grow - 1) * (0.75 - depth * 0.12);
	var visibleLength = branchLength * lengthScale;
	var cursor = {
		x: quantize(startX, grid),
		y: quantize(startY, grid),
	};

	context.beginPath();
	context.moveTo(cursor.x, cursor.y);

	for (var i = 1; i <= segmentCount; i++) {
		var advance = i / segmentCount * depthGrow;
		var stair = (i % 2 === 0 ? 1 : -1) * grid * (1 + (branchIndex + depth) % 2) * (1 - depth * 0.15);
		var scanlineGlitch = glitchIntensity * glitchValue(timer * 7 + branchIndex * 11 + depth * 31 + i, grid * 4);
		var x = startX + directionX * visibleLength * advance + sideX * stair + scanlineGlitch;
		var y = startY + directionY * visibleLength * advance + sideY * stair * 0.65;
		cursor = pixelLineTo(context, cursor.x, cursor.y, x, y, grid);
	}

	context.stroke();

	if (depthGrow < 0.48 || depth >= BRANCH_MAX_DEPTH) {
		return;
	}

	var childGrow = grow - 0.1;
	var spawnAdvances = depth === 0 ? [0.52, 0.78, 1] : depth === 1 ? [0.78, 1] : [1];
	var forkAngles = BRANCH_FORK_ANGLES[Math.min(depth, BRANCH_FORK_ANGLES.length - 1)];

	for (var spawn = 0; spawn < spawnAdvances.length; spawn++) {
		var spawnAdvance = spawnAdvances[spawn] * depthGrow;
		var childStartX = quantize(startX + directionX * visibleLength * spawnAdvance, grid);
		var childStartY = quantize(startY + directionY * visibleLength * spawnAdvance, grid);
		var childLength = visibleLength * (0.5 + depth * 0.03) * (0.82 + spawn * 0.08);

		for (var fork = 0; fork < forkAngles.length; fork++) {
			var forkAngle = angle + forkAngles[fork];
			var forkIndex = branchIndex * 3 + depth * 13 + spawn * 5 + fork;
			drawBranch(context, childStartX, childStartY, forkAngle, childLength, childGrow, forkIndex, depth + 1, grid, glitchIntensity, timer);
		}
	}
}

function drawGlitchSlices(context, size, grid, amount, timer) {
	if (amount <= 0.01) {
		return;
	}

	var sliceCount = 5;
	context.lineWidth = 0.006 + amount * 0.018;

	for (var i = 0; i < sliceCount; i++) {
		var phase = timer * (7 + i) + i * 19.13;
		if (Math.sin(phase) < 0.15) {
			continue;
		}

		var y = quantize((-0.8 + i * 0.4 + Math.sin(phase * 0.73) * 0.08) * size, grid);
		var width = Math.sqrt(Math.max(0, size * size - y * y));
		var offset = glitchValue(phase, size * 0.32 * amount);
		var x1 = quantize(-width + offset, grid);
		var x2 = quantize(width + offset, grid);

		context.beginPath();
		context.moveTo(x1, y);
		context.lineTo(x2, y);
		context.stroke();
	}
}

export function MonsterProgramming(aPosition, aSize, aTarget) {
	var that = this;

	PlanetParticle.call(this, aPosition, aSize, aTarget, { color: 0xf97316 });

	this.glitchIntensity = 0;
	this.glitchTimer = 0;
	this.nextGlitch = 0.15;
	this.branchGrowCoeff = 0;

	var programThis = function (context) {
		var timer = globalThis.sGeneralTimer || 0;
		var grid = that.size * PIXEL_GRID_RATIO;
		var hover = that.distanceLastProject;
		var glitch = that.glitchIntensity * (0.35 + hover * 0.65);

		context.lineCap = 'square';
		context.lineJoin = 'miter';
		context.lineWidth = 0.012;

		drawPixelCircle(context, that.size, grid, glitch, timer);

		if (that.branchGrowCoeff > 0.01) {
			var branchGrow = that.branchGrowCoeff;
			for (var i = 0; i < BRANCH_ROOT_COUNT; i++) {
				var wobble = Math.sin(timer * (1.2 + i * 0.11) + i) * 0.0 * hover;
				var angle = i / BRANCH_ROOT_COUNT * PI2 + wobble;
				var startX = Math.cos(angle) * that.size;
				var startY = Math.sin(angle) * that.size;
				var branchLength = that.size * (0.62 + (i % 3) * 0.06);
				drawBranch(context, startX, startY, angle, branchLength, branchGrow, i, 0, grid, glitch, timer);
			}
		}

		drawGlitchSlices(context, that.size, grid, glitch, timer);
	};

	this.particle.material.program = programThis;
}

inheritPlanetParticle(MonsterProgramming);

MonsterProgramming.prototype.Update = function (delta) {
	var dt = delta || 0.016;

	if (this.mouseOn) {
		this.distanceLastProject += 0.045;
		this.distanceLastProject = Math.min(1., this.distanceLastProject);
		this.info.material.opacity += 0.012;
		this.info.material.opacity = Math.min(1., this.info.material.opacity);
		this.branchGrowCoeff += dt * 0.28;
	} else {
		this.currentLastProjectString = this.target.name;
		this.distanceLastProject -= 0.035;
		this.distanceLastProject = Math.max(0, this.distanceLastProject);
		this.info.material.opacity -= 0.01;
		this.info.material.opacity = Math.max(globalThis.OPACITY_INFO, this.info.material.opacity);
		this.branchGrowCoeff *= 0.9;
	}

	this.branchGrowCoeff = clampBranchGrow(this.branchGrowCoeff);

	this.glitchTimer += dt;
	this.nextGlitch -= dt;

	if (this.nextGlitch <= 0) {
		this.glitchIntensity = this.mouseOn ? 1 : 0.35;
		this.nextGlitch = 0.12 + Math.random() * 0.75;
		if (this.mouseOn) {
			this.branchGrowCoeff = clampBranchGrow(this.branchGrowCoeff + 0.24);
		}
	} else {
		this.glitchIntensity *= 0.92;
	}
};

globalThis.MonsterProgramming = MonsterProgramming;
