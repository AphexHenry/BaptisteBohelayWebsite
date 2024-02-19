
var sButtons;

var TRANSITION_ENUM =
{
	TRANSITION_NONE: -1,
	TRANSITION_VIDEO_INIT:0,
	TRANSITION_VIDEO: 1
}

function TransitionVideo(aCanvas) 
{
	this.CoeffNoise = 0.;
	FadeTo(0, 1.5);
	this.WaitToFade = true;
	this.newFloor;
	this.HitFloorCount = 0;
	this.IsNextPage = false;
	this.stateTransition = TRANSITION_ENUM.TRANSITION_NONE;
	this.projector = new THREE.Projector();
}

/*
 * Update camera.
 */
TransitionVideo.prototype.Update = function(aTimeInterval)
{
	if(this.WaitToFade)
	{
		if(IsFaded())
		{
			FadeTo(1, 1);
			environment.Clear();
			this.WaitToFade = false;
			// cameraPosWhenTouch.z = -5;
			cameraPosWhenTouch.z = 5;
			cameraPosWhenTouch.y += 3;
			cameraManager.SetPositionPixel(RelativeToPixel(new THREE.Vector3(sTimerSlugMove, cameraPosWhenTouch.y, cameraPosWhenTouch.z)));
			

			var canvas = document.createElement('canvas');
			var ctxt = canvas.getContext('2d');
			var imageReflectionGradient = ctxt.createLinearGradient( 0, 0, 0, canvas.height );
			imageReflectionGradient.addColorStop( 0.2, 'rgba(0, 0, 0, 1)' );
			imageReflectionGradient.addColorStop( 1, 'rgba(0, 0, 0, 0.6)' );
			ctxt.fillStyle = imageReflectionGradient;
			ctxt.fillRect( 0, 0, canvas.width, canvas.height );
		
			var parameters = { map:new THREE.Texture( canvas, THREE.UVMapping ), transparent:true };
			var materialPend = new THREE.MeshBasicMaterial( parameters );
			materialPend.depthTest = true;
			var size = 0.1 * window.innerWidth;
			var lHeight = getHeight() * 30;
			var geometryPend = new THREE.PlaneGeometry( getWidth() * 30, lHeight);
			this.newFloor = new THREE.Mesh( geometryPend, materialPend );
			this.newFloor.doubleSided = false;

			var posPart = particles[particles.length - 1].mPosition;
			this.newFloor.position = RelativeToPixel(new THREE.Vector3(0, posPart.y, posPart.z));
			this.newFloor.position.y -= lHeight * 0.5;
			this.newFloor.rotation.x = 0.5 * Math.PI;
			
			scene.add(this.newFloor);

			sButtons.push(new Button(GetTextInBox("monolith rain", 960, 540, 300, 45), new THREE.Vector3(-0.4,-0.27,-0.4), 0.17, 1.));

			for(var i = 0; i < sButtons.length; i++)
			{
				sButtons[i].FadeIn();
			}

			// colorClear.r += 0.35;
			// colorClear.g -= 0.2;
			// colorClear.b -= 0.3;
			renderer.setClearColor ( colorClearSecond, 1.0 );

			SetComposer(3);
		}
	}

	switch(this.stateTransition)
	{
		case TRANSITION_ENUM.TRANSITION_VIDEO_INIT:
			// world
			var s = 100;

			var cube = new THREE.PlaneGeometry( s, s * 200);
			var material = new THREE.MeshBasicMaterial( { ambient: 0x333333, color: 0xffffff, specular: 0xffffff, shininess: 50, perPixel: true } );
			this.mSquareList = [];
			for ( var i = 0; i < 1000; i ++ ) 
			{
				var mesh = new THREE.Mesh( cube, material );
				var vertex = new THREE.Vector3();
				s = Math.random() * Math.PI * 2.;
				r = Math.random() * 1000;

				mesh.position.x = Math.random() * 25000;
				mesh.position.y = 30000 + Math.sqrt(Math.random()) * 700000;
				mesh.position.z = myRandom() * 1000 + particles[0].mesh.position.z;
				mesh.position.x += cameraManager.GetPositionPixel().x;
				var anglex = Math.random() * Math.PI * 0.1;
				mesh.rotation.x = Math.PI * 0.5 + anglex;
				mesh.rotation.y = 0.;// + Math.PI * 0.5;
				mesh.rotation.z = Math.random() * Math.PI * .2;

				//mesh.matrixAutoUpdate = false;
				mesh.updateMatrix();
				this.mSquareList.push({mesh:mesh, hit:false});
				scene.add( mesh );
			}
			this.stateTransition = TRANSITION_ENUM.TRANSITION_VIDEO;
			break;
		case TRANSITION_ENUM.TRANSITION_VIDEO:
			if(!this.WaitToFade)
			{
				for(var i = 0; i < this.mSquareList.length; i++)
				{
					this.mSquareList[i].mesh.position.y -= 100000. * aTimeInterval;
					this.mSquareList[i].mesh.position.x += Math.cos(this.mSquareList[i].mesh.rotation.x);
					if(this.mSquareList[i].mesh.position.y < 0)
					{
						if(!this.mSquareList[i].hit)
						{
							this.mSquareList[i].hit = true;
							this.CoeffNoise = .5;
							this.HitFloorCount++;
							if(this.HitFloorCount > this.mSquareList.length * 0.7)
							{
								this.SwitchNextState();
							}
						}
						this.mSquareList[i].mesh.position.y = Math.random() * 200;
					}
				}
			}
			break;
		default:
			break;
	}

	if(!this.WaitToFade)
	{
		cameraPosWhenTouch.z += 0.3 * aTimeInterval;
		cameraPosWhenTouch.z = Math.min(20., cameraPosWhenTouch.z);
		for(var i = 0; i < sButtons.length; i++)
		{
			sButtons[i].Update(aTimeInterval);
		}
		this.newFloor.position.x = cameraManager.GetPositionPixel().x;
	}
	this.CoeffNoise -= 3 * aTimeInterval;
	this.CoeffNoise = Math.max(this.CoeffNoise, 0.);
	cameraManager.SetNoise(this.CoeffNoise);

}

