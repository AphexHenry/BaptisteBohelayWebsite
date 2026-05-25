/**
 * Intro particle group: name letters, menu navigators, and the intro monster.
 *
 * Import named exports from this file in ES modules. For legacy pages that load
 * classic scripts in order, use registerParticleGroupMonsterGlobals.mjs (main site).
 */
import { MonsterIntro } from '../monsters/MonsterIntro.mjs';

var lIndexStates = 0;
export var ResumeStates = {
	INIT: lIndexStates++,
	IDLE: lIndexStates++,
};

export function ParticleGroupMonster(positionCenter, name) {
	var sTools = globalThis.sTools;

	this.width = (window.innerWidth + window.innerHeight) * 0.5 * 0.3;
	this.cameraDistance = this.width * 3.;
	this.positionCenter = positionCenter;
	this.positionCenterInitial = positionCenter.clone();
	this.name = name;
	this.id = sTools.ParticleGroup.PART_INTRO;
	// this.goAway = false;
	this.speed = { x: 0, y: 0 };
	this.cameraZRatio = 0.6;
	this.cameraZTimer = 0.;
	this.menuParticles = [];
	this.menuParticlesToUpdate = [];
	this.particles = [];
	this.NavigatorsCenter = null;
	this.navigatorsAngleAmplitude = Math.PI / 4;
	this.navigatorsVerticalAngleAmplitude = Math.PI / 16;
	// this.particleRotate = new THREE.Vector3(0, 0, 0);
	this.particleRotateSpeed = new THREE.Vector3(0, 0, 0);
	this.foodArray = [];
	this.introLetterSlots = [];
	this.introSlotOccupants = [];
	this.nextIntroLetterSlotIndex = 0;
	this.nextIntroStringIndex = 0;

	this.monster = new MonsterIntro(positionCenter, this.width, this);
	this.monsterEndPosition = null;
	this.monsterEndScale = null;
	this.monsterPathProgress = 0;
	this.monsterSpiralInit = false;
	this.monsterSpiralStopT = 1.;
	this.monsterSpiralPhase = 'spiraling';
	this.monsterSpringVel = { x: 0, y: 0, z: 0 };
	this.monsterSpringScaleVel = { x: 0, y: 0 };
	this.monsterIntroPhase = 'scratching';
	this.monsterIntroScratchTimer = 0;
	this.monsterIntroEatTimer = 0;
	this.monsterIntroScratchDuration = 1.4;
	this.monsterIntroMinEatDuration = 1.0;
	this.InitFood(this.width);
	this.InitSurface(this.width);
}


ParticleGroupMonster.prototype.InitSurface = function (width) {
	var THREE = globalThis.THREE;
	var scene = globalThis.scene;
	var programStroke = globalThis.programStroke;

	var particleClear = new THREE.Particle(
		new THREE.ParticleCanvasMaterial({ color: Math.random() * 0x808080 + 0x808080, program: programStroke, opacity: 0 })
	);
	var surfaceWidth = window.innerWidth * 1.;
	particleClear.scale.x = particleClear.scale.y = surfaceWidth;
	particleClear.position = this.positionCenter.clone();
	scene.add(particleClear);

	this.plane = new THREE.Mesh(
		new THREE.PlaneGeometry(2000, 2000, 8, 8),
		new THREE.MeshBasicMaterial({ color: 0x000000, opacity: 0.25, transparent: true, wireframe: true })
	);
	this.plane.geometry.applyMatrix(new THREE.Matrix4().makeRotationX(Math.PI / 2));
	this.plane.visible = false;
	this.plane.position = this.positionCenter;
	scene.add(this.plane);
};

