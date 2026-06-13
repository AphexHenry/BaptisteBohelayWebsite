/**
 * Intro particle group: name letters, menu navigators, and the intro monster.
 *
 * Import named exports from this file in ES modules. For legacy pages that load
 * classic scripts in order, use registerParticleGroupIntroGlobals.mjs (main site).
 */
import { MonsterIntro } from '../monsters/MonsterIntro.mjs';
import { Navigation } from '../Navigation.mjs';
import { getViewPlaneBasis } from './IntroSpaceship.mjs';
import {
	computeSpaceshipLetterPushVelocity,
	setIntroLetterRotationZ,
	testSpaceshipLetterCollision,
	updateIntroLetterCollisionDebug,
} from './IntroSpaceshipLetterCollision.mjs';

var INTRO_LETTER_RETURN_TO_POOL_SEC = 1.0;

var lIndexStates = 0;
export var ResumeStates = {
	INIT: lIndexStates++,
	IDLE: lIndexStates++,
};

export function ParticleGroupIntro(positionCenter, name) {
	var THREE = globalThis.THREE;
	var sTools = globalThis.sTools;

	this.width = (window.innerWidth + window.innerHeight) * 0.5 * 0.3;
	this.cameraDistance = this.width * 3.;
	this.positionCenter = positionCenter.clone();
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
	this.navigatorsAngleAmplitude = Math.PI / 20;
	this.navigatorsVerticalAngleAmplitude = Math.PI / 16;
	// this.particleRotate = new THREE.Vector3(0, 0, 0);
	this.particleRotateSpeed = new THREE.Vector3(0, 0, 0);
	this.foodArray = [];
	this.introLetterSlots = [];
	this.introSlotOccupants = [];
	this.nextIntroLetterSlotIndex = 0;
	this.nextIntroStringIndex = 0;

	this.monster = new MonsterIntro(positionCenter, this.width, this);
	this.spaceshipPlayfieldCenter = null;
	this.monsterEndPosition = null;
	this.monsterEndScale = null;
	// this.monsterPathProgress = 0;
	// this.monsterSpiralInit = false;
	// this.monsterSpiralStopT = 1.;
	// this.monsterSpiralPhase = 'spiraling';
	this.monsterSpringVel = { x: 0, y: 0, z: 0 };
	this.monsterSpringScaleVel = { x: 0, y: 0 };
	this.InitFood(this.width);
	this.InitSurface(this.width);
	this.isIntro = true;
}


ParticleGroupIntro.prototype.InitSurface = function (width) {
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

ParticleGroupIntro.prototype.AddFood = function (
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

/** Sattolo shuffle: uniform random derangement (every slot gets another slot's position). */
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
		var j = Math.floor(Math.random() * i);
		var tmp = permuted[i];
		permuted[i] = permuted[j];
		permuted[j] = tmp;
	}
	return permuted;
}

ParticleGroupIntro.prototype.IsIntroSlotFree = function (slotIndex) {
	if (slotIndex == null || slotIndex < 0) {
		return true;
	}
	return !this.introSlotOccupants[slotIndex];
}

ParticleGroupIntro.prototype.CaptureIntroLetter = function (particle) {
	if (particle.introCurrentSlotIndex != null && this.introSlotOccupants[particle.introCurrentSlotIndex] === particle) {
		this.introSlotOccupants[particle.introCurrentSlotIndex] = null;
	}
	particle.introCurrentSlotIndex = null;
	particle.introLifted = true;
	particle.isMovable = false;
	if (particle.introDirectPlacement) {
		particle.introPlacementRotationStart = particle.rotation.z;
		particle.introPlacementMoveProgress = 0;
	} else if (particle.introPlacementRotationStart == null) {
		particle.introPlacementRotationStart = particle.rotation.z;
	}
}

ParticleGroupIntro.prototype.CanPlaceIntroLetter = function (particle) {
	if (particle.introDestinationIndex == null) {
		return true;
	}
	var occupant = this.introSlotOccupants[particle.introDestinationIndex];
	return !occupant || occupant === particle;
}

