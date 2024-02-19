

function ButtonFlying(aCanvas) 
{
	var lTexture = new THREE.Texture( aCanvas, THREE.UVMapping );
	lTexture.needsUpdate = true;
	var size = 0.25 * window.innerWidth;

	var parameters = { map:lTexture, transparent:true };
	var materialPend = new THREE.MeshBasicMaterial( parameters );
	materialPend.depthTest = true;
	var ratio = aCanvas.width / aCanvas.height;
	var geometryPend = new THREE.PlaneGeometry( size, size / ratio );
	this.mesh = new THREE.Mesh( geometryPend, materialPend );
	this.mesh.doubleSided = false;
	this.mesh.rotation.x = 0.5 * Math.PI;

	this.mesh.position = RelativeToPixel(new THREE.Vector3());
	scene.add(this.mesh);

	this.speed = new THREE.Vector3();
	this.position = new THREE.Vector3();
	this.goAway = false;
}

/*
 * Update camera.
 */
ButtonFlying.prototype.Update = function(aTimeInterval)
{
	var targetPosition = new THREE.Vector3();
	targetPosition.x -= 0.5;
	targetPosition.y += 0.1;
	if(this.goAway)
	{
		this.speed.x -= aTimeInterval;
	}
	else
	{
		this.speed.addSelf(MinusMult(targetPosition, this.position, aTimeInterval));
	}
	this.speed.x += myRandom() * aTimeInterval * 0.7;
	this.speed.y += myRandom() * aTimeInterval * 0.7;
	this.speed.z += myRandom() * aTimeInterval * 0.3;

	this.speed.multiplyScalar(0.97);
	this.position.addSelf(this.speed.clone().multiplyScalar(aTimeInterval));
	var cameraPosition = cameraManager.GetPosition();
	cameraPosition.z -= 0.4;
	var lposition = cameraPosition.addSelf(this.position);
	this.mesh.position = RelativeToPixel(lposition);
}

ButtonFlying.prototype.GoAway = function()
{
	this.goAway = true;
}
