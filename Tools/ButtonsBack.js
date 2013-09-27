
var sButtonsBack;
/*
 * Manage the buttons bottom left used to navigate into the project.
 */
function ButtonsBack(aCanvas) 
{
	sButtonsBack = this;
	this.deploy = false;
	this.deployCoeff = 0.;
	this.ButtonsStack = [];
	this.borderLeft = 5;
	this.activeButtons = 0;

	var parent = document.getElementById('backButtonsContainer');
	parent.style.opacity = .9;
	var element;
	for(var i = 0; i < 3; i++)
	{
		element = document.createElement('div');
		element.className = "BackCircle";
		parent.appendChild(element);
		this.ButtonsStack.push(element);
		element.indexGroup = -1;
		element.style.display = 'none';
		element.style.zIndex = 10;
	}

	this.backLeft = document.createElement('img');
	this.backLeft.src = "textures/GUI/arrow.png";
	this.backLeft.className = "BackCircleLeft";
	this.backLeft.style.display = 'none';
	this.backLeft.style.opacity = 1.;
	this.backLeft.style.zIndex = 100;
	parent.appendChild(this.backLeft);

	$(this.backLeft).mouseenter(function() 
	{
    	sButtonsBack.SetEnter();
  	});

  	$(this.backLeft).bind('touchend mousedown',function() 
	{
    	sButtonsBack.SetLeave();
    	GoBack();
  	});

  	$(parent).mouseleave(function() 
	{
    	sButtonsBack.SetLeave();
  	});

	$(".BackCircle").mouseenter(function() 
	{
		this.style.zIndex = 100;
		$(this).animate({
	    height: '72px',
	    width: '72px',
	    // opacity: '0.9'
	  }, 100);

		$(this).css( "background-color",  this.myColor);
  	});
	
	$(".BackCircle").mouseleave(function() 
	{
		this.style.zIndex = 10;
		$(this).animate({
	    height: '70px',
	    width: '70px',
	    // opacity: '0.4'
	  }, 100);
    	$(this).css( "background-color",  "");
  	});

  	$(".BackCircle").click(function() 
	{
    	GoToIndex(this.indexGroup);
  	});
}

ButtonsBack.prototype.OnChange = function()
{
	var iPrev = 0;
	var iCurr;
	var listBack = [];
	if(sIsInHTML)
	{
		// iCurr = sGroupCurrent;
		listBack.push({index:sGroupCurrent ,color:new THREE.Color().setRGB(0.8,0.7,0.7), name:ParticleGroups[sGroupCurrent].name});
	}
	else
	{
		iCurr = Organigram.GetFather(sGroupCurrent);	
		while(iPrev >= 0 && (sGroupCurrent != ParticleGroup.PART_CREA_LULU) && (sGroupCurrent != ParticleGroup.PART_INTRO))
		{
			iPrev = Organigram.GetFather(iCurr);
			if(iPrev < 0)
			{
				listBack.push({index:ParticleGroup.PART_CREA_LULU ,color:new THREE.Color().setRGB(0.8,0.7,0.7), name:"home"});
				break;
			}

			var particle = ParticleGroups[iPrev].GetParticleThatLeadTo(iCurr);
			listBack.push({index:iCurr, color:particle.material.color, name:particle.TargetObject.name});
			iCurr = iPrev;
		}
	}
	 


	for(var i = 0; i < this.ButtonsStack.length; i++)
	{
		if(i < listBack.length)
		{
			var listElement = listBack[listBack.length - i - 1];
			var rgbString = 'rgb(' + Math.floor(listElement.color.r * 275) + ',' + Math.floor(listElement.color.g * 275) + ',' + Math.floor(listElement.color.b * 275) + ')';
			$(this.ButtonsStack[i]).text(listElement.name);
			$(this.ButtonsStack[i]).css( "border-color",  rgbString);
			this.ButtonsStack[i].myColor = rgbString;
			this.ButtonsStack[i].indexGroup = listElement.index;
			// this.ButtonsStack[i].style.display = '';
			$(this.ButtonsStack[i]).slideDown(400);
		}
		else
		{
			$(this.ButtonsStack[i]).slideUp(400);
			// this.ButtonsStack[i].style.display = 'none';
		}
	}
	this.activeButtons = listBack.length;

	if(this.activeButtons == 0)
	{
		$(this.backLeft).slideUp(400);
	}
	else
	{
		$(this.backLeft).slideDown(400);	
	}
}

/*
 * Update camera.
 */
ButtonsBack.prototype.Update = function(aTimeInterval)
{
	this.deployCoeff += 4. * (this.deploy ? aTimeInterval : -aTimeInterval);
	this.deployCoeff = clip(this.deployCoeff, 0., 1.);
	var decayBase = 0.7;

	leftLeftInit = -200;
	leftLeftEnd = 5;	
	for(var i = 0; i < this.ButtonsStack.length; i++)
	{
		this.ButtonsStack[i].style.left = (leftLeftInit + (leftLeftEnd - leftLeftInit) * this.deployCoeff) + (this.borderLeft + i * 70 * (GetCosInterpolation(this.deployCoeff) * 0.2 + decayBase)) + 'px';
	}

	var leftLeftInit = -10;
	var leftLeftEnd = (leftLeftInit + (leftLeftEnd - leftLeftInit) * this.deployCoeff) + (this.borderLeft + this.activeButtons * 70 * (GetCosInterpolation(this.deployCoeff) * 0.2 + decayBase));
	this.backLeft.style.left = (leftLeftInit + (leftLeftEnd - leftLeftInit) * this.deployCoeff) + 'px';
	// this.backLeft.style.opacity = 1. - this.deployCoeff;
	var deg = Math.floor(this.deployCoeff * 180);
	if(IS_PHONE)
	{
		deg += 180;
	}
	this.backLeft.style.mozTransform    = 'rotate(' + deg + 'deg)';
	this.backLeft.style.webkitTransform = 'rotate(' + deg + 'deg)';
	this.backLeft.style.oTransform      = 'rotate(' + deg + 'deg)';
	this.backLeft.style.msTransform     = 'rotate(' + deg + 'deg)';
	this.backLeft.style.transform       = 'rotate(' + deg + 'deg)';
}

ButtonsBack.prototype.SetEnter = function()
{ 	
	this.deploy = true;
}

ButtonsBack.prototype.SetLeave = function()
{
	this.deploy = false;
}