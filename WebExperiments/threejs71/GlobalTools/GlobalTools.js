
var MAX_Z = (window.innerWidth + window.innerHeight) * 0.5;
var MIN_Z = -window.innerWidth
var WINDOW_HEIGHT = window.innerHeight * 0.9;


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