ParticleGroupMonster.prototype.AddFood = function (
	aName,
	position,
	speed,
	size,
	aPositionTarget,
	aLetterColor,
	setToFinalPosition = false,
	isMonsterEndTarget = false,
	introLetterMeta = null
) {
	var THREE = globalThis.THREE;
	var scene = globalThis.scene;
	var ParticleLetter = globalThis.ParticleLetter;

	var lPosition = position.clone();
	lPosition.z = this.positionCenter.z;
	var particle = new ParticleLetter(lPosition, aName, aPositionTarget, size, aLetterColor);

	particle.scaleInit = particle.scale.x;
	particle.isMovable = !setToFinalPosition;
	particle.isTarget = setToFinalPosition;
	particle.mSpeed = speed.clone();
	if (introLetterMeta) {
		particle.introOriginIndex = introLetterMeta.originIndex;
		particle.introDestinationIndex = introLetterMeta.destinationIndex;
		particle.introCurrentSlotIndex = introLetterMeta.originIndex;
		particle.introStringIndex = introLetterMeta.stringIndex;
		particle.introCharacterIndex = introLetterMeta.characterIndex;
		particle.introOriginPosition = introLetterMeta.originPosition.clone();
		particle.introSlotPosition = introLetterMeta.slotPosition.clone();
		particle.introLifted = false;
		if (particle.introCurrentSlotIndex >= 0) {
			this.introSlotOccupants[particle.introCurrentSlotIndex] = particle;
		}
	}
	if(setToFinalPosition)
	{
		particle.position.x = aPositionTarget.x;
		particle.position.y = aPositionTarget.y;
		particle.position.z = aPositionTarget.z;
	}
	if(isMonsterEndTarget)
	{
		this.monsterEndPosition = particle.TargetObject.positionTarget.clone();
		// ParticleLetter draws the glyph at local canvas (-1, 1), not at (0, 0).
		// Apply the same scale transform to get the actual world position of the glyph.
		// scale.x = aSize, scale.y = -aSize, so:  Δx = -1*aSize (left),  Δy = 1*(-aSize) (down).
		this.monsterEndPosition.x += -1 * particle.scale.x;
		this.monsterEndPosition.y += 0 * particle.scale.y;
		this.monsterEndScale = new THREE.Vector3(particle.scale.x * 4, Math.abs(particle.scale.y) * 4, particle.scale.z * 2);
	}
	
	if (!isMonsterEndTarget) {
		scene.add(particle);
		this.foodArray.push(particle);
	}
	
	return particle;
}

/** Random cyclic permutation (Sattolo): every item moves, no fixed points when length > 1. */
function permuteIntroLetterSlots(slots) {
	var n = slots.length;
	if (n <= 1) {
		return slots.map(function (slot) {
			return {
				index: slot.index,
				positionTarget: slot.positionTarget.clone(),
			};
		});
	}
	var permuted = slots.map(function (slot) {
		return {
			index: slot.index,
			positionTarget: slot.positionTarget.clone(),
		};
	});
	for (var i = n - 1; i > 0; i--) {
		// myRandom() is in [-1, 1]; use Math.random() for a valid index in [0, i - 1].
		var j = Math.floor(Math.random() * i);
		var tmp = permuted[i];
		permuted[i] = permuted[j];
		permuted[j] = tmp;
	}
	return permuted;
}

ParticleGroupMonster.prototype.IsIntroSlotFree = function (slotIndex) {
	if (slotIndex == null || slotIndex < 0) {
		return true;
	}
	return !this.introSlotOccupants[slotIndex];
}

ParticleGroupMonster.prototype.CaptureIntroLetter = function (particle) {
	if (particle.introCurrentSlotIndex != null && this.introSlotOccupants[particle.introCurrentSlotIndex] === particle) {
		this.introSlotOccupants[particle.introCurrentSlotIndex] = null;
	}
	particle.introCurrentSlotIndex = null;
	particle.introLifted = true;
	particle.isMovable = false;
}

ParticleGroupMonster.prototype.CanPlaceIntroLetter = function (particle) {
	if (particle.introDestinationIndex == null) {
		return true;
	}
	var occupant = this.introSlotOccupants[particle.introDestinationIndex];
	return !occupant || occupant === particle;
}

ParticleGroupMonster.prototype.PlaceIntroLetter = function (particle) {
	var target = particle.TargetObject.positionTarget;
	particle.position.x = target.x;
	particle.position.y = target.y;
	particle.position.z = target.z;
	particle.introCurrentSlotIndex = particle.introDestinationIndex;
	particle.introLifted = false;
	if (particle.introDestinationIndex != null) {
		this.introSlotOccupants[particle.introDestinationIndex] = particle;
	}
	particle.isEaten = true;
	particle.isTarget = true;
	particle.isMovable = false;
}

