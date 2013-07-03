function ParticleGroupAboutMe(positionCenter, name) 
{
	this.name = name;
	this.htmlDisplayed = false;
	this.particles = [];
	flyer = [];
	flyer.push({name:"classic resume", targetURL:"resume.html", size:0.6});
	flyer.push({name: "interactive resume", targetHTML:"html/comingSoon.html", size:0.6});
	 // flyer.push({name: "interactive resume", targetURL:"resume"});

	var width = window.innerWidth * 0.12;
	this.cameraDistance = width * 1.7;
	this.cameraDistanceOrigine = this.cameraDistance;
	this.positionCenter = positionCenter;
	var angleDecay = 2 * Math.PI / (flyer.length + 1.) + Math.random() * 0.2;

	for ( var i = 0; i < flyer.length; i ++ ) 
	{
		// var particle = new THREE.Particle( new THREE.ParticleCanvasMaterial( { color: PickColor(), program: programStroke, transparent:true } ) );
		var lPosition = new THREE.Vector3();

		lPosition.x = positionCenter.x + width * Math.sin( i * angleDecay + myRandom() * 0.7 );
		lPosition.y = positionCenter.y + width * Math.sin( i * angleDecay + myRandom() * 0.7 );
		lPosition.z = positionCenter.z + width * Math.cos( i * angleDecay + myRandom() * 0.7 );

		var particle = new ParticleCircleNavigate(lPosition, flyer[i])
		this.particles.push(particle);
		particle.TargetObject.info.material.opacity = 0.5;
	}

	var lPosition = new THREE.Vector3();
	var thisWidth = 0.1;
	lPosition.x = positionCenter.x + thisWidth * width * Math.sin( flyer.length * angleDecay + myRandom() * 0.7 );
	lPosition.y = positionCenter.y + thisWidth * width * Math.sin( flyer.length * angleDecay + myRandom() * 0.7 );
	lPosition.z = positionCenter.z + thisWidth * width * Math.cos( flyer.length * angleDecay + myRandom() * 0.7 );
	this.social = new ParticleSocial(lPosition, width * 0.4);
}

ParticleGroupAboutMe.prototype.Init = function()
{
	$("#roundCorner").load("html/aboutMe.html");
	
	setTimeout(function() {$("#roundCorner").slideDown(500);}, 1500);
	$('body').click(function(e){
   	if( e.target.id == 'roundCorner' )
   	{
    	return true; 
   	}
   	else
   	{
    	$("#roundCorner").slideUp(400);
	}

	});

	this.social.particle.SetTextVisible(true);
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

	var vector = new THREE.Vector3( mouse.x, mouse.y, 0.5 );
	projector.unprojectVector( vector, camera );

	var ray = new THREE.Ray( camera.position, vector.subSelf( camera.position ).normalize() );

	var intersectsSocial = ray.intersectObject( this.social.plane );
	if(intersectsSocial.length > 0)
	{
		this.cameraDistance = window.innerWidth * 0.09;
		this.social.SetTouched(true);
	}
	else
	{
		this.social.SetTouched(false);
		this.cameraDistance = this.cameraDistanceOrigine;
	}
}

ParticleGroupAboutMe.prototype.MouseUp = function()
{

}

ParticleGroupAboutMe.prototype.Update = function()
{
	this.social.Update(0.03);

	var vector = new THREE.Vector3( mouse.x, mouse.y, 0.5 );
	projector.unprojectVector( vector, camera );

	var ray = new THREE.Ray( camera.position, vector.subSelf( camera.position ).normalize() );

	var intersects = ray.intersectObjects( this.particles );
	var intersectsSocial = ray.intersectObject( this.social.plane );
	if(intersectsSocial.length > 0)
	{
		this.social.SetTarget(true, intersectsSocial[0].face.a);
	}
	else
	{
		this.social.SetTarget(false);	
	}

	if ( intersects.length > 0 ) 
	{
		if ( INTERSECTED != intersects[ 0 ].object ) {

			if ( INTERSECTED ) INTERSECTED.material.program = programStroke;

			INTERSECTED = intersects[ 0 ].object;

			if(INTERSECTED === SELECTED)
			{
				INTERSECTED.material.program = programTriangle;
			}
			else
			{
				INTERSECTED.material.program = programFill;
			}
		}

		INTERSECTED.TargetObject.info.material.opacity += (1. - INTERSECTED.TargetObject.info.material.opacity) * 2. * 0.02;
	} 
	else 
	{
		if ( INTERSECTED ) 
		{
			INTERSECTED.material.program = programStroke;
			INTERSECTED.TargetObject.info.material.opacity = 0.5;
		}
		INTERSECTED = null;
	}
}

ParticleGroupAboutMe.prototype.Terminate = function()
{
	this.htmlDisplayed = false;
	$("#roundCorner").slideUp(400);
	this.social.particle.SetTextVisible(false);
}
