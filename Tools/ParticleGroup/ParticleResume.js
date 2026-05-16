/**
 * Resume landmarks for the About Me particle scene.
 * Each entry: company, title, years, place, description, importance (number, e.g. 1 = big, 0.4 = small), type, yearStart (for chronological path), xOffset (optional, relative to path scale).
 */

var ParticleResume = {};

ParticleResume.ENTRIES = [
	{
		company: "IRCAM",
		title: "Master's degree — Science of Music",
		displayShort: "IRCAM",
		years: "2008–2009",
		place: "Paris, France",
		description: "Graduate studies at IRCAM.",
		importance: 1.1,
		type: "study",
		yearStart: 2008,
		sortOrder: 0,
	},
	{
		company: "Dancing Dots",
		displayShort: "Dancing Dots - Audio Dev",
		title: "Video Game Audio Dev",
		years: "2008",
		place: "Paris, France",
		description:
			"Work on Horse Life 2 PC: programming of the sound manager; recording and processing of 70% of the game's sounds. Game released November 2008.",
		importance: 0.45,
		type: "pro",
		yearStart: 2008,
		sortOrder: 1,
		xOffset: 0.66,
	},
	{
		company: "IRCAM",
		title: "Sound Processing Intern",
		displayShort: "IRCAM Internship",
		years: "2009",
		place: "Paris, France",
		description:
			"Spoken voice real-time transformation: C++ implementation of analysis/synthesis for real-time use; improved the algorithm so users could adjust synthesis parameters to control voice quality.",
		importance: 0.4,
		type: "pro",
		yearStart: 2009,
		xOffset: -0.2,
	},
	{
		company: "Lulu Game",
		title: "Game Developer",
		displayShort: "Lulu's Unreal Exploration",
		years: "2009-2013",
		place: "France - Canada",
		description: "Video game for iPhone.",
		importance: 0.6,
		type: "art",
		yearStart: 2010,
		xOffset: -0.26,
	},
	{
		company: "Konami",
		displayShort: "Konami - Audio Dev",
		title: "Developer / Sound Designer",
		years: "2010",
		place: "Paris, France · On-site",
		description:
			"Pro Evolution Soccer 2010/2011 for smartphones: sound manager programming and part of the GUI using Airplay cross-platform middleware; sound design.",
		importance: 1,
		type: "pro",
		yearStart: 2010,
		xOffset: 0.16,
	},
	{
		company: "Le Cube",
		title: "Developer for Interactive Installation",
		displayShort: "Le Cube",
		years: "2011",
		place: "Issy-les-Moulineaux, France",
		description: "Developed a flexible video player for interactive art installations.",
		importance: 0.4,
		type: "pro",
		yearStart: 2011,
		xOffset: 0.8,
	},
	{
		company: "Tangible Interaction",
		displayShort: "Tangible Interaction",
		title: "Engineer",
		years: "2012 – 2015",
		place: "Vancouver",
		description:
			"Tangible Interaction blends art, design and technology for interactive experiences shown worldwide.\n\nDeveloped autonomously most of their recent applications: Cortex (control lights/motors with interaction); Mozza (Twitter/Instagram/Vine visualizer with 360° projection); driver for an innovative Graffiti Wall sensor.\n\nRobust, long-running installs presented at SXSW (Austin), Eyeo Festival (Minneapolis), Purity Ring concerts (Pitchfork), MTV Spring Break, Osheaga (Montreal).\n\nStack: C++, JavaScript, HTML, CSS, Max/MSP, Cinder, OpenFrameworks, WebGL, TUIO.",
		importance: 1.3,
		type: "pro",
		yearStart: 2012,
		xOffset: -0.2,
	},
	{
		company: "Musical Box",
		title: "Workshop Series",
		years: "2016",
		place: "Bucharest, Romania",
		description:
			"Workshop for kids experimenting with sound through drawn compositions.",
		importance: 0.45,
		type: "art",
		yearStart: 2016,
		xOffset: -0.5,
	},
	{
		company: "Onde de Choc",
		title: "Dance Performance",
		displayShort: "Onde de Choc",
		years: "2013",
		place: "Yukon Art Centre",
		description:
			"Opening of Onde de choc — improvised performance: dance and interactive visuals. Shayla Oxley — dance & interaction with visuals — William…",
		importance: 0.4,
		type: "art",
		yearStart: 2013,
		xOffset: 0.2,
	},
	{
		company: "Fête des Lumières",
		title: "Cocoons — Artist / Developer",
		years: "2015",
		place: "Lyon, France",
		description:
			"Cocoons is an interactive audiovisual installation: thirteen cocoons on rooftops in Lyon. They react to light from phones and flashlights, responding with sound and light for a new kind of dialogue with the public.",
		importance: 0.7,
		type: "art",
		yearStart: 2015,
		xOffset: -0.4,
	},
	{
		company: "Projection Intérieure Projection",
		title: "Artist / Developer",
		years: "",
		place: "",
		description:
			"Art exhibition in collaboration with Marten Berkman, Yukon-based 3D filmmaker.",
		importance: 0.45,
		type: "art",
		yearStart: 2014,
		xOffset: 0.0,
	},
	{
		company: "",
		title: "Womb",
		years: "2015",
		place: "",
		description: "Interactive audiovisual experience in a dome.",
		importance: 0.4,
		type: "art",
		yearStart: 2016,
		xOffset: 1.1,
	},
	{
		company: "Triber",
		title: "Mobile Developer",
		years: "2015",
		place: "Greater Paris Metropolitan Region",
		description:
			"Development of Triber, a cross-platform mobile app (Cordova/Ionic) letting users create and share their own mobile applications. Mostly AngularJS.",
		importance: 0.45,
		type: "pro",
		yearStart: 2015,
		xOffset: 0.4,
	},
	// {
	// 	company: "OrchPlay",
	// 	title: "Software Developer",
	// 	years: "2016 – 2025",
	// 	place: "Montreal · Remote",
	// 	description:
	// 		"Development of OrchPlay, educational musical software playing very high-quality orchestral material using a custom format. Control each instrument independently; educational visualizations; library download and management. Client in C++ (JUCE); server in Rails.\n\nOrchPlayMusic builds technologies for musical education and appreciation linked to the OrchPlay Library of multitrack excerpts (~100 works).",
	// 	importance: 1.2,
	// 	type: "pro",
	// 	yearStart: 2016,
	// 	xOffset: 0.9,
	// },
	{
		company: "McGill University",
		title: "Orchview / Orchplay",
		years: "2018 – 2025",
		place: "Montreal · Remote",
		description:
			"Programming OrchView, software for classical music theory researchers: annotate scores with maximum automation and versatility for conversion into the Orchard Database.\n\nSkills: software infrastructure, software development.",
		importance: 1.3,
		type: "pro",
		yearStart: 2016,
		xOffset: 0.4,
		
	},
	{
		company: "Badly Drawn",
		title: "Founder",
		years: "Jan 2025 – Present",
		place: "Paris, Île-de-France, France",
		description:
			"Design and development of Badly Drawn — draw silly things and share with friends. Drawings appear live in friends' apps; stick friends' drawings on home-screen widgets; print favourites on merch; occasional surprise events to spark creativity.\n\nSkills: software design, Flutter, and more.",
		importance: 1.1,
		type: "pro",
		yearStart: 2025,
		xOffset: -0.1,
	},
];

