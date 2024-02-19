function ParticleGroupLulu(positionCenter, name) 
{
	this.name = name;
	this.particles = [];
	flyer = [];
	flyer.push({name:"about the game", targetHTML:"html/LuluAbout.html"});
	flyer.push({name:"soundtrack", targetHTML:"html/LuluSounds.html"});
	flyer.push({name:"download", targetHTMLOpen:"http://itunes.apple.com/us/app/lulus-unreal-exploration/id478405155?mt=8"});
	flyer.push({name:"reviews", targetHTML:"html/LuluReviews.html", addRandom:false});
	flyer.push({name:"trailer", targetHTML:"html/LuluVideo.html"});

	var width = window.innerWidth * 0.2;
	this.cameraDistance = width * 2.;
	this.positionCenter = positionCenter;
	var angleDecay = 2 * Math.PI / flyer.length + Math.random() * 0.2;

	for ( var i = 0; i < flyer.length; i ++ ) 
	{
		if((isdefined(flyer[i].targetURL) || isdefined(flyer[i].targetHTML) || isdefined(flyer[i].targetHTMLOpen)) && !isdefined(flyer[i].addRandom))
		{
			sProjectsToRandom.push(flyer[i]);
		}

		// var particle = new THREE.Particle( new THREE.ParticleCanvasMaterial( { color: PickColor(), program: programStroke, transparent:true } ) );
		var lPosition = new THREE.Vector3();

		lPosition.x = positionCenter.x + width * (1. + myRandom() * 0.3) * Math.sin( i * angleDecay + myRandom() * 0.7 );
		lPosition.y = positionCenter.y + width * (1. + myRandom() * 0.3) * Math.sin( i * angleDecay + myRandom() * 0.7 );
		lPosition.z = positionCenter.z + width * (1. + myRandom() * 0.3) * Math.cos( i * angleDecay + myRandom() * 0.7 );

		var particle = new ParticleCircleNavigate(lPosition, flyer[i])
		this.particles.push(particle);
	}
}

ParticleGroupLulu.prototype.Terminate = function()
{

}

ParticleGroupLulu.prototype.Init = function()
{
}

ParticleGroupLulu.prototype.MouseDown = function()
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
	}
	else
	{
		SELECTED.material.program = programStroke;
		SELECTED = null;
	}
}

ParticleGroupLulu.prototype.Update = function()
{
	var vector = new THREE.Vector3( mouse.x, mouse.y, 0.5 );
	projector.unprojectVector( vector, camera );

	var ray = new THREE.Ray( camera.position, vector.subSelf( camera.position ).normalize() );

	var intersects = ray.intersectObjects( this.particles );

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
			INTERSECTED.TargetObject.info.material.opacity = OPACITY_INFO;
		}
		INTERSECTED = null;
	}
}
