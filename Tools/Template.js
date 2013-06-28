
var programTriangle = function ( context ) 
{
    programFill(context);
    context.fillStyle = '#000000';
    // Filled triangle
    context.beginPath();
    context.moveTo(-0.5 + 0.2,0.5);
    context.lineTo(0.5 + 0.2, 0.);
    context.lineTo(-0.5 + 0.2, -0.5);
    context.fill();
    context.fillStyle = '#ffffff';
}

var programTriangleStroke = function ( context ) 
{
    // programFill(context);
    programStroke(context);
    // Filled triangle
    context.beginPath();
    context.moveTo(-0.5 + 0.2,0.5);
    context.lineTo(0.5 + 0.2, 0.);
    context.lineTo(-0.5 + 0.2, -0.5);
    context.closePath();
    context.stroke();
}

var programDoNothing = function(context){};

var programPauseStroke = function ( context ) 
{
    programStroke(context);
    // Filled triangle
    context.lineWidth = 0.05;
    context.beginPath();
    context.rect(-0.25, -0.4, 0.05, 0.8);
    context.stroke();

    context.beginPath();
    context.rect(0.25, -0.4, 0.05, 0.8);
    context.stroke();
}

var programPause = function ( context ) 
{
    programFill(context);
    context.strokeStyle = '#000000';
    // Filled triangle
    context.lineWidth = 0.05;
    context.beginPath();
    context.rect(-0.25, -0.4, 0.05, 0.8);
    context.stroke();

    context.beginPath();
    context.rect(0.25, -0.4, 0.05, 0.8);
    context.stroke();
}

var programStrokeThick = function ( context ) {

    context.lineWidth = 0.15;
    context.beginPath();
    context.arc( 0, 0, 1. - 0.15, 0, PI2, true );
    context.closePath();
    context.stroke();
}

var programStroke = function ( context ) {

    context.lineWidth = 0.07;
    context.beginPath();
    context.arc( 0, 0, 1. - 0.05, 0, PI2, true );
    context.closePath();
    context.stroke();
}

var programFill = function ( context ) 
{
    context.beginPath();
    context.arc( 0, 0, 0.99, 0, PI2, true );
    context.closePath();
    context.fill();
}

var programFillWater = function ( context ) {

    context.beginPath();
    context.arc( 0, 0, 0.99, PI, PI2, true );
    context.quadraticCurveTo(-0.99, 0, 0., 0.5);
    context.closePath();
    context.fill();
}

function GetTitle()
{
    var canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    var context = canvas.getContext('2d');
    var weight = "Regular";
    context.font = size + "pt Helvetica"
    context.fillStyle = "#ffffff";
    context.textAlign = "left";
}

function GetCircle() 
{
    return GetCircleColor(0,0,0,1,1,1);
}

function GetCircleColor(rs, gs,bs, rf, gf, bf)
{
    var canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    var context = canvas.getContext('2d');

    context.fillStyle = "rgb(" + 255 * rf + "," + 255 * gf + "," + 255 * bf + ")";
    context.strokeStyle = "rgb(" + 255 * rs + "," + 255 * gs + "," + 255 * bs + ")";
    context.beginPath();
    context.arc( canvas.width * 0.5, canvas.width * 0.5, (canvas.width * 0.9) - 1, 0, 2*Math.PI );
    context.fill();
    // context.setLineWidth(canvas.width / 128 + 2); 
    // context.stroke();

    return(canvas);
}

function GetRectangleFaded()
{
    
}

function GetRectangleBack() 
{
        var canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        var context = canvas.getContext('2d');
        context.fillStyle = "rgb(250,120,0)";
        context.fillRect(0, 0, canvas.width, canvas.height) 
        context.drawImage(TEXTURE_BACK, 0, 0, canvas.width, canvas.width);

        return(canvas);
}

function GetNoise()
{
    var canvas = document.createElement('canvas');
    canvas.width = 300;
    canvas.height = 500;

    c = canvas.getContext("2d");

    // read the width and height of the canvas
    var width = canvas.width;
    var height = canvas.height;

// create a new pixel array
    imageData = c.createImageData(width, height);
    var value;
    for(var x = 0; x < canvas.width; x++)
        for(var y = 0; y < canvas.height; y++)
        {
            if(Math.random() > 0.8)
            {
                value = Math.random() * 200 | 0;
            }
            else
            {
                value = 0;
            }

            setPixel(imageData, x, y, value, value, value, 255); // 255 opaque        
        }
    
    // copy the image data back onto the canvas
    c.putImageData(imageData, 0, 0); // at coords 0,0
    
    return canvas;
}

