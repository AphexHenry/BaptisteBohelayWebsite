
// var Attractors = new Array();
// Attractors[0] = new Attractor();

var MirrorTouch = false;

var sTimerEnd = 0;
var ATTRACTOR_IDLE_SIZE = 1.;
var controls;

function BehaviourMirror(aPart, aPosition) 
{
	this.part = aPart;
	this.elementTarget = -1;
	this.free = 0.;
}

BehaviourMirror.prototype.GlobalUpdate = function(aTimeInterval)
{
	controls.update( aTimeInterval );

	effectController.aperture += 0.025 * aTimeInterval;
	effectController.aperture = Math.min(effectController.aperture, 0.025);
}

BehaviourMirror.prototype.GlobalInit = function(aTimeInterval)
{
	info = document.getElementById("info");

	controls = new THREE.FlyControls( camera );

	 controls.movementSpeed = 500;
	// controls.domElement = container;
	 controls.rollSpeed = Math.PI / 6;
	// controls.dragToLook = false
	controls.autoForward = false;
}

BehaviourMirror.prototype.GlobalMouseDown = function(aPosition)
{				 
	 controls.moveState.forward = 1;
	 controls.updateMovementVector();
}

BehaviourMirror.prototype.GlobalMouseUp = function(aPosition)
{
	 controls.moveState.forward = 0;
	 controls.updateMovementVector();
}

BehaviourMirror.prototype.GlobalMouseMove = function(aPosition)
{

}

BehaviourMirror.prototype.InitShow = function() 
{
	return true;
}

BehaviourMirror.prototype.Init = function() 
{
	this.elementTarget = -1;
}

BehaviourMirror.prototype.FadeIn = function(aTimeInterval) 
{
	return true;
}

BehaviourMirror.prototype.UpdateShow = function(aTimeInterval) 
{	

}

BehaviourMirror.prototype.Update = function(aTimeInterval) 
{	
	if(this.free >= 0.)
	{
		if(this.elementTarget < 0)
		{
			this.ChooseNewAttractor();
		}
		if((DoorsAttractorsArray[this.elementTarget].particleAttached >= 0) 
			&& (DoorsAttractorsArray[this.elementTarget].particleAttached != this.part.mIndex))
		{
			this.ChooseNewAttractor();
		}

		var lStrength = 3.;
		var lStrengthSpring = 1.8;
		var lAttractorMatrix = DoorsAttractorsArray[this.elementTarget].position;
		var lDistance = lAttractorMatrix.distanceTo(this.part.mPosition);

		if(lDistance < 0.1)
		{
			DoorsAttractorsArray[this.elementTarget].particleAttached = this.part.mIndex;
		}

	 	this.part.mVelocity.addSelf(new THREE.Vector3().sub(lAttractorMatrix, this.part.mPosition).multiplyScalar( lStrengthSpring * aTimeInterval));
	 	this.part.mSizeSpeed += 50 * (DoorsAttractorsArray[this.elementTarget].scale - this.part.mSize) * aTimeInterval;
	 	this.part.mSizeSpeed *= 0.95;
 	}
 	else
 	{
 		this.free += aTimeInterval;
 		this.part.mVelocity.addSelf(new THREE.Vector3(Math.random() * aTimeInterval, Math.random() * aTimeInterval, Math.random() * aTimeInterval));
 		this.part.mRotation.addSelf(new THREE.Vector3(Math.random() * aTimeInterval, Math.random() * aTimeInterval, Math.random() * aTimeInterval));
 		this.part.mVelocity.addSelf(new THREE.Vector3().sub(PixelToRelative(camera.position) , this.part.mPosition).multiplyScalar( 0.1 * aTimeInterval));	
 	}
}

BehaviourMirror.prototype.ChooseNewAttractor = function()
{
		var targets = new Array();
		var index;
		for(var i = 0; i < 3; i++)
		{
			index = Math.floor(Math.random() * DoorsAttractorsArray.length);
			var numTry = DoorsAttractorsArray.length;
			while(DoorsAttractorsArray[index].particleAttached >= 0)
			{
				numTry--;
				if(numTry < 0)
				{
					this.free = -20.;
					return;
				}
				index++;
				index = index % DoorsAttractorsArray.length;
			}
			targets.push(index);
		}

		var indexCloser = 0;
		var distanceCloser = 100000;
		var distanceCurrent;
		for(var i = 0; i < targets.length; i++)
		{
			distanceCurrent = DoorsAttractorsArray[targets[i]].position.distanceTo(this.part.mPosition);
			if(distanceCurrent < distanceCloser)
			{
				indexCloser = targets[i];
				distanceCloser = distanceCurrent;
			}
		}
		
		this.elementTarget = indexCloser;
}

BehaviourMirror.prototype.FadeOut = function(aTimeInterval) 
{
	var lStrengthAtt = (1. - (sTimerEnd / set.TIME_BEFORE_OUT)) * set.STRENGTH_ATTRACTOR * 3.;
    lDistance = Math.max(this.part.mPosition.length(), 0.15);
    this.part.mVelocity.addSelf(MinusMult(Vec3f(0., 0., -1.), this.part.mPosition, 1. * lStrengthAtt * aTimeInterval / (lDistance * lDistance)));
    var lAttractorMatrix = this.GetResized();

    if(sTimerEnd < 0.)
    {
		var lStrength = 4. * (0.75 + (Math.random() * 0.75));
		var lXrelative = (lAttractorMatrix.x - 0.5);
		var lYrelative = (lAttractorMatrix.y - 0.5) / (0.5);
		this.part.mVelocity.x	= lXrelative * lStrength;
		this.part.mVelocity.y	= lYrelative * lStrength;
		this.part.mVelocity.z	= -2. * Math.cos(Math.PI * lXrelative) * Math.sin(Math.PI * lYrelative) * lStrength;
		this.part.mSizeSpeed	= (ATTRACTOR_IDLE_SIZE * 0.5 - this.part.mSize) * aTimeInterval;

		this.part.mRotationSpeed.addSelf( new THREE.Vector3().sub( new THREE.Vector3(0., lXrelative * 90, 0.), this.part.mRotation).multiplyScalar(aTimeInterval));

		return true;
	}

	 return false;
}