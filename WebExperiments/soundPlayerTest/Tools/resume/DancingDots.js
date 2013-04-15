
var sHandsDancingDots = [];
var sTimerDD = 0;
var sAngleDD = 0;
programDancingDots = function ( context ) 
{
	// sAngleDD += 0.02;
	var rayCircle = 0.15;
	context.lineWidth = 0.02;
	var size = 0.1;
	for(var i = 0; i < sHandsDancingDots.length; i++)
	{
		// var size = 0.1 * Math.abs(Math.cos(3. * sTimerDD + i));
		drawArmDD(context, size, rayCircle, i);
	}

    var centerX = 0.;
    var centerY = 0.;
    context.lineWidth = 0.02;
    context.beginPath();
    context.arc( centerX, centerY, rayCircle, 0, PI2, true );
    context.closePath();
    context.stroke();

    // context.beginPath();
    // context.arc( centerX + Math.cos(sAngleDD) * rayCircle, centerY + Math.sin(sAngleDD) * rayCircle, rayCircle * 0.3, 0, PI2, true );
    // context.closePath();
    // context.stroke();
    
}

drawArmDD = function (context, size, circleRay, index)
{
	var angle = sHandsDancingDots[index].angle + sAngleDD;
	size * sHandsDancingDots[index].size;
	var left = sHandsDancingDots[index].left;
	var COS = Math.cos(angle);
	var SIN = Math.sin(angle);
	var posShoulderX =  COS * circleRay;
	var posShoulderY = SIN * circleRay;

	var coeff = left ? 1 : -1;
	posHandX = posShoulderX + COS * size + Math.cos(coeff * ( 1. * Math.PI * monsterTimer - Math.PI * 0.25 ) + angle ) * size;
	posHandY = posShoulderY + SIN * size + Math.sin(coeff * ( 1. * Math.PI * monsterTimer - Math.PI * 0.25 ) + angle) * size;

	sHandsDancingDots[index].position.x = posHandX;
	sHandsDancingDots[index].position.y = posHandX;

	context.beginPath();
	context.moveTo(posHandX, posHandY);
    context.lineTo(posShoulderX, posShoulderY);
    context.stroke();
}

// drawArmDD = function (context, size, circleRay, index)
// {
// 	var angle = sHandsDancingDots[index].angle;
// 	var COS = Math.cos(angle);
// 	var SIN = Math.sin(angle);
// 	var posShoulderX =  COS * circleRay;
// 	var posShoulderY = SIN * circleRay;

// 	posHandX = posShoulderX + COS * size;
// 	posHandY = posShoulderY + SIN * size;

// 	sHandsDancingDots[index].position.x = posHandX;
// 	sHandsDancingDots[index].position.y = posHandX;

// 	context.beginPath();
// 	context.moveTo(posHandX, posHandY);
//     context.lineTo(posShoulderX, posShoulderY);
//     context.stroke();
// }

function DancingDots(positionCenter)
{
	DisplayMessage("A challenge is coming", "video game developer at Dancing Dots", "This is the first time the creature is meet C++ progamming, and first real-life experience. Its sound design experience and its motivation will tips the scales in its favor.", "Let the creature fight and give it skills to make it stronger.");

	var numLegs = 12;
	for(var i = 0; i < numLegs; i++)
	{
		sHandsDancingDots.push({size:1. / i, angle:Math.PI * 2. * i / numLegs, position:new THREE.Vector3(0,0,positionCenter.z), left:(i >= 0.5 * numLegs)})
	}

	this.particle = new THREE.Particle( new THREE.ParticleCanvasMaterial( { color: PickColor() * 0.6, program: programDancingDots, transparent:true } ) );
	width = window.innerWidth;
	var angle = myRandom() * 4;
	this.particle.position.x = positionCenter.x + width * (1.) * Math.sin(angle );
	this.particle.position.y = positionCenter.y + width * (1.) * Math.cos(angle);
	this.particle.position.z = positionCenter.z;

	var size = 1;
	this.particle.scale.x = this.particle.scale.y = width * 0.2 * size;
	this.scaleInit = this.particle.scale.x;
	scene.add( this.particle );

	this.speed = new THREE.Vector3();
	this.angleRandom = 0.;
	this.strengthGeneral = 1.;

	this.timerAttack = 0;
	this.isDead = false;

	this.indexListSkills = 0;
	this.listSkills = [];
	this.listSkills.push({type:"programming", name:"C++"});
	this.listSkills.push({type:"sound design", name:"sound design"});
	this.listSkills.push({type:"sound design", name:"Adobe Audition"});
	this.listSkills.push({type:"programming", name:"OpenAL"});
	this.listSkills.push({type:"programming", name:"3D sound programming"});
}

