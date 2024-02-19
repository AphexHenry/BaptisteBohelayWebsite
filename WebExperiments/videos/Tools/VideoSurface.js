

var playImage = document.createElement('img');
playImage.src = "textures/videos/ButtonPlay.png"
var sVideoSurfaceMeshList = [];

function VideoSurface(path, aPosition, aWidth, aHeight) 
{
	var mult = 960/ aWidth;
	aWidth 	*= mult;
	aHeight *= mult;

	this.video = document.createElement('video');
	this.video.type = 'video/mp4; codecs="avc1.42E01E, mp4a.40.2"';
	this.video.src  = path;
	// this.video.autoplay = "autoplay";
	this.video.loop = true;
	this.video.volume = 0;
	//document.body.appendChild(this.video);

	this.image = document.createElement( 'canvas' );
	this.image.width = aWidth;
	this.image.height = aHeight;

	this.imageContext = this.image.getContext( '2d' );
	this.imageContext.fillStyle = '#000000';
	this.imageContext.fillRect( 0, 0, aWidth, 540 );

	this.texture = new THREE.Texture( this.image );
	this.texture.minFilter = THREE.LinearFilter;
	this.texture.magFilter = THREE.LinearFilter;

	var material = new THREE.MeshBasicMaterial( { map: this.texture, overdraw: true } );
	material.transparent = true;

	this.imageReflection = document.createElement( 'canvas' );
	this.imageReflection.width = aWidth;
	this.imageReflection.height = aHeight;

	this.imageReflectionContext = this.imageReflection.getContext( '2d' );

	this.imageReflectionContext.fillRect( 0, 0, aWidth, aHeight );

	this.imageReflectionGradient = this.imageReflectionContext.createLinearGradient( 0, 0, 0, aHeight );
	this.imageReflectionGradient.addColorStop( 0.2, 'rgba(40, 40, 40, 1)' );
	this.imageReflectionGradient.addColorStop( 1, 'rgba(40, 40, 40, 0.8)' );

	this.textureReflection = new THREE.Texture( this.imageReflection );
	this.textureReflection.minFilter = THREE.LinearFilter;
	this.textureReflection.magFilter = THREE.LinearFilter;

	var materialReflection = new THREE.MeshBasicMaterial( { map: this.textureReflection, overdraw: true } );
	materialReflection.transparent = true;

	var plane = new THREE.PlaneGeometry( aWidth, aHeight, 4, 4 );

	this.mAngle = Math.PI * Math.random();
	this.mesh = new THREE.Mesh( plane, material );
	this.mesh.position = aPosition;
	this.mesh.position.y = aHeight * 1.5 * 0.5;
	this.mesh.rotation.x = Math.PI / 2;
	this.mesh.rotation.z = this.mAngle;
	this.mesh.scale.x = this.mesh.scale.y = this.mesh.scale.z = 1.5;
	this.mesh.doubleSided = true;
	scene.add(this.mesh);
	sVideoSurfaceMeshList.push(this.mesh);

	var lmesh = new THREE.Mesh( plane, materialReflection );
	lmesh.position = aPosition.clone();
	lmesh.position.y = -aHeight * 1.5 * 0.5;
	lmesh.rotation.x = - Math.PI / 2 ;
	lmesh.rotation.z = -this.mAngle;
	lmesh.scale.x = lmesh.scale.y = lmesh.scale.z = 1.5;
	lmesh.doubleSided = true;
	scene.add( lmesh );
	sVideoSurfaceMeshList.push(lmesh);

	this.indexLetter = 0;
	this.aimed = false;
	this.play = false;
	this.timerLoad = 0;
	this.alphaPLay = 0.;

	this.drawFirstImage = false;
}

/*
 * Update.
 */
