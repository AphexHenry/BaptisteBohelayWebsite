
var MAX_Z = window.innerWidth
var MIN_Z = -window.innerWidth

function clone(obj) 
{
    // Handle the 3 simple types, and null or undefined
    if (null == obj || "object" != typeof obj) return obj;

    // Handle Date
    if (obj instanceof Date) {
        var copy = new Date();
        copy.setTime(obj.getTime());
        return copy;
    }

    // Handle Array
    if (obj instanceof Array) {
        var copy = [];
        var len = obj.length;
        for (var i = 0; i < len; ++i) {
            copy[i] = clone(obj[i]);
        }
        return copy;
    }

    // Handle Object
    if (obj instanceof Object) {
        var copy = {};
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr]);
        }
        return copy;
    }

    throw new Error("Unable to copy obj! Its type isn't supported.");
}

function myRandom(aMin, aMax)
{
	return aMin + (Math.random() * (aMax - aMin));
}

function RandInt(aValue)
{
    return Math.floor(Math.random() * aValue);
}

function getRatio()
{
	return window.innerWidth / window.innerHeight;
}

function getWidth()
{
	return window.innerWidth;
}

function getHeight()
{
	return window.innerHeight;
}

function RelativeToPixel(aPosition)
{
	return new THREE.Vector3((aPosition.x) * getWidth(), (aPosition.y) * getWidth(), aPosition.z * MAX_Z );
}

function PixelToRelative(aPosition)
{
    return new THREE.Vector3(2. * ((aPosition.x / getWidth()) - 0.5), -2. * ((aPosition.y / getWidth()) - 0.5), aPosition.z / MAX_Z );
}

function myClamp(val, min, max)
{
    return Math.max(min, Math.min(max, val))
}

function MinusMult(aVec1, aVec2, aCoeff)
{
	return new THREE.Vector3().subVectors(aVec1, aVec2).multiplyScalar(aCoeff);
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

//returns a function that calculates lanczos weight
function lanczosCreate(lobes){
  return function(x){
    if (x > lobes) 
      return 0;
    x *= Math.PI;
    if (Math.abs(x) < 1e-16) 
      return 1
    var xx = x / lobes;
    return Math.sin(x) * Math.sin(xx) / x / xx;
  }
}

//elem: canvas element, img: image element, sx: scaled width, lobes: kernel radius
function thumbnailer(elem, img, sx, lobes){ 
    this.canvas = elem;
    elem.width = img.width;
    elem.height = img.height;
    elem.style.display = "none";
    this.ctx = elem.getContext("2d");
    this.ctx.drawImage(img, 0, 0);
    this.img = img;
    this.src = this.ctx.getImageData(0, 0, img.width, img.height);
    this.dest = {
        width: sx,
        height: Math.round(img.height * sx / img.width),
    };
    this.dest.data = new Array(this.dest.width * this.dest.height * 3);
    this.lanczos = lanczosCreate(lobes);
    this.ratio = img.width / sx;
    this.rcp_ratio = 2 / this.ratio;
    this.range2 = Math.ceil(this.ratio * lobes / 2);
    this.cacheLanc = {};
    this.center = {};
    this.icenter = {};
    setTimeout(this.process1, 0, this, 0);
}

thumbnailer.prototype.process1 = function(self, u){
    self.center.x = (u + 0.5) * self.ratio;
    self.icenter.x = Math.floor(self.center.x);
    for (var v = 0; v < self.dest.height; v++) {
        self.center.y = (v + 0.5) * self.ratio;
        self.icenter.y = Math.floor(self.center.y);
        var a, r, g, b;
        a = r = g = b = 0;
        for (var i = self.icenter.x - self.range2; i <= self.icenter.x + self.range2; i++) {
            if (i < 0 || i >= self.src.width) 
                continue;
            var f_x = Math.floor(1000 * Math.abs(i - self.center.x));
            if (!self.cacheLanc[f_x]) 
                self.cacheLanc[f_x] = {};
            for (var j = self.icenter.y - self.range2; j <= self.icenter.y + self.range2; j++) {
                if (j < 0 || j >= self.src.height) 
                    continue;
                var f_y = Math.floor(1000 * Math.abs(j - self.center.y));
                if (self.cacheLanc[f_x][f_y] == undefined) 
                    self.cacheLanc[f_x][f_y] = self.lanczos(Math.sqrt(Math.pow(f_x * self.rcp_ratio, 2) + Math.pow(f_y * self.rcp_ratio, 2)) / 1000);
                weight = self.cacheLanc[f_x][f_y];
                if (weight > 0) {
                    var idx = (j * self.src.width + i) * 4;
                    a += weight;
                    r += weight * self.src.data[idx];
                    g += weight * self.src.data[idx + 1];
                    b += weight * self.src.data[idx + 2];
                }
            }
        }
        var idx = (v * self.dest.width + u) * 3;
        self.dest.data[idx] = r / a;
        self.dest.data[idx + 1] = g / a;
        self.dest.data[idx + 2] = b / a;
    }

    if (++u < self.dest.width) 
        setTimeout(self.process1, 0, self, u);
    else 
        setTimeout(self.process2, 0, self);
};
thumbnailer.prototype.process2 = function(self){
    self.canvas.width = self.dest.width;
    self.canvas.height = self.dest.height;
    self.ctx.drawImage(self.img, 0, 0);
    self.src = self.ctx.getImageData(0, 0, self.dest.width, self.dest.height);
    var idx, idx2;
    for (var i = 0; i < self.dest.width; i++) {
        for (var j = 0; j < self.dest.height; j++) {
            idx = (j * self.dest.width + i) * 3;
            idx2 = (j * self.dest.width + i) * 4;
            self.src.data[idx2] = self.dest.data[idx];
            self.src.data[idx2 + 1] = self.dest.data[idx + 1];
            self.src.data[idx2 + 2] = self.dest.data[idx + 2];
        }
    }
    self.ctx.putImageData(self.src, 0, 0);
    self.canvas.style.display = "block";
}

/*																					
 ************************************************************************************
 */

// Vec3.prototype.set = function(aX, aY, aZ)
// {
// 	this.x = aX;
// 	this.y = aY;
// 	this.z = aZ;
// }

// Vec3.prototype.distance = function(aVec)
// {
// 	return Math.sqrt(((aVec.x - this.x) * (aVec.x - this.x)) + ((aVec.y - this.y) * (aVec.y - this.y)) + ((aVec.z - this.z) * (aVec.z - this.z)))
// }

// Vec3.prototype.plus = function(aVec)
// {
// 	this.x += aVec.x;
// 	this.y += aVec.y;
// 	this.z += aVec.z;
// }

// Vec3.prototype.mult = function(aMult)
// {
// 	this.x *= aMult;
// 	this.y += aMult;
// 	this.z += aMult;
// }