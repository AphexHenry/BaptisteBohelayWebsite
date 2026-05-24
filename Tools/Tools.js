
var MAX_Z = (window.innerWidth + window.innerHeight) * 0.5;
var MIN_Z = -window.innerWidth
var WINDOW_HEIGHT = window.innerHeight * 1.;

var ImageFront = document.createElement('canvas');
document.body.appendChild(ImageFront);
ImageFront.style.position = 'absolute';
ImageFront.style.left="0px";
ImageFront.style.top="0px";
ImageFront.style.zIndex="100";
ImageFront.style.width="100%";
ImageFront.style.height="100%";
ImageFront.width=ImageFront.offsetWidth;
ImageFront.height=ImageFront.offsetHeight;
ImageFront.setAttribute("id", "frontground");
// ImageFront.style.display = "none";
var ImageFrontCtx = ImageFront.getContext('2d');
ImageFront.width = window.innerWidth;
ImageFront.height = window.innerHeight;
ImageFrontCtx.fillStyle = '#f0f0f0';
ImageFrontCtx.fillRect( 0, 0, ImageFront.width, ImageFront.height );
var fadeTimer = 0;
var sTargetFade = 0;
var sPreviousFade = 0;
var sFadeCurrentAlpha = 1;
var timerFade;
var sDurationFade = 1;
var isBlack = false;
var sWIDTH;

if(!isdefined(sAutomatedFadeIn))
{
    FadeIn();
}
else if(sAutomatedFadeIn)
{
    FadeIn();
}

function Tools()
{
    this.CameraControlType = 
    {
        NONE : 0,
        SATTELITE : 1,
        MOUSE_MOVE : 2,
    }

    this.ParticleGroups = [];
    var ParticleGroupID = 0;
    this.ParticleGroup = 
    {
        PART_WEB : ParticleGroupID++,
        PART_INTRO : ParticleGroupID++,
        PART_CREA_LULU : ParticleGroupID++,
        PART_LULU : ParticleGroupID++,
        PART_SOUND_EXPERIMENTS : ParticleGroupID++,
        PART_SOUND_MONSTER : ParticleGroupID++,
        PART_COMICS : ParticleGroupID++,
        PART_OTHER : ParticleGroupID++,
        PART_FUNKY_CREATION : ParticleGroupID++,
        PART_MONSTER : ParticleGroupID++,
        PART_ABOUT_ME : ParticleGroupID++,
        PART_PROGRAMMING : ParticleGroupID++,
    }
}

var sTools = new Tools();

// // fade intro + passer a transition, trucs qui tombent.
Tools.prototype.FadeOut = function()
{
    ImageFrontCtx.fillStyle = '#f0f0f0';
    ImageFrontCtx.fillRect( 0, 0, ImageFront.width, ImageFront.height );
    $('#frontground').fadeTo('slow', 1.);
}

Tools.prototype.FadeIn = function()
{
    ImageFrontCtx.fillStyle = '#f0f0f0';
    ImageFrontCtx.fillRect( 0, 0, ImageFront.width, ImageFront.height );
}

function onMouseDownIntro()
{
    FadeTo(1., 0.5);
    document.removeEventListener('mousedown',onMouseDownIntro);
    // info.style.filter = "alpha(opacity=" + opacityValue*100 + ")";
}

var IsNextPage = false;
function GoToURL(aURL)
{
    if(!IsNextPage)
    {
        isBlack = true;
        sTools.FadeOut();
        setTimeout(function() {document.location.href = aURL;}, 1000);
        IsNextPage = true;
    }
}

function clip(value, min, max)
{
    return Math.max(Math.min(value, max), min);
}

function RandInt(aValue)
{
    return Math.floor(Math.random() * aValue);
}

function getRatio()
{
	return window.innerWidth / WINDOW_HEIGHT;
}

function getWidth()
{
	return window.innerWidth;
}

function getHeight()
{
	return WINDOW_HEIGHT;
}

function RelativeToPixel(aPosition)
{
	return new THREE.Vector3((aPosition.x + 1.) * getWidth() * 0.5, (aPosition.y + 1.) * getWidth() * 0.5, aPosition.z * MAX_Z );
}

function PixelToRelative(aPosition)
{
    return new THREE.Vector3(2. * ((aPosition.x / getWidth()) - 0.5), 2. * ((aPosition.y / getWidth()) - 0.5), aPosition.z / MAX_Z );
}

function myClamp(val, min, max)
{
    return Math.max(min, Math.min(max, val))
}

function MinusMult(aVec1, aVec2, aCoeff)
{
	return new THREE.Vector3().sub(aVec1, aVec2).multiplyScalar(aCoeff);
}

function fMod(value, limit)
{
    return ((value * 1000) % (limit * 1000)) / 1000.;
}

function GetCosInterpolation(aVal)
{
    return( 1. - (1. + Math.cos(Math.min(1., aVal) * Math.PI)) * 0.5);
}

function Vec3f(x, y, z)
{
    return new THREE.Vector3(x, y, z);
}

function shortPath(aPath)
{
    var indexOfDot = aPath.lastIndexOf('.');
    var indexOfSlash = aPath.lastIndexOf('/');
    return aPath.substr(indexOfSlash + 1, indexOfDot - indexOfSlash - 1);
}

function CGPointMake(x, y)
{
    return new THREE.Vector2(x, y);
}

function myRandom()
{
    return Math.random() * 2. - 1.;
}

function isdefined( variable)
{
    return (typeof(variable) == "undefined")?  false: true;
}

function rotateAroundObjectAxis(object, axis, radians) 
{
    var rotObjectMatrix = new THREE.Matrix4();
    rotObjectMatrix.makeRotationAxis(axis.normalize(), radians);
    object.matrix.multiplySelf(rotObjectMatrix);      // post-multiply
    object.rotation.getRotationFromMatrix(object.matrix, object.scale);
}

var sColors = [];
// 16 accents tuned for contrast on warm beige: crisp blues/teals, coral, jewel tones
sColors.push(0x2563eb);
sColors.push(0x0891b2);
sColors.push(0x14b8a6);
sColors.push(0x0f766e);
sColors.push(0x4338ca);
sColors.push(0x7c3aed);
sColors.push(0xa855f7);
sColors.push(0xd946ef);
sColors.push(0xdb2777);
sColors.push(0xe11d48);
sColors.push(0xf43f5e);
sColors.push(0xf97316);
sColors.push(0xd97706);
sColors.push(0x65a30d);
sColors.push(0x16a34a);
sColors.push(0x15803d);

var sPickColorSeq = 0;

function PickColor()
{
    var i = sPickColorSeq % sColors.length;
    sPickColorSeq++;
    return sColors[i];
}

var OPACITY_INFO = 0.4;