ParticleResume.importanceToSize = function (importance) {
	if (typeof importance === "number" && isFinite(importance)) {
		return importance;
	}
	return 0.4;
};

ParticleResume.shortLabel = function (entry) {
	var parts = [];
	if (entry.displayShort && String(entry.displayShort).length > 0) {
		return entry.displayShort;
	}
	if (entry.company && String(entry.company).length > 0) parts.push(entry.company);
	if (entry.title && String(entry.title).length > 0) parts.push(entry.title);
	var s = parts.length > 0 ? parts.join(" · ") : entry.title || "Resume";
	if (s.length > 48) s = s.slice(0, 45) + "…";
	return s;
};

/**
 * Converts a resume entry into the flyer-shaped object expected by ParticleCircleNavigate.
 */
ParticleResume.toFlyer = function (entry) {
	var hasCompany = entry.company && String(entry.company).length > 0;
	return {
		name: entry.importance >= 0.5 ? (hasCompany ? entry.company : ParticleResume.shortLabel(entry)) : "",
		subTitle: entry.importance >= 0.5 && hasCompany ? entry.title : "",
		size: ParticleResume.importanceToSize(entry.importance),
		resumeEntry: entry,
	};
};

ParticleResume.isTangibleInteraction = function (entry) {
	return entry && entry.company === "Tangible Interaction";
};

