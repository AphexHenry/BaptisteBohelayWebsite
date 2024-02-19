
var FLIP_ROTATION_SPEED = 15.;
var CONSERVATION_OF_VELOCITY = 0.95;
var TEXTURE_SIZE = 300;
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

var SIZE_PART_IDLE = 0.1;
var sIndex = 0;
var mParticleToShow = 0;

function Particle(aPosition) 
{
	this.mPosition = aPosition;
	this.mVelocity = new THREE.Vector3(0., 0., 0. );
	this.mLastPosition = this.mPosition.clone();
	this.mRotation = new THREE.Vector3(0, 0 , 0);
	this.mRotationSpeed = new THREE.Vector3(0, 0 , 0);
	this.mSize = SIZE_PART_IDLE;
	this.mSizeSpeed = 0.;
	this.mSizeIdle = SIZE_PART_IDLE;
	this.mLimit;
	this.mAlpha = 1.;

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
	this.mParticleState[0] = new BehaviourIntro(this, aPosition);
	this.mParticleState[1] = new BehaviourMirror(this, aPosition);

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
	//materials.transparent = true;

	this.geometry = new THREE.CubeGeometry( TEXTURE_SIZE, TEXTURE_SIZE * 0.1, TEXTURE_SIZE );
	this.mRatio = 1.;
	//this.geometry.doubleSided = false;

	this.mesh = null;//new THREE.Mesh( this.geometry, this.materials );

	// parameters = { color: 0xff1100, envMap: aTextureCube, shading: THREE.FlatShading };

	this.materials = null;//new THREE.MeshBasicMaterial( parameters );
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

	// // Set the canera security zone behaviour, to ensure no particle will be to close form the camera.
 //    this.mImmunityToCamTimer -= aTimeInterval;
	// var lDistanceSecurity = cameraManager.mSecurityDistance;
	// if(!this.mIsShow && (this.mImmunityToCamTimer < 0.))
	// {
	// 	var lCameraPosition = cameraManager.camera.position.clone();
	// 	var lDistance = this.mPosition.distanceTo(lCameraPosition);
	// 	if(lDistance < lDistanceSecurity)
	// 	{
	// 		var lCoeff = Math.max(0.05, lDistance / lDistanceSecurity);
	// 		if(lCameraPosition.x - this.mPosition.x < 0.)
	// 		{
	// 			this.mVelocity.x *= 0.5;
	// 			this.mVelocity.x += 100. / lCoeff;
	// 		}
	// 		else
	// 		{
	// 			this.mVelocity.x *= 0.5;
	// 			this.mVelocity.x -= 100. / lCoeff;
	// 		}
			
	// 		if(lCameraPosition.y - this.mPosition.y < 0.)
	// 		{
	// 			this.mVelocity.y *= 0.5;
	// 			this.mVelocity.y += 150. / lCoeff;
	// 		}
	// 		else
	// 		{
	// 			vmVelocity.y *= 0.5;
	// 			this.mVelocity.y -= 150. / lCoeff;
	// 		}
			
	// 		if(lCameraPosition.z - this.mPosition.z < 0.)
	// 		{
	// 			this.mVelocity.z *= 0.5;
	// 			this.mVelocity.z += 100. / lCoeff;
	// 		}
	// 		else
	// 		{
	// 			this.mVelocity.z *= 0.5;
	// 			this.mVelocity.z -= 100. / lCoeff;
	// 		}
	// 		this.mRotation.x = fMod(this.mRotation.x, Math.PI * 2.);
	// 		this.mRotation.y = fMod(this.mRotation.y, Math.PI * 2.);
	// 		this.mRotation.z = fMod(this.mRotation.z, Math.PI * 2.)
	// 		this.mRotationSpeed.addSelf(this.mRotation.clone().multiplyScalar(-10. * aTimeInterval));
	// 		mAlpha = (lCoeff < 0.7) ? lCoeff * lCoeff * lCoeff: 1.;
	// 	}
	// 	// else
	// 	// {
	// 	// 	//mAlpha = 1.f;
	// 	// }
	// }

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
	
	this.mRotation.addSelf(this.mRotationSpeed.clone().multiplyScalar(aTimeInterval));
	this.mRotationSpeed.multiplyScalar(CONSERVATION_OF_VELOCITY);
	if(this.mesh != null)
	{
		this.mesh.position =  RelativeToPixel(this.mPosition);
		this.mesh.rotation.x = this.mRotation.x;
		this.mesh.rotation.y = this.mRotation.y + 0.5 * Math.PI;
		this.mesh.rotation.z = 0. + 0.5 * Math.PI;
		this.mesh.scale.x = (this.mFlipRotation * this.mSize *  awidth / TEXTURE_SIZE);
		this.mesh.scale.y = this.mSize *  awidth / TEXTURE_SIZE;
		this.mesh.scale.z = this.mSize *  awidth / TEXTURE_SIZE;
		this.mesh.doubleSided = true;
		this.mesh.updateMatrix();
		
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
	if(this.materials == null)
	{
		this.materials = this.materialsNext;
		this.mesh = new THREE.Mesh( this.geometry, this.materials );

		this.mesh.scale.x = 1;
		this.mesh.scale.y = 1;
		this.mesh.scale.z = 1;
		this.mesh.rotation.x = 0. * Math.PI;//Math.random() * Math.PI;//Math.random() * Math.PI;
		this.mesh.rotation.y = 0.5 * Math.PI;
		this.mesh.rotation.z = 0.5 * Math.PI;

		this.mesh.matrixAutoUpdate = false;
		if(enableShadow)
		{
			this.mesh.castShadow = true;
			this.mesh.receiveShadow = true;
		}
		this.mesh.updateMatrix();
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
	parameters = { color: 0xff1100, envMap: aTexture, shading: THREE.FlatShading };

	this.materialsNext = new THREE.MeshBasicMaterial( parameters );
	this.materialsNext.color.setRGB( 1., 1., 1.);

	this.mFlipState = Particle.FlipState.FLIP_FORWARD;
	var currentRatio = 1.;//(aTexture.image[0].width / aTexture.image[0].height);
	if(this.mRatio != currentRatio)
	{
		this.mRatio = currentRatio;
		this.geometry = new THREE.PlaneGeometry( TEXTURE_SIZE * this.mRatio, TEXTURE_SIZE);
	}
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
