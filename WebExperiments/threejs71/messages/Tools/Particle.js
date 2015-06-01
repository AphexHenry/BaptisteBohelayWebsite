
var FLIP_ROTATION_SPEED = 7.;
var CONSERVATION_OF_VELOCITY = 0.95;
var TEXTURE_SIZE = 3;
var sShowPartPosition = new THREE.Vector3(0., 0., 0.);
var sFrameRate = 1.;

/*
 * States into the state.
 * To transit from a state to another, one particle must go threw:
 *
 * UPDATE_INIT : an intitialization of his state, then a fade out until it return true.
 * UPDATE_FADE_IN : a fade in update, until the state return true.
 * UPDATE_UPDATE : a continuus update.
 * UPDATE_FADE_OUT : a fade out update, called when the state is changing. Switch to the init of the next state when return true.
 */
Particle.StateUpdate = 
{
	UPDATE_INIT : 0,
	UPDATE_FADE_IN : 1,
	UPDATE_UPDATE : 2,
	UPDATE_FADE_OUT : 3
}

/*
 * State of fliping.
 * To change the texture of a particle, we flip it first.
 *
 * FLIP_IDLE : Nothing happen.
 * FLIP_FORWARD : Flip the particle forward.
 * FLIP_BACKWARD : Come back to its original state (no flip).
 */
Particle.FlipState =
{
	FLIP_IDLE : 0,
	FLIP_FORWARD : 1,
	FLIP_BACKWARD : 2
};

var sIndex = 0;
var mParticleToShow = 0;

function Particle(aPosition, aTexture, aEnvMap)
{
	this.mPosition = aPosition;
	this.mVelocity = new THREE.Vector3(0., 0., 0. );
	this.mLastPosition = this.mPosition.clone();
	this.mRotation = new THREE.Vector3(0, 0 , 0);
	this.mRotationSpeed = new THREE.Vector3(0, 0 , 0);
	this.mSize = 1;
	this.mSizeSpeed = 0.;
	this.mLimit;

	this.mIndex = sIndex;
	sIndex++;
	
	// flip rotation (from -1.f to 1.f). The image wont be visible at 0.f.
	this.mFlipRotation = 1.;
	this.mIsTweet;
    
    this.mCount;
	
	this.mStateTimer;
	
	this.mFlipState = Particle.FlipState.FLIP_IDLE;
	this.mAnimationCounter;
	
    // we set the texture datas private because want to be sure that the two members are 
    // syncronized. So we manager them here.
    this.mtexture;
	this.mtextureNext;
	
	this.mStateUpdate = Particle.StateUpdate.UPDATE_INIT;
	this.mParticleState = new Array();
	//this.mParticleState[0] = new BehaviourIntro(this, aPosition);
	this.mParticleState[0] = new BehaviourMirror(this, aPosition);

	this.mStateCurrent = 0;
	this.mStateNext = 0;
	this.mIsShow = false;
	this.mTimerShow = 0.;
	// delay during which the particle is not responsive to camera closness.
	this.mImmunityToCamTimer = 0.;
	this.mAlpha = 1;

	mAnimationCounter = 0;

	this.canvas = aTexture.image;
	this.geometry = new THREE.PlaneBufferGeometry( this.canvas.width / this.canvas.height, 1, 19 );
	this.mRatio = 1.;
	this.geometry.doubleSided = true;

	parameters = { color: 0xffffff, map: aTexture, envMap:aEnvMap, shading: THREE.FlatShading, reflectivity:0.1, transparent:true };
	this.materials = new THREE.MeshBasicMaterial( parameters );
	this.materials.color.setRGB( 1., 1., 1.);

	this.mesh = new THREE.Mesh( this.geometry, this.materials );

	this.mesh.matrixAutoUpdate = false;
	this.mesh.updateMatrix();
	sRenderer.scene.add( this.mesh );
}

/*
 * Trigger the switch to the next state. Fade out first.
 *
 * @param aState: next state index.
 */
Particle.prototype.SwitchState = function(aState) 
{
	this.mStateNext = aState;
	this.mStateUpdate = Particle.StateUpdate.UPDATE_FADE_OUT;
}

Particle.prototype.PrepareTransition = function() 
{
	if(this.mStateUpdate == Particle.StateUpdate.UPDATE_FADE_OUT)
	{
		this.mParticleState[this.mStateNext].GlobalInit();
	}
}

/*
 * Update this particle.
 *
 * @param aTimeInterval: time elapsed since last update..
 */
