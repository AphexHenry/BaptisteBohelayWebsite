var rotationThree = 0;
var pickCircleRadius = 0;
var programMonster3 = function(context)
{
	rotationThree += 0.02;
    var centerX = 0.;
    var centerY = 0.;

    drawOneArmThree(context, Math.PI * 0, sDistanceTwo );
    drawOneArmThree(context, Math.PI * 0.25, sDistanceTwo );
    drawOneArmThree(context, Math.PI * 0.5, sDistanceTwo );
    drawOneArmThree(context, Math.PI * 0.75, sDistanceTwo );
    drawOneArmThree(context, Math.PI * 1., sDistanceTwo );
    drawOneArmThree(context, Math.PI * 1.25, sDistanceTwo );
    drawOneArmThree(context, Math.PI * 1.5, sDistanceTwo );
    drawOneArmThree(context, Math.PI * 1.75, sDistanceTwo );

    context.beginPath();
    context.arc( centerX, centerY, 0.3, 0, PI2, true );
    context.closePath();
    context.stroke();

    if(pickCircleRadius > 0.0001)
    {
	    context.beginPath();
	    context.arc( centerX, centerY, pickCircleRadius * pickCircleRadius * 0.3, 0, PI2, true );
	    context.closePath();
	    context.fill();
	}
}

var sCloseness = 0;
var sDistanceTwo = 0.5;
var positionClose = new THREE.Vector3();
function drawOneArmThree(context, angle, evolution)
{
	context.lineWidth = 0.01;
	var noiseElbow = Math.cos(-rotationThree + angle);
	var noiseHand = Math.sin(-rotationThree + angle * 2);

	size = evolution * 0.5;
	var evolution2NoPi = evolution * evolution * evolution * evolution;
	var evolution2 = evolution2NoPi * Math.PI;
	evolution = evolution * Math.PI;
	// context.setStrokeColor(0x0000f0);
	context.beginPath();
	var COS = Math.cos(angle + evolution + rotationThree);
	var SIN = Math.sin(angle + evolution + rotationThree);
	var posShoulderX =  COS * 0.3;
	var posShoulderY = SIN * 0.3;
	var posElbowX = posShoulderX + size * 0.5 * (COS * -Math.cos(evolution) + Math.sin(evolution + noiseElbow) * SIN);
	var posElbowY = posShoulderY + size * 0.5 * (SIN * -Math.cos(evolution) + Math.sin(evolution + noiseElbow) * COS);
	var posHandX = posShoulderX * (1. + 0.2 * evolution2) + size * (COS * -Math.cos(evolution2) + Math.sin(evolution2 + noiseHand) * SIN);
	var posHandY = posShoulderY * (1. + 0.2 * evolution2) + size * (SIN * -Math.cos(evolution2) + Math.sin(evolution2 + noiseHand) * COS);

	context.moveTo(posHandX, posHandY);
    context.quadraticCurveTo(posElbowX, posElbowY, posShoulderX, posShoulderY);
    context.stroke();

    context.beginPath();
    var rayLittle = 0.03 * evolution2NoPi;
    context.arc( posHandX + COS * rayLittle, posHandY+ SIN * rayLittle, rayLittle, 0, PI2, true );
    context.closePath();
    context.stroke();
}

var sIsMouseOnRandom = false;
var sIsPicking = false;
function MonsterRandom(aPosition, aSize)
{
	var aTarget = {name:"random"};
	this.particle = new ParticleCircleNavigate(aPosition, aTarget);
	this.particle.material.program = programMonster3;
	this.particle.scale.x *= 3.;
	this.particle.scale.y *= 3.;

	this.particle.TargetObject.isAutonomous = true;

	this.particle.MyMouseOn = function(intersect)
	{
		sIsMouseOnRandom = true;
	}

	this.particle.MyMouseOff = function(intersect)
	{
		sIsMouseOnRandom = false;
	}

	this.particle.MyMouseDown = function()
	{
		// sCurrentRandomString = "click to pick";
		sIsPicking = true;
		// SELECTED = this;
	}

	this.particle.MyCameraDistance= function()
	{
		 return window.innerWidth * 0.2;
	}

	this.info = this.particle.TargetObject.info;
	this.touched = false;
}

MonsterRandom.prototype.RunRandomProject = function()
{
	var	index = Math.floor(Math.random() * sProjectsToRandom.length);
	var lAlreadyIn = true;
	var iterCount = 0;
	while(lAlreadyIn)
	{
		iterCount++;
		index++;
		index = index % sProjectsToRandom.length;
		lAlreadyIn = false;
		for(var i = 0; i < sRandomLastIndex.length; i++)
		{
			if(index == sRandomLastIndex[i])
			{
				lAlreadyIn = true;
			}
		}
		if(iterCount > sProjectsToRandom.length)
		{
			sRandomLastIndex = [];
		}
	}

	var lProject = sProjectsToRandom[index];

	if(sRandomLastIndex >= sProjectsToRandom.length - 1)
	{
		sRandomLastIndex = [];	
	}
	sRandomLastIndex.push(index);
	console.log(lProject);
	
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
}

MonsterRandom.prototype.Update = function(delta)
{
	if(sIsPicking)
    {
    	pickCircleRadius += 0.01;
    	if(pickCircleRadius > 0.75)
    	{
    		pickCircleRadius = 1.;
    		sDistanceTwo = pickCircleRadius;
    		sIsPicking = false;
    		this.RunRandomProject();
    	}
    }
    else
    {
    	pickCircleRadius -= 0.05;
    	pickCircleRadius = Math.max(0., pickCircleRadius);
    }

	if(sIsMouseOnRandom || sIsPicking)
	{
		this.particle.SetName("click to pick");
		sDistanceTwo += 0.03;
		sDistanceTwo = Math.min(1., sDistanceTwo);
		this.info.material.opacity += 0.01;
		this.info.material.opacity = Math.min(1., this.info.material.opacity);
	}
	else
	{
		this.particle.SetName("roulette");
		sDistanceTwo -= 0.005;
		sDistanceTwo = Math.max(0., sDistanceTwo);
		this.info.material.opacity -= 0.01;
		this.info.material.opacity = Math.max(OPACITY_INFO, this.info.material.opacity);
	}
}

MonsterRandom.prototype.SetFood = function(foodArray)
{
	sFoodArray = foodArray;
}

