// Text “card” particle: circles on main particle; copy on TargetObject.info (same pattern as ParticleCircleNavigate).
function ParticleTextDescription(aPosition, aSizeCoeff)
{
	var sSocialTarget = false;
	var sSocialRadius = 0;

	var infoText = [
		{ string: "Baptiste — maker & tinkerer", size: 6.2 },
		{ string: "Programming · interactivity · sound · motion", size: 4.4 },
		{ string: "", size: 3.0 },
		{ string: "I love writing clear, expressive code and", size: 4.0 },
		{ string: "building things you can poke, hear, and", size: 4.0 },
		{ string: "watch move — playful systems with feeling.", size: 4.0 }
	];

	// SetTextInCanvas uses Y ~= 1.6 * cumulative(size) (≈5–20) while arcs use r ≈ sRayCircle (≈0.3). Same space → text drew far off-screen below.
	// Shrink that layout into the particle’s unit square so it sits under the circle.
	var programDescriptionText = function ( context )
	{
		var k = 0.028;
		var y0 = -(sRayCircle + 0.06);
		context.save();
		context.translate(-0.78, y0);
		context.scale(k, k);
		SetTextInCanvas(infoText, context.canvas);
		context.restore();
	};

	programSocial = function ( context )
	{
		context.lineWidth = 0.015;
		context.beginPath();
		context.arc( 0, 0, sRayCircle * 1., 0, PI2, true );
		context.closePath();
		context.stroke();

		sSocialRadius += sSocialTarget ? 0.01 : -0.01;
		sSocialRadius = myClamp(sSocialRadius, 0., sRayCircle);

		if(sSocialRadius < sRayCircle * 0.99)
		{
			context.beginPath();
			context.arc( 0, 0, sSocialRadius * 1., 0, PI2, true );
			context.closePath();
			context.stroke();
		}
	}

	var lTarget = { name: "about" };
	this.particle = new ParticleCircleNavigate(aPosition, lTarget);
	this.particle.material.program = programSocial;
	this.particle.scale.x *= 3.;
	this.particle.scale.y *= 3.;

	this.particle.TargetObject.info.material.program = programDescriptionText;
	var infoScaleBoost = 10.65;
	this.particle.TargetObject.info.scale.x *= infoScaleBoost;
	this.particle.TargetObject.info.scale.y *= infoScaleBoost;

	// create the mesh's material
	this.plane = new THREE.Mesh( new THREE.PlaneGeometry( this.particle.scale.x * 1.5, this.particle.scale.x * 1.5, 8, 8 ), new THREE.MeshBasicMaterial( { color: 0x000000, opacity: 0.25, transparent: true, wireframe: true } ) );
	this.plane.geometry.applyMatrix( new THREE.Matrix4().makeRotationX( Math.PI / 2 ) );
	this.plane.visible = false;
	this.plane.position = aPosition.clone();
	scene.add( this.plane );

	this.info = this.particle.GetInfo();

	this.touched = false;
}
