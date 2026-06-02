function ParticleAboutMe_drawStudentMortarboard(context, colorStyle) {
	var pivotX = 0;
	var pivotY = 0.37;
	var cornerX = -0.36;
	var cornerY = 0.44;
	var angle = -2.5 ;

	context.save();

	context.strokeStyle = colorStyle;
	context.lineWidth = 0.04;
	context.lineJoin = "round";
	context.lineCap = "round";

	context.translate(cornerX, cornerY);
	context.rotate(angle);
	context.translate(-pivotX, -pivotY);

  // Diamond/rhombus top cap (flat-on view)
  context.beginPath();
  context.moveTo(0, -0.55);   // top point
  context.lineTo(0.55, 0);    // right point
  context.lineTo(0, 0.55);    // bottom point
  context.lineTo(-0.55, 0);   // left point
  context.closePath();
  context.stroke();

  // Curved brim below the cap
//   context.beginPath();
//   context.moveTo(-0.42, 0.1);
//   context.quadraticCurveTo(-0.46, 0.45, -0.32, 0.6);
//   context.quadraticCurveTo(-0.1, 0.78, 0, 0.78);
//   context.quadraticCurveTo(0.1, 0.78, 0.32, 0.6);
//   context.quadraticCurveTo(0.46, 0.45, 0.42, 0.1);
//   context.stroke();

  // Tassel line (right side, from right diamond point downward)
  context.beginPath();
  context.moveTo(0.55, 0);
  context.lineTo(0.53, 0.55);
  context.stroke();

  // Tassel circle at bottom of tassel
  context.beginPath();
  context.arc(0.53, 0.63, 0.07, 0, Math.PI * 2);
  context.stroke();

  context.restore();
}

function ParticleAboutMe_composeProgramWithStudentHat(baseProgram, particle) {
	return function (context) {
		baseProgram(context);
		var colorStyle = particle.material.color.getContextStyle();
		ParticleAboutMe_drawStudentMortarboard(context, colorStyle);
	};
}

function ParticleAboutMe_particleStrokeProgram(targetObject) {
	var resumePrograms = targetObject.resumePrograms || targetObject.resumeProgramsWithHat;
	return resumePrograms ? resumePrograms.stroke : programStroke;
}

function ParticleAboutMe_particleFillProgram(targetObject) {
	var resumePrograms = targetObject.resumePrograms || targetObject.resumeProgramsWithHat;
	return resumePrograms ? resumePrograms.fill : programFill;
}

function ParticleAboutMe_particleTriangleProgram(targetObject) {
	var resumePrograms = targetObject.resumePrograms || targetObject.resumeProgramsWithHat;
	return resumePrograms ? resumePrograms.triangle : programTriangle;
}

function ParticleAboutMe_createResumeParticle(position, entry, labelCenter) {
	var flyerResume = ParticleResume.toFlyer(entry);
	var particleResume =
		typeof ParticleResumeLowImportanceEntry !== "undefined" && ParticleResume.isLowImportance(entry)
			? new ParticleResumeLowImportanceEntry(position, entry, undefined, labelCenter)
			: new ParticleCircleNavigate(position, flyerResume, undefined, true);
	flyerResume = particleResume.TargetObject;
	if (entry.type === "study") {
		flyerResume.resumeProgramsWithHat = {
			stroke: ParticleAboutMe_composeProgramWithStudentHat(programStrokeLimited, particleResume),
			fill: ParticleAboutMe_composeProgramWithStudentHat(programStrokeLimited, particleResume),
			triangle: ParticleAboutMe_composeProgramWithStudentHat(programTriangle, particleResume),
		};
		particleResume.material.program = flyerResume.resumeProgramsWithHat.stroke;
	}
	else if (entry.type === "art" && typeof ParticleResume.wavyCirclePrograms !== "undefined") {
		flyerResume.resumePrograms = ParticleResume.wavyCirclePrograms(entry);
		particleResume.material.program = flyerResume.resumePrograms.stroke;
	}
	else if (ParticleResume.isTangibleInteraction(entry)) {
		flyerResume.resumeProgramsWithHat = ParticleResume.tangibleInteractionPrograms(particleResume);
		particleResume.material.program = flyerResume.resumeProgramsWithHat.stroke;
	}
	ParticleAboutMe_applyOpaqueResumeCircleBackground(particleResume, entry);
	if (typeof particleResume.SetResumeCalloutActive === "undefined") {
		particleResume.TargetObject.info.material.opacity = 0.5;
	}
	return particleResume;
}