ParticleResume.drawTangibleInteractionLogo = function (context, colorStyle) {
	context.save();
	context.strokeStyle = colorStyle;
	context.fillStyle = colorStyle;
	context.lineWidth = 0.32;
	context.lineCap = "round";
	context.lineJoin = "round";
	var length = 0.34;
	context.rotate(Math.PI);

	context.beginPath();
	context.moveTo(-length, -0.0);
	context.lineTo(length, -0.0);
	context.stroke();

	context.beginPath();
	context.moveTo(0, -0.0);
	context.lineTo(0, length);
	context.stroke();

	context.beginPath();
	context.arc(0, -length - 0.06, 0.16, 0, Math.PI * 2);
	context.fill();

	context.restore();
};

ParticleResume.composeProgramWithTangibleInteractionLogo = function (baseProgram, particle, logoColorStyle) {
	return function (context) {
		baseProgram(context);
		var colorStyle = logoColorStyle || particle.material.color.getContextStyle();
		ParticleResume.drawTangibleInteractionLogo(context, colorStyle);
	};
};

ParticleResume.tangibleInteractionPrograms = function (particle) {
	return {
		stroke: ParticleResume.composeProgramWithTangibleInteractionLogo(programStroke, particle),
		fill: ParticleResume.composeProgramWithTangibleInteractionLogo(programFill, particle, "#ffffff"),
		triangle: ParticleResume.composeProgramWithTangibleInteractionLogo(programTriangle, particle, "#ffffff"),
	};
};

ParticleResume.getChronological = function () {
	var list = ParticleResume.ENTRIES.slice();
	list.sort(function (a, b) {
		var ya = typeof a.yearStart === "number" ? a.yearStart : 0;
		var yb = typeof b.yearStart === "number" ? b.yearStart : 0;
		if (ya !== yb) return ya - yb;
		var oa = typeof a.sortOrder === "number" ? a.sortOrder : 0;
		var ob = typeof b.sortOrder === "number" ? b.sortOrder : 0;
		if (oa !== ob) return oa - ob;
		var ta = (a.type || "") + ParticleResume.shortLabel(a);
		var tb = (b.type || "") + ParticleResume.shortLabel(b);
		return ta.localeCompare(tb);
	});
	return list;
};

/**
 * Stable pseudo-random phase from entry + index (no Math.random).
 */
ParticleResume._deterministicPhase = function (entry, index) {
	var h = ((index + 1) * 92837111) >>> 0;
	if (entry && typeof entry.yearStart === "number") {
		h = (h ^ (entry.yearStart * 2654435761)) >>> 0;
	}
	var shortLabel = entry ? ParticleResume.shortLabel(entry) : "";
	for (var c = 0; c < shortLabel.length; c++) {
		h = (h * 33 + shortLabel.charCodeAt(c)) >>> 0;
	}
	var t = entry && entry.type ? entry.type : "";
	h = (h ^ (t.length * 374761393)) >>> 0;
	return ((h % 6283) / 6283) * Math.PI * 2;
};

/**
 * Spine point + horizontal offset (Z fixed). Y stays chronological.
 */
ParticleResume.pathPosition = function (index, total, center, pathScale, entry) {
	var t = total <= 1 ? 0.5 : index / (total - 1);
	var verticalSpan = pathScale * 1.75;
	var y = center.y + verticalSpan * 0.5 * (1 - 2 * t) + pathScale * 0.02;
	var curveAmp = pathScale * 1.20;
	var x = center.x + curveAmp * Math.sin(t * Math.PI) - pathScale * 0.5;
	if (entry && typeof entry.xOffset === "number" && isFinite(entry.xOffset)) {
		x += entry.xOffset * pathScale;
	}
	if (total <= 1) {
		return new THREE.Vector3(x, y, center.z);
	}
	var GOLDEN = 2.39996322972865332;
	var lateralScale = pathScale * 0.17;
	var phase = ParticleResume._deterministicPhase(entry, index);
	var lateral = lateralScale * Math.sin(index * GOLDEN + phase);
	return new THREE.Vector3(x + lateral, y, center.z);
};

ParticleResume.pathSpinePosition = function (index, total, center, pathScale) {
	var t = total <= 1 ? 0.5 : index / (total - 1);
	var verticalSpan = pathScale * 1.75;
	var y = center.y + verticalSpan * 0.5 * (1 - 2 * t) + pathScale * 0.02;
	var curveAmp = pathScale * 1.20;
	var x = center.x + curveAmp * Math.sin(t * Math.PI) - pathScale * 0.3;
	return new THREE.Vector3(x, y, center.z);
};

