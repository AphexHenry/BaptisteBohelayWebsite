	function GoToIndex(index)
	{
		if(sIsInHTML)
		{
			HtmlToCircles();
			return;
		}

		controlAuto = true;
		if(index != sGroupCurrent)
		{
			if(sGroupCurrent >= 0)
				ParticleGroups[sGroupCurrent].Terminate();
			sGroupCurrent = index;
			if(typeof isdefined(ParticleGroups[sGroupCurrent].Init == 'function'))
				ParticleGroups[sGroupCurrent].Init();
			window.location.hash = ParticleGroups[sGroupCurrent].name;
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

	var sIsInHTML = false;
	function HtmlToCircles(aSpeed)
	{
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
		if(isdefined(ParticleGroups[sGroupCurrent].BackFromHTML))
		{
			ParticleGroups[sGroupCurrent].BackFromHTML();
		}
	}

	function CirclesToHtml(path)
	{
		$("#info").load(path, 
		function(response, status, xhr)
		{
			sIsInHTML = true;
			sButtonsBack.OnChange();
			$("#info").fadeIn(1000);
			$('#frontground').fadeTo('slow', 0.85);
			canInteract = false;
			 SetBackButton(true);

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