function ParticleAboutMe_findParticleRecord(records, entry) {
	for (var i = 0; i < records.length; i++) {
		if (records[i].entry === entry) {
			return records[i];
		}
	}
	return null;
}

function ParticleAboutMe_orbitalRadiusFromAngularSpeed(angularSpeed, referenceAngularSpeed, referenceRadius, minimumRadius) {
	var safeAngularSpeed = Math.max(Math.abs(angularSpeed), 0.000001);
	var safeReferenceSpeed = Math.max(Math.abs(referenceAngularSpeed), 0.000001);
	var visualGravity = Math.pow(referenceRadius, 3) * Math.pow(safeReferenceSpeed, 2);
	var orbitalRadius = Math.pow(visualGravity / Math.pow(safeAngularSpeed, 2), 1 / 3);
	return Math.max(orbitalRadius, minimumRadius);
}

function ParticleAboutMe_applyOpaqueResumeCircleBackground(particleResume, entry) {
	if (
		typeof ParticleResume === "undefined" ||
		typeof ParticleResume.composeProgramWithTangibleInteractionLogo !== "function"
	) {
		return;
	}
	if (typeof ParticleResume.isTangibleInteraction === "function" && ParticleResume.isTangibleInteraction(entry)) {
		return;
	}
	var flyer = particleResume.TargetObject;
	if (!flyer) {
		return;
	}
	var wrap = ParticleResume.composeProgramWithTangibleInteractionLogo;
	if (flyer.resumePrograms) {
		var rp = flyer.resumePrograms;
		flyer.resumePrograms = {
			stroke: wrap(rp.stroke, particleResume),
			fill: wrap(rp.fill, particleResume),
			triangle: wrap(rp.triangle, particleResume),
		};
	} else if (flyer.resumeProgramsWithHat) {
		var rw = flyer.resumeProgramsWithHat;
		flyer.resumeProgramsWithHat = {
			stroke: wrap(rw.stroke, particleResume),
			fill: wrap(rw.fill, particleResume),
			triangle: wrap(rw.triangle, particleResume),
		};
	} else {
		flyer.resumeProgramsWithHat = {
			stroke: wrap(programStroke, particleResume),
			fill: wrap(programFill, particleResume),
			triangle: wrap(programTriangle, particleResume),
		};
	}
	particleResume.material.program = flyer.resumePrograms
		? flyer.resumePrograms.stroke
		: flyer.resumeProgramsWithHat.stroke;
}

function ParticleAboutMe_updateSatteliteResumeOrbit(group) {
	var orbitParticles = group.resumeSatteliteOrbitParticles;
	if (!orbitParticles || orbitParticles.length === 0) {
		return;
	}

	group.resumeSatteliteOrbitAngle += group.resumeSatteliteOrbitSpeed;
	for (var i = 0; i < orbitParticles.length; i++) {
		var orbit = orbitParticles[i];
		var parentPosition = orbit.parent.position;
		var angularSpeed = group.resumeSatteliteOrbitSpeed * orbit.speedScale;
		var radius = ParticleAboutMe_orbitalRadiusFromAngularSpeed(
			angularSpeed,
			orbit.referenceAngularSpeed,
			orbit.referenceRadius,
			orbit.minimumRadius
		);
		var angle = group.resumeSatteliteOrbitAngle * orbit.speedScale + orbit.phase;
		var position = new THREE.Vector3(
			parentPosition.x + Math.cos(angle) * radius * 1.1,
			parentPosition.y + Math.sin(angle - 0.6) * radius * 0.3,
			parentPosition.z + Math.sin(angle) * radius * 0.1
		);
		orbit.particle.SetPosition(position);
	}
}

function ParticleAboutMe_setHoverState(particle, active) {
	if (particle && typeof particle.SetResumeCalloutActive !== "undefined") {
		particle.SetResumeCalloutActive(active);
	}
}

function ParticleAboutMe_updateHoverAnimations(group) {
	for (var i = 0; i < group.particles.length; i++) {
		if (typeof group.particles[i].UpdateResumeCallout !== "undefined") {
			group.particles[i].UpdateResumeCallout();
		}
	}
}

function ParticleAboutMe_fadeInfoIn(particle) {
	if (!particle || !particle.TargetObject || !particle.TargetObject.info) {
		return;
	}
	if (typeof particle.SetResumeCalloutActive !== "undefined") {
		return;
	}
	particle.TargetObject.info.material.opacity += (1. - particle.TargetObject.info.material.opacity) * 2. * 0.02;
}

