/**
 * Main site bootstrap (formerly inline in index.html).
 * Loaded as an ES module after Template / particle globals are registered.
 */
import { Navigation } from './Navigation.mjs';
import { CameraManager } from './CameraManager.mjs';
import { introSpaceshipController } from './intro/IntroSpaceshipController.mjs';
import { ParticleGroupFunkyCreation } from './ParticleGroup/ParticleGroupFunkyCreation.mjs';
import { ParticleGroupInteractive } from './ParticleGroup/ParticleGroupInteractive.mjs';
import { ParticleGroupWebExperiment } from './ParticleGroup/ParticleGroupWebExperiment.mjs';

(function () {
	function expose(name, get, set) {
		Object.defineProperty(globalThis, name, {
			get: get,
			set: set,
			enumerable: true,
			configurable: true,
		});
	}

	var container; // WebGL canvas container.
	var camera, scene, projector, renderer; // three.js components.
	var sceneInfo; // scene to display static informations.
	/** @type {InstanceType<typeof CameraManager> | undefined} */
	var cameraManager;

	var mousePosition = new THREE.Vector3(); // position of the mouse.
	var cameraTarget = new THREE.Vector3(); // where the camera needs to go in the end.
	var cameraTargetCurrent = new THREE.Vector3(); // where the camera needs to go next frame.
	var cameraPosition = new THREE.Vector3(); // where the camera is.
	var canInteract = true; // if false, the user can't interact with the website (like for animations states).
	var SELECTED = null; // current bubble selected.
	var organigram = new globalThis.Organigram(); // tree of relations between "pages" or actually group of bubbles.
	var isRoot = false; // if true, we actually are at the home "page".
	var sMinLoading = 1.;

	var sProjectsToRandom = []; // container for projects, used to get a random one.
	// var sProjectsLast; // last project added.

	var infoDisplay; // common text display in 3d.
	var sDrawScene = true;
	var sDrawSpeed = 0.2;

	var clock = new THREE.Clock(); // clock

	var PI2 = -Math.PI * 1.99; // PI2

	var mouse = { x: 0, y: 0 }, INTERSECTED;
	var sCoeffCameraMove = 0;

	expose('container', function () { return container; }, function (v) { container = v; });
	expose('camera', function () { return camera; }, function (v) { camera = v; });
	expose('scene', function () { return scene; }, function (v) { scene = v; });
	expose('sceneInfo', function () { return sceneInfo; }, function (v) { sceneInfo = v; });
	expose('projector', function () { return projector; }, function (v) { projector = v; });
	expose('renderer', function () { return renderer; }, function (v) { renderer = v; });
	expose('cameraManager', function () { return cameraManager; }, function (v) { cameraManager = v; });
	expose('mousePosition', function () { return mousePosition; }, function (v) { mousePosition = v; });
	expose('cameraTarget', function () { return cameraTarget; }, function (v) { cameraTarget = v; });
	expose('cameraTargetCurrent', function () { return cameraTargetCurrent; }, function (v) { cameraTargetCurrent = v; });
	expose('cameraPosition', function () { return cameraPosition; }, function (v) { cameraPosition = v; });
	expose('canInteract', function () { return canInteract; }, function (v) { canInteract = v; });
	expose('SELECTED', function () { return SELECTED; }, function (v) { SELECTED = v; });
	// Organigram.js already defines the constructor on globalThis; replace with the live instance.
	globalThis.Organigram = organigram;
	expose('isRoot', function () { return isRoot; }, function (v) { isRoot = v; });
	expose('sMinLoading', function () { return sMinLoading; }, function (v) { sMinLoading = v; });
	expose('sProjectsToRandom', function () { return sProjectsToRandom; }, function (v) { sProjectsToRandom = v; });
	expose('infoDisplay', function () { return infoDisplay; }, function (v) { infoDisplay = v; });
	expose('sDrawScene', function () { return sDrawScene; }, function (v) { sDrawScene = v; });
	expose('sDrawSpeed', function () { return sDrawSpeed; }, function (v) { sDrawSpeed = v; });
	expose('clock', function () { return clock; }, function (v) { clock = v; });
	expose('PI2', function () { return PI2; }, function (v) { PI2 = v; });
	expose('mouse', function () { return mouse; }, function (v) { mouse = v; });
	expose('INTERSECTED', function () { return INTERSECTED; }, function (v) { INTERSECTED = v; });
	expose('sCoeffCameraMove', function () { return sCoeffCameraMove; }, function (v) { sCoeffCameraMove = v; });

	init();
	animate();

	function init() {

		sWIDTH = window.innerWidth * 0.1;

		container = document.createElement('div');
		document.body.appendChild(container);

		camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 12000);
		// camera.position.set( 0, 0, 500 );

		scene = new THREE.Scene();
		sceneInfo = new THREE.Scene();

		scene.add(camera);
		sceneInfo.add(camera);

		// init the back button.
		new ButtonsBack();

		var flyer = [];
		flyer.push({ name: "musical baguette", targetHTML: "html/other/MusicalBaguette.html", size: 0.8 });
		flyer.push({ name: "Lulu - Iphone Game", targetHTML: "html/Lulu.html" });
		flyer.push({ name: "musical box", targetHTML: "html/other/MusicalBox.html" });
		flyer.push({ name: "Cocoons - Fête des Lumières", targetHTML: "html/other/Cocoons.html" });
		flyer.push({ name: "interactive dance", targetHTML: "html/other/InteractiveDance.html" });
		flyer.push({ name: "PIP - interactive installation", targetHTML: "html/other/pip.html" });
		// sProjectsLast = { name: "last project", targetHTML: "html/other/Cocoons.html" };
		var lBProjects = new ParticleGroupInteractive(new THREE.Vector3(0, 2000, 2000), flyer, "projects", sTools.ParticleGroup.PART_OTHER);
		lBProjects.mAngleAmplitude = Math.PI * .4;

		// Let's get all the particles group initialized each group at a time.
		// Monster
		var lIntro = new ParticleGroupIntro(new THREE.Vector3(-500, -1000, -1000), "home");
		sTools.ParticleGroups[sTools.ParticleGroup.PART_INTRO] = lIntro;
		sTools.ParticleGroups[sTools.ParticleGroup.PART_CREA_LULU] = lIntro;
		// This will define the position of those different particles relatively to the center.


		var lMenuPosition = lIntro.GetMenuPositionCenter();
		// var aboutMeTarget = { name: "about me", target: sTools.ParticleGroup.PART_ABOUT_ME, size: 0.9 };
		var menuScale = 2.3;
		var offsetY = 0.3 * window.innerHeight;
		var programmingPos = lMenuPosition.clone().addSelf(new THREE.Vector3(window.innerWidth * 0.15 * menuScale, -window.innerHeight * 0.5 * menuScale + offsetY, 0));
		var aboutMePos = lMenuPosition.clone().addSelf(new THREE.Vector3(window.innerWidth * 0.25 * menuScale, sWIDTH / getRatio() * -1.8 * menuScale + offsetY, 0));
		var funkyCreationPos = lMenuPosition.clone().addSelf(new THREE.Vector3(-window.innerWidth * 0.05 * menuScale, -window.innerWidth * 0.2 * menuScale + offsetY, 0));

		var aboutMe = new MonsterTournicoti(aboutMePos, 0.4, { name: "About Me", target: sTools.ParticleGroup.PART_ABOUT_ME, size: 1. * menuScale }, 1, false, 0xf97316);
		var programmingTarget = { name: "programming", target: sTools.ParticleGroup.PART_PROGRAMMING, size: 0.9 * menuScale };
		var programmingMonster = new MonsterRandom(programmingPos, 0.3, programmingTarget);
		
		// var randomLastProject = new MonsterTournicoti(new THREE.Vector3(lMenuPosition.x + sWIDTH * 1., lMenuPosition.y - 1. * sWIDTH / getRatio(), lMenuPosition.z + sWIDTH * 0.3), window.innerWidth * 0.06, sProjectsLast, 1);
		var funkyCreation = new MonsterTournicoti(funkyCreationPos, 0.4, { name: "creations", target: sTools.ParticleGroup.PART_FUNKY_CREATION, size: 1.5 * menuScale }, -1, false, 0xf97316);
		lIntro.AddParticle(funkyCreation);
		lIntro.AddParticle(programmingMonster);
		lIntro.AddParticle(aboutMe);
		lIntro.InitNavigatorsCenter();
		lIntro.InitSpaceshipPlayfield(funkyCreationPos);
		introSpaceshipController.init(lIntro);

		// creations type
		var flyer = [];
		var lFunky = new ParticleGroupFunkyCreation(lMenuPosition.clone().addSelf(new THREE.Vector3(600, 1300, -1700)), flyer, "funkyCreation", sTools.ParticleGroup.PART_FUNKY_CREATION);
		// var particleWebExp = { particle: new ParticleCircleNavigate(lFunky.positionCenter.clone().addSelf(new THREE.Vector3(sWIDTH * 1., sWIDTH * 0.5, 0.)), { name: "web exploration", target: sTools.ParticleGroup.PART_WEB }) };
		var monsterNoise = new MonsterNoise(lFunky.positionCenter.clone().addSelf(new THREE.Vector3(-sWIDTH * 1.6, 0., 0.)), 0.3, { name: "sounds", target: sTools.ParticleGroup.PART_SOUND_MONSTER });
		var monsterVideo = new MonsterVideo(lFunky.positionCenter.clone().addSelf(new THREE.Vector3(0, -sWIDTH * .3, sWIDTH * 1.6)), 0.3, { name: "comics", target: sTools.ParticleGroup.PART_COMICS });
		var monsterProjects = new MonsterProjects(lFunky.positionCenter.clone().addSelf(new THREE.Vector3(sWIDTH * 1., sWIDTH * 0.5, 0.)), 0.99, { name: "interactive", target: sTools.ParticleGroup.PART_OTHER, scale: 1.5 });
		monsterNoise.spaceshipCollides = false;
		monsterVideo.spaceshipCollides = false;
		monsterProjects.spaceshipCollides = false;

		lFunky.AddParticle(monsterNoise);
		lFunky.AddParticle(monsterVideo);
		lFunky.AddParticle(monsterProjects);
		lFunky.SetShortDistance();

		// sound monsters
		sTools.ParticleGroups[sTools.ParticleGroup.PART_SOUND_MONSTER] = new ParticleGroupMonsterSound(new THREE.Vector3(2500, 2500, 3500), "SoundMonsters");

		sTools.ParticleGroups[sTools.ParticleGroup.PART_ABOUT_ME] = new ParticleGroupAboutMe(new THREE.Vector3(2500, -1000, -1500), "AboutMe");

		// Web
		sTools.ParticleGroups[sTools.ParticleGroup.PART_WEB] = new ParticleGroupWebExperiment(new THREE.Vector3(-500, -2000, 1000), "WebExperiment");

		//  // Lulu
		sTools.ParticleGroups[sTools.ParticleGroup.PART_COMICS] = new ParticleGroupComics(new THREE.Vector3(1000, 1000, -1000), "comics");

		sTools.ParticleGroups[sTools.ParticleGroup.PART_PROGRAMMING] = new ParticleGroupProgramming(new THREE.Vector3(-1500, 2800, 500), "programming");

		// add the sounds as they are not in html in the website.
		sProjectsToRandom.push({ name: "sound monsters", targetHTML: "html/SoundMonsters.html", size: 1. });

		var lGroupToGo = sTools.ParticleGroup.PART_INTRO;
		var lHTMLToGo = window.location.hash.split('+');
		for (var i in sTools.ParticleGroups) {
			if (lHTMLToGo[0] == "#" + sTools.ParticleGroups[i].name) {
				lGroupToGo = i;
				if (lHTMLToGo.length > 1) {
					Navigation.circlesToHtmlEncoded(lHTMLToGo[1]);
				}
				break;
			}
		}
		if (!Navigation.isInHTML) {
			sTools.FadeIn();
		}
		if (Navigation.groupCurrent != sTools.ParticleGroup.PART_INTRO) {
			sTools.ParticleGroups[sTools.ParticleGroup.PART_INTRO].Terminate();
		}

		cameraManager = new CameraManager(camera);
		var lInitialGroup = sTools.ParticleGroups[lGroupToGo];
		if (typeof lInitialGroup.GetCameraPosition === 'function') {
			cameraTarget = lInitialGroup.positionCenter.clone();
			cameraTargetCurrent = cameraTarget.clone();
			cameraPosition = lInitialGroup.GetCameraPosition();
		} else {
			cameraTarget = lInitialGroup.positionCenter.clone();
			cameraTargetCurrent = cameraTarget.clone();
			cameraPosition = cameraTarget.clone();
			cameraPosition.z += 300;
		}
		camera.position = cameraPosition.clone();
		cameraManager.SetPositionPixel(cameraPosition);
		cameraManager.LookAt(cameraTarget);
		Navigation.goToIndex(lGroupToGo);
		if (lGroupToGo === sTools.ParticleGroup.PART_INTRO || lGroupToGo === sTools.ParticleGroup.PART_PROGRAMMING) {
			cameraManager.SetControlMode(sTools.CameraControlType.NONE);
		}

		projector = new THREE.Projector();

		renderer = new THREE.CanvasRenderer();
		renderer.setClearColorHex(0xf0f0f0)
		renderer.setSize(window.innerWidth, window.innerHeight);
		renderer.autoclear = false;

		container.appendChild(renderer.domElement);

		var ImageFront = document.createElement('canvas');
		document.body.appendChild(ImageFront);
		ImageFront.style.position = 'absolute';
		ImageFront.style.left = "0px";
		ImageFront.style.top = "0px";

		if (IS_PHONE) {
			document.addEventListener("touchstart", onDocumentTouchStart, false);
			document.addEventListener("touchend", onDocumentTouchEnd, false);
			document.addEventListener("touchmove", onDocumentTouchMove, false);
		}
		else {
			document.addEventListener('mousemove', onDocumentMouseMove, false);
			document.addEventListener('mousedown', onDocumentMouseDown, false);
			document.addEventListener('mouseup', onDocumentMouseUp, false);
		}

		infoDisplay = new InfoDisplay(1., 1.5);



		THREEx.WindowResize(renderer, cameraManager.GetCamera());
	}

	window.onload = function () {
		sPageLoaded = true;
	}

	window.onhashchange = function () {
		var hashGroup = Navigation.getHashGroup();
		if (!hashGroup) {
			if (Navigation.isInHTML) {
				Navigation.htmlToCircles();
			}
			Navigation.goToIndex(sTools.ParticleGroup.PART_INTRO);
			return;
		}
		if (!Navigation.isInHTML) {
			for (var i in sTools.ParticleGroups) {
				if (hashGroup == sTools.ParticleGroups[i].name) {
					Navigation.goToIndex(i);
					return;
				}
			}
		}
		else {
			Navigation.setHashGroup(sTools.ParticleGroups[Navigation.groupCurrent].name);
			Navigation.htmlToCircles();
		}
	}

	function isSelectableDomTarget(event) {
		var el = event.target;
		if (!el || el.nodeType !== 1 || typeof el.closest !== 'function') {
			return false;
		}
		return !!(
			el.closest('#textDescription') ||
			el.closest('#comicsViewer') ||
			el.closest('a, input, textarea, button, select, [contenteditable="true"]')
		);
	}

	function shouldPreserveNativeMouseBehavior(event) {
		if (isSelectableDomTarget(event)) {
			return true;
		}
		if (event.type === 'mousemove' && (event.buttons & 1)) {
			var sel = window.getSelection && window.getSelection();
			if (sel && sel.rangeCount > 0 && !sel.isCollapsed) {
				return true;
			}
		}
		return false;
	}

	function onDocumentMouseUp(event) {
		if (canInteract && !isSelectableDomTarget(event)) {
			sTools.ParticleGroups[Navigation.groupCurrent].MouseUp(event);
		}
	}

	function onDocumentMouseMove(event) {
		if (!shouldPreserveNativeMouseBehavior(event)) {
			event.preventDefault();
		}

		mousePosition = new THREE.Vector2(event.clientX, event.clientY, 1000);

		mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
		mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
	}

	function onDocumentMouseDown(event) {
		if (shouldPreserveNativeMouseBehavior(event)) {
			return;
		}
		event.preventDefault();
		if (canInteract) {
			sTools.ParticleGroups[Navigation.groupCurrent].MouseDown(event);
		}
	}

	function onDocumentTouchMove(event) {
		event.preventDefault();

		mousePosition = new THREE.Vector2(event.touches[0].clientX, event.touches[0].clientY, 1000);

		mouse.x = (event.touches[0].clientX / window.innerWidth) * 2 - 1;
		mouse.y = - (event.touches[0].clientY / window.innerHeight) * 2 + 1;
	}

	function onDocumentTouchStart(event) {
		event.preventDefault();
		mousePosition = new THREE.Vector2(event.touches[0].clientX, event.touches[0].clientY, 1000);

		mouse.x = (event.touches[0].clientX / window.innerWidth) * 2 - 1;
		mouse.y = - (event.touches[0].clientY / window.innerHeight) * 2 + 1;

		sTools.ParticleGroups[Navigation.groupCurrent].Update(0);

		if (canInteract) {
			sTools.ParticleGroups[Navigation.groupCurrent].MouseDown(event);
		}
	}

	function onDocumentTouchEnd(event) {
		if (canInteract) {
			sTools.ParticleGroups[Navigation.groupCurrent].MouseUp(event);
		}
	}

	function animate() {

		requestAnimationFrame(animate);

		render();
	}

	function render() {

		if (!sPageLoaded || sMinLoading > -1) {
			sMinLoading -= 0.02;
			if (sMinLoading <= 0) {
				sMinLoading = -2;
				if (!Navigation.isInHTML)
					Navigation.loadedInitDisplay()
			}
			return;
		}

		var radius = sTools.ParticleGroups[Navigation.groupCurrent].cameraDistance;
		var delta = Math.max(Math.min(clock.getDelta(), 0.06), 0.001);

		$("#framerate").html("framerate:" + Math.round(1 / delta))

		sButtonsBack.Update(delta);

		if (sDrawScene) {
			sDrawSpeed += delta * 1;
			sDrawSpeed = Math.min(1, sDrawSpeed);
		}
		else {
			sDrawSpeed -= delta;
			if (sDrawSpeed <= 0) {
				sDrawSpeed = 0;
				return;
			}

		}

		delta *= sDrawSpeed;
		sGeneralTimer += delta;

		var isNavigationTransitionActive = Navigation.isTransitionActive();
		if (canInteract && !isNavigationTransitionActive) {
			sTools.ParticleGroups[Navigation.groupCurrent].Update(delta);
		}

		infoDisplay.Update(delta);

		if (canInteract || introSpaceshipController.isEnteringGroup()) {
			introSpaceshipController.update(delta);
		}

		cameraManager.Update(delta);

		if (!SELECTED && !isNavigationTransitionActive) {
			cameraManager.UpdateAutoControl(
				sTools.ParticleGroups[Navigation.groupCurrent], radius, sGeneralTimer, mouse,
				cameraPosition, cameraTarget
			);
		}
		if (isNaN(camera.position.x)) {
			camera.position = new THREE.Vector3();
			console.log("error, NAN");
		}

		cameraManager.UpdateGoTo(cameraPosition, cameraTarget);

		camera.updateMatrixWorld();

		Navigation.update(delta);

		// rotate camera
		renderer.clear(true, true, true);

		renderer.render(sceneInfo, camera);
		renderer.render(scene, camera);

	}
})();