DancingDots.prototype.Update = function(delta)
{
	if(this.isDead)
	{
		this.particle.scale.x *= 0.95;
		this.particle.scale.y = this.particle.scale.x;
		if(this.particle.scale.x < 0.1 * this.scaleInit)
		{	

		}
	}
	this.UpdateMovement(delta * 1.5);

	var monsterDirection = sMonster.position.clone().subSelf(this.particle.position.clone()).normalize();
	var strengthVar = 1.;
	if(monsterDirection.length() > window.innerWidth * 0.4)
	{
		strengthVar = 3;
	}
	var strengthAtt = 50 * strengthVar;
	var strengthRand = 30 * strengthVar;
	var strengthGeneral = this.strengthGeneral * 0.7;
	this.speed.x += (strengthRand * Math.cos(this.angleRandom) + strengthAtt * monsterDirection.x) * strengthGeneral;
	this.speed.y += (strengthRand * Math.sin(this.angleRandom) + strengthAtt * monsterDirection.y) * strengthGeneral;

	sAngleDD = Math.atan((this.speed.y) / (this.speed.x));
	if((this.speed.x) > 0)
	{
		sAngleDD += Math.PI;
	}
	sAngleDD += Math.PI;
	 // sAngleDD -= 0.5 * Math.PI;

	this.speed.multiplyScalar(0.98);
	this.particle.position.x += this.speed.x * delta;
	this.particle.position.y += this.speed.y * delta;
	sTimerDD += delta;
}

var monsterTimer = 0.;
var monsterHandTimer = 0;
var waitTimer = 0;
var sUp = 0;
DancingDots.prototype.UpdateMovement = function(delta)
{
	switch(sUp)
	{
		case 0:
			waitTimer *= 0.97;
			monsterHandTimer += delta * 4;
			monsterHandTimer = Math.min(1., monsterHandTimer);
			monsterTimer += delta;
			if(monsterTimer >= 1.)
			{
				monsterTimer = 1;
				sUp = 1;
				this.strengthGeneral = 1.;
			}
			break;
		case 1:
			monsterTimer += 4. * delta;
			if(monsterTimer >= 2.)
			{
				monsterTimer = 0;
				sUp = 3;
				this.strengthGeneral = 0;
			}
			break;
		// case 2:
		// 	monsterHandTimer -= 6. * delta;
		// 	if(monsterHandTimer <= 0.)
		// 	{
		// 		sUp = 3;
		// 	}
		// 	break;
		case 3:
			waitTimer += 1. * delta;
			if(waitTimer >= 1.5)
			{
				sUp = 0;
				this.angleRandom = myRandom() * 0.7;
			}
			break;
		case 4:
			waitTimer *= 0.97;
			monsterHandTimer += delta * 4;
			monsterHandTimer = Math.min(1., monsterHandTimer);
			monsterTimer += 9 * delta;
			if(monsterTimer >= 9.)
			{
				this.strengthGeneral = 0;
				monsterTimer = 1;
				sUp = 3;
				this.strengthGeneral = 1.;
			}
			break;
	}
}

DancingDots.prototype.UpdateAttack = function(delta)
{
	this.timerAttack -= delta;
	if(this.timerAttack <= 0)
	{
		this.timerAttack = 3.;
	}
}

DancingDots.prototype.SetAttacked = function(strength)
{
	var monsterDirection = sMonster.position.clone().subSelf(this.particle.position.clone()).normalize();
	var strengthAtt = window.innerWidth * 0.7;
	sUp = 4;
	this.speed.x += strengthAtt * -monsterDirection.x;
	this.speed.y += strengthAtt * -monsterDirection.y;
	for(var i = 0; i < 2; i++)
	{
		ParticleGroups[ParticleGroup.PART_MONSTER].AddFood(this.listSkills[this.indexListSkills].type, 
															this.listSkills[this.indexListSkills].name, 
															this.particle.position, 
															new THREE.Vector3(window.innerWidth * myRandom(), window.innerHeight * myRandom(), 0.),
															0.9);
		
		this.indexListSkills++;
		if(this.indexListSkills >= this.listSkills.length)
		{
			this.SetDead();
			break;
		}
	}
}

DancingDots.prototype.SetDead = function()
{
	scene.remove(this.particle);
	this.isDead = true;
	DisplayMessage("Challenge completed","the creature was strong enough", "Continue feeding it with skills.", "");
	ParticleGroups[ParticleGroup.PART_MONSTER].SwitchNextState();
		
}