function ParticleAboutMe_resetInfo(particle) {
	if (!particle || !particle.TargetObject || !particle.TargetObject.info) {
		return;
	}
	if (typeof particle.SetResumeCalloutActive !== "undefined") {
		particle.SetResumeCalloutActive(false);
		return;
	}
	particle.TargetObject.info.material.opacity = 0.5;
}

function ParticleAboutMe_hideHoverAnimations(group) {
	for (var i = 0; i < group.particles.length; i++) {
		if (typeof group.particles[i].HideResumeCallout !== "undefined") {
			group.particles[i].HideResumeCallout();
		}
	}
}

function ParticleAboutMe_saveDescriptionPanelDefault() {
	if (typeof sTextDescriptionDOMController === "undefined") {
		return;
	}
	if (!sTextDescriptionDOMController._aboutMeDefaultHtml && sTextDescriptionDOMController.$textarea.length) {
		sTextDescriptionDOMController._aboutMeDefaultHtml = sTextDescriptionDOMController.$textarea.html();
	}
}

var ParticleAboutMe_descriptionTvNoiseState = {
	rafId: 0,
	timeoutId: 0,
	canvas: null,
	$textarea: null,
};

function ParticleAboutMe_stopDescriptionPanelTvNoise(restoreText) {
	var state = ParticleAboutMe_descriptionTvNoiseState;
	if (state.rafId) {
		cancelAnimationFrame(state.rafId);
		state.rafId = 0;
	}
	if (state.timeoutId) {
		clearTimeout(state.timeoutId);
		state.timeoutId = 0;
	}
	if (state.canvas && state.canvas.parentNode) {
		state.canvas.parentNode.removeChild(state.canvas);
	}
	state.canvas = null;
	if (restoreText !== false && state.$textarea && state.$textarea.length) {
		state.$textarea.css("visibility", "");
	}
	state.$textarea = null;
}

function ParticleAboutMe_drawDescriptionPanelTvNoiseFrame(context, width, height) {
	context.clearRect(0, 0, width, height);

	var lineCount = 3 + (Math.random() * 6 | 0);
	for (var line = 0; line < lineCount; line++) {
		var lineY = Math.random() * height | 0;
		var lineWidth = width * (0.01 + Math.random() * 0.19);
		var lineX = Math.random() * Math.max(1, width - lineWidth);
		var lineShade = Math.random() > 0.5 ? 12 : 228;
		context.fillStyle = "rgba(" + lineShade + "," + lineShade + "," + lineShade + "," + (0.18 + Math.random() * 0.42) + ")";
		context.fillRect(lineX, lineY, lineWidth, 1 + (Math.random() * 2 | 0));
	}

	var dotCount = Math.max(180, (width * height / 55) | 0);
	for (var i = 0; i < dotCount; i++) {
		var dotShade = Math.random() * 255 | 0;
		context.fillStyle = "rgba(" + dotShade + "," + dotShade + "," + dotShade + "," + (0.35 + Math.random() * 0.55) + ")";
		context.fillRect(Math.random() * width | 0, Math.random() * height | 0, 1 + (Math.random() * 2 | 0), 1);
	}
}

function ParticleAboutMe_layoutDescriptionPanelTvNoiseCanvas(canvas, $container, $textarea) {
	var containerRect = $container[0].getBoundingClientRect();
	var areaRect = $textarea[0].getBoundingClientRect();
	var width = Math.max(1, areaRect.width | 0);
	var height = Math.max(1, areaRect.height | 0);
	canvas.style.left = (areaRect.left - containerRect.left) + "px";
	canvas.style.top = (areaRect.top - containerRect.top) + "px";
	canvas.style.width = width + "px";
	canvas.style.height = height + "px";
	return { width: width, height: height };
}

