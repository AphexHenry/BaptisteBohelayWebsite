
function MonsterTournicoti(aPosition, aSize, aTarget, aDrawParam)
{
	this.target = aTarget;
	this.drawParam = aDrawParam;
	var programLastProject = function(context)
	{
	    var centerX = 0.;
	    var centerY = 0.;
		context.lineWidth = 0.015;
		if(that.distanceLastProject > 0.01)
		{
		    drawOneArmLastProject(context, Math.PI * 0 );
		    drawOneArmLastProject(context, Math.PI * 0.5 );
		    drawOneArmLastProject(context, Math.PI * 1. );
		    drawOneArmLastProject(context, Math.PI * 1.5 );
		}

	    context.beginPath();
	    context.arc( centerX, centerY, 0.3, 0, PI2, true );
	    context.closePath();
	    context.stroke();
	}

	function drawOneArmLastProject(context, angle)
	{
	  var px = Math.cos(angle) * 0.3;
	  var py = Math.sin(angle) * 0.3;
	  var lNumPt = 100;
	  var theta = 0;
	  context.beginPath();
	  context.moveTo(px, py);
	  
	  for (var i=0; i<lNumPt; i++) {

	    theta += Math.sin(sGeneralTimer * 1. + i/lNumPt * Math.PI * 2.227217823) * i * 0.01;
	      
	    var cos_t = Math.cos(theta+ angle);
	    var sin_t = Math.sin(theta + angle);

	    px += cos_t * 0.02 * that.distanceLastProject * that.drawParam;
	    py += sin_t * 0.02 * that.distanceLastProject * that.drawParam;

	    context.lineTo(px, py);
	  }
	  context.stroke();
	}

	this.particle = new THREE.Particle( new THREE.ParticleCanvasMaterial( { color: PickColor(), program: programLastProject, transparent:true } ) );

	this.particle.position = aPosition.clone();
	this.particle.TargetObject = {isAutonomous:true};

	this.particle.scale.x = this.particle.scale.y = aSize;
	scene.add( this.particle );
	var that = this;

	this.particle.MyMouseOn = function(intersect)
	{
		that.mouseOn = true;
	}

	this.particle.MyMouseOff = function(intersect)
	{
		that.mouseOn = false;
	}

	this.particle.MyMouseDown = function()
	{
		that.RunLastProject();
	}

	this.particle.MyCameraDistance= function()
	{
		 return window.innerWidth * 0.2;
	}

	this.distanceLastProject = 1.;
	this.mouseOn = false;
	this.currentLastProjectString = this.target.name;
	that = this;

	var programText = function ( context ) 
	{
		var infoText = [];
		infoText.push({string:that.currentLastProjectString, size: 2});
		SetTextInCanvas(infoText, context.canvas)
	}

	this.info = new THREE.Particle( new THREE.ParticleCanvasMaterial( { color: PickColor(), program: programText, transparent:true, opacity:OPACITY_INFO } ) );
	this.info.position = aPosition.clone();
	this.info.scale.x = this.particle.scale.x * 0.07;
	this.info.scale.y = -this.info.scale.x;
	scene.add( this.info );

	// create the mesh's material
	this.plane = new THREE.Mesh( new THREE.PlaneGeometry( this.particle.scale.x * 1.5, this.particle.scale.x * 1.5, 8, 8 ), new THREE.MeshBasicMaterial( { color: 0x000000, opacity: 0.25, transparent: true, wireframe: true } ) );
	this.plane.geometry.applyMatrix( new THREE.Matrix4().makeRotationX( Math.PI / 2 ) );
	this.plane.visible = false;
	this.plane.position = aPosition.clone();
	scene.add( this.plane );

	this.particleClear = new THREE.Particle( new THREE.ParticleCanvasMaterial( { color: Math.random() * 0x808080 + 0x808080, program: programDoNothing, opacity:0 } ) );
	var width = window.innerWidth * 1.5;
	this.particleClear.scale.x = this.particleClear.scale.y = this.particle.scale.x * 2.;
	scene.add( this.particleClear );
	this.particleClear.position = this.particle.position;

	this.touched = false;
}

MonsterTournicoti.prototype.RunLastProject = function()
{
	var lProject = this.target;

	if(typeof lProject.targetHTML != "undefined")
	{
		CirclesToHtml(lProject.targetHTML);
	}
	else if(typeof lProject.targetURL != "undefined")
	{
		ImageFrontCtx.fillStyle = '#ffffff';
		var newURL = window.location.href.substring(0, window.location.href.indexOf('#')) + lProject.targetURL;
		open_in_new_tab(newURL);
		if(isdefined(ParticleGroups[sGroupCurrent].BackFromHTML))
		{
			ParticleGroups[sGroupCurrent].BackFromHTML();
		}
	}
	else if(typeof lProject.targetHTMLOpen != "undefined")
	{
		open_in_new_tab(lProject.targetHTMLOpen);
	}
	else if(isdefined(lProject.target))
	{
		GoToIndex(lProject.target);
	}
}

MonsterTournicoti.prototype.Update = function(delta)
{
	if(this.mouseOn)
	{
		this.currentLastProjectString = "click me"
		this.distanceLastProject += 0.03;
		this.distanceLastProject = Math.min(1., this.distanceLastProject);
		this.info.material.opacity += 0.01;
		this.info.material.opacity = Math.min(1., this.info.material.opacity);
	}
	else
	{
		this.currentLastProjectString = this.target.name;
		this.distanceLastProject -= 0.005;
		this.distanceLastProject = Math.max(0, this.distanceLastProject);
		this.info.material.opacity -= 0.01;
		this.info.material.opacity = Math.max(OPACITY_INFO, this.info.material.opacity);
	}
}

