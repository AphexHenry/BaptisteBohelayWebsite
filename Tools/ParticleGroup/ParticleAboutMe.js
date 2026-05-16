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
	return targetObject.resumeProgramsWithHat ? targetObject.resumeProgramsWithHat.stroke : programStroke;
}

function ParticleAboutMe_particleFillProgram(targetObject) {
	return targetObject.resumeProgramsWithHat ? targetObject.resumeProgramsWithHat.fill : programFill;
}

function ParticleAboutMe_particleTriangleProgram(targetObject) {
	return targetObject.resumeProgramsWithHat ? targetObject.resumeProgramsWithHat.triangle : programTriangle;
}

function ParticleAboutMe_isSharedOrbitResumeEntry(entry) {
	return entry && (entry.company === "OrchPlayMusic" || entry.company === "McGill University");
}

function ParticleAboutMe_configureSharedResumeOrbit(group) {
	var orbitParticles = group.resumeSharedOrbitParticles;
	if (!orbitParticles || orbitParticles.length < 2) {
		return;
	}

	var center = new THREE.Vector3(0, 0, 0);
	for (var i = 0; i < orbitParticles.length; i++) {
		center.x += orbitParticles[i].anchor.x;
		center.y += orbitParticles[i].anchor.y;
		center.z += orbitParticles[i].anchor.z;
	}
	center.multiplyScalar(1 / orbitParticles.length);

	var radius = 0;
	for (var j = 0; j < orbitParticles.length; j++) {
		var dx = orbitParticles[j].anchor.x - center.x;
		var dy = orbitParticles[j].anchor.y - center.y;
		var angle = Math.atan2(dy, dx);
		if (!isFinite(angle)) {
			angle = (j / orbitParticles.length) * Math.PI * 2;
		}
		orbitParticles[j].phase = angle;
		radius = Math.max(radius, Math.sqrt(dx * dx + dy * dy));
	}

	group.resumeSharedOrbitCenter = center;
	group.resumeSharedOrbitRadius = Math.max(radius, window.innerWidth * 0.035);
}

function ParticleAboutMe_updateSharedResumeOrbit(group) {
	var orbitParticles = group.resumeSharedOrbitParticles;
	if (!orbitParticles || !group.resumeSharedOrbitCenter) {
		return;
	}

	group.resumeSharedOrbitAngle += group.resumeSharedOrbitSpeed;
	// for (var i = 0; i < orbitParticles.length; i++) {
	// 	var angle = group.resumeSharedOrbitAngle + orbitParticles[i].phase;
	// 	var radius = group.resumeSharedOrbitRadius;
	// 	var center = group.resumeSharedOrbitCenter;
	// 	var position = new THREE.Vector3(
	// 		center.x + Math.cos(angle) * radius,
	// 		center.y + Math.sin(angle) * radius,
	// 		center.z + Math.sin(angle) * radius
	// 	);
	// 	orbitParticles[i].particle.SetPosition(position);
	// }
}