VideoSurface.prototype.Update = function(aTimeInterval)
{
	if(this.mesh.position.distanceTo(cameraManager.GetPositionPixel()) < this.mesh.scale.x * this.image.width * 0.4)
	{
		this.mesh.material.opacity *= 0.97;
	}
	else
	{
		this.mesh.material.opacity += aTimeInterval;
		this.mesh.material.opacity = Math.min(this.mesh.material.opacity, 1.);
	}

		if ( this.video.readyState === this.video.HAVE_ENOUGH_DATA ) 
		{
			if(this.play || !this.drawFirstImage)
			{
			 	this.imageContext.drawImage( this.video, 0, 0, this.image.width, this.image.height );

			 	this.drawFirstImage = true;
			 	this.alphaPLay = 0.;
				if ( this.texture ) this.texture.needsUpdate = true;
				if ( this.textureReflection ) this.textureReflection.needsUpdate = true;
			}
			else if(this.aimed)
			{
				this.image.width = this.image.width;
				this.imageContext.drawImage( this.video, 0, 0, this.image.width, this.image.height );
				var size = this.image.width / 5;
				this.alphaPLay += aTimeInterval * 0.5;
				this.imageContext.globalAlpha = 0.3 + 0.7 * Math.abs(Math.sin(this.alphaPLay));
				this.imageContext.drawImage(playImage, (this.image.width - size) * 0.5, (this.image.height - size) * 0.5, size, size);
				if ( this.texture ) this.texture.needsUpdate = true;
				if ( this.textureReflection ) this.textureReflection.needsUpdate = true;
				this.imageContext.globalAlpha = 1.;
			}
		}
		else
		{
			this.timerLoad += aTimeInterval;
			if(this.timerLoad > 1.7)
			{
				this.image.width = this.image.width;
				this.imageContext.fillStyle = '#000000';
				this.imageContext.fillRect( 0, 0, this.image.width, this.image.height );
				this.imageContext.drawImage(imageLoad[this.indexLetter], 0, 0, this.image.width, this.image.height);
				this.timerLoad = 0;
				this.indexLetter++;
				this.indexLetter = this.indexLetter % imageLoad.length;
			}	

			if ( this.texture ) this.texture.needsUpdate = true;
			if ( this.textureReflection ) this.textureReflection.needsUpdate = true;
		}
	// }
	// else
	// {
	// 	if(this.aimed)
	// 	{
	// 		this.indexNoise++;
	// 		this.indexNoise = this.indexNoise % noiseImages.length;
	// 		this.imageContext.drawImage(noiseImages[this.indexNoise], 0, 0, this.image.width, this.image.height );
	// 		if ( this.texture ) this.texture.needsUpdate = true;
	// 		if ( this.textureReflection ) this.textureReflection.needsUpdate = true;
	// 	}
	// }

	this.imageReflectionContext.drawImage( this.image, 0, 0 );
	this.imageReflectionContext.fillStyle = this.imageReflectionGradient;
	this.imageReflectionContext.fillRect( 0, 0, this.image.width, this.image.height );
}

VideoSurface.prototype.GetMesh = function()
{
	return this.mesh;
}

VideoSurface.prototype.GetWatch = function()
{
	var returnPosition = undefined;
	if(this.play)
	{
		returnPosition = this.mesh.position.clone();
		var distance = 1500;
		returnPosition.z -= distance * Math.cos(-this.mAngle + Math.PI);
		returnPosition.x -= distance * Math.sin(-this.mAngle + Math.PI);
		returnPosition.y = 350;
	}
	
	return returnPosition;
}

VideoSurface.prototype.SetTouched = function(touched)
{
	this.play = !this.play;
	if(this.play)
	{
		this.video.play();
	}
	else
	{
		this.video.pause();
		this.aimed = false;
	}

	return this.play;
}

VideoSurface.prototype.GetColorCenter = function()
{
    var p = this.imageContext.getImageData(Math.floor(this.image.width / 2), Math.floor(this.image.height / 2), 1, 1).data; 
    return new THREE.Color().setRGB(p[0] / 255, p[1] / 255, p[2] / 255);
}

VideoSurface.prototype.SetAimed = function(touched)
{
	if(this.aimed && !touched)
	{
		this.drawFirstImage = false;
	}
	this.aimed = touched;

}

VideoSurface.prototype.Play = function()
{
	this.play = true;
}

VideoSurface.prototype.Stop = function()
{
	this.play = false;
	this.video.pause();
}