Particle.prototype.Update = function(aTimeInterval, awidth) 
{
	aTimeInterval *= sFrameRate;
	// call the good update (init -> FadeIn -> Update -> FadeOut.
	var lParticleState = this.mParticleState[this.mStateCurrent];

	switch(this.mStateUpdate)
	{
		case Particle.StateUpdate.UPDATE_INIT:
			lParticleState.Init();
			this.mStateUpdate = Particle.StateUpdate.UPDATE_FADE_IN;
		case Particle.StateUpdate.UPDATE_FADE_IN:
			if(lParticleState.FadeIn(aTimeInterval))
			{
				this.mStateUpdate = Particle.StateUpdate.UPDATE_UPDATE;
			}
			break;
		case Particle.StateUpdate.UPDATE_UPDATE:
			if(!this.mIsShow)
			{
				lParticleState.Update(aTimeInterval);
			}
			else
			{
				lParticleState.UpdateShow(aTimeInterval);
			}
			break;
		case Particle.StateUpdate.UPDATE_FADE_OUT:
			if(lParticleState.FadeOut(aTimeInterval))
			{
				this.mStateCurrent = this.mStateNext;
				this.mStateUpdate = Particle.StateUpdate.UPDATE_INIT;
			}
			break;
		default:
			break;
	}

	// Update fliping to change the texture.
	switch(this.mFlipState)
	{
		case Particle.FlipState.FLIP_IDLE:
			break;
		case Particle.FlipState.FLIP_FORWARD:
			this.mFlipRotation -= FLIP_ROTATION_SPEED * aTimeInterval;
			if(this.mFlipRotation < 0.)
			{
				this.mFlipRotation = 0.;
				this.mFlipState = Particle.FlipState.FLIP_BACKWARD;
				this.SwitchTexture();
			}
			break;
		case Particle.FlipState.FLIP_BACKWARD:
			this.mFlipRotation += FLIP_ROTATION_SPEED * aTimeInterval;
			if(this.mFlipRotation > 1.)
			{
				this.mFlipRotation = 1.;
				this.mFlipState = Particle.FlipState.FLIP_IDLE;
			}
			break;
		default:
			break;
	}

		// classic physics equations.
	 this.mPosition.x += this.mVelocity.x * aTimeInterval;
	 this.mPosition.y += this.mVelocity.y * aTimeInterval;
	 this.mPosition.z += this.mVelocity.z * aTimeInterval;
	this.mVelocity.multiplyScalar(CONSERVATION_OF_VELOCITY);

	this.mSize += this.mSizeSpeed * aTimeInterval;
    this.mSizeSpeed *= CONSERVATION_OF_VELOCITY;
	
	this.mRotation.add(this.mRotationSpeed.clone().multiplyScalar(aTimeInterval));
	this.mRotationSpeed.multiplyScalar(CONSERVATION_OF_VELOCITY);
	if(this.mesh != null)
	{
		var lPos = RelativeToPixel(this.mPosition);
		this.mesh.position.set(lPos.x,lPos.y,lPos.z);// =  RelativeToPixel(this.mPosition);
		 this.mesh.rotation.x = this.mRotation.x;
		 this.mesh.rotation.y = this.mRotation.y;// + 0.5 * Math.PI;
		 this.mesh.rotation.z = 0;// + 0.5 * Math.PI;
		this.mSize = Math.max(this.mSize, 0.0001);
		this.mesh.scale.x = 0.05 * this.mAlpha * (this.mFlipRotation * this.mSize *  awidth / TEXTURE_SIZE);
		this.mesh.scale.y = 0.05 * this.mSize *  awidth / TEXTURE_SIZE;
		this.mesh.scale.z = 0.05 * this.mSize *  awidth / TEXTURE_SIZE;
		// this.mesh.scale.x = this.mesh.scale.y = this.mesh.scale.z = 60;
		// this.mesh.doubleSided = true;
		this.mesh.updateMatrix();
		
	}
}

Particle.prototype.GetCanvas = function() {
	return this.canvas;
}

Particle.prototype.MouseDown = function(aPosition)
{
	this.mParticleState[this.mStateCurrent].GlobalMouseDown(aPosition);
}

Particle.prototype.MouseUp = function(aPosition)
{
	this.mParticleState[this.mStateCurrent].GlobalMouseUp(aPosition);
}

Particle.prototype.MouseMove = function(aPosition)
{
	this.mParticleState[this.mStateCurrent].GlobalMouseMove(aPosition);
}

Particle.prototype.GlobalUpdate = function(aTimeInterval) 
{
	this.mParticleState[this.mStateCurrent].GlobalUpdate(aTimeInterval);
}

Particle.prototype.GlobalInit = function(aStateGlobal, aState) 
{
	this.mParticleState[aState].GlobalInit();
}

/*
 * Set the texture and the corresponding path.
 *
 * @param aTexture: Texture to set.
 * @param aTexturePath: Corresponding path of the file.
 * 
 * @Note:   We do that because it is important to be able to know what is the source of the texture.
 *          We might want to delete it for example if the user want to.
 */
 Particle.prototype.SwitchTexture = function()
{
	this.materials.map.needsUpdate = true;
}

// Particle.prototype.SetTexture = function(aTexturePath, aTexture) 
Particle.prototype.RefreshTexture = function()
{
	this.mFlipState = Particle.FlipState.FLIP_FORWARD;
}

Particle.prototype.SetShow = function(aShow)
{
	this.mIsShow = aShow;
	this.mTimerShow = 0.;
	if(!aShow)
	{
		this.mImmunityToCamTimer = 4.;
	}
	else
	{
		return this.mParticleState[this.mStateCurrent].InitShow();
	}
}

Particle.prototype.IsShowAvailable = function()
{
	return false;
}

Particle.prototype.HasTexture = function(aShow)
{
	return (this.materials.map != null);
}
