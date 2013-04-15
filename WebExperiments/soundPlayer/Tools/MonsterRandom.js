var rotationThree = 0;
var pickCircleRadius = 0;
var programMonster3 = function(context)
{
	rotationThree += 0.02;
    var centerX = 0.;
    var centerY = 0.;

    drawOneArmThree(context, Math.PI * 0, sDistanceTwo );
    drawOneArmThree(context, Math.PI * 0.25, sDistanceTwo );
    drawOneArmThree(context, Math.PI * 0.5, sDistanceTwo );
    drawOneArmThree(context, Math.PI * 0.75, sDistanceTwo );
    drawOneArmThree(context, Math.PI * 1., sDistanceTwo );
    drawOneArmThree(context, Math.PI * 1.25, sDistanceTwo );
    drawOneArmThree(context, Math.PI * 1.5, sDistanceTwo );
    drawOneArmThree(context, Math.PI * 1.75, sDistanceTwo );

    context.beginPath();
    context.arc( centerX, centerY, 0.3, 0, PI2, true );
    context.closePath();
    context.stroke();

    if(pickCircleRadius > 0.0001)
    {
	    context.beginPath();
	    context.arc( centerX, centerY, pickCircleRadius * pickCircleRadius * 0.3, 0, PI2, true );
	    context.closePath();
	    context.fill();
	}
}

var sCloseness = 0;
var sDistanceTwo = 0.5;
var positionClose = new THREE.Vector3();
function drawOneArmThree(context, angle, evolution)
{
	context.lineWidth = 0.01;
	var noiseElbow = Math.cos(-rotationThree + angle);
	var noiseHand = Math.sin(-rotationThree + angle * 2);

	size = evolution * 0.5;
	var evolution2NoPi = evolution * evolution * evolution * evolution;
	var evolution2 = evolution2NoPi * Math.PI;
	evolution = evolution * Math.PI;
	// context.setStrokeColor(0x0000f0);
	context.beginPath();
	var COS = Math.cos(angle + evolution + rotationThree);
	var SIN = Math.sin(angle + evolution + rotationThree);
	var posShoulderX =  COS * 0.3;
	var posShoulderY = SIN * 0.3;
	var posElbowX = posShoulderX + size * 0.5 * (COS * -Math.cos(evolution) + Math.sin(evolution + noiseElbow) * SIN);
	var posElbowY = posShoulderY + size * 0.5 * (SIN * -Math.cos(evolution) + Math.sin(evolution + noiseElbow) * COS);
	var posHandX = posShoulderX * (1. + 0.2 * evolution2) + size * (COS * -Math.cos(evolution2) + Math.sin(evolution2 + noiseHand) * SIN);
	var posHandY = posShoulderY * (1. + 0.2 * evolution2) + size * (SIN * -Math.cos(evolution2) + Math.sin(evolution2 + noiseHand) * COS);

	context.moveTo(posHandX, posHandY);
    context.quadraticCurveTo(posElbowX, posElbowY, posShoulderX, posShoulderY);
    context.stroke();

    context.beginPath();
    var rayLittle = 0.03 * evolution2NoPi;
    context.arc( posHandX + COS * rayLittle, posHandY+ SIN * rayLittle, rayLittle, 0, PI2, true );
    context.closePath();
    context.stroke();
}

var sCurrentRandomString = "random project";
var sIsMouseOnRandom = false;
var sIsPicking = false;
function MonsterRandom(aPosition, aSize)
{
	this.timer = 0.;
	this.particle = new THREE.Particle( new THREE.ParticleCanvasMaterial( { color: PickColor(), program: programMonster3, transparent:true } ) );

	this.particle.position = aPosition.clone();
	this.particle.TargetObject = {isAutonomous:true};

	this.particle.scale.x = this.particle.scale.y = aSize;
	scene.add( this.particle );

	// create the mesh's material
	this.plane = new THREE.Mesh( new THREE.PlaneGeometry( this.particle.scale.x * 1.5, this.particle.scale.x * 1.5, 8, 8 ), new THREE.MeshBasicMaterial( { color: 0x000000, opacity: 0.25, transparent: true, wireframe: true } ) );
	this.plane.geometry.applyMatrix( new THREE.Matrix4().makeRotationX( Math.PI / 2 ) );
	this.plane.visible = false;
	this.plane.position = aPosition.clone();
	scene.add( this.plane );

	this.particleClear = new THREE.Particle( new THREE.ParticleCanvasMaterial( { color: Math.random() * 0x808080 + 0x808080, program: programDoNothing, opacity:0 } ) );
	var width = window.innerWidth * 1.5;
	this.particleClear.scale.x = this.particleClear.scale.y = this.particle.scale.x * 2.;
	scene.add( this.particleClear );
	this.particleClear.position = this.particle.position;

	this.touched = false;
}

MonsterRandom.prototype.Update = function(delta)
{
	this.timer += delta;
	sDistanceTwo = 0.5 + 0.5 * Math.cos(this.timer * 0.1);
	// sDistanceTwo = pickCircleRadius;
}

MonsterRandom.prototype.SetFood = function(foodArray)
{
	sFoodArray = foodArray;
}