/** Spaceship-pushed letters re-enter the pool without the lift arc before placement. */
ParticleGroupIntro.prototype.ShouldSkipIntroLetterLift = function (particle) {
	return !!particle.introDirectPlacement;
};

ParticleGroupIntro.prototype.PlaceIntroLetter = function (particle) {
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
	particle.introSpaceshipDislodged = false;
	particle.introSpaceshipIdleTimer = 0;
	particle.introSpaceshipVel = null;
	particle.introSpaceshipAngularVel = 0;
	particle.rotation.z = 0;
	particle.introPlacementRotationStart = null;
	particle.introPlacementMoveProgress = 0;
	particle.introDirectPlacement = false;
}

ParticleGroupIntro.prototype.IsIntroLetterHeldByMonster = function (particle) {
	if (particle.introLifted) {
		return true;
	}
	var legs = this.monster.legs;
	for (var i = 0; i < legs.length; i++) {
		if (legs[i].gotObject && legs[i].gotObject.particle === particle) {
			return true;
		}
	}
	return false;
};

ParticleGroupIntro.prototype.ReleaseIntroLetterFromMonster = function (particle) {
	var LegStates = globalThis.IntroLegStates;
	var legs = this.monster.legs;
	for (var i = 0; i < legs.length; i++) {
		if (legs[i].gotObject && legs[i].gotObject.particle === particle) {
			legs[i].gotObject = null;
			if (LegStates) {
				legs[i].SetState(LegStates.IDLE);
			}
		}
	}
	particle.isTarget = false;
};

ParticleGroupIntro.prototype.DislodgeIntroLetter = function (particle) {
	if (this.IsIntroLetterHeldByMonster(particle)) {
		this.ReleaseIntroLetterFromMonster(particle);
	}

	if (particle.introCurrentSlotIndex != null && this.introSlotOccupants[particle.introCurrentSlotIndex] === particle) {
		this.introSlotOccupants[particle.introCurrentSlotIndex] = null;
	}
	if (particle.isTarget || particle.isEaten) {
		if (particle.introDestinationIndex != null && this.introSlotOccupants[particle.introDestinationIndex] === particle) {
			this.introSlotOccupants[particle.introDestinationIndex] = null;
		}
		particle.isTarget = false;
		particle.isEaten = false;
		particle.isMovable = true;
	}

	particle.introCurrentSlotIndex = null;
	particle.introOriginPosition = particle.position.clone();
	particle.introLifted = false;
	particle.introSpaceshipDislodged = true;
	particle.introSpaceshipIdleTimer = 0;
	particle.introDirectPlacement = false;

	if (this.monster.introMode === 'resting') {
		this.monster.SetIntroMode('eating');
	}
	this.monster.WakeUp(1.2);
};

ParticleGroupIntro.prototype.ReturnIntroLetterToPool = function (particle) {
	if (particle.introCurrentSlotIndex != null && this.introSlotOccupants[particle.introCurrentSlotIndex] === particle) {
		this.introSlotOccupants[particle.introCurrentSlotIndex] = null;
	}
	if (particle.introDestinationIndex != null && this.introSlotOccupants[particle.introDestinationIndex] === particle) {
		this.introSlotOccupants[particle.introDestinationIndex] = null;
	}

	// Stay where the push left the letter; pool origin is for monster pickup, not spawn layout.
	var poolRotationZ = particle.rotation.z;
	particle.introOriginPosition = particle.position.clone();
	particle.introOriginPosition.z = this.positionCenter.z;
	particle.position.z = this.positionCenter.z;
	particle.introCurrentSlotIndex = null;
	particle.introPlacementRotationStart = poolRotationZ;
	particle.introPlacementMoveProgress = 0;

	particle.isTarget = false;
	particle.isEaten = false;
	particle.introLifted = false;
	particle.isMovable = true;
	particle.introSpaceshipDislodged = false;
	particle.introSpaceshipIdleTimer = 0;
	particle.introSpaceshipVel = null;
	particle.introSpaceshipAngularVel = 0;
	particle.introDirectPlacement = true;
};

