
if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

var set = new Settings();
var container, stats;
var statEnabled = false;
var camera, scene, renderer;
var effectController;

var particles = new Array();
var NUM_PART = 0;
var zmaterial = [],
	parameters, i, j, k, h, color, x, y, z, s, n, nobjects,
	material_depth, cubeMaterial;

var mouseX = 0, mouseY = 0;

var light;
var enableShadow = true;
var SHADOW_MAP_WIDTH = 2048, SHADOW_MAP_HEIGHT = 1024;
var FLOOR = -window.innerHeight;

var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

var clock = new THREE.Clock();

var height = window.innerHeight - 200;

var postprocessing = { enabled  : true };

var attractorPosition = new THREE.Vector3();
 var attractorStrength = 0.;
var surface = window.innerWidth * 4;
var DoorArray = new Array();

init();
animate();

function MinusMult(aVec1, aVec2, aCoeff)
{
	return new THREE.Vector3().sub(aVec1, aVec2).multiplyScalar(aCoeff);
}

function init() {

	container = document.createElement( 'div' );
	document.body.appendChild( container );

	scene = new THREE.Scene();

	camera = new THREE.PerspectiveCamera( 70, window.innerWidth / height, 1, 13000 );
	camera.position.z = 200;
	scene.add( camera );

	//controls = new THREE.TrackballControls( camera );

	renderer = new THREE.WebGLRenderer( { antialias: false } );
	renderer.setSize( window.innerWidth, height );
	renderer.domElement.style.top = 0;
	renderer.domElement.style.position = 'absolute';
	container.appendChild( renderer.domElement );

	renderer.sortObjects = false;

	material_depth = new THREE.MeshDepthMaterial();

	var start = Date.now();

	scene.fog = new THREE.Fog( 0xffffff, 3500, 15000 );
	scene.fog.color.setHSL( 0.51, 1., 0.5 );

	// LIGHTS
	if(enableShadow)
	{
		var ambient = new THREE.AmbientLight( 0xfff );
		scene.add( ambient );

		light = new THREE.SpotLight( 0xffffff, 1, 0, Math.PI, 1 );
		light.position.set( 1000, 1500, 1000 );
		light.target.position.set( 0, 0, 0 );

		light.castShadow = true;

		light.shadowCameraNear = 700;
		light.shadowCameraFar = camera.far;
		light.shadowCameraFov = 950;

		//light.shadowCameraVisible = true;

		light.shadowBias = 0.001;
		light.shadowDarkness = 0.5;

		light.shadowMapWidth = SHADOW_MAP_WIDTH;
		light.shadowMapHeight = SHADOW_MAP_HEIGHT;

		scene.add( light );
	}

	GetGroundGeo();


	// PARTICLES

	var xgrid = 25,
		ygrid = Math.floor(xgrid * 1. * height / window.innerWidth);
		zgrid = 1;

	NUM_PART = xgrid * ygrid * zgrid;

	for ( i = 0; i < xgrid; i ++ )
	for ( j = 0; j < ygrid; j ++ )
	for ( k = 0; k < zgrid; k ++ ) 
	{
		var ratio = height / window.innerWidth;
		xRel = 2. * (( i / xgrid ) - 0.5);
		//yRel = ratio - (j / xgrid
		yRel = 2. * (( j / xgrid ) - 0.5);
		x = xRel;
		y = yRel;
		z = -0.7;// * ( k - zgrid/2 );

		particles.push(new Particle(new THREE.Vector3(x, y, z)));
	}

	initTexture("textures/cube/SwedishRoyalCastle/");
	//console.log("init time: ", Date.now() - start );

	scene.matrixAutoUpdate = false;

	initPostprocessing();

	renderer.autoClear = false;

	renderer.shadowMapEnabled = true;
	renderer.shadowMapSoft = true;
	renderer.gammaInput = true;
	renderer.gammaOutput = true;
	renderer.physicallyBasedShading = true;

	renderer.domElement.style.position = 'absolute';
	renderer.domElement.style.top = "100px";
	renderer.domElement.style.left = "0px";

	if(statEnabled)
	{
		stats = new Stats();
		stats.domElement.style.position = 'absolute';
		stats.domElement.style.top = '0px';
		container.appendChild( stats.domElement );
	}

	document.addEventListener( 'mousemove', onDocumentMouseMove, false );
	document.addEventListener( 'touchstart', onDocumentTouchStart, false );
	document.addEventListener( 'touchmove', onDocumentTouchMove, false );
	document.addEventListener( 'mousedown', onDocumentMouseDown, false );
	document.addEventListener( 'mouseup', onDocumentMouseUp, false );

	effectController = {

		focus: 		1.0,
		aperture:	0.025,
		maxblur:	1.0

	};

	var matChanger = function( ) {

		postprocessing.bokeh_uniforms[ "focus" ].value = effectController.focus;
		postprocessing.bokeh_uniforms[ "aperture" ].value = effectController.aperture;
		postprocessing.bokeh_uniforms[ "maxblur" ].value = effectController.maxblur;

	};

}

