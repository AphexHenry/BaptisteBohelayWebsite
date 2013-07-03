
function MonsterTournicoti(aPosition, aSize, aTarget, aDrawParam, aStayAwake)
{
	var that = this;
	this.target = aTarget;
	this.drawParam = aDrawParam;

	this.stayAwake = isdefined(aStayAwake) ? aStayAwake : false;

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

	this.particle = new ParticleCircleNavigate(aPosition, aTarget);
	this.particle.material.program = programLastProject;
	this.particle.scale.x *= 3.;
	this.particle.scale.y *= 3.;
	this.particle.SetAutonomous(true);

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

	this.info = this.particle.TargetObject.info;

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
		this.distanceLastProject += 0.03;
		this.distanceLastProject = Math.min(1., this.distanceLastProject);
	}
	else
	{
		this.currentLastProjectString = this.target.name;
		if(!this.stayAwake)
		{
			this.distanceLastProject -= 0.005;
			this.distanceLastProject = Math.max(0, this.distanceLastProject);
		}
	}
}

