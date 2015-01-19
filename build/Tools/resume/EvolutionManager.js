
var sSkillTypes = [];
sSkillTypes["programming"] = {gotIt:false, nextEvolution:3, level:0, explanation:"programming make your creature able to move more"};
sSkillTypes["sound design"] = {gotIt:false, nextEvolution:2, level:0, explanation:"skills will be more attracted by the creature"};
sSkillTypes["sound processing"] = {gotIt:false, nextEvolution:3, level:0, explanation:"the creature can now make sound"};
sSkillTypes["experimentation"] = {gotIt:false, nextEvolution:3, level:0, explanation:"the creature can will improve its legs movement"};
sSkillTypes["grooviness"] = {gotIt:false, nextEvolution:3, level:0, explanation:"creature will move smarter"};
sSkillTypes["interaction technologies"] = {gotIt:false, nextEvolution:2, level:0, explanation:"you can interact with it with your mouse"};

levelList = ["new born", "beginner", "intermediate", "pro", "master"];

var sTime1 = 0, sTime2 = 0;
var sSizeLegs = 0;
var sSizeLegsTarget = 0;
var sSizeLegsMax = 0.2;
var sRayCircle = 0.13;
var sMovementMonster = 0.;
var sAttractionMonster = 0.;
var sRayCircleTarget = sRayCircle;
var sMonster = null;
var sFoodArray = [];
var sLegArray = [];
var sChallenge;

var isSizeMessageDisplayed = false;
function EvolutionParseObject(object)
{
	if(object.type != "skill")
	{
		return;
	}

	if(!isdefined(sSkillTypes[object.skillType]))
	{
		console.log(object.skillType + " not defined in skill types");
	}

	if(!sSkillTypes[object.skillType].gotIt)
	{
		sSkillTypes[object.skillType].gotIt = true;
		AddLeg();
		if(!isSizeMessageDisplayed)
		{
			isSizeMessageDisplayed = true;
			DisplayMessage("You just fed the creature with a skill","for each skill eaten : <font color=red> the creature evolve  </font>", "depending of the type of skill, it will evolve differently and will survive more or less efficiently in his environment", "");
		}
		DisplayMessage("your got a new skill!","new skill eaten : <font color=red>" + object.skillType + "</font>", "the creature grow a new leg", "An extra leg allow your creature to fight more creatures and eat more elements at the same time");
	}

	sSkillTypes[object.skillType].nextEvolution--;
	if(sSkillTypes[object.skillType].nextEvolution <= 0)
	{
		levelList[sSkillTypes[object.skillType].level] += 1;
		DisplayMessage("Your creature evolve","level : <font color=red>" + levelList[sSkillTypes[object.skillType].level] + " </font> in <font color=red>" + object.skillType + " </font>", sSkillTypes[object.skillType].explanation, "");
		sSkillTypes[object.skillType].nextEvolution = 3;
		if(object.skillType == "programming")
		{
			sMovementMonster += 1.;
		}
		else if(object.skillType == "sound design")
		{
			sAttractionMonster += 1.;
		}
	}

	sSizeLegsMax += 0.01;
	sRayCircleTarget += 0.003;
	sRayCircleTarget = Math.min(sRayCircleTarget, 0.3);
}

function AddLeg()
{
	sLegArray.push({angle:0, random:myRandom(), closeness:0, needToCalmDown:false, posClose:new THREE.Vector3(), posHandX:0, posHandY:0, target:null});
	for(var i = 0; i < sLegArray.length; i++)
	{
		sLegArray[i].angle = i * Math.PI * 2. / sLegArray.length;
	}
}

var sMessageDisplaying = false;
var sMessagesToDisplay = [];
function DisplayMessage(title, type, text, explanation)
{
	if(sMessageDisplaying)
	{
		sMessagesToDisplay.push({title:title, type:type, text:text, explanation:explanation});
		return;
	}
	$("div infoTitle").html(title);	
	$("div type").html(type);
	$("div effect").html(text);
	$("div explanation").html(explanation);
	$('div').click(	function(){
		$("#infoSmall").fadeOut(500);
		$('#frontground').fadeOut(500, function(){
				sTimerClose = 1.;
				sMessageDisplaying = false;
				if(sMessagesToDisplay.length > 0)
				{
					DisplayMessage(sMessagesToDisplay[0].title, sMessagesToDisplay[0].type, sMessagesToDisplay[0].text, sMessagesToDisplay[0].explanation);
					sMessagesToDisplay.splice(0,1);
				}});
	});
	// $('#infoSmall.type').html("<b>Wow!</b> Such excitement...");
	// $('div.inner').replaceWith(text);
	$("#infoSmall").fadeIn(500);
	$('#frontground').fadeTo(500, 0.8);
	sMessageDisplaying = true;
}