ParticleGroupMonster.prototype.AddString = function (aText, aPosition, aTextSize = 0.03, aTextColor = 0x000000) {
	var THREE = globalThis.THREE;
	var myRandom = globalThis.myRandom;

	var size = window.innerWidth * aTextSize;
	var spaceInit = size * 1.9;
	var position = aPosition.clone();
	position.addSelf(this.positionCenter);
	var width = window.innerWidth * 0.5;
	var testCanvas = document.createElement('canvas');
	var context = testCanvas.getContext('2d');
        context.font = size + "pt TitleText";
        context.textAlign = "left";
    var etalon = context.measureText('a').width;
	var thisSize = 0;
	var letterSpecs = [];
	var stringIndex = this.nextIntroStringIndex++;
	var maxToMove = 4;

	for (var i = 0; i < aText.length; i++) {
		var char = aText[i];
		var textMeasured = context.measureText(char);
		thisSize = textMeasured.width / etalon;
		position.x += spaceInit * thisSize * 0.5;
		if (char !== ' ') {
			var isMonsterEndTarget = aText == "BAPTISTE BOHELAY" && char == "O";
			var slotIndex = this.nextIntroLetterSlotIndex++;
			var isFinalPosition = i == 0 || Math.random() < 0.8 || isMonsterEndTarget;
			if (maxToMove <= 0 && !isFinalPosition) {
				isFinalPosition = true;
				maxToMove--;
			}
			
			this.introLetterSlots[slotIndex] = {
				index: slotIndex,
				stringIndex: stringIndex,
				characterIndex: i,
				char: char,
				positionTarget: position.clone(),
			};
			letterSpecs.push({
				char: char,
				slotIndex: slotIndex,
				stringIndex: stringIndex,
				characterIndex: i,
				positionTarget: position.clone(),
				isFinalPosition: isFinalPosition,
				isMonsterEndTarget: isMonsterEndTarget,
			});
		}
		position.x += spaceInit * thisSize * 0.5;
	}

	var movableSlots = [];
	for (var j = 0; j < letterSpecs.length; j++) {
		if (!letterSpecs[j].isFinalPosition) {
			movableSlots.push({
				index: letterSpecs[j].slotIndex,
				positionTarget: letterSpecs[j].positionTarget,
			});
		}
	}
	var permutedMovableSlots = permuteIntroLetterSlots(movableSlots);
	var movableIndex = 0;

	for (var k = 0; k < letterSpecs.length; k++) {
		var spec = letterSpecs[k];
		var startPosition;
		var originIndex = spec.slotIndex;
		if (spec.isFinalPosition) {
			startPosition = spec.positionTarget.clone();
		} else if (movableSlots.length <= 1) {
			startPosition = new THREE.Vector3(
				this.positionCenter.x + myRandom() * width * 0.5 + width * 0.3,
				this.positionCenter.y + (myRandom() - 0.5) * width * 0.3,
				0
			);
			originIndex = -1;
		} else {
			var originSlot = permutedMovableSlots[movableIndex++];
			startPosition = originSlot.positionTarget.clone();
			originIndex = originSlot.index;
		}
		this.AddFood(
			spec.char,
			startPosition,
			new THREE.Vector3(),
			size,
			spec.positionTarget,
			aTextColor,
			spec.isFinalPosition,
			spec.isMonsterEndTarget,
			{
				originIndex: originIndex,
				destinationIndex: spec.slotIndex,
				stringIndex: spec.stringIndex,
				characterIndex: spec.characterIndex,
				originPosition: startPosition,
				slotPosition: spec.positionTarget,
			}
		);
	}
}

ParticleGroupMonster.prototype.InitFood = function(width)
{
	this.AddString("BAPTISTE BOHELAY", new THREE.Vector3(-window.innerWidth * .4, window.innerHeight * 0.3, 0));
	this.AddString("Developer & Designer", new THREE.Vector3(-window.innerWidth * .4, window.innerHeight * 0.3 - window.innerWidth * 0.08, 0), 0.023, 0x666666);
}

ParticleGroupMonster.prototype.MouseUp = function () {
	globalThis.SELECTED = false;
};

ParticleGroupMonster.prototype.GetMenuPositionCenter = function () {
	var THREE = globalThis.THREE;

	// Push z toward the camera so the particles are ~w*0.27 in front of it,
	// matching the apparent scale they had in the old PART_CREA_LULU group
	// (which used cameraDistance = w*0.27, vs the intro's much larger (w+h)*0.45).
	var zOffset = this.cameraDistance - window.innerWidth * 0.27;
	return this.positionCenter.clone().addSelf(new THREE.Vector3(window.innerWidth * 0.0, window.innerHeight * 0.0, zOffset));
}

ParticleGroupMonster.prototype.SetMenuParticleVisible = function (aParticle, aVisible) {
	var isdefined = globalThis.isdefined;

	aParticle.visible = aVisible;
	if (isdefined(aParticle.TargetObject.info))
	{
		aParticle.TargetObject.info.visible = aVisible;
	}
	if(isdefined(aParticle.TargetObject.particleClear))
	{
		aParticle.TargetObject.particleClear.visible = aVisible;
	}
}

