
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
	return new THREE.Vector3((aPosition.x) * getWidth(), (aPosition.y) * getWidth(), aPosition.z * getWidth() );
}

function PixelToRelative(aPosition)
{
    return new THREE.Vector3(2. * ((aPosition.x / getWidth()) - 0.5), -2. * ((aPosition.y / getWidth()) - 0.5), aPosition.z / getWidth() );
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
    return ((value * 1000) % (limit * 1000)) / 1000;
}

function GetCosInterpolation(aVal)
{
    return 1 - (1 + Math.cos(Math.min(1, aVal) * Math.PI)) * 0.5;
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

function smoothstep(near, far, depth) {
    var x = saturate( (depth - near) / (far - near));
    return x * x * (3- 2*x);
}

function saturate(x) {
    return Math.max(0, Math.min(1, x));
}

String.prototype.replaceAt=function(index, character) {
    return this.substr(0, index) + character + this.substr(index+character.length);
}


