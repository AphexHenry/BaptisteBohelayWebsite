// particle for video link.
function MonsterVideo(aPosition, aSize, aTarget)
{
	this.target = aTarget;
	this.rayCircle = 0.3;
	var that = this;

	// animation algorithm.
	var programThis = function(context)
	{
		context.lineWidth = 0.015 + that.distanceLastProject * 0.1;
		context.beginPath();

	    var centerX = 0.;
	    var centerY = 0.;
	    context.lineWidth = 0.02 + that.distanceLastProject * 0.01;
	    context.arc( centerX, centerY, that.rayCircle, 0, PI2, true );
		context.closePath();
		context.stroke();
		if(that.distanceLastProject > 0.01)
		{
			context.beginPath();
			var lY = 0.;
		    var coeffOpen = (1.0 - (that.distanceLastProject * 0.5));
		    context.moveTo(-that.rayCircle, -lY);
		    context.bezierCurveTo(-0.7 * that.rayCircle, that.rayCircle * 1.4 - lY, 0.7 * that.rayCircle, that.rayCircle * 1.4 - lY, that.rayCircle, -lY);
		    context.bezierCurveTo(0.7 * that.rayCircle, that.rayCircle * 1.4 * coeffOpen, -0.7 * that.rayCircle, that.rayCircle * 1.4 * coeffOpen, -that.rayCircle, 0);

			context.closePath();
			context.fill();

			context.moveTo(-that.rayCircle, lY);
		    context.bezierCurveTo(-0.7 * that.rayCircle, -that.rayCircle * 1.4 + lY, 0.7 * that.rayCircle + lY, -that.rayCircle * 1.4, that.rayCircle, lY);
		    context.bezierCurveTo(0.7 * that.rayCircle, -that.rayCircle * 1.4 * coeffOpen, -0.7 * that.rayCircle, -that.rayCircle * 1.4 * coeffOpen, -that.rayCircle, lY);

			context.closePath();
			context.fill();

			// draw the eye.
			var xmove = Math.cos(sGeneralTimer * 2.);
			var ymove = Math.sin(sGeneralTimer);
			xmove *= xmove * xmove;
		    var centerX = 0.03 + 0.1 * xmove;
	    	var centerY = 0.05 + 0.1 * Math.sin(sGeneralTimer);

			context.beginPath();
	    	context.arc( centerX, centerY, that.rayCircle * 0.4 * that.distanceLastProject, 0, PI2, true );
			context.closePath();
			context.fill();
		}
	}

	this.particle = new ParticleCircleNavigate(aPosition, aTarget);
	this.particle.material.program = programThis;
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
		that.RunTarget();
	}

	this.particle.MyCameraDistance= function()
	{
		 return window.innerWidth * 0.2;
	}

	this.distanceLastProject = 0.;
	this.mouseOn = false;
	this.currentLastProjectString = this.target.name;

	var programText = function ( context ) 
	{
		var infoText = [];
		infoText.push({string:that.currentLastProjectString, size: 2});
		SetTextInCanvas(infoText, context.canvas)
	}

	this.info = this.particle.TargetObject.info;

	this.touched = false;
}

MonsterVideo.prototype.RunTarget = function()
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
		this.particle.MyMouseOff();
	}
}

MonsterVideo.prototype.Update = function(delta)
{
	if(this.mouseOn)
	{
		this.distanceLastProject += 0.07;
		this.distanceLastProject = Math.min(1., this.distanceLastProject);
		this.info.material.opacity += 0.01;
		this.info.material.opacity = Math.min(1., this.info.material.opacity);
	}
	else
	{
		this.currentLastProjectString = this.target.name;
		this.distanceLastProject -= 0.05;
		this.distanceLastProject = Math.max(0, this.distanceLastProject);
		this.info.material.opacity -= 0.01;
		this.info.material.opacity = Math.max(OPACITY_INFO, this.info.material.opacity);
	}
}