ParticleGroupMonster.prototype.AddParticle = function (aParticleObject) {
	var isdefined = globalThis.isdefined;
	var Organigram = globalThis.Organigram;

	var particle = aParticleObject.particle;
	particle.positionTargetIntro = particle.position.clone();
	particle.SetPosition(particle.positionTargetIntro.clone());
	if(isdefined(this.NavigatorsCenter))
	{
		particle.navigatorOffset = particle.positionTargetIntro.clone().subSelf(this.NavigatorsCenter);
	}
	this.SetMenuParticleVisible(particle, true);
	if(isdefined(particle.SetTextVisible))
	{
		particle.SetTextVisible(true);
	}

	this.menuParticles.push(particle);
	this.menuParticlesToUpdate.push(aParticleObject);
	this.particles = this.menuParticles;
	if(isdefined(aParticleObject.target) && isdefined(aParticleObject.target.target))
	{
		Organigram.Map(this.id, aParticleObject.target.target);
	}
}

ParticleGroupMonster.prototype.GetParticleThatLeadTo = function(aTarget)
{
	for(var i = 0; i < this.particles.length; i++)
	{
		if(this.particles[i].TargetObject.target == aTarget)
		{
			return this.particles[i];
		}
	}
}

ParticleGroupMonster.prototype.UpdateMenuParticles = function (delta) {
	var isdefined = globalThis.isdefined;

	for (var j = 0; j < this.menuParticlesToUpdate.length; j++) {
		if (isdefined(this.menuParticlesToUpdate[j].Update))
		{
			this.menuParticlesToUpdate[j].Update(delta);
		}
	}
}

ParticleGroupMonster.prototype.UpdateNavigatorsRotation = function () {
	var isdefined = globalThis.isdefined;
	var mouse = globalThis.mouse;

	if (!isdefined(this.NavigatorsCenter) || this.menuParticles.length === 0) return;

	var theta = -mouse.x * this.navigatorsAngleAmplitude;
	var phi = mouse.y * this.navigatorsVerticalAngleAmplitude;

	this.particleRotateSpeed.x += (phi - this.particleRotateSpeed.x) * 0.03;
	this.particleRotateSpeed.y += (theta - this.particleRotateSpeed.y) * 0.03;

	// this.particleRotate.x += this.particleRotateSpeed.x * 0.03;
	// this.particleRotate.y += this.particleRotateSpeed.y * 0.03;

	// this.particleRotateSpeed.x = this.particleRotateSpeed.x * 0.96;
	// this.particleRotateSpeed.y = this.particleRotateSpeed.y * 0.96;

	var cosT = Math.cos(this.particleRotateSpeed.y);
	var sinT = Math.sin(this.particleRotateSpeed.y);
	var cosP = Math.cos(this.particleRotateSpeed.x);
	var sinP = Math.sin(this.particleRotateSpeed.x);
	var cx = this.NavigatorsCenter.x;
	var cy = this.NavigatorsCenter.y;
	var cz = this.NavigatorsCenter.z;

	for(var i = 0; i < this.menuParticles.length; i++)
	{
		var particle = this.menuParticles[i];
		if(!isdefined(particle.navigatorOffset))
			continue;

		var ox = particle.navigatorOffset.x;
		var oy = particle.navigatorOffset.y;
		var oz = particle.navigatorOffset.z;
		// Y axis (mouse.x), then X axis (mouse.y)
		var x1 = ox * cosT + oz * sinT;
		var y1 = oy;
		var z1 = -ox * sinT + oz * cosT;
		particle.position.x = cx + x1;
		particle.position.y = cy + y1 * cosP - z1 * sinP;
		particle.position.z = cz + y1 * sinP + z1 * cosP;
		particle.SetPosition(particle.position);
	}
}

ParticleGroupMonster.prototype.IsMenuParticle = function(aParticle)
{
	for(var i = 0; i < this.menuParticles.length; i++)
	{
		if(this.menuParticles[i] === aParticle)
		{
			return true;
		}
	}
	return false;
}