function ParticleAboutMe_playDescriptionPanelTvNoise(durationMs) {
	if (
		typeof sTextDescriptionDOMController === "undefined" ||
		!sTextDescriptionDOMController.$container.length ||
		!sTextDescriptionDOMController.$textarea.length
	) {
		return;
	}

	ParticleAboutMe_stopDescriptionPanelTvNoise(false);

	var $container = sTextDescriptionDOMController.$container;
	var $textarea = sTextDescriptionDOMController.$textarea;
	var state = ParticleAboutMe_descriptionTvNoiseState;
	state.$textarea = $textarea;
	$textarea.css("visibility", "hidden");
	var canvas = document.createElement("canvas");
	canvas.className = "about-description__tv-noise";
	canvas.setAttribute("aria-hidden", "true");
	$container.append(canvas);
	state.canvas = canvas;

	var context = canvas.getContext("2d");
	var startedAt = performance.now();
	var duration = durationMs != null ? durationMs : 300;

	function resizeCanvas() {
		var size = ParticleAboutMe_layoutDescriptionPanelTvNoiseCanvas(canvas, $container, $textarea);
		var dpr = window.devicePixelRatio || 1;
		canvas.width = size.width * dpr;
		canvas.height = size.height * dpr;
		context.setTransform(dpr, 0, 0, dpr, 0, 0);
		return size;
	}

	function tick(now) {
		if (!state.canvas) {
			return;
		}
		var size = resizeCanvas();
		ParticleAboutMe_drawDescriptionPanelTvNoiseFrame(context, size.width, size.height);
		if (now - startedAt < duration) {
			state.rafId = requestAnimationFrame(tick);
			return;
		}
		ParticleAboutMe_stopDescriptionPanelTvNoise();
	}

	state.rafId = requestAnimationFrame(tick);
	state.timeoutId = setTimeout(ParticleAboutMe_stopDescriptionPanelTvNoise, duration + 50);
}

function ParticleAboutMe_setDescriptionPanelHtml(html) {
	if (typeof sTextDescriptionDOMController === "undefined" || !sTextDescriptionDOMController.$textarea.length) {
		return;
	}
	var nextHtml = html != null ? String(html) : "";
	var currentHtml = sTextDescriptionDOMController.$textarea.html();
	var changed = nextHtml !== currentHtml;
	if (changed) {
		sTextDescriptionDOMController.$textarea.css("visibility", "hidden");
	}
	if (typeof sTextDescriptionDOMController.setHtml === "function") {
		sTextDescriptionDOMController.setHtml(nextHtml);
	} else {
		sTextDescriptionDOMController.$textarea.html(nextHtml);
	}
	if (changed) {
		ParticleAboutMe_playDescriptionPanelTvNoise(200);
	}
}

function ParticleAboutMe_updateDescriptionPanel(particle) {
	if (typeof sTextDescriptionDOMController === "undefined") {
		return;
	}
	if (particle && particle.TargetObject && particle.TargetObject.resumeEntry) {
		var description = particle.TargetObject.resumeEntry.description;
		ParticleAboutMe_setDescriptionPanelHtml(description || "");
		return;
	}
	if (sTextDescriptionDOMController._aboutMeDefaultHtml) {
		ParticleAboutMe_setDescriptionPanelHtml(sTextDescriptionDOMController._aboutMeDefaultHtml);
	}
}

