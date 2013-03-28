
var sButtonsBack;

function ButtonsBack(aCanvas) 
{
	sButtonsBack = this;
	this.deploy = false;
	this.deployCoeff = 0.;
	this.ButtonsStack = [];
	this.borderLeft = 5;
	var element;
	for(var i = 0; i < 3; i++)
	{
		element = document.createElement('img');
		element.className = "BackCircle";
		document.body.appendChild( element );
		this.ButtonsStack.push(element);
	}

	$(".BackCircle").mouseenter(function() {
    sButtonsBack.SetEnter();
  });
	
	$(".BackCircle").mouseleave(function() {
    sButtonsBack.SetLeave();
  });
}

ButtonsBack.prototype.OnChange = function()
{
	var iPrev = 0;
	var iCurr = sGroupCurrent;
	var listBack = [];
	while(iPrev >= 0)
	{
		iPrev = Organigram.GetFather(iCurr);
		if(iPrev < 0)
			break;
		var particle = ParticleGroups[iPrev].GetParticleThatLeadTo(iCurr);
		listBack.push({color:particle.material.color, name:particle.TargetObject.name});
		iCurr = iPrev;
	}

	for(var i = 0; i < this.ButtonsStack.length; i++)
	{
		if(i < listBack.length)
		{
			$(this.ButtonsStack[i]).text(listBack[i].name);
			// $(this.ButtonsStack[i]).css('background-color', 'rgb(' + listBack[i].color.r + ',' + listBack[i].color.g + ',' + listBack[i].color.b + ')');
		}
	}
}

/*
 * Update camera.
 */
ButtonsBack.prototype.Update = function(aTimeInterval)
{
	this.deployCoeff += 2. * (this.deploy ? aTimeInterval : -aTimeInterval);
	this.deployCoeff = clip(this.deployCoeff, 0.1, 1.);
	for(var i = 0; i < this.ButtonsStack.length; i++)
	{
		this.ButtonsStack[i].style.left = (this.borderLeft + i * this.ButtonsStack[i].width * GetCosInterpolation(this.deployCoeff)) + 'px';
	}
}

ButtonsBack.prototype.SetEnter = function()
{ 	
	this.deploy = true;
}

ButtonsBack.prototype.SetLeave = function()
{
	this.deploy = false;
}