ParticleGroupMonster.prototype.SelectMenuParticle = function (aParticle) {
	var isdefined = globalThis.isdefined;
	var programStroke = globalThis.programStroke;
	var OPACITY_INFO = globalThis.OPACITY_INFO;
	var GoToIndex = globalThis.GoToIndex;
	var CirclesToHtml = globalThis.CirclesToHtml;
	var GoToURL = globalThis.GoToURL;
	var ImageFrontCtx = globalThis.ImageFrontCtx;

	if (isdefined(aParticle.TargetObject.isAutonomous))
	{
		aParticle.MyMouseDown();
		this.cameraDistance = aParticle.MyCameraDistance();
		return;
	}

	aParticle.material.program = programStroke;
	aParticle.TargetObject.info.material.opacity = OPACITY_INFO;
	if(typeof aParticle.TargetObject.target != "undefined")
	{
		GoToIndex(aParticle.TargetObject.target);
	}
	else if(typeof aParticle.TargetObject.targetHTML != "undefined")
	{
		CirclesToHtml(aParticle.TargetObject.targetHTML);
	}
	else if(typeof aParticle.TargetObject.targetURL != "undefined")
	{
		ImageFrontCtx.fillStyle = '#ffffff';
		var newURL = window.location.href.substring(0, window.location.href.indexOf('#')) + aParticle.TargetObject.targetURL;
		GoToURL(newURL);
	}
}

ParticleGroupMonster.prototype.MouseDown = function () {
	var IS_PHONE = globalThis.IS_PHONE;
	var INTERSECTED = globalThis.INTERSECTED;

	if (IS_PHONE) this.UpdatePointer();

	if (this.menuParticles.length > 0 && INTERSECTED && this.IsMenuParticle(INTERSECTED)) {
		this.SelectMenuParticle(INTERSECTED);
		return;
	}

	if (INTERSECTED || !globalThis.sEnd) {
		globalThis.sEnd = true;

		$('#githubButton').slideUp(300);
		$('#contactButton').slideUp(200);

		globalThis.infoDisplay.FadeOut();
	}
};

ParticleGroupMonster.prototype.UpdateCamera = function (delta) {
	var sTools = globalThis.sTools;

	this.cameraZTimer += delta;
	var delay = 2.;
	var t = Math.min(1., Math.max(0., this.cameraZTimer - delay));
	t = t * t * (3. - 2. * t);
	this.cameraZRatio = 0.7 + 0.3 * t;

	globalThis.cameraTarget = sTools.ParticleGroups[sTools.ParticleGroup.PART_INTRO].positionCenter;
	globalThis.cameraPosition = this.GetCameraPosition();
	this.positionCenter.x = this.positionCenterInitial.x + t * window.innerWidth * 0.25;
	this.positionCenter.y = this.positionCenterInitial.y - t * window.innerHeight * 0.3;
}

ParticleGroupMonster.prototype.GetCameraPosition = function () {
	var THREE = globalThis.THREE;

	return new THREE.Vector3(
		this.positionCenter.x + this.cameraDistance * 0.0,
		this.positionCenter.y,
		this.positionCenter.z + this.cameraDistance * this.cameraZRatio
	);
}

ParticleGroupMonster.prototype.AreIntroLettersSettled = function () {
	for (var i = 0; i < this.foodArray.length; i++) {
		var target = this.foodArray[i].TargetObject.positionTarget;
		var dx = target.x - this.foodArray[i].position.x;
		var dy = target.y - this.foodArray[i].position.y;
		var settleDistance = Math.sqrt(dx * dx + dy * dy);
		if (settleDistance > this.foodArray[i].scale.x * 0.1) {
			return false;
		}
	}
	return this.foodArray.length > 0;
}

ParticleGroupMonster.prototype.StartMonsterTravel = function () {
	if(this.monsterIntroPhase === 'travelling' || this.monsterIntroPhase === 'settled')
	{
		return;
	}

	this.monsterIntroPhase = 'travelling';
	this.monster.SetIntroMode('travelling');
	this.monsterSpiralInit = false;
	this.monsterSpiralPhase = 'spiraling';
	this.monsterPathProgress = 0;
	this.monsterSpringVel = { x: 0, y: 0, z: 0 };
	this.monsterSpringScaleVel = { x: 0, y: 0 };
}

ParticleGroupMonster.prototype.UpdateMonsterIntroPhase = function (delta) {
	if(globalThis.sEnd && this.monsterIntroPhase !== 'travelling' && this.monsterIntroPhase !== 'settled')
	{
		this.StartMonsterTravel();
		return;
	}

	switch(this.monsterIntroPhase)
	{
		case 'scratching':
			this.monsterIntroScratchTimer += delta;
			if(this.monsterIntroScratchTimer >= this.monsterIntroScratchDuration)
			{
				this.monsterIntroPhase = 'eating';
				this.monsterIntroEatTimer = 0;
				this.monster.SetIntroMode('eating');
			}
			break;
		case 'eating':
			this.monsterIntroEatTimer += delta;
			if(this.monsterIntroEatTimer >= this.monsterIntroMinEatDuration && this.AreIntroLettersSettled())
			{
				this.StartMonsterTravel();
			}
			break;
	}
}