function ParticleGroupAboutMe(positionCenter, name) 
{
	this.name = name;
	this.htmlDisplayed = false;
	this.particles = [];
	this.resumeSatteliteOrbitParticles = [];
	this.resumeSatteliteOrbitAngle = 0;
	this.resumeSatteliteOrbitSpeed = 0.004;
	this.resumePath = null;
	// var baseFlyers = [];
	// baseFlyers.push({name:"classic resume", targetURL:"resume.html", size:0.6});
	// baseFlyers.push({name: "interactive resume", targetHTML:"html/comingSoon.html", size:0.6});

	var width = window.innerWidth * 0.12;
	var resumePathScale = window.innerWidth * 0.22;
	var chronological = typeof ParticleResume !== "undefined" ? ParticleResume.getChronological() : [];
	var stackEntries =
		typeof ParticleResume.getStackEntries !== "undefined"
			? ParticleResume.getStackEntries(chronological)
			: chronological;

	this.cameraDistance = Math.max(width * 1.7, resumePathScale * 1.55);
	this.cameraDistanceOrigine = this.cameraDistance;
	this.positionCenter = positionCenter;
	this.mVerticalAngleAmplitude = Math.PI / 70.;
	this.mAngleAmplitude = Math.PI / 70.;
	// var angleDecay = 2 * Math.PI / (baseFlyers.length + 1.) + Math.random() * 0.2;

	// for ( var i = 0; i < baseFlyers.length; i ++ ) 
	// {
	// 	var lPosition = new THREE.Vector3();

	// 	lPosition.x = positionCenter.x + width * Math.sin( i * angleDecay + myRandom() * 0.7 );
	// 	lPosition.y = positionCenter.y + width * Math.sin( i * angleDecay + myRandom() * 0.7 );
	// 	lPosition.z = positionCenter.z + width * Math.cos( i * angleDecay + myRandom() * 0.7 );

	// 	var particle = new ParticleCircleNavigate(lPosition, baseFlyers[i]);
	// 	this.particles.push(particle);
	// 	particle.TargetObject.info.material.opacity = 0.5;
	// }

	var resumePositions =
		typeof ParticleResume.layoutResumeParticlePositions !== "undefined"
			? ParticleResume.layoutResumeParticlePositions(stackEntries, positionCenter, resumePathScale)
			: [];
	var particleRecords = [];

	for (var r = 0; r < stackEntries.length; r++)
	{
		var posResume =
			resumePositions.length === stackEntries.length
				? resumePositions[r]
				: ParticleResume.pathPosition(r, stackEntries.length, positionCenter, resumePathScale, stackEntries[r]);
		var particleResume = ParticleAboutMe_createResumeParticle(posResume, stackEntries[r], positionCenter);
		this.particles.push(particleResume);
		particleRecords.push({ entry: stackEntries[r], particle: particleResume });
	}

	var satteliteGroups = {};
	for (var s = 0; s < chronological.length; s++) {
		var parentEntry = ParticleResume.findSatteliteParent(chronological[s], chronological);
		if (!parentEntry) {
			continue;
		}
		var parentName = ParticleResume.satteliteParentName(chronological[s]);
		if (!satteliteGroups[parentName]) {
			satteliteGroups[parentName] = [];
		}
		satteliteGroups[parentName].push({ entry: chronological[s], parentEntry: parentEntry });
	}

	for (var groupName in satteliteGroups) {
		if (!satteliteGroups.hasOwnProperty(groupName)) {
			continue;
		}
		var sattelites = satteliteGroups[groupName];
		for (var satIndex = 0; satIndex < sattelites.length; satIndex++) {
			var parentRecord = ParticleAboutMe_findParticleRecord(particleRecords, sattelites[satIndex].parentEntry);
			if (!parentRecord) {
				continue;
			}
			var parentParticle = parentRecord.particle;
			var phase = (satIndex / sattelites.length) * Math.PI * 2;
			var initialPosition = new THREE.Vector3(
				parentParticle.position.x + Math.cos(phase) * resumePathScale * 0.18,
				parentParticle.position.y + Math.sin(phase) * resumePathScale * 0.18,
				parentParticle.position.z
			);
			var satteliteParticle = ParticleAboutMe_createResumeParticle(initialPosition, sattelites[satIndex].entry, parentParticle.position);
			var speedScale = 0.5 + (satIndex % 3) * 0.22;
			var minimumRadius = parentParticle.scale.x * 0.78 + satteliteParticle.scale.x * 1.18;
			var referenceRadius = Math.max(resumePathScale * 0.23, minimumRadius * 1.18);
			var referenceAngularSpeed = this.resumeSatteliteOrbitSpeed * 0.5;
			var radius = ParticleAboutMe_orbitalRadiusFromAngularSpeed(
				this.resumeSatteliteOrbitSpeed * speedScale,
				referenceAngularSpeed,
				referenceRadius,
				minimumRadius
			);
			satteliteParticle.SetPosition(new THREE.Vector3(
				parentParticle.position.x + Math.cos(phase) * radius,
				parentParticle.position.y + Math.sin(phase * 1.3) * radius * 0.3,
				parentParticle.position.z + Math.sin(phase) * radius * 0.7
			));
			this.particles.push(satteliteParticle);
			this.resumeSatteliteOrbitParticles.push({
				particle: satteliteParticle,
				parent: parentParticle,
				phase: phase,
				speedScale: speedScale,
				referenceAngularSpeed: referenceAngularSpeed,
				referenceRadius: referenceRadius,
				minimumRadius: minimumRadius,
			});
		}
	}
	if (typeof ParticleResume.createDecorativeDashedPath !== "undefined") {
		this.resumePath = ParticleResume.createDecorativeDashedPath(
			stackEntries,
			new THREE.Vector3(positionCenter.x, positionCenter.y, positionCenter.z - 10.5),
			resumePathScale,
			resumePositions.length === stackEntries.length ? resumePositions : null
		);
		scene.add(this.resumePath);
	}
}

ParticleGroupAboutMe.prototype.Init = function()
{
	// $("#roundCorner").load("html/aboutMe.html");
	
	// setTimeout(function() {$("#roundCorner").slideDown(500);}, 1500);
	// $('body').bind('touchend mousedown',function(e){
   	// if( e.target.id == 'roundCorner' )
   	// {
    // 	return true; 
   	// }
   	// else
   	// {
    // 	$("#roundCorner").slideUp(400);
	// }

	// });

	if (typeof sTextDescriptionDOMController !== "undefined")
	{
		ParticleAboutMe_saveDescriptionPanelDefault();
		sTextDescriptionDOMController.show();
	}
}

