
if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

var set = new Settings();
var sParticlesManager = null;
var container, stats;
var camera, scene, renderer,
	materials = [], objects = [],
	singleMaterial, zmaterial = [],
	parameters, i, j, k, h, color, x, y, z, s, n,
	 cubeMaterial;
var sCardManager = null;
var clock = new THREE.Clock();

var mouseX = 0, mouseY = 0;

var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

var width = window.innerWidth;
var height = window.innerHeight;

var postprocessing = {};

init();
animate();

function init() {

	container = document.createElement( 'div' );
	document.body.appendChild( container );

	camera = new THREE.PerspectiveCamera( 70, width / height, 1, 3000 );
	camera.position.z = 200;

	scene = new THREE.Scene();

	renderer = new THREE.WebGLRenderer( { antialias: true, alpha:true } );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( width, height );
	container.appendChild( renderer.domElement );

	renderer.sortObjects = true;

	var start = Date.now();

	sCardManager = new CardManager();

	sParticlesManager = new ParticlesManager();
	sParticlesManager.init();

	scene.matrixAutoUpdate = false;

	initPostprocessing();

	renderer.autoClear = false;

	stats = new Stats();
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.top = '0px';
	container.appendChild( stats.domElement );

	document.addEventListener( 'keydown', onDocumentKeyDown, false );

	window.addEventListener( 'resize', onWindowResize, false );

	var effectController  = {

		focus: 		1.0,
		aperture:	0.005,
		maxblur:	1.0
	};

	settings = {
		backR:0,
		backG:0,
		backB:0
	}

	var matChanger = function( ) {
		postprocessing.bokeh.uniforms[ "focus" ].value = effectController.focus;
		postprocessing.bokeh.uniforms[ "aperture" ].value = effectController.aperture;
		postprocessing.bokeh.uniforms[ "maxblur" ].value = effectController.maxblur;
	};

	var gui = new dat.GUI();
	gui.add( effectController, "focus", 0.0, 3.0, 0.025 ).onChange( matChanger );
	gui.add( effectController, "aperture", 0.001, 0.2, 0.001 ).onChange( matChanger );
	gui.add( effectController, "maxblur", 0.0, 3.0, 0.025 ).onChange( matChanger );
	gui.add( settings, "backR", 0.0, 1, 0.01 );
	gui.add( settings, "backG", 0.0, 1, 0.01 );
	gui.add( settings, "backB", 0.0, 1, 0.01 );
	gui.close();

	setupTest();
}

/*
 * Add various fake cards for test purposes.
 */
function setupTest() {
	for(var i = 0; i < 30; i++) {
		addFakeCard();
	}
}

function addFakeCard() {
	var lNames = ['henriette!', 'Marie;)', 'Ron Hubbard', 'Blondy Love'];
	var lIcons = ['icon1.png', 'icon2.jpg', 'icon3.jpg'];
	var lPictures = ['jazzConcert.jpg', 'jazzConcert2.jpg'];

	var lAvatarPath = 'textures/' + lIcons[Math.floor(Math.random() * lIcons.length)];
	var lImagePath = i%2 ?  'textures/' + lPictures[Math.floor(Math.random() * lPictures.length)] : null;
	var lUserName = lNames[Math.floor(Math.random() * lNames.length)];

	var lText = '';
	var lTextIndex = Math.floor(Math.random() * 3);
	switch(lTextIndex) {
		case 0:
			lText = "NICE!"
			break;
		case 1:
			lText = "Holy cow! This guys know something about music!"
			break;
		case 2:
			lText = "Then the perilous path was planted:And a river, and a spring On every cliff and tomb; And on the bleached bones Red clay brought forth."
				+"Till the villain left the paths of ease, To walk in perilous paths, and drive The just man into barren climes."
			break;
	}

	var lObject = {
		userIcon:lAvatarPath,
		userName:lUserName,
		text:lText,
		image:lImagePath
	}

	sCardManager.add(lObject);

}

function onDocumentKeyDown() {

}

function onWindowResize() {

	windowHalfX = window.innerWidth / 2;
	windowHalfY = window.innerHeight / 2;

	width = window.innerWidth;
	height = window.innerHeight;

	camera.aspect = width / height;
	camera.updateProjectionMatrix();

	renderer.setSize( width, height );
	postprocessing.composer.setSize( width, height );

}

function initPostprocessing() {
	var renderPass = new THREE.RenderPass( scene, camera );

	var bokehPass = new THREE.BokehPass( scene, camera, {
		focus: 		1.0,
		aperture:	0.005,
		maxblur:	1.0,

		width: width,
		height: height
	} );

	bokehPass.renderToScreen = true;

	var composer = new THREE.EffectComposer( renderer );

	composer.addPass( renderPass );
	composer.addPass( bokehPass );

	postprocessing.composer = composer;
	postprocessing.bokeh = bokehPass;

}

function animate() {

	requestAnimationFrame( animate, renderer.domElement );

	render();
	stats.update();
}

function render() {

	var time = Date.now() * 0.00005;
	var delta = Math.min(clock.getDelta(), 0.06);

	var lwidth = getWidth();
	sParticlesManager.Update(delta, lwidth);

	//camera.position.x += ( mouseX * 0.3 - camera.position.x ) * 0.036;
	//camera.position.y += ( - (mouseY * 0.3) - camera.position.y ) * 0.036;

	camera.lookAt( scene.position );

	renderer.setClearColor( new THREE.Color(settings.backR, settings.backG, settings.backB), 1);
	renderer.clear();

	postprocessing.composer.render( 0.1 );



}