function GetGroundGeo()
{
	// LIGHTS

	var ambientLight = new THREE.AmbientLight( 0x111111 );
	scene.add( ambientLight );

	var pointLight = new THREE.PointLight( 0xffffff );
	pointLight.position.z = 10000;
	pointLight.distance = 4000;
	scene.add( pointLight );

	var pointLight2 = new THREE.PointLight( 0xff5500 );
	pointLight2.position.z = 1000;
	pointLight2.distance = 2000;
	scene.add( pointLight2 );

	var pointLight3 = new THREE.PointLight( 0x0000ff );
	pointLight3.position.x = -1000;
	pointLight3.position.z = 1000;
	pointLight3.distance = 2000;
	scene.add( pointLight3 );

	var spotLight = new THREE.SpotLight( 0xaaaaaa );
	spotLight.position.set( 1000, 500, 1000 );
	spotLight.castShadow = true;
	spotLight.shadowCameraNear = 500;
	spotLight.shadowCameraFov = 70;
	spotLight.shadowBias = 0.001;
	spotLight.shadowMapWidth = 1024;
	spotLight.shadowMapHeight = 1024;
	scene.add( spotLight );

	var sphere = new THREE.SphereGeometry( 100, 16, 8 );
	lightMesh = new THREE.Mesh( sphere, new THREE.MeshBasicMaterial( { color: 0xffaa00 } ) );
	lightMesh.position = pointLight.position;
	lightMesh.scale.x = lightMesh.scale.y = lightMesh.scale.z = 0.05;
	//scene.add( lightMesh );

	var path = "textures/cube/SwedishRoyalCastle/";
	var format = '.jpg';
	var urls = [
			path + 'px' + format, path + 'nx' + format,
			path + 'py' + format, path + 'ny' + format,
			path + 'pz' + format, path + 'nz' + format
		];

	var reflectionCube = THREE.ImageUtils.loadTextureCube( urls );

	// common material parameters

	var ambient = 0x050505, diffuse = 0x331100, specular = 0xffffff, shininess = 10, scale = 23;

	// normal map shader

	var shader = THREE.ShaderLib[ "normal" ];
	var uniforms = THREE.UniformsUtils.clone( shader.uniforms );

	uniforms[ "enableAO" ].value = false;
	uniforms[ "enableDiffuse" ].value = false;
	uniforms[ "enableSpecular" ].value = false;
	uniforms[ "enableReflection" ].value = false;

	uniforms[ "tNormal" ].texture = THREE.ImageUtils.loadTexture( "textures/NormalMap.png" );
	// uniforms[ "tAO" ].texture = THREE.ImageUtils.loadTexture( "textures/normal/ninja/ao.jpg" );

	// uniforms[ "tDisplacement" ].texture = THREE.ImageUtils.loadTexture( "textures/normal/ninja/displacement.jpg" );
	// uniforms[ "uDisplacementBias" ].value = - 0.428408 * scale;
	// uniforms[ "uDisplacementScale" ].value = 2.436143 * scale;

	uniforms[ "uDiffuseColor" ].value.setHex( diffuse );
	uniforms[ "uSpecularColor" ].value.setHex( specular );
	uniforms[ "uAmbientColor" ].value.setHex( ambient );

	uniforms[ "uShininess" ].value = shininess;

	uniforms[ "tCube" ].texture = reflectionCube;
	uniforms[ "uReflectivity" ].value = 0.1;

	uniforms[ "uDiffuseColor" ].value.convertGammaToLinear();
	uniforms[ "uSpecularColor" ].value.convertGammaToLinear();
	uniforms[ "uAmbientColor" ].value.convertGammaToLinear();


	var parameters = { fragmentShader: shader.fragmentShader, vertexShader: shader.vertexShader, uniforms: uniforms, lights: true, fog: false };
	var material1 = new THREE.ShaderMaterial( parameters );

	// loader.load( "obj/ninja/NinjaLo_bin.js", function( geometry ) { createScene( geometry, scale, material1, material2 ) } );

	var geometry = new THREE.PlaneGeometry( 300, 300 );
	geometry.computeTangents();
	ground = new THREE.Mesh(geometry, material1);
	ground.position.set( 0, FLOOR, 0 );
	ground.scale.set( 100, 100, 100 );
	// if(enableShadow)
	// {
	// 	ground.castShadow = false;
	// 	ground.receiveShadow = true;
	// }
	scene.add(ground);

}

