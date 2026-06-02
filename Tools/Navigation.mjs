/**
 * Site navigation: particle groups, hash routing, and HTML overlay transitions.
 * Uses globalThis for app state shared with classic scripts (camera, sTools, etc.).
 */

let isInHTML = false;
let currentGroup;

export const Navigation = {
	get isInHTML() {
		return isInHTML;
	},
	set isInHTML(value) {
		isInHTML = value;
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

		var prevIndex = globalThis.sGroupCurrent;
		logNav('enter (from ' + (groups?.[prevIndex]?.name ?? prevIndex) + ')');

		if (index != globalThis.sGroupCurrent) {
			if (globalThis.sGroupCurrent >= 0) {
				this.globalGroupTerminate();
			}
			globalThis.sGroupCurrent = index;
			this.globalGroupInit();

			this.setHashGroup(globalThis.sTools.ParticleGroups[globalThis.sGroupCurrent].name);
			globalThis.SELECTED = globalThis.INTERSECTED = null;
			globalThis.sCoeffCameraMove = 0;
			globalThis.sButtonsBack.OnChange();
			var prev = globalThis.Organigram.GetFather(globalThis.sGroupCurrent);
			if (prev < 0) {
				globalThis.isRoot = true;
				this.setBackButton(false);
			} else {
				globalThis.isRoot = false;
				this.setBackButton(true);
			}
		}

		var intro = globalThis.sTools.ParticleGroup.PART_INTRO;
		var programming = globalThis.sTools.ParticleGroup.PART_PROGRAMMING;
		if (index !== intro && index !== programming) {
			globalThis.cameraManager.SetControlMode(globalThis.sTools.CameraControlType.SATTELITE);
		}

		logNav(index !== prevIndex ? 'exit (changed)' : 'exit (same group)');
	},

	goBack() {
		this.goToIndex(globalThis.Organigram.GetFather(globalThis.sGroupCurrent));
	},

	globalGroupInit() {
		currentGroup = globalThis.sTools.ParticleGroups[globalThis.sGroupCurrent];
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
		currentGroup = globalThis.sTools.ParticleGroups[globalThis.sGroupCurrent];
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
		if (globalThis.isdefined(globalThis.sTools.ParticleGroups[globalThis.sGroupCurrent].BackFromHTML)) {
			globalThis.sTools.ParticleGroups[globalThis.sGroupCurrent].BackFromHTML();
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
		if (globalThis.isdefined(globalThis.sTools.ParticleGroups[globalThis.sGroupCurrent].BackFromHTML)) {
			globalThis.sTools.ParticleGroups[globalThis.sGroupCurrent].BackFromHTML();
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
			var prev = globalThis.Organigram.GetFather(globalThis.sGroupCurrent);
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
