var StringUtils = {
    /**
     * Removes urls from a string.
     * Returns the modified string.
     **/
    removeURLs: (function(string) {
        var urlToken = /(http|https):\/\/[\/a-z_A-Z_0-9.?=+&-]*/gi;
        return function(string) {
            if (!string) return null;
            return string.replace(urlToken, '');
        }
    })(),
    /**
     * Removes carriage returns, new lines, and tabs.
     * Returns the modified string.
     **/
    removeWhiteSpaces: (function(string) {
        var whiteSpaceToken = /(:?\r|\n|\t)+/g;
        return function(string) {
            if (!string) return null;
            return string.replace(whiteSpaceToken, '');
        }
    })(),
    /**
     * Explodes long strings larger than maxWidth into individual characters.
     * Returns an array of strings.
     **/
    breakLongString: function(context, string, maxWidth) {
        var words = string.split(' ');
        var shortWords = [];
        for (n = 0; n < words.length; n++) {
            word = words[n];
            metrics = context.measureText(word);
            testWidth = metrics.width;
            if (testWidth > maxWidth) {
                chars = word.split('');
                shortWords = shortWords.concat(chars);
            } else {
                shortWords.push(word);
            }
        }
        return shortWords;
    }
}

var CanvasTextUtils = {
    /**
     * Wraps a string in lines given a maximum witdh.
     * Returns an array of lines.
     **/
    wrap: function(context, string, maxWidth) {
        if (!string) return null;
        var words = string.split(' ')
            , shortWords
            , line 			= ''
            , lines 		= []
            , separator = ' '
            , metrics
            , testLine;

        shortWords = StringUtils.breakLongString(context, string, maxWidth);

        if (words.length !== shortWords.length) separator = '';

        for (var n = 0; n < shortWords.length; n++) {
            testLine = line + shortWords[n] + separator;
            metrics = context.measureText(testLine);
            testWidth = metrics.width;
            if (testWidth > maxWidth) {
                lines.push(line);
                line = shortWords[n] + separator;
            } else {
                line = testLine;
            }
        }
        lines.push(line);
        return lines;
    },
    /**
     * Truncates to full words an array of strings.
     * Returns an array of strings.
     **/
    truncate: function(string, ellipsis) {
        var ellipsis = ellipsis || '...'
            , lastSpaceToken = /\S\s(:?\w|'|")*$/g
            , index = 0;

        string = string.substring(0, string.length - ellipsis.length + 1);
        index  = string.search(lastSpaceToken);
        string = string.substring(0, index + 1) + ellipsis;
        return string;
    },
    /**
     * Truncates a string to a given maximum width.
     * Returns a string.
     **/
    crop: function(context, string, maxWidth, ellipsis) {
        var ellipsis = ellipsis || "..."
            , testWidth = context.measureText(string).width;
        if (testWidth > maxWidth) {
            do {
                string = string.slice(0, -1);
                testWidth = context.measureText(string).width;
            }
            while(testWidth > maxWidth);
            string += ellipsis;
        }
        return string;
    },
    /**
     * Caps an array of strings.
     * Returns a string.
     **/
    limit: function(lines, maxLines, truncate) {
        if (!lines) return null;
        var lastLine;
        if (maxLines && lines.length > maxLines) {
            lines = lines.slice(0, maxLines);
            if (truncate) {
                lastLine = lines.pop();
                lines.push(this.truncate(lastLine));
            }
        }
        return lines;
    }
}


var CanvasUtils = {
    /**
     * Draws an image to a canvas context object.
     * Options: x, y, width, height;
     **/
    drawImage: function(context, img, options) {
        var defaults = { x: 0, y: 0 }
        options = ObjectUtils.extend(defaults, options);
        context.drawImage(img, options.x, options.y, options.width, options.height);
    },
    /**
     * Draw a cropped image to a canvas context object.
     * Options: sx, sy, swidth, sheight, x, y, width, height;
     **/
    drawCroppedImage: function(context, img, options) {
        var defaults = {sx: 0, sy: 0, swidth: 100, sheight: 100, x: 0, y: 0, width: 100, height: 100};
        options = ObjectUtils.extend(defaults, options);
        context.drawImage(img, options.sx, options.sy, options.swidth, options.sheight, options.x, options.y, options.width, options.height);
    },
    /**
     * Draws an circle to a canvas context object.
     * Options: x, y, width, height, fill, stroke, lineWidth
     **/
    drawCircle: function(context, options) {
        var defaults = {
            x: 0
            ,	y: 0
            , width: 100
            , height: 100
            ,	fill: 'rgba(255, 0, 0, 1.0)'
            , stroke: 'black'
            , lineWidth: 8
        };

        options = ObjectUtils.extend(defaults, options);

        var x = options.x + options.width * 0.5
            , y = options.y + options.height * 0.5
            , r = options.width * 0.5;

        context.beginPath();
        context.arc(x, y, r, 0, Math.PI * 2, false);
        context.fillStyle = options.fill;
        context.fill();
        context.lineWidth = options.lineWidth;
        context.strokeStyle = options.stroke;
        context.stroke();
    },

    /**
     * Draws a rectangle to a canvas context object.
     * Options: x, y, width, height, fill, stroke, lineWidth
     **/
    drawRectangle: function (context, options) {
        var defaults = {
            x: 0,
            y: 0,
            width: 100,
            height: 100,
            fill: 'rgba(255, 0, 0, 1.0)',
            stroke: 'black',
            lineWidth: 8
        };

        options = ObjectUtils.extend(defaults, options);

        context.rect(options.x, options.y, options.width, options.height);
        context.fillStyle = options.fill;
        context.fill();

        if (options.lineWidth && options.stroke !== 'none') {
            context.lineWidth = options.lineWidth;
            context.strokeStyle = options.stroke;
            context.strokeRect(options.x, options.y, options.width, options.height);
        }
    },

    /**
     * Draws a rectangle with round corners to a canvas context object.
     * Options: x, y, width, height, cornerRadius, fill, stroke, lineWidth
     **/
    drawRoundedRectangle: function (context, options) {
        if (options.cornerRadius == 0) return;

        var defaults = {
            x: 0,
            y: 0,
            width: 100,
            height: 100,
            cornerRadius: 10,
            fill: 'rgba(255, 0, 0, 1.0)',
            stroke: 'black',
            lineWidth: 8,
            clip:false
        };

        options = ObjectUtils.extend(defaults, options);

        var x = options.x;
        var y = options.y;
        var width = options.width;
        var height = options.height;
        var cornerRadius = options.cornerRadius;
        var diameter = cornerRadius * 2;
        var clip = options.clip;


        if (diameter > width || diameter > height) {
            cornerRadius = Math.min(width, height) * 0.5;
        }

        var innerWidth = width - (2 * cornerRadius);
        var innerHeight = height - (2 * cornerRadius);
        var fill = options.fill;
        var stroke = options.stroke;
        var lineWidth = options.lineWidth;

        var xa = x;
        var xb = xa + cornerRadius;
        var xc = xb + innerWidth;
        var xd = xc + cornerRadius;

        var ya = y;
        var yb = ya + cornerRadius;
        var yc = yb + innerHeight;
        var yd = yc + cornerRadius;

        context.beginPath();
        context.moveTo(xb, ya);
        context.lineTo(xc, ya);
        context.arc(xc, yb, cornerRadius, 1.5 * Math.PI, 0);
        context.lineTo(xd, yc);
        context.arc(xc, yc, cornerRadius, 0, 0.5 * Math.PI);
        context.lineTo(xb, yd);
        context.arc(xb, yc, cornerRadius, 0.5 * Math.PI, Math.PI);
        context.lineTo(xa, yb);
        context.arc(xb, yb, cornerRadius, Math.PI, 1.5 * Math.PI);

        if(clip) {
            context.closePath();
            context.clip();
        }

        if (fill !== 'none' &&
            fill !== 'transparent' &&
            fill !== 'rgba(0, 0, 0, 0.0)')
        {
            context.fillStyle = options.fill;
            context.fill();
        }

        if (lineWidth && stroke !== 'none') {
            context.lineWidth = options.lineWidth;
            context.strokeStyle = options.stroke;
            context.stroke();
        }
    },

    /**
     * Clips with a round rectangle the output of
     * drawing any calls made past this point.
     * Options: x, y, width, height, cornerRadius, fill, stroke, lineWidth
     **/
    clipWithRoundedRectangle: function (context, options) {
        if (!options.cornerRadius) return;

        var overwrites = {};
        overwrites = ObjectUtils.extend(options, overwrites);

        overwrites.fill = 'black';
        overwrites.stroke = 'none';
        overwrites.lineWidth = 0;

        this.drawRoundedRectangle(context, overwrites);
        context.globalCompositeOperation = 'source-atop';
    },

    /**
     * Draws text to a canvas context object.
     * Too many options to list here...
     **/
    drawText: function(aCanvas, text, options) {
        var context = aCanvas.getContext( "2d" );

        if (!text || text.length == 0) return;

        if (options === undefined) options = {};

        var defaults = {
            font: 'Helvetica'
            , size: '40px'
            , color: '#ffffff'
            , lead: 60
            , style: ''
            , align: 'left'
            , paddingTop: 0
            , paddingRight: 0
            , paddingBottom: 0
            , paddingLeft: 0
            , width: aCanvas.width
            , height: aCanvas.height
            , top: 0
            , right: 0
            , bottom: 0
            , left: 0
            , verticalAlign: 'top'
            , maxLines: 1
            , wrap: false
            , truncate: false
            , crop: false
        }

        options = ObjectUtils.extend(defaults, options);

        var w = options.width - options.paddingLeft - options.paddingRight
            , h = options.height - options.paddingTop - options.paddingBottom
            , y = options.top + options.paddingTop + options.lead
            , x = options.left + options.paddingLeft
            , lines = [text]; // assume single line...

        context.font = [options.style, options.weight, options.size, options.font].join(' ');
        context.textAlign = options.align;
        context.fillStyle = options.color;

        if (options.wrap) {
            lines = CanvasTextUtils.wrap(context, text, w);
        }

        if (options.maxLines) {
            lines = CanvasTextUtils.limit(lines, options.maxLines, true);
        }

        if (options.crop && !(options.wrap || options.truncate)) {
            lines = [CanvasTextUtils.crop(context, text, w)];
        }

        if (options.align === 'right') {
            x += options.width - (options.left + options.paddingLeft) - (options.right + options.paddingRight);
        }

        if (options.verticalAlign === 'middle') {
            y += Math.round((options.height - (lines.length * options.lead)) * 0.5);
        }

        if (options.verticalAlign === 'bottom') {
            y += options.height - (lines.length * options.lead);
        }

        for (var i = 0; i < lines.length; i++) {
            context.fillText(lines[i], x, y);
            y += options.lead;
        }
    }
}

/**
 * Utilities - A mix of template helper functions
 *
 * Credit to http://www.html5canvastutorials.com/tutorials
 * for guidance on clever uses around the HTML5 Canvas API.
 *
 */

var ObjectUtils = {
    /**
     * Copies properties from source object to a copy of the destination object.
     **/
    extend: function(destination, source) {
        var json = JSON.stringify(destination);
        var o = JSON.parse(json);
        for (var i in source)
            o[i] = source[i];
        return o;
    }
}


var LoadingUtils = {
    /**
     * A simple image loader...
     **/
    load: function(sources, callback) {
        var images = {};
        var loadedImages = 0;
        var numImages = 0;
        for (var src in sources) {
            numImages++;
        }
        for (var src in sources) {
            images[src] = new Image();
            images[src].onload = function() {
                if(++loadedImages >= numImages) {
                    callback(images);
                }
            };
            images[src].onerror = function() {
                loadedImages--;
                callback(null);
            }
            images[src].src = sources[src];
        }
    }
}
