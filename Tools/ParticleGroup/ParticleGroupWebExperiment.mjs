/**
 * Web-experiments particle group: experiment bubbles with info overlay.
 */
function getReference(aName, aDescription, aPath, aChromeOnly, aCPUUse, aOtherPage) {
	if (!aOtherPage) {
		aOtherPage = false;
	}
	return { name: aName, description: aDescription, path: aPath, chromeOnly: aChromeOnly, cpuUse: aCPUUse, newDomain: aOtherPage };
}

export function ParticleGroupWebExperiment(positionCenter, name) {
	var THREE = globalThis.THREE;
	var PickColor = globalThis.PickColor;
	var programStroke = globalThis.programStroke;
	var scene = globalThis.scene;

	this.name = name;
	this.references = [];
	this.references.push(getReference("Slug Journey", "", "WebExperiments/slug", true, "high"));
	this.references.push(getReference("Moving Mirror", "", "WebExperiments/mirror", true, "high"));
	this.references.push(getReference("3D Videos", "", "WebExperiments/videos", true, "high"));
	this.references.push(getReference("Plane Forest", "", "WebExperiments/LightForest", true, "high"));
	this.references.push(getReference("Plane Forest", "", "WebExperiments/LightForest", true, "high"));
	this.references.push(getReference("Sound Visu", "", "WebExperiments/SoundVisu", true, "high"));
	var width = window.innerWidth * .7;
	this.cameraDistance = width * 0.6;
	this.positionCenter = positionCenter;
	this.particles = [];

	for (var i = 0; i < this.references.length; i++) {
		for (var j = 0; j < 2; j++) {
			var particle = new THREE.Particle(new THREE.ParticleCanvasMaterial({ color: PickColor(), program: programStroke, transparent: true }));
			particle.position.x = positionCenter.x + Math.random() * width - width * 0.5;
			particle.position.y = positionCenter.y + Math.random() * width - width * 0.5;
			particle.position.z = positionCenter.z + Math.random() * width - width * 0.5;
			particle.scale.x = particle.scale.y = (Math.random() + 4) * width * 0.0065;
			particle.WebObject = this.references[i];
			scene.add(particle);
			this.particles.push(particle);
		}
	}
}

ParticleGroupWebExperiment.prototype.Init = function () {
	$("#roundCorner").load("html/aboutWebExperiments.html");

	setTimeout(function () { $("#roundCorner").slideDown(500); }, 1500);
	$('body').bind('touchend mousedown', function (e) {
		if (e.target.id == 'roundCorner') {
			return true;
		}
		$("#roundCorner").slideUp(400);
	});
};

ParticleGroupWebExperiment.prototype.MouseUp = function () {
};

ParticleGroupWebExperiment.prototype.MouseDown = function () {
	var INTERSECTED = globalThis.INTERSECTED;
	var programStroke = globalThis.programStroke;
	var programTriangle = globalThis.programTriangle;
	var ImageFrontCtx = globalThis.ImageFrontCtx;
	var GoToURL = globalThis.GoToURL;
	var infoDisplay = globalThis.infoDisplay;

	if (INTERSECTED) {
		if (globalThis.SELECTED === INTERSECTED) {
			if (!globalThis.SELECTED.WebObject.newDomain) {
				ImageFrontCtx.fillStyle = '#ffffff';
				var newURL = window.location.href.substring(0, window.location.href.indexOf('#')) + globalThis.SELECTED.WebObject.path;
				GoToURL(newURL);
			} else {
				GoToURL(globalThis.SELECTED.WebObject.path);
			}
		}
		globalThis.SELECTED = INTERSECTED;
		globalThis.cameraTarget = INTERSECTED.position.clone().addSelf(infoDisplay.particle.position).multiplyScalar(0.5);
		globalThis.cameraPosition = globalThis.cameraTarget.clone();
		globalThis.cameraPosition.z += window.innerWidth * 0.2;
		globalThis.cameraTarget.x += window.innerWidth * 0.05;
		INTERSECTED.material.program = programTriangle;
	} else if (globalThis.SELECTED) {
		globalThis.SELECTED.material.program = programStroke;
		globalThis.SELECTED = null;
	}
};

ParticleGroupWebExperiment.prototype.Terminate = function () {
	$("#roundCorner").slideUp(400);
};

ParticleGroupWebExperiment.prototype.Update = function () {
	var THREE = globalThis.THREE;
	var mouse = globalThis.mouse;
	var projector = globalThis.projector;
	var camera = globalThis.camera;
	var programStroke = globalThis.programStroke;
	var programTriangle = globalThis.programTriangle;
	var programFill = globalThis.programFill;
	var infoDisplay = globalThis.infoDisplay;

	var vector = new THREE.Vector3(mouse.x, mouse.y, 0.5);
	projector.unprojectVector(vector, camera);

	var ray = new THREE.Ray(camera.position, vector.subSelf(camera.position).normalize());

	var intersects = ray.intersectObjects(this.particles);

	if (intersects.length > 0) {
		if (globalThis.INTERSECTED != intersects[0].object) {
			if (globalThis.INTERSECTED) {
				globalThis.INTERSECTED.material.program = programStroke;
			}

			globalThis.INTERSECTED = intersects[0].object;

			if (globalThis.INTERSECTED === globalThis.SELECTED) {
				globalThis.INTERSECTED.material.program = programTriangle;
			} else {
				globalThis.sWaterHeight = 0.01;
				globalThis.INTERSECTED.material.program = programFill;
			}
		}

		var webObject = globalThis.INTERSECTED.WebObject;
		if (webObject) {
			var text = [];
			text.push({ string: webObject.name, size: 2 });
			if (webObject.chromeOnly) {
				text.push({ string: "Chrome Only", size: 1 });
			}
			if (webObject.cpuUse.length > 0) {
				text.push({ string: "CPU need : " + webObject.cpuUse, size: 1 });
			}
			if (webObject.description.length > 0) {
				text.push({ string: webObject.description, size: 1 });
			}

			infoDisplay.SetSize(.5);
			infoDisplay.SetText(text);
			infoDisplay.SetPosition(globalThis.INTERSECTED.position);
			infoDisplay.FadeIn();
		}
	} else {
		if (!globalThis.SELECTED) {
			infoDisplay.FadeOut();
		}

		if (globalThis.INTERSECTED) {
			globalThis.INTERSECTED.material.program = programStroke;
		}

		globalThis.INTERSECTED = null;
	}
};