TransitionVideo.prototype.MouseDown = function(aPosition)
{
	aPosition = RelativeToPixel(aPosition);

	var vector = new THREE.Vector3( ( aPosition.x / window.innerWidth ) * 2 - 1, - ( aPosition.y / getHeight() ) * 2 + 1, 0.5 );
	var camera = cameraManager.GetCamera();
	this.projector.unprojectVector( vector, camera );

	var ray = new THREE.Ray( camera.position, vector.subSelf( camera.position ).normalize() );

	var intersects = ray.intersectObjects( sButtonMeshArray );

	for(var j = 0; j < intersects.length; j++ )
	{				
		for(var i = 0; i < sButtons.length; i++)
		{
			if(intersects[j].object === sButtons[i].mesh)
			{
				this.stateTransition = TRANSITION_ENUM.TRANSITION_VIDEO_INIT;
				for(var k = 0; k < sButtons.length; k++)
				{
					sButtons[k].FadeOut();
					sButtons[k].Kill();
				}
			}
		}
	}
}

TransitionVideo.prototype.MouseMove = function(aPosition)
{
	if(this.stateTransition != TRANSITION_ENUM.TRANSITION_NONE)
		return;
	aPosition = RelativeToPixel(aPosition);

	var vector = new THREE.Vector3( ( aPosition.x / window.innerWidth ) * 2 - 1, - ( aPosition.y / getHeight() ) * 2 + 1, 0.5 );
	var camera = cameraManager.GetCamera();
	this.projector.unprojectVector( vector, camera );

	var ray = new THREE.Ray( camera.position, vector.subSelf( camera.position ).normalize() );

	var intersects = ray.intersectObjects( sButtonMeshArray );

	// for(var j = 0; j < intersects.length; j++ )
	// {				
		if(intersects.length > 0)
		{
			for(var i = 0; i < sButtons.length; i++)
			{
				if(intersects[0].object === sButtons[i].mesh)
				{
					sButtons[i].SetAimed(true);
				}
				else
				{
					sButtons[i].SetAimed(false);
				}
			}
		}
		else
		{
			for(var i = 0; i < sButtons.length; i++)
			{
				sButtons[i].SetAimed(false);
			}
		}
	// }
}

TransitionVideo.prototype.SwitchNextState = function()
{
	if(!this.IsNextPage)
	{
		FadeTo(0, 1.);
		setTimeout(function() {document.location.href += "../videos";}, 1250);
		this.IsNextPage = true;
	}
}
