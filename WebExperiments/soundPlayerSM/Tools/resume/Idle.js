

function Idle(positionCenter)
{
	this.timer = 20.;
	this.positionCenter = positionCenter;

	this.listSkills = [];
	this.listSkills.push({type:"programming", name:"C++"});
	this.listSkills.push({type:"sound design", name:"sound design"});
	this.listSkills.push({type:"sound design", name:"Adobe Audition"});
	this.listSkills.push({type:"programming", name:"OpenAL"});
	this.listSkills.push({type:"programming", name:"3D sound programming"});

	var angle = 0;
	for(var i = 0; i < this.listSkills.length; i++)
	{
		angle = myRandom() * Math.PI;
		distance = 1.5 + myRandom() * 0.5;
		this.listSkills[i].particle = ParticleGroups[ParticleGroup.PART_MONSTER].AddFood(this.listSkills[i].type, 
																this.listSkills[i].name, 
																new THREE.Vector3(distance * window.innerWidth * Math.cos(angle) + positionCenter.x, distance * window.innerHeight * Math.sin(angle) + positionCenter.y, 0.), 
																new THREE.Vector3(0., 0., 0.),
																0.9);
		this.listSkills[i].particle.mySpeed = new THREE.Vector3(-Math.cos(angle), -Math.sin(angle), 0.);
	}	
}

Idle.prototype.Update = function(delta)
{
	this.timer -= delta;
	if((this.timer < 0) || (sFoodArray.length <= 0))
	{
		ParticleGroups[ParticleGroup.PART_MONSTER].SwitchNextState();
	}

	for(var i = 0; i < this.listSkills.length; i++)
	{
			var lPart = this.listSkills[i].particle;
			lPart.mSpeed.x += lPart.mySpeed.x * window.innerHeight * 0.03;
			lPart.mSpeed.y += lPart.mySpeed.y * window.innerHeight * 0.03;
	}
}