function initTexture(path) 
{	
	var format = '.jpg';
	var urls = [
			path + 'px' + format, path + 'nx' + format,
			path + 'py' + format, path + 'ny' + format,
			path + 'pz' + format, path + 'nz' + format
		];

	var textureCube = THREE.ImageUtils.loadTextureCube( urls );

	ApplyTexture(textureCube);
}

function ApplyTexture(textureCube)
{

	for (var j = 0; j < particles.length; j ++ ) 
	{
		 particles[ j ].SetTexture(textureCube);
	}
}

function onDocumentMouseUp( event ) 
{
	event.preventDefault();
	particles[0].MouseUp(PixelToRelative(new THREE.Vector3(event.clientX, event.clientY, 0)));
}

function SwitchState(index)
{
	var numDoor = 3;
	DoorArray.push(new Door(new THREE.Vector3(1.5, 1., -1.2), 0.6, 1., Math.floor(NUM_PART / numDoor)));
	DoorArray.push(new Door(new THREE.Vector3(-0.5, 1., -1.9), 0., 1., Math.floor(NUM_PART / numDoor)));
	DoorArray.push(new Door(new THREE.Vector3(0., 1., -2.9), 0.5, 1., Math.floor(NUM_PART / numDoor)));

	for (var i = 0; i < particles.length; i ++ ) 
	{
		particles[ i ].SwitchState(index);
	}
	particles[0].PrepareTransition();
}

function onDocumentMouseDown( event ) 
{
	event.preventDefault();

	particles[0].MouseDown(PixelToRelative(new THREE.Vector3(event.clientX, event.clientY, 0)));				 
}

function onDocumentMouseMove( event ) 
{
	event.preventDefault();
	particles[0].MouseMove(PixelToRelative(new THREE.Vector3(event.clientX, event.clientY, 0)));
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

function createDoor()
{

}

function initPostprocessing() 
{

	postprocessing.scene = new THREE.Scene();

	postprocessing.camera = new THREE.OrthographicCamera( window.innerWidth / - 2, window.innerWidth / 2,  window.innerHeight / 2, window.innerHeight / - 2, -10000, 10000 );
	postprocessing.camera.position.z = 100;

	postprocessing.scene.add( postprocessing.camera );

	var pars = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBFormat };
	postprocessing.rtTextureDepth = new THREE.WebGLRenderTarget( window.innerWidth, height, pars );
	postprocessing.rtTextureColor = new THREE.WebGLRenderTarget( window.innerWidth, height, pars );

	var bokeh_shader = THREE.ShaderExtras[ "bokeh" ];

	postprocessing.bokeh_uniforms = THREE.UniformsUtils.clone( bokeh_shader.uniforms );

	postprocessing.bokeh_uniforms[ "tColor" ].texture = postprocessing.rtTextureColor;
	postprocessing.bokeh_uniforms[ "tDepth" ].texture = postprocessing.rtTextureDepth;
	postprocessing.bokeh_uniforms[ "focus" ].value = 1.1;
	postprocessing.bokeh_uniforms[ "aspect" ].value = window.innerWidth / height;

	postprocessing.materialBokeh = new THREE.ShaderMaterial( {

		uniforms: postprocessing.bokeh_uniforms,
		vertexShader: bokeh_shader.vertexShader,
		fragmentShader: bokeh_shader.fragmentShader

	} );

	postprocessing.quad = new THREE.Mesh( new THREE.PlaneGeometry( window.innerWidth, window.innerHeight ), postprocessing.materialBokeh );
	postprocessing.quad.position.z = - 500;
	postprocessing.quad.rotation.x = Math.PI / 2;
	postprocessing.scene.add( postprocessing.quad );

}

function animate() {

	requestAnimationFrame( animate, renderer.domElement );

	render();
	if(statEnabled)
	{
		stats.update();
	}

}

function render() {

	var time = Date.now() * 0.00005;
	var delta = Math.min(clock.getDelta(), 0.06);

	var lwidth = getWidth();
	for ( i = 0; i < particles.length; i ++ ) 
	{
		particles[ i ].Update(delta, lwidth);
	}

	particles[0].GlobalUpdate(delta);

	if ( postprocessing.enabled ) {

		renderer.setClearColor( 0xffffff, 1);
		renderer.clear();

		// Render scene into texture

		scene.overrideMaterial = null;
		renderer.render( scene, camera, postprocessing.rtTextureColor, true );

		// Render depth into texture

		scene.overrideMaterial = material_depth;
		renderer.render( scene, camera, postprocessing.rtTextureDepth, true );

		// Render bokeh composite

		renderer.render( postprocessing.scene, postprocessing.camera );


	} else {

		renderer.clear();
		renderer.render( scene, camera );

	}

}

