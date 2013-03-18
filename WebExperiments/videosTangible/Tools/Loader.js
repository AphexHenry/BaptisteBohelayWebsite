var indexLoading = 0;
var lastLoading = -1;
var methodList = new Array();
var TEXTURE_SNAKE_HEAD, TEXTURE_TREE, TEXTURE_GROUND, TEXTURE_BACK;
var sButtons = [];

function InitLoading()
{
    methodList.push(LoadTextures);
    methodList.push(InitParticles);
    methodList.push(AddEventListener);
    methodList.push(initBackground);
}

function UpdateLoading()
{
    if(indexLoading >= methodList.length)
    {
        return false;
    }

    if(indexLoading > lastLoading)
    {
        lastLoading = indexLoading;
        methodList[indexLoading]();
    }
    return true;
}

function ParseEnterLogo()
{
    ParseLogo("models/Enter.txt");
}

function ParseResumeLogo()
{
    ParseLogo("models/Resume.txt");
}

function ParseResumeGallery()
{
    ParseLogo("models/Gallery.txt");
}

function InitParticles()
{
    NUM_PART = 146  ;

    for ( i = 0; i < NUM_PART; i ++ )
    {
        particles.push(new Particle());
        particles[i].AddState(new BehaviourIntro(particles[i]));
    }

    initTexture();
    SwitchState(0);
    indexLoading++;
}

function AddEventListener()
{
    document.addEventListener( 'mousemove', onDocumentMouseMove, false );
    document.addEventListener( 'touchstart', onDocumentTouchStart, false );
    document.addEventListener( 'touchmove', onDocumentTouchMove, false );
    document.addEventListener( 'mousedown', onDocumentMouseDown, false );
    document.addEventListener( 'mouseup', onDocumentMouseUp, false );
    indexLoading++;
}

var indexTextureLoad = 0;
var countTextureLoad = 0;
function LoadTextures()
{
    // TEXTURE_SNAKE_BODY = LoadTexture("textures/pendulum/blackBody.png");
    TEXTURE_TREE       = LoadTexture("textures/Tree.png");
    TEXTURE_GROUND     = LoadTexture("textures/Ground.png");
    TEXTURE_BACK       = LoadTexture("textures/BackBlack.png");
}

function LoadTexture(fileName)
{
    countTextureLoad++;
    var img = document.createElement('img');
    img.onload = function()
    {
        indexTextureLoad++;
        if(indexTextureLoad == countTextureLoad)
        {
            indexLoading++;
        }
    }
    img.src = fileName;
    return img;
}

function initBackground()
{
    environment = new Environment();
    // var width = window.innerWidth;
    // var height = window.innerHeight;
    // var lgeometry = new THREE.PlaneGeometry( width, height );
    // var canvas = GetRectangleBack();

    // var lTexture = new THREE.Texture( canvas, THREE.UVMapping );
    // lTexture.needsUpdate = true;
    // lTexture.minFilter = lTexture.magFilter = THREE.NearestFilter;  
    // var lmaterials = new THREE.MeshBasicMaterial( { color: 0xffffff, map: lTexture} );
    // lmaterials.transparent = false;
    // lmaterials.depthTest = false;
    // //lmaterials.depthWrite = false;
    // lmaterials.overdraw = true;
    // var lmesh = new THREE.Mesh( lgeometry, lmaterials );
    // lmesh.position.x = 0;//width * 0.5;
    // lmesh.position.y = height * 0.2;
    // lmesh.position.z = -900;

    // lmesh.rotation.x = Math.PI / 2.;
    // lmesh.scale.x = 1.;
    // lmesh.scale.y = 1.;
    // lmesh.scale.z = 1.;
    // sceneBack.add( lmesh );
        indexLoading++;
}