function ParticleGroupAboutMe(positionCenter, name) 
{
	this.name = name;
	this.htmlDisplayed = false;
	this.particles = [];
	this.resumeSharedOrbitParticles = [];
	this.resumeSharedOrbitCenter = null;
	this.resumeSharedOrbitRadius = 0;
	this.resumeSharedOrbitAngle = 0;
	this.resumeSharedOrbitSpeed = 0.01;
	this.resumePath = null;
	// var baseFlyers = [];
	// baseFlyers.push({name:"classic resume", targetURL:"resume.html", size:0.6});
	// baseFlyers.push({name: "interactive resume", targetHTML:"html/comingSoon.html", size:0.6});

	var width = window.innerWidth * 0.12;
	var resumePathScale = window.innerWidth * 0.22;
	var chronological = typeof ParticleResume !== "undefined" ? ParticleResume.getChronological() : [];

	this.cameraDistance = Math.max(width * 1.7, resumePathScale * 1.55);
	this.cameraDistanceOrigine = this.cameraDistance;
	this.positionCenter = positionCenter;
	this.mVerticalAngleAmplitude = Math.PI / 27.;
	this.mAngleAmplitude = Math.PI / 9.;
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
			? ParticleResume.layoutResumeParticlePositions(chronological, positionCenter, resumePathScale)
			: [];

	for (var r = 0; r < chronological.length; r++)
	{
		var flyerResume = ParticleResume.toFlyer(chronological[r]);
		var posResume =
			resumePositions.length === chronological.length
				? resumePositions[r]
				: ParticleResume.pathPosition(r, chronological.length, positionCenter, resumePathScale, chronological[r]);
		var particleResume = new ParticleCircleNavigate(posResume, flyerResume, undefined);
		if (chronological[r].type === "study") {
			flyerResume.resumeProgramsWithHat = {
				stroke: ParticleAboutMe_composeProgramWithStudentHat(programStrokeLimited, particleResume),
				fill: ParticleAboutMe_composeProgramWithStudentHat(programStrokeLimited, particleResume),
				triangle: ParticleAboutMe_composeProgramWithStudentHat(programTriangle, particleResume),
			};
			particleResume.material.program = flyerResume.resumeProgramsWithHat.stroke;
		}
		// else if (ParticleResume.isTangibleInteraction(chronological[r])) {
		// 	flyerResume.resumeProgramsWithHat = ParticleResume.tangibleInteractionPrograms(particleResume);
		// 	particleResume.material.program = flyerResume.resumeProgramsWithHat.stroke;
		// }
		this.particles.push(particleResume);
		particleResume.TargetObject.info.material.opacity = 0.5;
		if (ParticleAboutMe_isSharedOrbitResumeEntry(chronological[r])) {
			this.resumeSharedOrbitParticles.push({
				particle: particleResume,
				anchor: posResume.clone(),
				phase: 0,
			});
		}
	}
	if (typeof ParticleResume.createDecorativeDashedPath !== "undefined") {
		this.resumePath = ParticleResume.createDecorativeDashedPath(
			chronological,
			positionCenter,
			resumePathScale,
			resumePositions.length === chronological.length ? resumePositions : null
		);
		scene.add(this.resumePath);
	}
	ParticleAboutMe_configureSharedResumeOrbit(this);
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
		sTextDescriptionDOMController.show();
	}
}

ParticleGroupAboutMe.prototype.MouseDown = function()
{
	if(INTERSECTED)
	{
		if(typeof INTERSECTED.TargetObject.target != "undefined")
		{
			sGroupCurrent = INTERSECTED.TargetObject.target;
			SELECTED = INTERSECTED = null;
			sCoeffCameraMove = 0;
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
	}
}

ParticleGroupAboutMe.prototype.MouseUp = function()
{

}

ParticleGroupAboutMe.prototype.Update = function()
{

	controlAuto = sTools.CameraControlType.MOUSE_MOVE;
	ParticleAboutMe_updateSharedResumeOrbit(this);
	var vector = new THREE.Vector3( mouse.x, mouse.y, 0.5 );
	projector.unprojectVector( vector, camera );

	var ray = new THREE.Ray( camera.position, vector.subSelf( camera.position ).normalize() );

	var intersects = ray.intersectObjects( this.particles );

	if ( intersects.length > 0 ) 
	{
		if ( INTERSECTED != intersects[ 0 ].object ) {

			if ( INTERSECTED ) INTERSECTED.material.program = ParticleAboutMe_particleStrokeProgram(INTERSECTED.TargetObject);

			INTERSECTED = intersects[ 0 ].object;

			if(INTERSECTED === SELECTED)
			{
				INTERSECTED.material.program = ParticleAboutMe_particleTriangleProgram(INTERSECTED.TargetObject);
			}
			else
			{
				INTERSECTED.material.program = ParticleAboutMe_particleFillProgram(INTERSECTED.TargetObject);
			}
		}

		INTERSECTED.TargetObject.info.material.opacity += (1. - INTERSECTED.TargetObject.info.material.opacity) * 2. * 0.02;
	} 
	else 
	{
		if ( INTERSECTED ) 
		{
			INTERSECTED.material.program = ParticleAboutMe_particleStrokeProgram(INTERSECTED.TargetObject);
			INTERSECTED.TargetObject.info.material.opacity = 0.5;
		}
		INTERSECTED = null;
	}
}

ParticleGroupAboutMe.prototype.Terminate = function()
{
	this.htmlDisplayed = false;
	$("#roundCorner").slideUp(400);
	if (typeof sTextDescriptionDOMController !== "undefined")
	{
		sTextDescriptionDOMController.hide();
	}
}