ParticleGroupAboutMe.prototype.MouseDown = function()
{
	if(INTERSECTED)
	{
		if(typeof INTERSECTED.TargetObject.target != "undefined")
		{
			GoToIndex(INTERSECTED.TargetObject.target);
		}
		else if(typeof INTERSECTED.TargetObject.targetHTML != "undefined")
		{
			CirclesToHtml(INTERSECTED.TargetObject.targetHTML);
		}
		else if(typeof INTERSECTED.TargetObject.targetHTMLOpen != "undefined")
		{
			open_in_new_tab(INTERSECTED.TargetObject.targetHTMLOpen);
		}
		else if(typeof INTERSECTED.TargetObject.targetURL != "undefined")
		{
			ImageFrontCtx.fillStyle = '#ffffff';
			var newURL = window.location.href.substring(0, window.location.href.indexOf('#')) + INTERSECTED.TargetObject.targetURL;
			open_in_new_tab(newURL);
		}
		else if (INTERSECTED.TargetObject.resumeEntry)
		{
			if (SELECTED && SELECTED !== INTERSECTED) {
				SELECTED.material.program = ParticleAboutMe_particleStrokeProgram(SELECTED.TargetObject);
				ParticleAboutMe_resetInfo(SELECTED);
			}
			SELECTED = INTERSECTED;
			INTERSECTED.material.program = ParticleAboutMe_particleTriangleProgram(INTERSECTED.TargetObject);
			ParticleAboutMe_updateDescriptionPanel(INTERSECTED);
		}
	}
	// else if (SELECTED)
	// {
	// 	SELECTED.material.program = ParticleAboutMe_particleStrokeProgram(SELECTED.TargetObject);
	// 	ParticleAboutMe_resetInfo(SELECTED);
	// 	SELECTED = null;
	// 	ParticleAboutMe_updateDescriptionPanel(null);
	// }
}

ParticleGroupAboutMe.prototype.MouseUp = function()
{

}

ParticleGroupAboutMe.prototype.Update = function()
{

	cameraManager.SetControlMode(sTools.CameraControlType.MOUSE_MOVE);
	ParticleAboutMe_updateSatteliteResumeOrbit(this);
	ParticleAboutMe_updateHoverAnimations(this);
	var vector = new THREE.Vector3( mouse.x, mouse.y, 0.5 );
	projector.unprojectVector( vector, camera );

	var ray = new THREE.Ray( camera.position, vector.subSelf( camera.position ).normalize() );

	var intersects = ray.intersectObjects( this.particles );

	if ( intersects.length > 0 ) 
	{
		if ( INTERSECTED != intersects[ 0 ].object ) {

			if ( INTERSECTED ) {
				INTERSECTED.material.program = ParticleAboutMe_particleStrokeProgram(INTERSECTED.TargetObject);
				ParticleAboutMe_setHoverState(INTERSECTED, false);
			}

			INTERSECTED = intersects[ 0 ].object;
			ParticleAboutMe_setHoverState(INTERSECTED, true);

			if(INTERSECTED === SELECTED)
			{
				INTERSECTED.material.program = ParticleAboutMe_particleTriangleProgram(INTERSECTED.TargetObject);
			}
			else
			{
				INTERSECTED.material.program = ParticleAboutMe_particleFillProgram(INTERSECTED.TargetObject);
			}
		}

		ParticleAboutMe_fadeInfoIn(INTERSECTED);
	} 
	else 
	{
		if ( INTERSECTED ) 
		{
			INTERSECTED.material.program = ParticleAboutMe_particleStrokeProgram(INTERSECTED.TargetObject);
			ParticleAboutMe_resetInfo(INTERSECTED);
		}
		INTERSECTED = null;
	}
}

ParticleGroupAboutMe.prototype.Terminate = function()
{
	this.htmlDisplayed = false;
	ParticleAboutMe_hideHoverAnimations(this);
	ParticleAboutMe_stopDescriptionPanelTvNoise();
	$("#roundCorner").slideUp(400);
	if (typeof sTextDescriptionDOMController !== "undefined")
	{
		ParticleAboutMe_updateDescriptionPanel(null);
		sTextDescriptionDOMController.hide();
	}
}
