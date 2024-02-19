
var MAX_Z = (window.innerWidth + window.innerHeight) * 0.5;
var MIN_Z = -window.innerWidth
var WINDOW_HEIGHT = window.innerHeight * 0.9;

var ImageHome = document.createElement('canvas');
document.body.appendChild(ImageHome);
ImageHome.style.position = 'absolute';
ImageHome.style.left="0px";
ImageHome.style.top="100%";
ImageHome.style.zIndex="100";
ImageHome.style.width="12%";
ImageHome.style.height="12%";
ImageHome.width=ImageHome.offsetWidth;
ImageHome.height=ImageHome.offsetHeight;
var ImageHomeCtx = ImageHome.getContext('2d');

    // var grad = ImageHomeCtx.createLinearGradient(0, 0, 50, 50);
    // grad.addColorStop(0, 'black');
    // grad.addColorStop(1, 'rgba(0, 0, 0, 0.1)');
    // ImageHomeCtx.fillStyle = grad;
    // ImageHomeCtx.fillRect(0, 0, 75, 75);
// ImageHomeCtx.fillStyle = '#000000';
// ImageHomeCtx.fillRect( 0, 0, ImageHome.width, ImageHome.height );

var ImageHomePNG = document.createElement('img');
ImageHomePNG.src = "../GlobalTools/Home.png";
ImageHomePNG.onload = function(){
    ImageHomeCtx.drawImage(ImageHomePNG, (ImageHome.width - ImageHome.height) * 0.02 , 0, ImageHome.height, ImageHome.height);
};

var sTargetFadeHome = 0;
var sPreviousFadeHome = 0;
var sFadeCurrentAlphaHome = 0;
var timerFadeHome;
var sDurationFadeHome = 1;
HomeFadeTo(1., 1.);
timerFadeHome = setInterval("HomeFade()", 50);

// fade intro + passer a transition, trucs qui tombent.
function HomeFadeTo(intensity, duration)
{
    sDurationFadeHome = duration;
    sTargetFadeHome = 1. - intensity;
    
    if(sPreviousFadeHome != sTargetFadeHome)
    {
        ImageHome.hidden = false;
        sPreviousFadeHome = sFadeCurrentAlphaHome;
    }
}

function HomeFade()
{
    sFadeCurrentAlphaHome += (sTargetFadeHome - sPreviousFadeHome) * 0.05 / sDurationFadeHome;
    sFadeCurrentAlphaHome = Math.min(Math.max(sFadeCurrentAlphaHome, 0), 1);
    if(IsFadedHome())
    {
        sFadeCurrentAlphaHome = sTargetFadeHome;
        if(sFadeCurrentAlphaHome < 0.05)
        {
             ImageHome.hidden = true;
        }
        // clearInterval(timerFadeHome);
    }
    var topValue = 100 - sFadeCurrentAlphaHome * 10;
    ImageHome.style.top = topValue + "%";
}

function IsFadedHome()
{
    return (Math.abs(sTargetFadeHome - sFadeCurrentAlphaHome) < 0.05);
}

document.addEventListener( 'mousemove', onMouseMoveHome, false );
document.addEventListener( 'mousedown', onMouseDownHome, false );

function onMouseMoveHome(event) 
{
    if(event.clientY > window.innerHeight * 0.9)
    {
        HomeFadeTo(0., .15);
    }
    else
    {
        HomeFadeTo(1., .15);
    }
}

function onMouseDownHome(event) 
{
    if((sFadeCurrentAlphaHome > 0.95) && (event.clientY > window.innerHeight * 0.9) && (event.clientX < window.innerWidth * 0.3))
    {
        GoHome();
    }
}

var IsNextPage = false;
function GoHome()
{
    if(!IsNextPage)
    {
        FadeTo(0, 1.);
        setTimeout(function() {document.location.href = document.location.href + "../../#WebExperiment";}, 1250);
        IsNextPage = true;
    }
}

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
var ImageFrontCtx = ImageFront.getContext('2d');
ImageFront.width = window.innerWidth;
ImageFront.height = window.innerHeight;
ImageFrontCtx.fillStyle = '#000000';
ImageFrontCtx.fillRect( 0, 0, ImageFront.width, ImageFront.height );
var fadeTimer = 0;
var sTargetFade = 0;
var sPreviousFade = 0;
var sFadeCurrentAlpha = 1;
var timerFade;
var sDurationFade = 1;
FadeTo(1., 1.);
// fade intro + passer a transition, trucs qui tombent.
function FadeTo(intensity, duration)
{
    sDurationFade = duration;
    sTargetFade = 1. - intensity;
    timerFade = setInterval("fade()", 50);
    ImageFront.hidden = false;
    sPreviousFade = sFadeCurrentAlpha;
}

function fade()
{
    ImageFront.width = ImageFront.width;
    sFadeCurrentAlpha += (sTargetFade - sPreviousFade) * 0.05 / sDurationFade;
    // ImageFrontCtx.fillStyle = 'rgba(0,0,0,' + ImageFrontCtx.globalAlpha+')';
    if(IsFaded())
    {
        sFadeCurrentAlpha = sTargetFade;
        if(sFadeCurrentAlpha < 0.05)
        {
            ImageFront.hidden = true;
        }
        clearInterval(timerFade);
    }
    ImageFrontCtx.globalAlpha = sFadeCurrentAlpha;
    ImageFrontCtx.fillRect( 0, 0, ImageFront.width, ImageFront.height );
}

function IsFaded()
{
    return (Math.abs(sTargetFade - sFadeCurrentAlpha) < 0.05);
}