/*
* update the position of the letters.
*/
ParticleGroupMonster.prototype.UpdateFood = function (delta) {
	var monsterParticle = this.monster.particle;
	var isdefined = globalThis.isdefined;

	var prevMonsterX = monsterParticle.position.x;
	var prevMonsterY = monsterParticle.position.y;

	this.UpdateMonsterIntroPhase(delta);
	// if(this.monsterIntroPhase !== 'travelling' && this.monsterIntroPhase !== 'settled')
	// {
	// 	sMonster.speed = { x: 0, y: 0 };
	// 	return;
	// }

	if(isdefined(this.monsterEndPosition))
	{

		monsterParticle.position = this.monsterEndPosition.clone();
		monsterParticle.scale = this.monsterEndScale.clone();
		// if(!this.monsterSpiralInit)
		// {
		// 	var spiralDx = sMonster.position.x - this.monsterEndPosition.x;
		// 	var spiralDy = sMonster.position.y - this.monsterEndPosition.y;
		// 	this.monsterSpiralRadius = Math.sqrt(spiralDx * spiralDx + spiralDy * spiralDy);
		// 	this.monsterSpiralAngle = Math.atan2(spiralDy, spiralDx);
		// 	this.monsterSpiralTurns = 2.;
		// 	this.monsterSpiralStartZ = sMonster.position.z;
		// 	this.monsterSpiralStartScaleX = sMonster.scale.x;
		// 	this.monsterSpiralStartScaleY = sMonster.scale.y;
		// 	this.monsterPathProgress = 0;
		// 	this.monsterSpiralStopT = 1.;
		// 	var dTheta = this.monsterSpiralTurns * Math.PI * 2;
		// 	for(var n = 0; n < 20; n++)
		// 	{
		// 		var targetTheta = Math.PI / 2 + n * Math.PI * 2;
		// 		var tStop = (targetTheta - this.monsterSpiralAngle) / dTheta;
		// 		if(tStop > 0.01 && tStop <= 1.)
		// 		{
		// 			this.monsterSpiralStopT = tStop;
		// 			break;
		// 		}
		// 	}
		// 	this.monsterSpiralInit = true;
		// }

		// if(this.monsterSpiralPhase === 'springing' || this.monsterSpiralPhase === 'settled')
		// {
		// 	if(this.monsterSpiralPhase === 'springing')
		// 	{
		// 		var springK = 70.;
		// 		var springD = 11.;
		// 		var scaleSpringK = 55.;
		// 		var scaleSpringD = 9.;
		// 		var targetX = this.monsterEndPosition.x;
		// 		var targetY = this.monsterEndPosition.y;
		// 		var targetZ = this.monsterEndPosition.z;
		// 		var targetScaleX = isdefined(this.monsterEndScale) ? this.monsterEndScale.x * 2 : sMonster.scale.x;
		// 		var targetScaleY = isdefined(this.monsterEndScale) ? this.monsterEndScale.y * 2 : sMonster.scale.y;

		// 		this.monsterSpringVel.x += (springK * (targetX - sMonster.position.x) - springD * this.monsterSpringVel.x) * delta;
		// 		this.monsterSpringVel.y += (springK * (targetY - sMonster.position.y) - springD * this.monsterSpringVel.y) * delta;
		// 		this.monsterSpringVel.z += (springK * (targetZ - sMonster.position.z) - springD * this.monsterSpringVel.z) * delta;
		// 		sMonster.position.x += this.monsterSpringVel.x * delta;
		// 		sMonster.position.y += this.monsterSpringVel.y * delta;
		// 		sMonster.position.z += this.monsterSpringVel.z * delta;

		// 		this.monsterSpringScaleVel.x += (scaleSpringK * (targetScaleX - sMonster.scale.x) - scaleSpringD * this.monsterSpringScaleVel.x) * delta;
		// 		this.monsterSpringScaleVel.y += (scaleSpringK * (targetScaleY - sMonster.scale.y) - scaleSpringD * this.monsterSpringScaleVel.y) * delta;
		// 		sMonster.scale.x += this.monsterSpringScaleVel.x * delta;
		// 		sMonster.scale.y += this.monsterSpringScaleVel.y * delta;

		// 		var settleDist = Math.sqrt(
		// 			(targetX - sMonster.position.x) * (targetX - sMonster.position.x) +
		// 			(targetY - sMonster.position.y) * (targetY - sMonster.position.y)
		// 		);
		// 		var settleSpeed = Math.sqrt(
		// 			this.monsterSpringVel.x * this.monsterSpringVel.x +
		// 			this.monsterSpringVel.y * this.monsterSpringVel.y
		// 		);
		// 		if(settleDist < window.innerWidth * 0.002 && settleSpeed < window.innerWidth * 0.02)
		// 		{
		// 			this.monsterSpiralPhase = 'settled';
		// 			this.monsterIntroPhase = 'settled';
		// 			this.monster.SetIntroMode('settled');
		// 			sMonster.position.x = targetX;
		// 			sMonster.position.y = targetY;
		// 			sMonster.position.z = targetZ;
		// 			sMonster.scale.x = targetScaleX;
		// 			sMonster.scale.y = targetScaleY;
		// 			this.monsterSpringVel = { x: 0, y: 0, z: 0 };
		// 			this.monsterSpringScaleVel = { x: 0, y: 0 };
		// 		}
		// 	}

		

		// 	if(delta > 0)
		// 	{
		// 		sMonster.speed = {
		// 			x: (sMonster.position.x - prevMonsterX) / delta,
		// 			y: (sMonster.position.y - prevMonsterY) / delta
		// 		};
		// 	}
		// }
		// else
		// {
		// 	var PHI = (1 + Math.sqrt(5)) * 0.5;
		// 	this.monsterPathProgress = Math.min(this.monsterSpiralStopT, this.monsterPathProgress + delta * 0.12 * (1 + this.monsterPathProgress));
		// 	var t = this.monsterPathProgress;
		// 	var theta = this.monsterSpiralAngle + t * this.monsterSpiralTurns * Math.PI * 2;
		// 	var radius = this.monsterSpiralRadius * Math.pow(PHI, -t * this.monsterSpiralTurns * 4);

		// 	if(t >= this.monsterSpiralStopT)
		// 	{
		// 		sMonster.position.x = this.monsterEndPosition.x;
		// 		sMonster.position.y = this.monsterEndPosition.y + 0.7 * radius;
		// 		this.monsterSpiralPhase = 'springing';
		// 		this.monsterSpringVel = {
		// 			x: delta > 0 ? (sMonster.position.x - prevMonsterX) / delta : 0,
		// 			y: delta > 0 ? (sMonster.position.y - prevMonsterY) / delta : 0,
		// 			z: 0
		// 		};
		// 		this.monsterSpringScaleVel = { x: 0, y: 0 };
		// 	}
		// 	else
		// 	{
		// 		sMonster.position.x = this.monsterEndPosition.x + radius * Math.cos(theta);
		// 		sMonster.position.y = this.monsterEndPosition.y + 0.7 * radius * Math.sin(theta);
		// 	}
		// 	sMonster.position.z = this.monsterSpiralStartZ + (this.monsterEndPosition.z - this.monsterSpiralStartZ) * t;

		// 	if(isdefined(this.monsterEndScale))
		// 	{
		// 		sMonster.scale.x = this.monsterSpiralStartScaleX + (this.monsterEndScale.x * 2 - this.monsterSpiralStartScaleX) * t;
		// 		sMonster.scale.y = this.monsterSpiralStartScaleY + (this.monsterEndScale.y * 2 - this.monsterSpiralStartScaleY) * t;
		// 	}

		// 	globalThis.sMonsterLineWidth = 1000.11 / (sMonster.scale.x * sMonster.scale.x);

		// 	if(delta > 0)
		// 	{
		// 		sMonster.speed = {
		// 			x: (sMonster.position.x - prevMonsterX) / delta,
		// 			y: (sMonster.position.y - prevMonsterY) / delta
		// 		};
		// 	}
		// }
	}
	else
	{
		monsterParticle.speed = { x: 0, y: 0 };
	}
}

