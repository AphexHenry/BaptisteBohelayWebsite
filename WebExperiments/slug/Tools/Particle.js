
var FLIP_ROTATION_SPEED = 15.;
var CONSERVATION_OF_VELOCITY = 0.95;
var TEXTURE_SIZE = 1000;
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

Particle.StateEnum = 
{
	STATE_INTRO:0,
	STATE_SECOND:1,
	STATE_VIDEO:2,
};

var SIZE_PART_IDLE = 0.1;
var sIndex = 0;
var mParticleToShow = 0;

function Particle() 
{
	this.mPosition = new THREE.Vector3(0., 0., 0. );
	this.mVelocity = new THREE.Vector3(0., 0., 0. );
	this.mLastPosition = this.mPosition.clone();
	this.mRotation = new THREE.Vector3(0, 0 , 0);
	this.mRotationSpeed = new THREE.Vector3(0, 0 , 0);
	this.mSize = SIZE_PART_IDLE;
	this.mSizeSpeed = 0.;
	this.mColorSpeed = {r:0., g:0., b:0.};
	this.mSizeIdle = SIZE_PART_IDLE;
	this.mLimit;
	this.mAlpha = 1.;
	this.mColor = new THREE.Color(0x000000);
	this.mColor.setRGB(1., 1., 1.);
	this.mToWatch = false;
	this.mVisible = true;

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

	this.mStateCurrent = 0;
	this.mStateNext = 0;
	this.mIsShow = false;
	this.mTimerShow = 0.;
	// delay during which the particle is not responsive to camera closness.
	this.mImmunityToCamTimer = 0.;

	// mLimit = Rand::randFloat(1.2f, 2.f);
	
	mAnimationCounter = 0;

	this.materials = null;
	this.materialsNext = null;

	this.geometry = new THREE.SphereGeometry( TEXTURE_SIZE * 1.3, 32, 16 );
	this.mRatio = 1.;
	//this.geometry.doubleSided = false;

	this.mesh = null;//new THREE.Mesh( this.geometry, this.materials );
}

Particle.prototype.AddState = function(aState)
{
	this.mParticleState.push(aState);
}

Particle.prototype.SetupLogo = function(index)
{
	this.mParticleState[Particle.StateEnum.STATE_LOGO] = new BehaviourLogo(this, index);
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

	this.mLastPosition = this.mPosition.clone();

	this.mVelocity.multiplyScalar(CONSERVATION_OF_VELOCITY);

	this.mSize += this.mSizeSpeed * aTimeInterval;

	this.mColor.r += this.mColorSpeed.r * aTimeInterval;
	this.mColor.g += this.mColorSpeed.g * aTimeInterval;
	this.mColor.b += this.mColorSpeed.b * aTimeInterval;

	this.mColorSpeed.r *= 0.9;
	this.mColorSpeed.g *= 0.9;
	this.mColorSpeed.b *= 0.9;
	
	this.mRotation.addSelf(this.mRotationSpeed.clone().multiplyScalar(aTimeInterval));
	this.mRotationSpeed.multiplyScalar(CONSERVATION_OF_VELOCITY);
	if(this.mesh != null)
	{
		this.mesh.position =  RelativeToPixel(this.mPosition);
		// this.mesh.position.z =  -1000.;
		this.mesh.rotation.x = this.mRotation.x;
		this.mesh.rotation.y = this.mRotation.y;
		this.mesh.rotation.z = 0.;
		this.mesh.scale.x = (this.mFlipRotation * this.mSize *  awidth / TEXTURE_SIZE);
		this.mesh.scale.y = this.mSize *  awidth / TEXTURE_SIZE;
		this.mesh.scale.z = this.mSize *  awidth / TEXTURE_SIZE;
		this.mesh.material.color = this.mColor;
		this.mesh.castShadow = true;
		this.mesh.receiveShadow  = true;
		this.mesh.visible = this.mVisible;
	}
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

// Particle.prototype.SetShow = function(aShow)
// {
// 	mIsShow = aShow;
// 	if(!aShow)
// 	{
// 		mImmunityToCamTimer = 4.;
// 	}
// } 

Particle.prototype.GlobalUpdate = function(aTimeInterval) 
{
	var state = this.mParticleState[this.mStateCurrent];
	if(state != undefined)
	{
		state.GlobalUpdate(aTimeInterval);
	}
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
	if(this.materials == null)
	{
		this.materials = this.materialsNext;
		this.mesh = new THREE.Mesh( this.geometry, this.materials );
		scene.add( this.mesh );
	}
	else
	{
		scene.remove(this.mesh);
		this.materials = this.materialsNext;
		this.mesh = new THREE.Mesh( this.geometry, this.materials );
		scene.add(this.mesh);
	}
}

// Particle.prototype.SetTexture = function(aTexturePath, aTexture) 
Particle.prototype.SetTexture = function(aTexture)
{
	//parameters = { map: aTexture, transparent:true };

	 this.materialsNext = new THREE.MeshLambertMaterial(  );
	// this.materialsNext = new THREE.MeshPhongMaterial({
 //        color: 0x000000,
 //        shininess: 1.0,
 //        ambient: 0xff0000,
 //        emissive: 0x111111,
 //        specular: 0xbbbbbb
 //      });
	//this.materialsNext.depthTest = true;
	//this.materialsNext.depthWrite = true;
	this.materialsNext.color.setRGB(1., 1., 1.);
//	this.materialsNext.blending = THREE[ "NormalBlending" ];

	this.mFlipState = Particle.FlipState.FLIP_FORWARD;
	var currentRatio = 1.;//(aTexture.image[0].width / aTexture.image[0].height);
	if(this.mRatio != currentRatio)
	{
		this.mRatio = currentRatio;
		this.geometry = new THREE.PlaneGeometry( TEXTURE_SIZE * this.mRatio, TEXTURE_SIZE);
	}
}

Particle.prototype.SetColor = function(r, g, b)
{
	this.mColor.setRGB(r, g, b);
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

/*
 * Returns whether a given point is visible onscreen or not.
 * TODO: consider the z position.
 */
// bool Particle::isOffscreen()
// {
// 	return ( ( mPosition.x < -getWindowWidth() * (mLimit - 1.f) ) || ( mPosition.x > getWindowWidth() * mLimit) || ( mPosition.y < -getWindowHeight() * (mLimit - 1.f) ) || ( mPosition.y > getWindowHeight() * mLimit ) || (mPosition.z < MIN_Z) || (mPosition.z > MAX_Z));
// }

Particle.prototype.HasTexture = function(aShow)
{
	return (this.materials.map != null);
}