ParticleGroupIntro.prototype.UpdateSpaceshipLetterInteractions = function (spaceship, planeAnchor, delta) {
	if (!spaceship || !planeAnchor) {
		return;
	}

	var basis = getViewPlaneBasis(planeAnchor);
	if (globalThis.sEnd) {
		updateIntroLetterCollisionDebug(this, spaceship, planeAnchor, basis);
		return;
	}
	for (var i = 0; i < this.foodArray.length; i++) {
		var particle = this.foodArray[i];
		if (this.IsIntroLetterHeldByMonster(particle)) {
			continue;
		}

		var hit = testSpaceshipLetterCollision(spaceship, particle, planeAnchor, basis);
		if (hit) {
			this.DislodgeIntroLetter(particle);

			var push = computeSpaceshipLetterPushVelocity(spaceship, particle, basis);
			particle.introSpaceshipVel = { x: push.x, y: push.y };
			particle.introSpaceshipAngularVel = push.angular;
			particle.introSpaceshipIdleTimer = 0;
		} else if (particle.introSpaceshipDislodged) {
			particle.introSpaceshipIdleTimer = (particle.introSpaceshipIdleTimer || 0) + delta;
			if (particle.introSpaceshipIdleTimer >= INTRO_LETTER_RETURN_TO_POOL_SEC) {
				this.ReturnIntroLetterToPool(particle);
			}
		}
	}

	updateIntroLetterCollisionDebug(this, spaceship, planeAnchor, basis);
};

