
function MonsterNoise(aPosition, aSize, aTarget)
{
	this.target = aTarget;
	this.rayCircle = 0.3;
	var that = this;

	var programThis = function(context)
	{
		context.lineWidth = 0.015;
		context.beginPath();
		if(that.distanceLastProject < 0.01)
		{
		    var centerX = 0.;
		    var centerY = 0.;
		    context.lineWidth = 0.02;
		    context.arc( centerX, centerY, that.rayCircle, 0, PI2, true );
		}
		else
		{
			var nunPt = 100;
			var radius = that.rayCircle;
			var angleDecay = 2 * Math.PI / (nunPt + 1);
			context.moveTo(that.distanceLastProject * (myRandom() * 0.01 + Math.cos(sGeneralTimer * 20) * 0.015) + that.rayCircle, 0);
			for(var i = 0; i < nunPt; i++)
			{
				radius = that.distanceLastProject * (myRandom() * 0.01 + Math.cos(sGeneralTimer * 20 + angleDecay * i * 16 * Math.cos(sGeneralTimer)) * 0.015) + that.rayCircle;
				context.lineTo( radius * Math.cos( angleDecay * i ), radius * Math.sin( angleDecay * i ));
			}
		}
		context.closePath();
		context.stroke();
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
		that.RunLastProject();
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

MonsterNoise.prototype.RunLastProject = function()
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

MonsterNoise.prototype.Update = function(delta)
{
	if(this.mouseOn)
	{
		// this.currentLastProjectString = "click me"
		this.distanceLastProject += 0.03;
		this.distanceLastProject = Math.min(1., this.distanceLastProject);
		this.info.material.opacity += 0.01;
		this.info.material.opacity = Math.min(1., this.info.material.opacity);
	}
	else
	{
		this.currentLastProjectString = this.target.name;
		this.distanceLastProject -= 0.01;
		this.distanceLastProject = Math.max(0, this.distanceLastProject);
		this.info.material.opacity -= 0.01;
		this.info.material.opacity = Math.max(OPACITY_INFO, this.info.material.opacity);
	}
}

