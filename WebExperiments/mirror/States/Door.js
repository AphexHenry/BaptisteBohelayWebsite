
// var Attractors = new Array();
// Attractors[0] = new Attractor();

var touch = false;

var sTimerEnd = 0;
var ATTRACTOR_IDLE_SIZE = 1.;
var DoorsAttractorsArray = new Array();

function Door(aPosition, width, height, aNumPart) 
{
	for(var i = 0; i < aNumPart; i++)
	{
		var ratio = width / height;
		var area = width;
		this.mAttractorMatrix = new Array();
		var lNumPartX = Math.floor(Math.sqrt(aNumPart * ratio));
		var lNumPartY = Math.floor(aNumPart / lNumPartX);
		var decay = area * 2. / lNumPartX;
		var lPosXStart = -area;//lNumPartX * 0.5;
		var lPosYStart = lPosXStart /  ratio;//-lNumPartY * 0.5;
		
		this.mIdleSize = 0.25 * decay * window.innerWidth / TEXTURE_SIZE;

		var lYposition = Math.floor(i / lNumPartX);
		var lXposition = i - (lYposition * lNumPartX);
		lYposition = (lYposition * decay) + lPosYStart;
		lXposition = (lXposition * decay) + lPosXStart;

		var element = 
		{
			position:new THREE.Vector3(lXposition + aPosition.x, lYposition + aPosition.y, aPosition.z), 
			rotation:new THREE.Vector3(0., 0., 0.), 
			scale:this.mIdleSize,
			particleAttached:-1
		};

		this.mAttractorMatrix.push(element);
		DoorsAttractorsArray.push(element);
	}
}