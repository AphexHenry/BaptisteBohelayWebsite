
var NUM_TREE = 20;

function Environment() 
{
	this.mTreeArray = new Array();
	this.mGroundArray = new Array();
	var lTexture = new THREE.Texture( TEXTURE_TREE, THREE.UVMapping );
	lTexture.needsUpdate = true;
	var size = 0.1 * window.innerWidth;


	for(var i = 0; i < NUM_TREE; i++)
	{
		var parameters = { map:lTexture, transparent:true };
		var materialPend = new THREE.MeshBasicMaterial( parameters );
		materialPend.depthTest = true;
		var ratio = (Math.random() * 0.2 + 0.8) * TEXTURE_TREE.width / TEXTURE_TREE.height;
		var geometryPend = new THREE.PlaneGeometry( size, size / ratio );
		var mesh = new THREE.Mesh( geometryPend, materialPend );
		mesh.doubleSided = false;
		mesh.up = new THREE.Vector3(0,0,1);

		mesh.scale.x = mesh.scale.y = mesh.scale.z = 7;
		var sizeH = mesh.scale.x * (size / window.innerWidth) / ratio
		var x = 2. + Math.random() * 2.;
		x = (Math.random() > 0.5) ? -x : x;
		z = Math.random() > 0.1 ? set.DISTANCE_SLUG * 1.5 - Math.random() : set.DISTANCE_SLUG * 0.6 + Math.random() * 0.5;
		mesh.position = RelativeToPixel(new THREE.Vector3(x, FLOOR + sizeH,  z));
		mesh.rotation.x = 0.5 * Math.PI;
		mesh.rotation.y = (Math.random() - 0.5) * 0.1;//0;//0.5 * Math.PI;
		mesh.rotation.z = 0;//0.5 * Math.PI;
		scene.add(mesh);
		this.mTreeArray.push(mesh);
	}

	this.setGround();
}

Environment.prototype.setGround = function()
{
	var lTexture = new THREE.Texture( TEXTURE_GROUND, THREE.UVMapping );
	var scaleGround = 15.;
	var ratio = TEXTURE_GROUND.width / TEXTURE_GROUND.height;
	this.sizeGroundX = scaleGround * 0.1 * ratio;
	lTexture.needsUpdate = true;
	for(var i = 0; i < 3; i++)
	{
		var parameters = { map:lTexture, transparent:true };
		var materialPend = new THREE.MeshBasicMaterial( parameters );
		materialPend.depthTest = true;
		var size = 0.1 * window.innerWidth;
		var geometryPend = new THREE.PlaneGeometry( size * ratio, size );
		var mesh = new THREE.Mesh( geometryPend, materialPend );
		mesh.doubleSided = false;
		mesh.up = new THREE.Vector3(0,0,1);

		mesh.scale.x = mesh.scale.y = mesh.scale.z = scaleGround;
		var sizeH = mesh.scale.x * (size / window.innerWidth) * .7;
		mesh.position = RelativeToPixel(new THREE.Vector3(i * this.sizeGroundX, FLOOR + sizeH, -0.5));
		mesh.rotation.x = 0.5 * Math.PI;
		
		scene.add(mesh);
		this.mGroundArray.push(mesh);
	}

	for(var i = 0; i < 4; i++)
	{
		var parameters = { map:lTexture, transparent:true };
		var materialPend = new THREE.MeshBasicMaterial( parameters );
		materialPend.depthTest = true;
		var size = .3 * window.innerWidth;
		var geometryPend = new THREE.PlaneGeometry( size * ratio, size );
		var mesh = new THREE.Mesh( geometryPend, materialPend );
		mesh.doubleSided = false;
		mesh.up = new THREE.Vector3(0,0,1);

		mesh.scale.x = mesh.scale.y = mesh.scale.z = scaleGround;
		var sizeH = mesh.scale.x * (size / window.innerWidth) * .5;
		mesh.position = RelativeToPixel(new THREE.Vector3(i * this.sizeGroundX, FLOOR + sizeH, -2.5));
		mesh.rotation.x = 0.5 * Math.PI;
		mesh.material.opacity = 0.6;
		
		scene.add(mesh);
		this.mGroundArray.push(mesh);
	}
}

/*
 * Update camera.
 */
Environment.prototype.Update = function(aTimeInterval)
{
	var cameraPosition = cameraManager.GetPosition();
	var posElement;
	var limit = 0;
	for(var i = 0; i < this.mGroundArray.length; i++)
	{
		limit = 20. * this.mGroundArray[i].boundRadius / 500;
		posElement = PixelToRelative(this.mGroundArray[i].position).x;
		if((cameraPosition.x - posElement) > limit)
		{
			this.mGroundArray[i].position.x = cameraManager.GetPositionPixel().x + (2. + this.sizeGroundX) * window.innerWidth;
		}
	}

	for(var i = 0; i < this.mTreeArray.length; i++)
	{
		posElement = PixelToRelative(this.mTreeArray[i].position).x;
		limit = 20.;
		if((cameraPosition.x - posElement) > limit)
		{
			this.mTreeArray[i].position.x = cameraManager.GetPositionPixel().x + 5. * window.innerWidth + Math.random();
		}
	}
}

Environment.prototype.Clear = function()
{
	for(var i = 0; i < this.mGroundArray.length; i++)
	{
		scene.remove(this.mGroundArray[i]);
		renderer.deallocateTexture( this.mGroundArray[i].material.map );
	}
	this.mGroundArray = [];

	for(var i = 0; i < this.mTreeArray.length; i++)
	{
		scene.remove(this.mTreeArray[i]);
		renderer.deallocateTexture( this.mTreeArray[i].material.map );
	}

	this.mTreeArray = [];
}