ParticleGroupMonster.prototype.SwitchNextState = function () {
	globalThis.sCurrentResumeSate = ResumeStates.IDLE;
};

ParticleGroupMonster.prototype.Update = function (delta) {
	var sChallenge = globalThis.sChallenge;
	var isdefined = globalThis.isdefined;
	var sCurrentResumeSate = globalThis.sCurrentResumeSate;

	switch (sCurrentResumeSate) {
		case ResumeStates.INIT:
			if (this.foodArray.length == 0) {
				globalThis.sCurrentResumeSate = ResumeStates.IDLE;
			}
			break;
		case ResumeStates.IDLE:
			this.InitChallenge(this.NextChallenge);
			globalThis.sCurrentResumeSate++;
			break;
	}

	if (isdefined(sChallenge)) sChallenge.Update(delta);

	if (globalThis.sMessageDisplaying) {
		delta *= 0.05;
	}
	globalThis.cameraManager.SetControlMode(globalThis.sTools.CameraControlType.NONE);
	this.UpdateCamera(delta);

	this.UpdateFood(delta);

	this.monster.Update(delta);
	this.UpdateMenuParticles(delta);
	this.UpdateNavigatorsRotation();

	this.UpdateIntersectPlane();
}

ParticleGroupMonster.prototype.Init = function()
{
	if(!this.menuParticles.length)
	{
		this.particles = [];
		return;
	}
	this.particles = this.menuParticles;
	for(var i = 0; i < this.menuParticles.length; i++)
	{
		this.SetMenuParticleVisible(this.menuParticles[i], true);
	}
};
ParticleGroupMonster.prototype.Terminate = function()
{
	// for(var i = 0; i < this.foodArray.length; i++)
	// {
	// 	scene.remove(this.foodArray[i]);
	// }
}

