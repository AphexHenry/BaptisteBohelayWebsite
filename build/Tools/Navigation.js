	function GoToIndex(index)
	{
		if(sIsInHTML)
		{
			HtmlToCircles();
			return;
		}

		controlAuto = sTools.CameraControlType.SATTELITE;;
		if(index != sGroupCurrent)
		{
			if(sGroupCurrent >= 0)
			{
				GlobalGroupTeminate();				
			}
			sGroupCurrent = index;
			GlobalGroupInit();

			SetHashGroup(sTools.ParticleGroups[sGroupCurrent].name);
			SELECTED = INTERSECTED = null;
			sCoeffCameraMove = 0;
			sButtonsBack.OnChange();
				var prev = Organigram.GetFather(sGroupCurrent);
			if(prev < 0)
			{
				isRoot = true;
				SetBackButton(false);
			}
			else
			{
				isRoot = false;
				SetBackButton(true);
			}
		}   				
	}

	function GoBack()
	{
		GoToIndex(Organigram.GetFather(sGroupCurrent));
	}

	function GlobalGroupInit()
	{
		lCurrentGroup = sTools.ParticleGroups[sGroupCurrent];
		lCurrentGroup.Init();

		// stop display text for particles of this group.
		if(isdefined(lCurrentGroup.particles))
		{
			for(var i in lCurrentGroup.particles)
			{
				if(isdefined(lCurrentGroup.particles[i].SetTextVisible))
				{
					lCurrentGroup.particles[i].SetTextVisible(true);
				}
			}
		}
	}

	function GlobalGroupTeminate()
	{
		lCurrentGroup = sTools.ParticleGroups[sGroupCurrent];
		lCurrentGroup.Terminate();

		// stop display text for particles of this group.
		if(isdefined(lCurrentGroup.particles))
		{
			for(var i in lCurrentGroup.particles)
			{
				if(isdefined(lCurrentGroup.particles[i].SetTextVisible))
				{
					lCurrentGroup.particles[i].SetTextVisible(false);
				}
			}
		}
	}

	var sIsInHTML = false;
	function HtmlToCircles(aSpeed)
	{
		sDrawScene = true;
		var lSpeed = 1000;
		if(isdefined(aSpeed))
		{
			lSpeed = aSpeed;
		}
		sIsInHTML = false;
		$("#info").fadeOut(lSpeed, function()
		{
			$("#info").children().filter("iframe").each(function()
			{
				this.postMessage('{"event":"command","func": pauseVideo,"args":""}', '*');
			});
			$("#info").empty();
			$("#info").unload();
		});
		$('#frontground').fadeOut(lSpeed);
		canInteract = true;
		SetBackButton(true);
		sButtonsBack.OnChange();
		SetHashHTML('');
		if(isdefined(sTools.ParticleGroups[sGroupCurrent].BackFromHTML))
		{
			sTools.ParticleGroups[sGroupCurrent].BackFromHTML();
		}
	}

	function LoadedInitDisplay()
	{
		sDrawScene = true;
		var lSpeed = 1000;
		sIsInHTML = false;
		$("#info").fadeOut(lSpeed, function()
		{
			$("#info").children().filter("iframe").each(function()
			{
				this.postMessage('{"event":"command","func": pauseVideo,"args":""}', '*');
			});
			$("#info").empty();
			$("#info").unload();
		});
		$('#frontground').fadeOut(lSpeed);
		canInteract = true;
		SetBackButton(true);
		// sButtonsBack.OnChange();
		SetHashHTML('');
		if(isdefined(sTools.ParticleGroups[sGroupCurrent].BackFromHTML))
		{
			sTools.ParticleGroups[sGroupCurrent].BackFromHTML();
		}
	}

	function SetHashHTML(aPath)
	{
		var hashSplit = window.location.hash.split('+');
		var newHash = hashSplit[0] + ((aPath.length > 0) ? '+' + aPath.replace(/\//g, '&') : '');
		window.location.hash = newHash;
	}

	function SetHashGroup(aPath)
	{
		var hashSplit = window.location.hash.split('+');
		var newHash = aPath;
		newHash += (hashSplit.length > 1) ? '+' + hashSplit[1] : '';
		window.location.hash = newHash;
	}

	function GetHashGroup(aPath)
	{
		var hashSplit = window.location.hash.split('+');
		return hashSplit[0].replace('#','');
	}

	function CirclesToHtmlEncoded(path)
	{
		path = path.replace(/&/g, '/');
		CirclesToHtml(path, false);
	}

	function CirclesToHtml(path, aUpdateHash)
	{
		if(!isdefined(aUpdateHash))
		{
			SetHashHTML(path);
		}
		else if(aUpdateHash)
		{
			SetHashHTML(path);
		}

		$("#info").load(path, 
		function(response, status, xhr)
		{
			if(status == 'error')
			{
				SetHashHTML('');
			}
			sIsInHTML = true;
			INTERSECTED = null;
			sButtonsBack.OnChange();
			$("#info").fadeIn(1000);
			$('#frontground').fadeTo('slow', 0.85);
			canInteract = false;
			 SetBackButton(true);
			 sDrawScene = false;;

			$("#info").click(	function(event)
			{
				if( ! $( event.target).is('input') ) 
				{
					HtmlToCircles();
			    }

				});
			$('#info').scrollTop();
			var el = document.getElementById('info');
			el.scrollTop = 0;
		}
		);
	}

	function inAppCirlceBackOut()
	{
		container.style.cursor = 'auto';
		canInteract = true;
	}

	function inAppCirlceBackIn()
	{
		container.style.cursor = 'pointer';
		// container.style.cursor = 'move';
		canInteract = false;
	}

	function changeButtonBackOut()
	{
		document.getElementById("circle").style.background = "#f9dfcb";
	}

	function changeButtonBackIn()
	{
		document.getElementById("circle").style.background = "#d9cfbb";
	}

	function replaceImageSource() 
	{
       $("img").each( function(){
              $(this).attr({
                 src:  + $(this).attr('src')
              });
   	 });
	}

	function BackCircle()
	{	
		if(sIsInHTML)
		{
			HtmlToCircles();
		}
		else
		{
			var prev = Organigram.GetFather(sGroupCurrent);
			if(prev > -1)
			{
				GoToIndex(prev);
			}
		}
	}

	function open_in_new_tab(url )
	{
	  window.open(url, '_blank');
	  window.focus();
	}

	function SetBackButton(visible)
	{

	}

	function removeRoundCorner()
	{
		$("#roundCorner").slideUp(400);
	}