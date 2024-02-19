
var sButtonMeshArray = [];

function Button(aCanvas, aPosition, aSize, aSpeedFade) 
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
	this.mesh.scale.x = this.mesh.scale.y = this.mesh.scale.z = aSize * getWidth() / size;
	this.mesh.rotation.x = 0.5 * Math.PI;
	this.mesh.material.opacity = 0;

	scene.add(this.mesh);
	sButtonMeshArray.push(this.mesh);

	this.size = this.mesh.scale.x;
	this.position = aPosition.clone();
	this.fadeIn = false;
	this.speedFade = aSpeedFade;
	this.hasToBekilled = false;
	this.aimed = false;
}

/*
 * Update camera.
 */
Button.prototype.Update = function(aTimeInterval)
{
	if(!this.mesh)
		return;

	if(this.fadeIn)
	{
		this.mesh.material.opacity += aTimeInterval * this.speedFade;
		this.mesh.material.opacity = Math.min(1, this.mesh.material.opacity);
	}
	else
	{
		this.mesh.material.opacity -= aTimeInterval * this.speedFade;
		if(this.mesh.material.opacity < 0.01)
		{
			this.mesh.material.visible = false;
			this.mesh.material.opacity = Math.max(0, this.mesh.material.opacity);
			if(this.hasToBekilled)
			{
				scene.remove(this.mesh);
				renderer.deallocateTexture( this.mesh.material.map );
				renderer.deallocateObject( this.mesh );
				this.mesh = undefined;
				return;
			}
		}
	}

	this.mesh.scale.x = this.mesh.scale.y = this.mesh.scale.z = this.aimed ? this.size * 1.1 : this.size;
	this.mesh.position = RelativeToPixel(cameraManager.GetPosition().addSelf(this.position));
}

Button.prototype.FadeIn = function()
{
	this.fadeIn = true;
	this.mesh.material.visible = true;
}

Button.prototype.FadeOut = function()
{
	this.fadeIn = false;
}

Button.prototype.SetAimed = function(aAim)
{
	this.aimed = aAim;
}

Button.prototype.Kill = function()
{
	this.hasToBekilled = true;
}