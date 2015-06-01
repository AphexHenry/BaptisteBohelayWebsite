
function ParticlesManager() {
	this.particles = [];
	this.nextRangeId = 0;
	this.textureEnvMap = null;
	this.particleShow = null;
	this.mTimerShow = 8;
	this.mTimeBetweenShow = 15;
	this.mShowList = [];
}

ParticlesManager.prototype.init = function() {

	var lCount = 250;

	this.particles = [];

	var lEnvMap = this.GetEnvMap("textures/cube/triber/");
	var lTexture = new THREE.Texture(lCanvas);
	var lTextures = [];
	for(var i = 0; i < sCardManager.GetCardCount(); i++) {
		var lCanvas = sCardManager.GetCanvas(i);
		var lTexture = new THREE.Texture(lCanvas);
		lTexture.needsUpdate = true;
		lTextures.push(lTexture);
	}

	for (var i = 0; i < lCount; i ++ )
	{
		x = 1. * (Math.random() - 0.5);
		z = 0.11 - Math.random() * 0.3;
		y = 1 * (Math.random() - 0.5);

		this.particles.push(new Particle(new THREE.Vector3(x, y, z), lTextures[i % lTextures.length], lEnvMap));
	}
}

ParticlesManager.prototype.GetEnvMap = function(aPath) {
	material_depth = new THREE.MeshDepthMaterial();

	var path = aPath;
	var format = '.jpg';
	var urls = [
		path + 'px' + format, path + 'nx' + format,
		path + 'py' + format, path + 'ny' + format,
		path + 'pz' + format, path + 'nz' + format
	];

	return THREE.ImageUtils.loadTextureCube( urls );

}

ParticlesManager.prototype.GetCount = function() {
	return this.particles.length;
}

/*
 * Update this particle.
 *
 * @param aTimeInterval: time elapsed since last update..
 */
ParticlesManager.prototype.Update = function(aTimeInterval, awidth) 
{
	this.mTimerShow += aTimeInterval;

	if(this.GetTimeBeforeNextShow() <= 0) {
		this.ShowNewParticle();
	}

	for(var i = 0; i < this.particles.length; i++) {
		this.particles[i].Update(aTimeInterval, awidth);

		//if(lTexture && this.IsNextChange(i)) {
		//	this.particles[ i ].SetTexture(lTexture, this.textureEnvMap);
		//}
	}

	this.particles[0].GlobalUpdate(aTimeInterval);
}

//ParticlesManager.prototype.IsNextChange = function(aIndex) {
//
//	return ((aIndex + this.nextRangeId) % lCardCount) == 0;
//}

ParticlesManager.prototype.ShowNewParticle = function() {
	this.mTimerShow = 0.;
	if(this.particleShow) {
		this.particleShow.SetShow(false);
	}

	// chose first one in the list or a random one.
	if(this.mShowList.length > 0) {
		this.particleShow = this.mShowList[0];
		this.mShowList.splice(0,1);
	}
	else {
		var lIndexPart = Math.floor(this.particles.length * Math.random());
		this.particleShow = this.particles[lIndexPart];
	}

	this.particleShow.SetShow(true);
}

ParticlesManager.prototype.SetCanvasFilled = function(aCanvas) {
	var lPartGroupChanged = [];
	for(var i = 0; i < this.particles.length; i ++) {
		if(this.particles[i].GetCanvas() === aCanvas) {
			this.particles[i].RefreshTexture();
			lPartGroupChanged.push(this.particles[i]);
		}
	}

	this.mShowList.push(lPartGroupChanged[Math.floor(Math.random(lPartGroupChanged.length))]);

}

ParticlesManager.prototype.SetTextureAll = function(aTexture) {
	this.textureEnvMap = aTexture;
}

/*
 * Set the state of the particles.
 *
 * @param aIndex: index to set.
 */
ParticlesManager.prototype.SwitchState = function(aIndex)
{
	for (var i = 0; i < this.particles.length; i ++ ) 
	{
		this.particles[ i ].SwitchState(index);
	}
	this.particles[0].PrepareTransition();
}

ParticlesManager.prototype.GetTimeBeforeNextShow = function() {
	return this.mTimeBetweenShow - this.mTimerShow;
}

ParticlesManager.prototype.GetParticleShow = function() {
	return this.particleShow;
}