ParticleGroupIntro.prototype.AddString = function (aText, aPosition, aTextSize = 0.03, aTextColor = 0x000000) {
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
	var maxToMove = 8;

	for (var i = 0; i < aText.length; i++) {
		var char = aText[i];
		var textMeasured = context.measureText(char);
		thisSize = textMeasured.width / etalon;
		position.x += spaceInit * thisSize * 0.5;
		if (char !== ' ') {
			var isMonsterEndTarget = aText == "BAPTISTE BOHELAY" && char == "O";
			var slotIndex = this.nextIntroLetterSlotIndex++;
			var isFinalPosition = i == 0 || i % 4 != 0 || isMonsterEndTarget;
			if (!isFinalPosition && maxToMove <= 0) {
				isFinalPosition = true;
			}
			if (!isFinalPosition) {
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

ParticleGroupIntro.prototype.InitFood = function(width)
{
	this.AddString("BAPTISTE BOHELAY", new THREE.Vector3(-window.innerWidth * .4, window.innerHeight * 0.3, 0));
	this.AddString("Developer & Designer", new THREE.Vector3(-window.innerWidth * .4, window.innerHeight * 0.3 - window.innerWidth * 0.08, 0), 0.023, 0x666666);
}

ParticleGroupIntro.prototype.MouseUp = function () {
	globalThis.SELECTED = false;
};

ParticleGroupIntro.prototype.GetMenuPositionCenter = function () {
	var THREE = globalThis.THREE;

	// Push z toward the camera so the particles are ~w*0.27 in front of it,
	// matching the apparent scale they had in the old PART_CREA_LULU group
	// (which used cameraDistance = w*0.27, vs the intro's much larger (w+h)*0.45).
	var zOffset = 0;
	return this.positionCenter.clone().addSelf(new THREE.Vector3(window.innerWidth * 0.0, window.innerHeight * 0.0, zOffset));
}

ParticleGroupIntro.prototype.SetMenuParticleVisible = function (aParticle, aVisible) {
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

ParticleGroupIntro.prototype.AddParticle = function (aParticleObject) {
	var isdefined = globalThis.isdefined;
	var Organigram = globalThis.Organigram;

	var particle = aParticleObject.particle;
	particle.positionTargetIntro = particle.position.clone();
	particle.SetPosition(particle.positionTargetIntro.clone());
	if (this.NavigatorsCenter) {
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

ParticleGroupIntro.prototype.InitNavigatorsCenter = function () {
	var THREE = globalThis.THREE;
	var isdefined = globalThis.isdefined;

	if (this.menuParticles.length === 0) return;

	var cx = 0;
	var cy = 0;
	var cz = 0;
	for (var i = 0; i < this.menuParticles.length; i++) {
		var pos = this.menuParticles[i].positionTargetIntro;
		cx += pos.x;
		cy += pos.y;
		cz += pos.z;
	}
	var count = this.menuParticles.length;
	this.NavigatorsCenter = new THREE.Vector3(cx / count, cy / count, cz / count);

	for (var j = 0; j < this.menuParticles.length; j++) {
		var particle = this.menuParticles[j];
		if (!isdefined(particle.positionTargetIntro)) continue;
		particle.navigatorOffset = particle.positionTargetIntro.clone().subSelf(this.NavigatorsCenter);
	}
}

ParticleGroupIntro.prototype.GetParticleThatLeadTo = function(aTarget)
{
	for(var i = 0; i < this.particles.length; i++)
	{
		if(this.particles[i].TargetObject.target == aTarget)
		{
			return this.particles[i];
		}
	}
}

ParticleGroupIntro.prototype.UpdateMenuParticles = function (delta) {
	var isdefined = globalThis.isdefined;

	for (var j = 0; j < this.menuParticlesToUpdate.length; j++) {
		if (isdefined(this.menuParticlesToUpdate[j].Update))
		{
			this.menuParticlesToUpdate[j].Update(delta);
		}
	}
}

ParticleGroupIntro.prototype.UpdateNavigatorsRotation = function () {
	var isdefined = globalThis.isdefined;
	var mouse = globalThis.mouse;

	if (!this.NavigatorsCenter || this.menuParticles.length === 0) return;

	var theta = Math.cos(sGeneralTimer * 0.1) * this.navigatorsAngleAmplitude;
	// var theta = -mouse.x * this.navigatorsAngleAmplitude;
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

ParticleGroupIntro.prototype.IsMenuParticle = function(aParticle)
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

ParticleGroupIntro.prototype.SelectMenuParticle = function (aParticle) {
	var isdefined = globalThis.isdefined;
	var programStroke = globalThis.programStroke;
	var OPACITY_INFO = globalThis.OPACITY_INFO;
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
		Navigation.goToIndex(aParticle.TargetObject.target);
	}
	else if(typeof aParticle.TargetObject.targetHTML != "undefined")
	{
		Navigation.circlesToHtml(aParticle.TargetObject.targetHTML);
	}
	else if(typeof aParticle.TargetObject.targetURL != "undefined")
	{
		ImageFrontCtx.fillStyle = '#ffffff';
		var newURL = window.location.href.substring(0, window.location.href.indexOf('#')) + aParticle.TargetObject.targetURL;
		GoToURL(newURL);
	}
}

ParticleGroupIntro.prototype.MouseDown = function () {
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

ParticleGroupIntro.prototype.UpdateCamera = function (delta) {
	var sTools = globalThis.sTools;

	this.cameraZTimer += delta;
	var delay = 3.;
	var t = Math.min(1., Math.max(0., this.cameraZTimer - delay));
	t = t * t * (3. - 2. * t);
	this.cameraZRatio = 0.7 + 0.3 * t;

	globalThis.cameraTarget = sTools.ParticleGroups[sTools.ParticleGroup.PART_INTRO].positionCenter.clone();
	if (!this.isIntro) {
		globalThis.cameraTarget.z = -window.innerWidth * 0.15;	
	}
	
	globalThis.cameraPosition = this.GetCameraPosition();
	this.positionCenter.x = this.positionCenterInitial.x + t * window.innerWidth * 0.25;
	this.positionCenter.y = this.positionCenterInitial.y - t * window.innerHeight * 0.3;
}

ParticleGroupIntro.prototype.GetCameraPosition = function () {
	var THREE = globalThis.THREE;

	return new THREE.Vector3(
		this.positionCenter.x + this.cameraDistance * 0.0,
		this.positionCenter.y,
		this.positionCenter.z + this.cameraDistance * this.cameraZRatio
	);
};

ParticleGroupIntro.prototype.InitSpaceshipPlayfield = function (menuPosition) {
	this.spaceshipPlayfieldCenter = menuPosition.clone();
};

ParticleGroupIntro.prototype.GetSpaceshipPlayfieldCenter = function () {
	if (this.spaceshipPlayfieldCenter) {
		return this.spaceshipPlayfieldCenter.clone();
	}
	if (this.NavigatorsCenter) {
		return this.NavigatorsCenter.clone();
	}
	return this.positionCenter.clone();
};

// Spawn near the playfield anchor (e.g. creations bubble), not at a screen-corner offset.
ParticleGroupIntro.prototype.GetSpaceshipSpawnPlaneOffset = function () {
	return {
		right: -window.innerWidth * 0.12,
		up: window.innerHeight * 0.06,
	};
};

ParticleGroupIntro.prototype.GetSpaceshipPlayfieldBounds = function () {
	return {
		halfRight: window.innerWidth * 1.0,
		halfUp: window.innerHeight * 1.0,
	};
};

ParticleGroupIntro.prototype.GetSpaceshipGravityBodies = function () {
	var bodies = [];
	for (var i = 0; i < this.menuParticles.length; i++) {
		var particle = this.menuParticles[i];
		var target = particle.TargetObject || {};
		bodies.push({
			x: particle.position.x,
			y: particle.position.y,
			z: particle.position.z,
			mass: target.size || 1,
		});
	}
	return bodies;
};

ParticleGroupIntro.prototype.GetSpaceshipPlanetColliders = function () {
	var colliders = [];
	for (var i = 0; i < this.menuParticlesToUpdate.length; i++) {
		var planet = this.menuParticlesToUpdate[i];
		if (!planet || !planet.particle) {
			continue;
		}
		colliders.push({
			particle: planet.particle,
			name: (planet.target && planet.target.name) || 'planet',
			radius: planet.getWorldRadius(),
		});
	}
	return colliders;
};

ParticleGroupIntro.prototype.AreIntroLettersSettled = function () {
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

/*
* update the position of the letters.
*/
ParticleGroupIntro.prototype.UpdateFood = function (delta) {
	var monsterParticle = this.monster.particle;
	var isdefined = globalThis.isdefined;

	if (isdefined(this.monsterEndPosition)) {
		monsterParticle.position = this.monsterEndPosition.clone();
		monsterParticle.position.z += -1;
		monsterParticle.scale = this.monsterEndScale.clone();
	} else {
		monsterParticle.speed = { x: 0, y: 0 };
	}

	for (var i = 0; i < this.foodArray.length; i++) {
		var particle = this.foodArray[i];
		if (!particle.introSpaceshipDislodged || !particle.introSpaceshipVel) {
			continue;
		}
		if (this.IsIntroLetterHeldByMonster(particle)) {
			continue;
		}

		particle.position.x += particle.introSpaceshipVel.x * delta;
		particle.position.y += particle.introSpaceshipVel.y * delta;
		particle.position.z = this.positionCenter.z;
		setIntroLetterRotationZ(
			particle,
			(particle.rotation.z || 0) + (particle.introSpaceshipAngularVel || 0) * delta
		);

		var drag = Math.pow(0.96, delta * 60);
		particle.introSpaceshipVel.x *= drag;
		particle.introSpaceshipVel.y *= drag;
		particle.introSpaceshipAngularVel = (particle.introSpaceshipAngularVel || 0) * drag;
	}
}

ParticleGroupIntro.prototype.SwitchNextState = function () {
	globalThis.sCurrentResumeSate = ResumeStates.IDLE;
};

ParticleGroupIntro.prototype.Update = function (delta) {
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

ParticleGroupIntro.prototype.Init = function()
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
	this.isIntro = false;
};
ParticleGroupIntro.prototype.Terminate = function()
{
	// for(var i = 0; i < this.foodArray.length; i++)
	// {
	// 	scene.remove(this.foodArray[i]);
	// }
}

ParticleGroupIntro.prototype.UpdateIntersectPlane = function () {
	if (globalThis.IS_PHONE) return;

	if (this.menuParticles.length > 0 || globalThis.sEnd)
	{
		this.UpdatePointer();
	}
}

ParticleGroupIntro.prototype.UpdatePointer = function () {
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

