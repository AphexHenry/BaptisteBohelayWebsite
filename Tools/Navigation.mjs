/**
 * Site navigation: particle groups, hash routing, and HTML overlay transitions.
 * Uses globalThis for app state shared with classic scripts (camera, sTools, etc.).
 * Active particle group index lives in module state; exposed as Navigation.groupCurrent
 * and legacy globalThis.sGroupCurrent (setter routes through goToIndex).
 */
import { introSpaceshipController } from './intro/IntroSpaceshipController.mjs';

let isInHTML = false;
let currentGroup;
let groupCurrent = globalThis.sTools?.ParticleGroup?.PART_INTRO ?? 1;

const TransitionState = {
	IDLE: 'idle',
	CAMERA_MOVING: 'cameraMoving',
};

const NAVIGATION_CAMERA_DURATION = 1.5;

let transition = {
	state: TransitionState.IDLE,
	fromIndex: null,
	toIndex: null,
	fromGroup: null,
	toGroup: null,
};

function setGroupCurrentIndex(index) {
	groupCurrent = +index;
}

function callGroupNavigationHook(group, hookName, context) {
	if (group && typeof group[hookName] === 'function') {
		group[hookName](context);
	}
}

function getCameraDestination(group) {
	var THREE = globalThis.THREE;
	var lookAt = group.positionCenter.clone();
	var position;

	if (typeof group.GetCameraPosition === 'function') {
		position = group.GetCameraPosition();
	} else {
		var distance = group.cameraDistance || window.innerWidth * 0.5;
		position = new THREE.Vector3(
			group.positionCenter.x,
			group.positionCenter.y,
			group.positionCenter.z + distance
		);
	}

	return {
		position: position,
		lookAt: lookAt,
	};
}

function setNavigationCameraDestination(group) {
	var destination = getCameraDestination(group);
	globalThis.cameraPosition = destination.position.clone();
	globalThis.cameraTarget = destination.lookAt.clone();
	if (globalThis.cameraManager) {
		globalThis.cameraManager.SetControlMode(globalThis.sTools.CameraControlType.NONE);
		globalThis.cameraManager.GoTo(destination.position.clone(), destination.lookAt.clone(), NAVIGATION_CAMERA_DURATION);
	}
}

