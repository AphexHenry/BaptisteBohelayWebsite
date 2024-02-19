
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
var sSizeLegsMax = 1.5;
var sRayCircle = 0.3;
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

}

function AddLeg()
{
	sLegArray.push({angle:0, random:myRandom(), state:0, posHandCurrent:new THREE.Vector2(), posHandTarget:new THREE.Vector2(), posHandInit:new THREE.Vector2(), coeffMove: 1, gotObject:null, speed:0.9 + Math.random() * 0.2});
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