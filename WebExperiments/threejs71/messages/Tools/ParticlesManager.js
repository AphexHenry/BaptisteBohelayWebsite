
function ParticlesManager() {
	this.particles = [];
	this.nextRangeId = 0;
}

ParticlesManager.prototype.init = function() {
	var xgrid = 14,
	ygrid = 9,
	zgrid = 14;
	var lCoeffDist = ygrid * zgrid * xgrid;

	this.particles = [];

	for (var i = 0; i < xgrid; i ++ )
	for (var j = 0; j < ygrid; j ++ )
	for (var k = 0; k < zgrid; k ++ ) {

		x = 200 * ( i - xgrid/2 ) / lCoeffDist;
		y = 200 * ( j - ygrid/2 ) / lCoeffDist;
		z = 200 * ( k - zgrid/2 ) / lCoeffDist;

		this.particles.push(new Particle(new THREE.Vector3(x, y, z)));
	}
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
	var lTexture = sCardManager.GetTexture();

	for(var i = 0; i < this.particles.length; i++) {
		this.particles[i].Update(aTimeInterval, awidth);

		if(lTexture && this.IsNextChange(i)) {
			this.particles[ i ].SetTexture(lTexture);
		}
	}

	if(lTexture) {
		this.nextRangeId++;
	}

	this.particles[0].GlobalUpdate(aTimeInterval);
}

ParticlesManager.prototype.IsNextChange = function(aIndex) {
	var lCardCount = sCardManager.GetCardCound();
	
	return ((aIndex + this.nextRangeId) % lCardCount) == 0;
}

ParticlesManager.prototype.SetTextureAll = function(aTexture) {
	// for (var j = 0; j < this.particles.length; j ++ ) 
	// {
	// 	 this.particles[ j ].SetTexture(aTexture);
	// }
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