export const Navigation = {
	get isInHTML() {
		return isInHTML;
	},
	set isInHTML(value) {
		isInHTML = value;
	},

	get groupCurrent() {
		return groupCurrent;
	},

	isTransitionActive() {
		return transition.state !== TransitionState.IDLE;
	},

	update(delta) {
		if (transition.state === TransitionState.IDLE) {
			return;
		}

		if (transition.state === TransitionState.CAMERA_MOVING) {
			if (!globalThis.cameraManager || !globalThis.cameraManager.IsMovementComplete()) {
				return;
			}

			introSpaceshipController.startGroupEntry(transition.toGroup);
			callGroupNavigationHook(transition.toGroup, 'OnNavigationCameraArrive', transition);
			this.finishTransition();
		}
	},

	finishTransition() {
		if (transition.state === TransitionState.IDLE) {
			return;
		}

		callGroupNavigationHook(transition.fromGroup, 'OnNavigationTransitionEnd', transition);
		callGroupNavigationHook(transition.toGroup, 'OnNavigationTransitionEnd', transition);

		var intro = globalThis.sTools.ParticleGroup.PART_INTRO;
		var programming = globalThis.sTools.ParticleGroup.PART_PROGRAMMING;
		if (groupCurrent !== intro && groupCurrent !== programming) {
			globalThis.cameraManager.SetControlMode(globalThis.sTools.CameraControlType.SATTELITE);
		}

		globalThis.canInteract = true;
		transition = {
			state: TransitionState.IDLE,
			fromIndex: null,
			toIndex: null,
			fromGroup: null,
			toGroup: null,
		};
	},

	goToIndex(index) {
		index = +index;
		var groups = globalThis.sTools?.ParticleGroups;
		var targetName = groups?.[index]?.name ?? String(index);
		var logNav = function (phase) {
			globalThis.cameraManager?.logState('nav/goToIndex ' + targetName + ' ' + phase);
		};

		if (isInHTML) {
			this.htmlToCircles();
			return;
		}

		var prevIndex = groupCurrent;
		if (index === prevIndex) {
			if (!this.isTransitionActive()) {
				introSpaceshipController.onGroupDidChange(groups[groupCurrent], true);
			}
			logNav('exit (same group)');
			return;
		}

		logNav('enter (from ' + (groups?.[prevIndex]?.name ?? prevIndex) + ')');

		if (this.isTransitionActive()) {
			this.finishTransition();
		}

		var fromGroup = groups[prevIndex];
		var toGroup = groups[index];
		transition = {
			state: TransitionState.CAMERA_MOVING,
			fromIndex: prevIndex,
			toIndex: index,
			fromGroup: fromGroup,
			toGroup: toGroup,
		};

		globalThis.canInteract = false;
		if (groupCurrent >= 0) {
			introSpaceshipController.onNavigationStart(fromGroup);
			callGroupNavigationHook(fromGroup, 'OnNavigationTransitionStart', transition);
			this.globalGroupTerminate();
		}
		setGroupCurrentIndex(index);
		this.globalGroupInit();

		this.setHashGroup(globalThis.sTools.ParticleGroups[groupCurrent].name);
		globalThis.SELECTED = globalThis.INTERSECTED = null;
		globalThis.sCoeffCameraMove = 0;
		globalThis.sButtonsBack.OnChange();
		var prev = globalThis.Organigram.GetFather(groupCurrent);
		if (prev < 0) {
			globalThis.isRoot = true;
			this.setBackButton(false);
		} else {
			globalThis.isRoot = false;
			this.setBackButton(true);
		}

		callGroupNavigationHook(toGroup, 'OnNavigationTransitionStart', transition);
		setNavigationCameraDestination(toGroup);

		logNav('exit (changed)');
	},

	goBack() {
		this.goToIndex(globalThis.Organigram.GetFather(groupCurrent));
	},

	globalGroupInit() {
		currentGroup = globalThis.sTools.ParticleGroups[groupCurrent];
		currentGroup.Init();

		if (globalThis.isdefined(currentGroup.particles)) {
			for (var i in currentGroup.particles) {
				if (globalThis.isdefined(currentGroup.particles[i].SetTextVisible)) {
					currentGroup.particles[i].SetTextVisible(true);
				}
			}
		}
	},

	globalGroupTerminate() {
		currentGroup = globalThis.sTools.ParticleGroups[groupCurrent];
		currentGroup.Terminate();

		if (globalThis.isdefined(currentGroup.particles)) {
			for (var i in currentGroup.particles) {
				if (globalThis.isdefined(currentGroup.particles[i].SetTextVisible)) {
					currentGroup.particles[i].SetTextVisible(false);
				}
			}
		}
	},

	htmlToCircles(aSpeed) {
		globalThis.sDrawScene = true;
		var lSpeed = 1000;
		if (globalThis.isdefined(aSpeed)) {
			lSpeed = aSpeed;
		}
		isInHTML = false;
		$("#info").fadeOut(lSpeed, function () {
			$("#info").children().filter("iframe").each(function () {
				this.postMessage('{"event":"command","func": pauseVideo,"args":""}', '*');
			});
			$("#info").empty();
			$("#info").unload();
		});
		$('#frontground').fadeOut(lSpeed);
		globalThis.canInteract = true;
		this.setBackButton(true);
		globalThis.sButtonsBack.OnChange();
		this.setHashHTML('');
		if (globalThis.isdefined(globalThis.sTools.ParticleGroups[groupCurrent].BackFromHTML)) {
			globalThis.sTools.ParticleGroups[groupCurrent].BackFromHTML();
		}
	},

	loadedInitDisplay() {
		globalThis.sDrawScene = true;
		var lSpeed = 1000;
		isInHTML = false;
		$("#info").fadeOut(lSpeed, function () {
			$("#info").children().filter("iframe").each(function () {
				this.postMessage('{"event":"command","func": pauseVideo,"args":""}', '*');
			});
			$("#info").empty();
			$("#info").unload();
		});
		$('#frontground').fadeOut(lSpeed);
		globalThis.canInteract = true;
		this.setBackButton(true);
		this.setHashHTML('');
		if (globalThis.isdefined(globalThis.sTools.ParticleGroups[groupCurrent].BackFromHTML)) {
			globalThis.sTools.ParticleGroups[groupCurrent].BackFromHTML();
		}
	},

	setHashHTML(aPath) {
		var hashSplit = window.location.hash.split('+');
		var newHash = hashSplit[0] + ((aPath.length > 0) ? '+' + aPath.replace(/\//g, '&') : '');
		window.location.hash = newHash;
	},

	setHashGroup(aPath) {
		var hashSplit = window.location.hash.split('+');
		var newHash = aPath;
		newHash += (hashSplit.length > 1) ? '+' + hashSplit[1] : '';
		window.location.hash = newHash;
	},

	getHashGroup() {
		var hashSplit = window.location.hash.split('+');
		return hashSplit[0].replace('#', '');
	},

	circlesToHtmlEncoded(path) {
		path = path.replace(/&/g, '/');
		this.circlesToHtml(path, false);
	},

	circlesToHtml(path, aUpdateHash) {
		if (!globalThis.isdefined(aUpdateHash)) {
			this.setHashHTML(path);
		} else if (aUpdateHash) {
			this.setHashHTML(path);
		}

		$("#info").load(path,
			function (response, status, xhr) {
				if (status == 'error') {
					Navigation.setHashHTML('');
				}
				isInHTML = true;
				globalThis.INTERSECTED = null;
				globalThis.sButtonsBack.OnChange();
				$("#info").fadeIn(1000);
				$('#frontground').fadeTo('slow', 0.85);
				globalThis.canInteract = false;
				Navigation.setBackButton(true);
				globalThis.sDrawScene = false;;

				$("#info").click(function (event) {
					if (!$(event.target).is('input')) {
						Navigation.htmlToCircles();
					}

				});
				$('#info').scrollTop();
				var el = document.getElementById('info');
				el.scrollTop = 0;
			}
		);
	},

	inAppCirlceBackOut() {
		globalThis.container.style.cursor = 'auto';
		globalThis.canInteract = true;
	},

	inAppCirlceBackIn() {
		globalThis.container.style.cursor = 'pointer';
		globalThis.canInteract = false;
	},

	changeButtonBackOut() {
		document.getElementById("circle").style.background = "#f9dfcb";
	},

	changeButtonBackIn() {
		document.getElementById("circle").style.background = "#d9cfbb";
	},

	replaceImageSource() {
		$("img").each(function () {
			$(this).attr({
				src: +$(this).attr('src')
			});
		});
	},

	backCircle() {
		if (isInHTML) {
			this.htmlToCircles();
		} else {
			var prev = globalThis.Organigram.GetFather(groupCurrent);
			if (prev > -1) {
				this.goToIndex(prev);
			}
		}
	},

	openInNewTab(url) {
		window.open(url, '_blank');
		window.focus();
	},

	setBackButton(visible) {

	},

	removeRoundCorner() {
		$("#roundCorner").slideUp(400);
	},
};