ParticleResume.decorativePathAnchor = function (index, total, center, pathScale, entry, entryPosition) {
	var spine = ParticleResume.pathSpinePosition(index, total, center, pathScale);
	if (!entryPosition) {
		return spine;
	}
	var coeff = Math.min(1, ParticleResume.importanceToSize(entry.importance * 0));
	coeff = coeff * coeff;
	return new THREE.Vector3(
		spine.x * (1 - coeff) + entryPosition.x * coeff,
		spine.y * (1 - coeff) + entryPosition.y * coeff,
		spine.z * (1 - coeff) + entryPosition.z * coeff
	);
};

ParticleResume._catmullRomPoint = function (p0, p1, p2, p3, t) {
	var t2 = t * t;
	var t3 = t2 * t;
	return new THREE.Vector3(
		0.5 *
			(2 * p1.x +
				(-p0.x + p2.x) * t +
				(2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 +
				(-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3),
		0.5 *
			(2 * p1.y +
				(-p0.y + p2.y) * t +
				(2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 +
				(-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3),
		p1.z + (p2.z - p1.z) * t
	);
};

ParticleResume._hermitePoint = function (p1, p2, m1, m2, t) {
	var t2 = t * t;
	var t3 = t2 * t;
	var h00 = 2 * t3 - 3 * t2 + 1;
	var h10 = t3 - 2 * t2 + t;
	var h01 = -2 * t3 + 3 * t2;
	var h11 = t3 - t2;
	return new THREE.Vector3(
		p1.x * h00 + m1.x * h10 + p2.x * h01 + m2.x * h11,
		p1.y * h00 + m1.y * h10 + p2.y * h01 + m2.y * h11,
		p1.z * h00 + m1.z * h10 + p2.z * h01 + m2.z * h11
	);
};

ParticleResume._anchorTangent = function (anchors, index) {
	var prev = anchors[Math.max(0, index - 1)];
	var next = anchors[Math.min(anchors.length - 1, index + 1)];
	return new THREE.Vector3((next.x - prev.x) * 0.5, (next.y - prev.y) * 0.5, (next.z - prev.z) * 0.5);
};

ParticleResume._pushDecorativeLoop = function (points, base, tangent, radius, direction) {
	var tangentLength = Math.sqrt(tangent.x * tangent.x + tangent.y * tangent.y);
	if (tangentLength < 1e-6) {
		return;
	}
	var tx = tangent.x / tangentLength;
	var ty = tangent.y / tangentLength;
	var nx = -ty * direction;
	var ny = tx * direction;
	for (var i = 0; i <= 24; i++) {
		var a = (i / 24) * Math.PI * 2;
		points.push(
			new THREE.Vector3(
				base.x + tx * Math.sin(a) * radius * 1.05 + nx * (1 - Math.cos(a)) * radius,
				base.y + ty * Math.sin(a) * radius * 1.05 + ny * (1 - Math.cos(a)) * radius,
				base.z
			)
		);
	}
};

ParticleResume.decorativePathPoints = function (entries, center, pathScale, entryPositions) {
	var total = entries.length;
	var anchors = [];
	var i;
	if (total < 2) {
		return anchors;
	}
	for (i = 0; i < total; i++) {
		anchors.push(
			ParticleResume.decorativePathAnchor(
				i,
				total,
				center,
				pathScale,
				entries[i],
				entryPositions && entryPositions.length === total ? entryPositions[i] : null
			)
		);
	}

	var points = [];
	for (i = 0; i < total - 1; i++) {
		var p1 = anchors[i];
		var p2 = anchors[i + 1];
		var tangentIn = ParticleResume._anchorTangent(anchors, i);
		var tangentOut = ParticleResume._anchorTangent(anchors, i + 1);
		var samples = 24;
		for (var s = 0; s < samples; s++) {
			var t = s / samples;
			points.push(ParticleResume._hermitePoint(p1, p2, tangentIn, tangentOut, t));
		}
	}
	points.push(anchors[total - 1].clone());
	return points;
};

ParticleResume.createDecorativeDashedPath = function (entries, center, pathScale, entryPositions) {
	var points = ParticleResume.decorativePathPoints(entries, center, pathScale, entryPositions);
	var geometry = new THREE.Geometry();
	if (points.length < 2) {
		return new THREE.Line(geometry, new THREE.LineBasicMaterial({ color: 0xcccccc }), THREE.LinePieces);
	}

	var dashLength = pathScale * 0.045;
	var gapLength = pathScale * 0.028;
	var drawRemaining = dashLength;
	var gapRemaining = 0;

	for (var i = 1; i < points.length; i++) {
		var from = points[i - 1].clone();
		var to = points[i];
		var dx = to.x - from.x;
		var dy = to.y - from.y;
		var dz = to.z - from.z;
		var length = Math.sqrt(dx * dx + dy * dy + dz * dz);
		if (length < 1e-6) {
			continue;
		}
		var ux = dx / length;
		var uy = dy / length;
		var uz = dz / length;
		var walked = 0;
		while (walked < length) {
			var remaining = length - walked;
			if (gapRemaining > 0) {
				var gapStep = Math.min(gapRemaining, remaining);
				walked += gapStep;
				gapRemaining -= gapStep;
				if (gapRemaining <= 1e-6) {
					drawRemaining = dashLength;
				}
			} else {
				var drawStep = Math.min(drawRemaining, remaining);
				var start = new THREE.Vector3(from.x + ux * walked, from.y + uy * walked, from.z + uz * walked);
				var end = new THREE.Vector3(
					from.x + ux * (walked + drawStep),
					from.y + uy * (walked + drawStep),
					from.z + uz * (walked + drawStep)
				);
				geometry.vertices.push(start);
				geometry.vertices.push(end);
				walked += drawStep;
				drawRemaining -= drawStep;
				if (drawRemaining <= 1e-6) {
					gapRemaining = gapLength;
				}
			}
		}
	}
	geometry.computeBoundingSphere();
	var material = new THREE.LineBasicMaterial({
		color: 0xaaaaaa,
		linewidth: 1,
		opacity: 0.35,
		transparent: true,
	});
	return new THREE.Line(geometry, material, THREE.LinePieces);
};

/**
 * Full layout: starts from pathPosition for each entry, then applies deterministic
 * pairwise separation while springing back toward those anchors so the curve stays coherent.
 */
ParticleResume.layoutResumeParticlePositions = function (entries, center, pathScale) {
	var total = entries.length;
	var positions = [];
	var i;
	if (total === 0) {
		return positions;
	}
	for (i = 0; i < total; i++) {
		positions.push(ParticleResume.pathPosition(i, total, center, pathScale, entries[i]).clone());
	}
	var anchors = [];
	for (i = 0; i < total; i++) {
		anchors.push({ x: positions[i].x, y: positions[i].y });
	}
	var sizes = [];
	for (i = 0; i < total; i++) {
		sizes.push(ParticleResume.importanceToSize(entries[i].importance));
	}
	var baseSep = pathScale * 0.2;
	var iterations = Math.min(16, 6 + Math.floor(total * 0.75));
	var iter, j, dx, dy, distSq, dist, minDist, minDistSq, overlap, ox, attract;
	for (iter = 0; iter < iterations; iter++) {
		var deltas = [];
		for (i = 0; i < total; i++) {
			deltas.push({ x: 0, y: 0 });
		}
		for (i = 0; i < total; i++) {
			for (j = i + 1; j < total; j++) {
				dx = positions[j].x - positions[i].x;
				dy = positions[j].y - positions[i].y;
				distSq = dx * dx + dy * dy;
				minDist = baseSep * (0.72 + (sizes[i] + sizes[j]) * 0.52);
				minDistSq = minDist * minDist;
				if (distSq > 1e-16 && distSq < minDistSq) {
					dist = Math.sqrt(distSq);
					overlap = ((minDist - dist) / dist) * 0.52;
					ox = dx * overlap;
					deltas[i].x -= ox;
					deltas[j].x += ox;
				}
			}
		}
		attract = 0.2;
		for (i = 0; i < total; i++) {
			deltas[i].x += (anchors[i].x - positions[i].x) * attract;
			deltas[i].y += (anchors[i].y - positions[i].y) * attract;
		}
		for (i = 0; i < total; i++) {
			positions[i].x += deltas[i].x;
			positions[i].y += deltas[i].y;
			positions[i].z = center.z;
		}
	}
	return positions;
};
