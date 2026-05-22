/**
 * Resume landmarks for the About Me particle scene.
 * Each entry: company, title, years, place, description (HTML panel via ParticleResume_descriptionHtml), importance (number, e.g. 1 = big, 0.4 = small), type, yearStart (for chronological path), xOffset (optional, relative to path scale), calloutAngle (optional degrees for small-entry hover label).
 */

var ParticleResume = {};

function ParticleResume_descriptionHtml(company, title, years, place, paragraphs) {
	var taglineParts = [];
	if (title) taglineParts.push(title);
	if (years) taglineParts.push(years);
	if (place) taglineParts.push(place);
	var html = '<header class="about-description__header">';
	html += '<h2 class="about-description__name">' + company + '</h2>';
	if (taglineParts.length > 0) {
		html += '<p class="about-description__tagline">' + taglineParts.join(' · ') + '</p>';
	}
	html += '</header><div class="about-description__body">';
	for (var i = 0; i < paragraphs.length; i++) {
		html += '<p>' + paragraphs[i] + '</p>';
	}
	return html + '</div>';
}

ParticleResume.ENTRIES = [
	{
		company: "IRCAM",
		title: "Master's degree — Science of Music",
		displayShort: "IRCAM",
		years: "2008–2009",
		place: "Paris, France",
		description: ParticleResume_descriptionHtml(
			"IRCAM",
			"Master's degree — Science of Music",
			"2008–2009",
			"Paris, France",
			["Graduate studies at IRCAM."]
		),
		importance: 1.1,
		type: "study",
		yearStart: 2008,
		sortOrder: 0,
	},
	{
		company: "Dancing Dots",
		displayShort: "Dancing Dots - Audio Dev",
		title: "Video Game Audio",
		years: "2008",
		place: "Paris, France",
		description: ParticleResume_descriptionHtml(
			"Dancing Dots",
			"Video Game Audio",
			"2008",
			"Paris, France",
			[
				"Work on <em>Horse Life 2</em> PC: programming of the sound manager; recording and processing of 70% of the game's sounds. Game released November 2008.",
			]
		),
		importance: 0.45,
		type: "pro",
		yearStart: 2008,
		sortOrder: 1,
		xOffset: 0.5,
		calloutAngle: -0.8,
	},
	{
		company: "IRCAM",
		title: "Sound Processing Intern",
		displayShort: "IRCAM Internship",
		years: "2009",
		place: "Paris, France",
		description: ParticleResume_descriptionHtml(
			"IRCAM",
			"Sound Processing Intern",
			"2009",
			"Paris, France",
			[
				"Spoken voice real-time transformation: C++ implementation of analysis/synthesis for real-time use; improved the algorithm so users could adjust synthesis parameters to control voice quality.",
			]
		),
		importance: 0.4,
		type: "pro",
		yearStart: 2009,
		xOffset: -0.2,
	},
	{
		company: "Lulu's Exploration",
		title: "Video Game",
		displayShort: "Lulu's Unreal Exploration",
		years: "2009-2013",
		place: "France - Canada",
		description: ParticleResume_descriptionHtml(
			"Lulu's Exploration",
			"Video Game",
			"2009–2013",
			"France · Canada",
			["Video game for iPhone."]
		),
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
		description: ParticleResume_descriptionHtml(
			"Konami",
			"Developer / Sound Designer",
			"2010",
			"Paris, France · On-site",
			[
				"<em>Pro Evolution Soccer 2010/2011</em> for smartphones: sound manager programming and part of the GUI using Airplay cross-platform middleware; sound design.",
			]
		),
		importance: 1,
		type: "pro",
		yearStart: 2010,
		xOffset: 0.16,
	},
	{
		company: "Le Cube",
		title: "Interactive Installation Dev",
		displayShort: "Le Cube",
		years: "2011",
		place: "Issy-les-Moulineaux, France",
		description: ParticleResume_descriptionHtml(
			"Le Cube",
			"Interactive Installation Dev",
			"2011",
			"Issy-les-Moulineaux, France",
			["Developed a flexible video player for interactive art installations."]
		),
		importance: 0.4,
		type: "pro",
		yearStart: 2011,
		xOffset: 0.8,
		calloutAngle: -2,
	},
	{
		company: "Tangible Interaction",
		displayShort: "Tangible Interaction",
		title: "Engineer",
		years: "2012 – 2015",
		place: "Vancouver",
		description: ParticleResume_descriptionHtml(
			"Tangible Interaction",
			"Engineer",
			"2012 – 2015",
			"Vancouver",
			[
				"Tangible Interaction blends art, design and technology for interactive experiences shown worldwide.",
				"Developed autonomously most of their recent applications: Cortex (control lights/motors with interaction); Mozza (Twitter/Instagram/Vine visualizer with 360° projection); driver for an innovative Graffiti Wall sensor.",
				"Robust, long-running installs presented at SXSW (Austin), Eyeo Festival (Minneapolis), Purity Ring concerts (Pitchfork), MTV Spring Break, Osheaga (Montreal).",
				"<em>Stack:</em> C++, JavaScript, HTML, CSS, Max/MSP, Cinder, OpenFrameworks, WebGL, TUIO.",
			]
		),
		importance: 1.4,
		type: "pro",
		yearStart: 2012,
		xOffset: -0.4,
	},
	{
		company: "Social Mosa",
		displayShort: "Social Mosa",
		title: "Instagram Visualizer for Events",
		years: "2012 – 2015",
		place: "Vancouver",
		description: ParticleResume_descriptionHtml(
			"Social Mosa",
			"Instagram Visualizer for Events",
			"2012 – 2015",
			"Vancouver",
			[
				"Development of Social Mozaic, a Twitter/Instagram/Vine visualizer with 360° projection.",
			]
		),
		importance: 0.3,
		type: "pro",
		yearStart: 2012,
		xOffset: -0.4,
		satteliteOf:"Tangible Interaction"
	},
	{
		company: "Halo",
		displayShort: "Halo",
		title: "Light Installation",
		years: "2012 – 2015",
		place: "Vancouver",
		description: ParticleResume_descriptionHtml(
			"Halo",
			"Light Installation",
			"2012 – 2015",
			"Vancouver",
			["Halo is a light installation that reacts to the movement of the audience."]
		),
		importance: 0.3,
		type: "pro",
		yearStart: 2012,
		xOffset: -0.4,
		satteliteOf:"Tangible Interaction"
	},
	{
		company: "Cortex",
		displayShort: "Halo",
		title: "Light Control Software",
		years: "2012 – 2015",
		place: "Vancouver",
		description: ParticleResume_descriptionHtml(
			"Cortex",
			"Light Control Software",
			"2012 – 2015",
			"Vancouver",
			["Cortex is a software for controlling lights and motors with interaction."]
		),
		importance: 0.3,
		type: "pro",
		yearStart: 2012,
		xOffset: -0.4,
		satteliteOf:"Tangible Interaction"
	},
	{
		company: "Graffiti Wall",
		displayShort: "Halo",
		title: "Digital Graffiti Wall",
		years: "2012 – 2015",
		place: "Vancouver",
		description: ParticleResume_descriptionHtml(
			"Graffiti Wall",
			"Digital Graffiti Wall",
			"2012 – 2015",
			"Vancouver",
			[
				"Driver for an innovative Graffiti Wall sensor — digital spray-paint on a large interactive wall.",
			]
		),
		importance: 0.3,
		type: "pro",
		yearStart: 2012,
		xOffset: -0.4,
		satteliteOf:"Tangible Interaction"
	},
	{
		company: "Visitor",
		displayShort: "Halo",
		title: "Light Scrulpture",
		years: "2012 – 2015",
		place: "Vancouver",
		description: ParticleResume_descriptionHtml(
			"Visitor",
			"Light Scrulpture",
			"2012 – 2015",
			"Vancouver",
			["Visitor is a 3D light sculpture that reacts to the touch."]
		),
		importance: 0.3,
		type: "pro",
		yearStart: 2015,
		xOffset: -0.4,
		satteliteOf:"Tangible Interaction"
	},
	{
		company: "Musical Box",
		title: "Workshop Series",
		years: "2016",
		place: "Bucharest, Romania",
		description: ParticleResume_descriptionHtml(
			"Musical Box",
			"Workshop Series",
			"2016",
			"Bucharest, Romania",
			["Workshop for kids experimenting with sound through drawn compositions."]
		),
		importance: 0.45,
		type: "art",
		yearStart: 2016,
		xOffset: -0.3,
		calloutAngle: -2,
	},
	{
		company: "Onde de Choc",
		title: "Dance Performance",
		displayShort: "Onde de Choc",
		years: "2013",
		place: "Yukon Art Centre",
		description: ParticleResume_descriptionHtml(
			"Onde de Choc",
			"Dance Performance",
			"2013",
			"Yukon Art Centre",
			[
				"Opening of <em>Onde de choc</em> — improvised performance: dance and interactive visuals. Shayla Oxley — dance &amp; interaction with visuals — William…",
			]
		),
		importance: 0.4,
		type: "art",
		yearStart: 2013,
		xOffset: -0.2,
	},
	{
		company: "Cocoons - Fête des Lumières",
		title: "Light and Sound Interactive Installation",
		years: "2015",
		place: "Lyon, France",
		description: ParticleResume_descriptionHtml(
			"Cocoons",
			"Light and Sound Interactive Installation",
			"2015",
			"Lyon, France",
			[
				"Cocoons is an interactive audiovisual installation: thirteen cocoons on rooftops in Lyon. They react to light from phones and flashlights, responding with sound and light for a new kind of dialogue with the public.",
			]
		),
		importance: 0.7,
		type: "art",
		yearStart: 2015,
		xOffset: -0.4,
	},
	{
		company: "Projection Intérieure Projection",
		title: "Interactive Video Installation",
		years: "",
		place: "",
		description: ParticleResume_descriptionHtml(
			"Projection Intérieure Projection",
			"Interactive Video Installation",
			"",
			"",
			[
				"Art exhibition in collaboration with Marten Berkman, Yukon-based 3D filmmaker.",
			]
		),
		importance: 0.45,
		type: "art",
		yearStart: 2014,
		xOffset: 0.2,
	},
	{
		company: "Womb",
		title: "360 InteractiveVideo",
		years: "2015",
		place: "",
		description: ParticleResume_descriptionHtml(
			"Womb",
			"360 Interactive Video",
			"2015",
			"",
			["Interactive audiovisual experience in a dome."]
		),
		importance: 0.4,
		type: "art",
		yearStart: 2016,
		xOffset: 0.6,
		calloutAngle: -0.4,
	},
	{
		company: "Triber",
		title: "Mobile Developer",
		years: "2015",
		place: "Greater Paris Metropolitan Region",
		description: ParticleResume_descriptionHtml(
			"Triber",
			"Mobile Developer",
			"2015",
			"Greater Paris Metropolitan Region",
			[
				"Development of Triber, a cross-platform mobile app (Cordova/Ionic) letting users create and share their own mobile applications. Mostly AngularJS.",
			]
		),
		importance: 0.45,
		type: "pro",
		yearStart: 2015,
		xOffset: 0.4,
		calloutAngle: 0.4,
	},
	{
		company: "Шагни через границу",
		title: "Comics Exhibition - Bishkek",
		years: "2019",
		place: "Bishkek, Kyrgyzstan",
		description: ParticleResume_descriptionHtml(
			"Шагни через границу",
			"Comics Exhibition",
			"2019",
			"Bishkek, Kyrgyzstan",
			["Comics exhibition held in Bishkek, Kyrgyzstan."]
		),
		importance: 0.45,
		type: "art",
		yearStart: 2019,
		xOffset: 0.9,
		calloutAngle: -0.4,
	},
	{
		company: "McGill University",
		title: "Orchview / Orchplay",
		years: "2018 – 2025",
		place: "Montreal · Remote",
		description: ParticleResume_descriptionHtml(
			"McGill University",
			"Orchview / Orchplay",
			"2018 – 2025",
			"Montreal · Remote",
			[
				"Programming OrchView, software for classical music theory researchers: annotate scores with maximum automation and versatility for conversion into the Orchard Database.",
				"<em>Skills:</em> software infrastructure, software development.",
			]
		),
		importance: 1.3,
		type: "pro",
		yearStart: 2016,
		xOffset: -0.1,
	},
	{
		company: "Orchplay",
		title: "Educational Musical Software",
		years: "2018 – 2025",
		place: "Montreal · Remote",
		description: ParticleResume_descriptionHtml(
			"Orchplay",
			"Educational Musical Software",
			"2018 – 2025",
			"Montreal · Remote",
			[
				"Development of OrchPlay, educational musical software playing very high-quality orchestral material using a custom format. Control each instrument independently; educational visualizations; library download and management. Client in C++ (JUCE); server in Rails.",
				"OrchPlayMusic builds technologies for musical education and appreciation linked to the OrchPlay Library of multitrack excerpts (~100 works).",
			]
		),
		importance: 0.3,
		type: "pro",
		yearStart: 2016,
		xOffset: -0.1,
		satteliteOf:"McGill University"
	},
	{
		company: "Orchview",
		title: "Research Tool for Music Theory",
		years: "2018 – 2025",
		place: "Montreal · Remote",
		description: ParticleResume_descriptionHtml(
			"Orchview",
			"Research Tool for Music Theory",
			"2018 – 2025",
			"Montreal · Remote",
			[
				"Programming OrchView, software for classical music theory researchers: annotate scores with maximum automation and versatility for conversion into the Orchard Database.",
				"<em>Skills:</em> software infrastructure, software development.",
			]
		),
		importance: 0.3,
		type: "pro",
		yearStart: 2018,
		xOffset: -0.1,
		satteliteOf:"McGill University"
	},
	{
		company: "Badly Drawn",
		title: "Founder",
		years: "Jan 2025 – Present",
		place: "Paris, Île-de-France, France",
		description: ParticleResume_descriptionHtml(
			"Badly Drawn",
			"Founder",
			"Jan 2025 – Present",
			"Paris, Île-de-France, France",
			[
				"Design and development of Badly Drawn — draw silly things and share with friends. Drawings appear live in friends' apps; stick friends' drawings on home-screen widgets; print favourites on merch; occasional surprise events to spark creativity.",
				"<em>Skills:</em> software design, Flutter, and more.",
			]
		),
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

ParticleResume.isLowImportance = function (entry) {
	return entry && typeof entry.importance === "number" && entry.importance < 0.5;
};

ParticleResume.lowImportanceName = function (entry) {
	if (entry.company && String(entry.company).length > 0) {
		return entry.company;
	}
	return ParticleResume.shortLabel(entry);
};

ParticleResume.lowImportanceSubTitle = function (entry) {
	if (entry.company && String(entry.company).length > 0 && entry.title && String(entry.title).length > 0) {
		return entry.title;
	}
	if (entry.years && String(entry.years).length > 0) {
		return entry.years;
	}
	return entry.place || "";
};

ParticleResume.lowImportanceCalloutAngle = function (entry, side) {
	if (entry && typeof entry.calloutAngle === "number" && isFinite(entry.calloutAngle)) {
		return entry.calloutAngle;
	}
	return Math.atan2(-1.35, side * (7.1 - 2.45));
};

ParticleResume.drawWavyCircle = function (context, phase, entry) {
	var radius = 0.6;
	var waveCount = 34 * entry.importance * 2.2;
	var steps = 120;
	var amplitude = 0.47;
	// context.lineWidth = 0.008;
	context.beginPath();
	for (var i = 0; i <= steps; i++) {
		var angle = (i / steps) * PI2;
		var waveRadius = radius + Math.sin(angle * waveCount + phase) * amplitude;
		var x = Math.cos(angle) * waveRadius;
		var y = Math.sin(angle) * waveRadius;
		if (i === 0) {
			context.moveTo(x, y);
		} else {
			context.lineTo(x, y);
		}
	}
	context.closePath();
};

ParticleResume.wavyCirclePhase = function (entry) {
	return ParticleResume._deterministicPhase(entry, 0);
};

ParticleResume.wavyCircleStrokeProgram = function (entry) {
	var phase = ParticleResume.wavyCirclePhase(entry);
	return function (context) {
		context.lineWidth = 0.008;
		ParticleResume.drawWavyCircle(context, phase, entry);
		context.stroke();
	};
};

ParticleResume.wavyCircleFillProgram = function (entry) {
	var phase = ParticleResume.wavyCirclePhase(entry);
	return function (context) {
		context.lineWidth = 0.012;
		ParticleResume.drawWavyCircle(context, phase, entry);
		context.stroke();
	};
};

ParticleResume.wavyCircleTriangleProgram = function (entry) {
	var fillProgram = ParticleResume.wavyCircleFillProgram(entry);
	return function (context) {
		fillProgram(context);
		context.fillStyle = "#000000";
		context.beginPath();
		context.moveTo(-0.5 + 0.2, 0.5);
		context.lineTo(0.5 + 0.2, 0);
		context.lineTo(-0.5 + 0.2, -0.5);
		context.fill();
		context.fillStyle = "#ffffff";
	};
};

ParticleResume.wavyCirclePrograms = function (entry) {
	return {
		stroke: ParticleResume.wavyCircleStrokeProgram(entry),
		fill: ParticleResume.wavyCircleFillProgram(entry),
		triangle: ParticleResume.wavyCircleTriangleProgram(entry),
	};
};

function ParticleResumeLowImportanceEntry(position, entry, aColor, labelCenter) {
	var flyer = ParticleResume.toFlyer(entry);
	var particle = new ParticleCircleNavigate(position, flyer, aColor);
	var baseInfo = particle.TargetObject.info;
	var defaultSide = labelCenter && position.x > labelCenter.x ? -1 : 1;
	var calloutState = {
		progress: 0,
		target: 0,
		name: ParticleResume.lowImportanceName(entry),
		subTitle: ParticleResume.lowImportanceSubTitle(entry),
		angle: ParticleResume.lowImportanceCalloutAngle(entry, defaultSide),
	};

	var clamp01 = function (value) {
		return Math.max(0, Math.min(1, value));
	};

	var visibleText = function (text, progress) {
		if (!text || text.length === 0) {
			return "";
		}
		return text.substring(0, Math.floor(text.length * clamp01(progress)));
	};

	var calloutCircleScaleMul = function () {
		var tObj = particle.TargetObject;
		var mul = 1;
		if (tObj.size) {
			mul *= tObj.size;
		}
		if (isdefined(tObj.scale)) {
			mul *= tObj.scale;
		}
		return isFinite(mul) && mul > 0 ? mul : 1;
	};

	var programCallout = function (context) {
		var progress = calloutState.progress;
		if (progress <= 0.001) {
			return;
		}

		var textComp = 0.5 / calloutCircleScaleMul();

		var lineProgress = clamp01(progress / 0.42);
		var nameProgress = clamp01((progress - 0.28) / 0.44);
		var subTitleProgress = clamp01((progress - 0.48) / 0.42);
		var directionX = Math.cos(calloutState.angle);
		var directionY = Math.sin(calloutState.angle);
		var side = directionX < 0 ? -1 : 1;
		var startX = directionX * 2.45;
		var startY = directionY * 2.45;
		var endX = directionX * 7.25;
		var endY = directionY * 7.25;
		var drawEndX = startX + (endX - startX) * lineProgress;
		var drawEndY = startY + (endY - startY) * lineProgress;
		var textX = endX + side * 0.5 * textComp;

		context.save();
		context.strokeStyle = "#555555";
		context.fillStyle = "#555555";
		context.lineWidth = 0.08 * textComp;
		context.lineCap = "round";
		context.textAlign = side > 0 ? "left" : "right";
		context.textBaseline = "middle";

		context.beginPath();
		context.moveTo(startX, startY);
		context.lineTo(drawEndX, drawEndY);
		context.stroke();

		if (nameProgress > 0) {
			context.font = 2.25 * textComp + "pt TitleText";
			context.fillText(visibleText(calloutState.name, nameProgress), textX, endY - 1 * textComp);
		}
		if (subTitleProgress > 0 && calloutState.subTitle && calloutState.subTitle.length > 0) {
			context.font = 1.45 * textComp + "pt TitleText";
			context.fillText(visibleText(calloutState.subTitle, subTitleProgress), textX, endY + 1.2 * textComp);
		}

		context.restore();
	};

	var callout = new THREE.Particle(
		new THREE.ParticleCanvasMaterial({
			color: isdefined(aColor) ? aColor : 0x000000,
			program: programCallout,
			transparent: true,
			opacity: 0,
		})
	);
	callout.position = particle.position;
	callout.scale.x = particle.scale.x * 0.34;
	callout.scale.y = -callout.scale.x;
	callout.visible = false;
	scene.add(callout);

	if (baseInfo) {
		scene.remove(baseInfo);
	}
	particle.TargetObject.info = callout;
	particle.TargetObject.resumeLowImportanceCallout = calloutState;

	particle.SetResumeCalloutActive = function (active) {
		calloutState.target = active ? 1 : 0;
		if (active) {
			callout.visible = true;
		}
	};

	particle.UpdateResumeCallout = function () {
		var speed = calloutState.target > calloutState.progress ? 0.14 : 0.2;
		calloutState.progress += (calloutState.target - calloutState.progress) * speed;
		if (Math.abs(calloutState.target - calloutState.progress) < 0.002) {
			calloutState.progress = calloutState.target;
		}
		callout.material.opacity = calloutState.progress;
		callout.visible = calloutState.progress > 0.001 || calloutState.target > 0;
	};

	particle.HideResumeCallout = function () {
		calloutState.target = 0;
		calloutState.progress = 0;
		callout.material.opacity = 0;
		callout.visible = false;
	};

	return particle;
}

ParticleResume.isTangibleInteraction = function (entry) {
	return entry && entry.company === "Tangible Interaction";
};

ParticleResume.drawTangibleInteractionBackground = function (context) {
	context.save();
	context.fillStyle = "#f0f0f0";
	context.beginPath();
	context.arc(0, 0, 0.99, 0, PI2, true);
	context.closePath();
	context.fill();
	context.restore();
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
		ParticleResume.drawTangibleInteractionBackground(context);
		baseProgram(context);
		// var colorStyle = logoColorStyle || particle.material.color.getContextStyle();
		// ParticleResume.drawTangibleInteractionLogo(context, colorStyle);
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

ParticleResume.satteliteParentName = function (entry) {
	if (!entry) {
		return "";
	}
	if (typeof entry.satteliteOf === "string" && entry.satteliteOf.length > 0) {
		return entry.satteliteOf;
	}
	if (typeof entry.satelliteOf === "string" && entry.satelliteOf.length > 0) {
		return entry.satelliteOf;
	}
	return "";
};

ParticleResume.findSatteliteParent = function (entry, entries) {
	var parentName = ParticleResume.satteliteParentName(entry);
	if (!parentName || !entries) {
		return null;
	}
	for (var i = 0; i < entries.length; i++) {
		if (entries[i] !== entry && entries[i].company === parentName) {
			return entries[i];
		}
	}
	return null;
};

ParticleResume.isSatteliteEntry = function (entry, entries) {
	return !!ParticleResume.findSatteliteParent(entry, entries || ParticleResume.ENTRIES);
};

ParticleResume.getStackEntries = function (entries) {
	var source = entries || [];
	var stackEntries = [];
	for (var i = 0; i < source.length; i++) {
		if (!ParticleResume.isSatteliteEntry(source[i], source)) {
			stackEntries.push(source[i]);
		}
	}
	return stackEntries;
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
	// var phase = ParticleResume._deterministicPhase(entry, index);
	var lateral = lateralScale * Math.sin(index * GOLDEN);
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
