// particle for projects link.
function MonsterProjects(aPosition, aSize, aTarget)
{
	this.target = aTarget;
	this.rayCircle = 0.99;
	this.circleArray = [];
	for(var i = 0; i < 6; i++)
	{
		// this.circleArray.push(Math.random());
		this.circleArray.push(i / 8);
	}
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
		{// peut etre tenter le truc des penduls
			context.beginPath();
			var lY = 0.;
		    var coeffOpen = that.distanceLastProject;

			var xmove = 0.5 *  Math.cos(sGeneralTimer * 2.);
			var ymove = 0.5 * Math.sin(sGeneralTimer);
			xmove *= xmove * xmove;

		  	for(var i = 0; i < that.circleArray.length; i++)
		    {
				var advance = (that.circleArray[i] * sGeneralTimer * 0.7 % 1)
				var y = advance * that.rayCircle;
				var width = Math.sqrt((that.rayCircle * that.rayCircle) - (y * y));
				width *= that.distanceLastProject;

      			context.beginPath();
      			context.moveTo(-width, y);
      			context.lineTo(width, y);
      			context.stroke();

      			context.beginPath();
      			context.moveTo(-width, -y);
      			context.lineTo(width, -y);
      			context.stroke();
		    }
		}
	}

	this.particle = new ParticleCircleNavigate(aPosition, aTarget);
	this.particle.material.program = programThis;


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

	// var programText = function ( context ) 
	// {
	// 	var infoText = [];
	// 	infoText.push({string:that.currentLastProjectString, size: 5});
	// 	//SetTextInCanvas(infoText, context.canvas)
	// }

	this.info = this.particle.TargetObject.info;

	this.touched = false;
}

MonsterProjects.prototype.RunTarget = function()
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

MonsterProjects.prototype.Update = function(delta)
{
	if(this.mouseOn)
	{
		this.distanceLastProject += 0.04;
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