ParticleGroupMonster.prototype.UpdateIntersectPlane = function () {
	if (globalThis.IS_PHONE) return;

	if (this.menuParticles.length > 0 || globalThis.sEnd)
	{
		this.UpdatePointer();
	}
}

ParticleGroupMonster.prototype.UpdatePointer = function () {
	var THREE = globalThis.THREE;
	var mouse = globalThis.mouse;
	var projector = globalThis.projector;
	var camera = globalThis.camera;
	var isdefined = globalThis.isdefined;
	var programStroke = globalThis.programStroke;
	var programFill = globalThis.programFill;
	var OPACITY_INFO = globalThis.OPACITY_INFO;
	var monsterParticle = this.monster.particle;
	var sRayCircle = this.monster.rayCircle;

	var vector = new THREE.Vector3(mouse.x, mouse.y, 0.5);
	projector.unprojectVector(vector, camera);

	var ray = new THREE.Ray(camera.position, vector.subSelf(camera.position).normalize());

	if(this.menuParticles.length > 0)
	{
		var menuIntersects = ray.intersectObjects(this.menuParticles);
		if (menuIntersects.length > 0) {
			if (globalThis.INTERSECTED != menuIntersects[0].object) {
				if (globalThis.INTERSECTED && this.IsMenuParticle(globalThis.INTERSECTED)) {
					if (isdefined(globalThis.INTERSECTED.TargetObject.isAutonomous)) {
						globalThis.INTERSECTED.MyMouseOff(menuIntersects[0]);
					} else {
						globalThis.INTERSECTED.material.program = programStroke;
					}
					globalThis.INTERSECTED.TargetObject.info.material.opacity = OPACITY_INFO;
				}

				globalThis.INTERSECTED = menuIntersects[0].object;
				if (isdefined(globalThis.INTERSECTED.TargetObject.isAutonomous)) {
					globalThis.INTERSECTED.MyMouseOn(menuIntersects[0]);
					return;
				}
				globalThis.INTERSECTED.material.program = programFill;
			}

			if (isdefined(globalThis.INTERSECTED.TargetObject.info)) {
				globalThis.INTERSECTED.TargetObject.info.material.opacity +=
					(1. - globalThis.INTERSECTED.TargetObject.info.material.opacity) * 2. * 0.02;
			}
			return;
		}

		if (globalThis.INTERSECTED && this.IsMenuParticle(globalThis.INTERSECTED)) {
			if (isdefined(globalThis.INTERSECTED.TargetObject.isAutonomous)) {
				globalThis.INTERSECTED.MyMouseOff(menuIntersects[0]);
			} else {
				globalThis.INTERSECTED.material.program = programStroke;
			}
			globalThis.INTERSECTED.TargetObject.info.material.opacity = OPACITY_INFO;
			globalThis.INTERSECTED = null;
		}
	}

	var intersects = ray.intersectObject(monsterParticle);

	if (intersects.length > 0) {
		globalThis.INTERSECTED = intersects[0].object;
		if (intersects[0].distance < globalThis.INTERSECTED.boundRadiusScale * sRayCircle) {
			this.monster.setMouseOverDisplay();
			return;
		}
	}
	this.monster.setNormalDisplay();
};

