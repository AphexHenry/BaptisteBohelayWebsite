
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

	renderer = new THREE.WebGLRenderer( { antialias: false, alpha:true } );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( width, height );
	container.appendChild( renderer.domElement );

	renderer.sortObjects = true;

	var start = Date.now();

	sCardManager = new CardManager();

	sParticlesManager = new ParticlesManager();
	sParticlesManager.init();
	initTexture("textures/cube/SwedishRoyalCastle/");

	//console.log("init time: ", Date.now() - start );

	scene.matrixAutoUpdate = false;

	initPostprocessing();

	renderer.autoClear = false;

	stats = new Stats();
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.top = '0px';
	container.appendChild( stats.domElement );

	document.addEventListener( 'mousemove', onDocumentMouseMove, false );
	document.addEventListener( 'touchstart', onDocumentTouchStart, false );
	document.addEventListener( 'touchmove', onDocumentTouchMove, false );

	window.addEventListener( 'resize', onWindowResize, false );

	var effectController  = {

		focus: 		1.0,
		aperture:	0.025,
		maxblur:	1.0

	};

	var matChanger = function( ) {
		postprocessing.bokeh.uniforms[ "focus" ].value = effectController.focus;
		postprocessing.bokeh.uniforms[ "aperture" ].value = effectController.aperture;
		postprocessing.bokeh.uniforms[ "maxblur" ].value = effectController.maxblur;
	};

	var gui = new dat.GUI();
	gui.add( effectController, "focus", 0.0, 3.0, 0.025 ).onChange( matChanger );
	gui.add( effectController, "aperture", 0.001, 0.2, 0.001 ).onChange( matChanger );
	gui.add( effectController, "maxblur", 0.0, 3.0, 0.025 ).onChange( matChanger );
	gui.close();

}

function initTexture(aPath) 
{	
	material_depth = new THREE.MeshDepthMaterial();

	var path = aPath;
	var format = '.jpg';
	var urls = [
			path + 'px' + format, path + 'nx' + format,
			path + 'py' + format, path + 'ny' + format,
			path + 'pz' + format, path + 'nz' + format
		];

	var texturePart = THREE.ImageUtils.loadTextureCube( urls );

	sParticlesManager.SetTextureAll(texturePart);
}

function onDocumentMouseMove( event ) {

	mouseX = event.clientX - windowHalfX;
	mouseY = event.clientY - windowHalfY;

}

function onDocumentTouchStart( event ) {

	if ( event.touches.length == 1 ) {

		event.preventDefault();

		mouseX = event.touches[ 0 ].pageX - windowHalfX;
		mouseY = event.touches[ 0 ].pageY - windowHalfY;

	}
}

function onDocumentTouchMove( event ) {

	if ( event.touches.length == 1 ) {

		event.preventDefault();

		mouseX = event.touches[ 0 ].pageX - windowHalfX;
		mouseY = event.touches[ 0 ].pageY - windowHalfY;

	}

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
		aperture:	0.025,
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

	camera.position.x += ( mouseX * 0.3 - camera.position.x ) * 0.036;
	camera.position.y += ( - (mouseY * 0.3) - camera.position.y ) * 0.036;

	camera.lookAt( scene.position );

	renderer.setClearColor( 0xffffff, 1);
	renderer.clear();

	postprocessing.composer.render( 0.1 );



}