function setPixel(imageData, x, y, r, g, b, a) 
{
    index = (x + y * imageData.width) * 4;
    imageData.data[index+0] = r;
    imageData.data[index+1] = g;
    imageData.data[index+2] = b;
    imageData.data[index+3] = a;
}

function SetTextInCanvas(text, canvas)
{
    var context = canvas.getContext('2d');  
    var weight = "Regular";
    context.fillStyle = "#000000";
    context.textAlign = "left"; 

    var thissize;
    var jump = 0;
    for(var lineIndex = 0; lineIndex < text.length; lineIndex++)
    {
        if(!isdefined(text[lineIndex].size))
        {
            return;
        }
        thissize = text[lineIndex].size;
        jump += thissize;
        context.font = thissize + "pt Helvetica"
        context.fillText(text[lineIndex].string, 5, 1.6 * jump);
    }
}

function GetTextInBox(text, width, height, border, size, status) 
{
        var canvasText = document.createElement('canvas');

        canvasText.width = width;
        canvasText.height = height;

        var context = canvasText.getContext('2d');

        if(size < 0)
        {
                size = Math.round(0.9 * Math.round(Math.sqrt((width - 2 * border) * (height - 2 * border) / text.length)));
        }

        var weight = "Regular";
        context.font = size + "pt Helvetica"
        context.fillStyle = "#ffffff";
        context.textAlign = "left";

        var splitText = text.split(" ");
        var splitTextLine = new Array();
        var line = text;
        
        // for(var i = 0; i < splitText.length; i++)
        // {
        //    var metricSeg = context.measureText(splitText[i]).width;
        //    var metricLine = context.measureText(line).width;
        //    if((metricLine + metricSeg) > (width - 2 * border))
        //    {
        //         splitTextLine.push(line);
        //         line = "";
        //    }

        //    line = line + " " + splitText[i];
        // }
        var metricLine = context.measureText(line).width;
        canvasText.width = metricLine + 10;
        canvasText.height = size * 2;

        var context = canvasText.getContext('2d');

        var weight = "Regular";
        context.font = size + "pt Helvetica"
        context.fillStyle = "#ffffff";
        context.textAlign = "left";
 
        splitTextLine.push(line);

        var up = (height - splitTextLine.length * size) * 0.25;
        for(var lineIndex = 0; lineIndex < splitTextLine.length; lineIndex++)
        {
            context.fillText(splitTextLine[lineIndex], 5, size + canvasText.height * 0.);
        }

        return canvasText;
}

function GetImageInRectangle(img, widthOnHeight)
{
    var canvas = document.createElement('canvas');
    canvas.height = 512;
    canvas.width = canvas.height * widthOnHeight;
    var context = canvas.getContext('2d');

    imgRatio = img.width / img.height;
    var newImgWidth;
    var newImgHeight;
    var decay;
    // if image width > widthOnHeight
    if (imgRatio > widthOnHeight) 
    {
        newImgHeight = canvas.height;
        newImgWidth = imgRatio * newImgHeight;
        decay = newImgWidth - canvas.width;
        context.drawImage(img, -decay * 0.5, 0, newImgWidth, newImgHeight);  
    }
    else
    {
        newImgWidth = canvas.width;
        newImgHeight = newImgWidth / imgRatio;
        decay = newImgHeight - canvas.height;
        context.drawImage(img, 0, -decay * 0.5, newImgWidth, newImgHeight);  
    }

    return canvas;
}

function GetAvatarCircle(avatarImg)
{
        var canvas2 = document.createElement('canvas');
        canvas2.width = avatarImg.width;
        canvas2.height = avatarImg.width;
        var context2 = canvas2.getContext('2d');
        context2.beginPath();
        context2.arc(canvas2.width * 0.5,canvas2.height * 0.5,canvas2.width * 0.5 - 1,0,2*Math.PI);
        context2.fill();
        context2.globalCompositeOperation = 'source-in'; 
        context2.drawImage(avatarImg, 0, 0);
        context2.globalCompositeOperation = 'source-over';
        context2.beginPath();
        var lineWidth = 1. * set.TEMPLATE_CIRCLE_WIDTH;
        context2.strokeStyle= set.TEMPLATE_CIRCLE_COLOR;
        context2.arc(canvas2.width * 0.5,canvas2.height * 0.5,(canvas2.width - lineWidth) * 0.5 ,0,2*Math.PI);
        context2.setLineWidth(lineWidth); 
        context2.stroke();
        return canvas2;
}