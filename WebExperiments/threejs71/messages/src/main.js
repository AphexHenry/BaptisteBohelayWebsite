
if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

var set = null;
var sParticlesManager = null;
var stats;
var sCardManager = null;
var sRenderer = null;
var clock = new THREE.Clock();

var mouseX = 0, mouseY = 0;

var width = window.innerWidth;
var height = window.innerHeight;

init();
animate();

function init() {

	var start = Date.now();

	sRenderer = new Renderer();

	sCardManager = new CardManager();

	sParticlesManager = new ParticlesManager();
	sParticlesManager.init();

	var lSet = new Settings();
	set = lSet.get();

	setupBackground('textures/background/background.gif')
	setupTriberIcon('textures/background/Logo.png')

	stats = new Stats();
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.top = '0px';
	sRenderer.container.appendChild( stats.domElement );

	document.addEventListener( 'keydown', onDocumentKeyDown, false );

	window.addEventListener( 'resize', onWindowResize, false );

	setupTest();
}


function onWindowResize() {
	sRenderer.onWindowResize();
}

/*
 * Add various fake cards for test purposes.
 */
function setupTest() {
	for(var i = 0; i < 100; i++) {
		addFakeCard();
	}
}

function addFakeCard() {
	var lNames = ['henriette!', 'Marie;)', 'Ron Hubbard', 'Blondy Love'];
	var lIcons = ['icon1.png', 'icon2.jpg', 'icon3.jpg'];
	var lPictures = ['jazzConcert.jpg', 'jazzConcert2.jpg'];

	var lAvatarPath = 'textures/' + lIcons[Math.floor(Math.random() * lIcons.length)];
	var lImagePath = Math.random() > 0.5 ?  'textures/' + lPictures[Math.floor(Math.random() * lPictures.length)] : null;
	var lUserName = lNames[Math.floor(Math.random() * lNames.length)];

	var lText = '';
	var lTextIndex = Math.floor(Math.random() * 4);
	switch(lTextIndex) {
		case 0:
			lText = "NICE!"
			break;
		case 1:
			lText = "Holy cow! This guys know something about music!"
			break;
		case 2:
			lText = "This is bearable.";
			break;
		case 3:
			lText = "Then the perilous path was planted:And a river, and a spring On every cliff and tomb; And on the bleached bones Red clay brought forth."
				+"Till the villain left the paths of ease, To walk in perilous paths, and drive The just man into barren climes.";
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

function onDocumentKeyDown(aEvent) {
	addFakeCard();
}

function setupBackground(path)
{
	var isShapeLoaded = false;
	var applicationBackground = document.createElement( 'img' );
	applicationBackground.src = path;

	applicationBackground.onload= function()
	{
		var width = getWidth();
		var height = getHeight();
		var ratioScreen = width / height;
		var lgeometry = new THREE.PlaneGeometry( 100., 100.);
		var lTexture = new THREE.Texture( applicationBackground, THREE.UVMapping );
		lTexture.needsUpdate = true;
		var lmaterials = new THREE.MeshBasicMaterial( { color: 0xffffff, map: lTexture} );
		lmaterials.transparent = true;
		lmaterials.depthTest = false;
		lmaterials.depthWrite = false;
		lmaterials.overdraw = true;
		var lmesh = new THREE.Mesh( lgeometry, lmaterials );
		lmesh.position.x = 0;//width * 0.5;
		lmesh.position.y = 0.;//decay * height * 0.5;
		lmesh.position.z = 10;

		lScale = width / 100.;
		lmesh.scale.x = lScale;
		lmesh.scale.y = lScale / ratioScreen;
		lmesh.scale.z = lScale / ratioScreen;
		sRenderer.sceneBack.add( lmesh );
	}
}

function setupTriberIcon(path)
{
	var isShapeLoaded = false;
	var lIcon = document.createElement( 'img' );
	lIcon.src = path;

	lIcon.onload= function()
	{
		var width = getWidth();
		var height = getHeight();
		var ratioScreen = lIcon.width / lIcon.height;
		var lgeometry = new THREE.PlaneGeometry( 1, 1);
		var lTexture = new THREE.Texture( lIcon, THREE.UVMapping );
		lTexture.needsUpdate = true;
		var lmaterials = new THREE.MeshBasicMaterial( { color: 0xffffff, map: lTexture} );
		lmaterials.transparent = true;
		lmaterials.depthTest = false;
		lmaterials.depthWrite = false;
		lmaterials.overdraw = true;
		var lScale = width / 10;

		var lmesh = new THREE.Mesh( lgeometry, lmaterials );
		lmesh.position.x = -width * 0.5 + lScale * 0.5;
		lmesh.position.y = -height * 0.5 + lScale * 0.5;
		lmesh.position.z = 10;

		lmesh.scale.x = lScale;
		lmesh.scale.y = lScale / ratioScreen;
		lmesh.scale.z = lScale / ratioScreen;
		sRenderer.sceneFront.add( lmesh );
	}
}

function animate() {
	var delta = Math.min(clock.getDelta(), 0.06);
	var lwidth = getWidth();

	requestAnimationFrame( animate, sRenderer.renderer.domElement );
	sParticlesManager.Update(delta, lwidth);

	sRenderer.render();
	stats.update();
}