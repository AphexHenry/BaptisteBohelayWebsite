function ParticleGroupProgramming(positionCenter, name)
{
	this.name = name;
	this.particles = [];
	this.projects = ProgrammingProjects.PROJECTS;

	var cols = 4;
	var rows = 3;
	var cellSize = window.innerWidth * 0.09;
	var gridWidth = (cols - 1) * cellSize;
	var gridHeight = (rows - 1) * cellSize;
	var count = Math.min(this.projects.length, cols * rows);

	this.cameraDistance = Math.max(gridWidth, gridHeight) * 1.4;
	this.positionCenter = positionCenter;

	for (var index = 0; index < count; index++)
	{
		var row = Math.floor(index / cols);
		var col = index % cols;
		var lPosition = new THREE.Vector3();
		lPosition.x = positionCenter.x + col * cellSize - gridWidth * 0.5;
		lPosition.y = positionCenter.y + row * cellSize - gridHeight * 0.5;
		lPosition.z = positionCenter.z;

		var flyer = ProgrammingProjects.toFlyer(this.projects[index]);
		var particle = new ParticleCircleNavigate(lPosition, flyer);
		this.particles.push(particle);
	}
}

ParticleGroupProgramming.prototype.Init = function() {};
ParticleGroupProgramming.prototype.MouseUp = function() {};
ParticleGroupProgramming.prototype.Terminate = function() {};

ParticleGroupProgramming.prototype.MouseDown = function()
{
	if (INTERSECTED)
	{
		if (typeof INTERSECTED.TargetObject.target != "undefined")
		{
			sGroupCurrent = INTERSECTED.TargetObject.target;
			SELECTED = INTERSECTED = null;
			sCoeffCameraMove = 0;
		}
		else if (typeof INTERSECTED.TargetObject.targetHTML != "undefined")
		{
			INTERSECTED.material.program = programStroke;
			CirclesToHtml(INTERSECTED.TargetObject.targetHTML);
		}
		else if (typeof INTERSECTED.TargetObject.targetHTMLOpen != "undefined")
		{
			open_in_new_tab(INTERSECTED.TargetObject.targetHTMLOpen);
		}
	}
	else if (SELECTED)
	{
		SELECTED.material.program = programStroke;
		SELECTED = null;
	}
}

ParticleGroupProgramming.prototype.Update = function()
{
	controlAuto = sTools.CameraControlType.NONE;
	var vector = new THREE.Vector3(mouse.x, mouse.y, 0.5);
	projector.unprojectVector(vector, camera);

	var ray = new THREE.Ray(camera.position, vector.subSelf(camera.position).normalize());

	var intersects = ray.intersectObjects(this.particles);

	if (intersects.length > 0)
	{
		if (INTERSECTED != intersects[0].object)
		{
			if (INTERSECTED) INTERSECTED.material.program = programStroke;

			INTERSECTED = intersects[0].object;

			if (INTERSECTED === SELECTED)
			{
				INTERSECTED.material.program = programTriangle;
			}
			else
			{
				INTERSECTED.material.program = programFill;
			}
		}

		INTERSECTED.TargetObject.info.material.opacity += (1. - INTERSECTED.TargetObject.info.material.opacity) * 2. * 0.02;
	}
	else
	{
		if (INTERSECTED)
		{
			INTERSECTED.material.program = programStroke;
			INTERSECTED.TargetObject.info.material.opacity = OPACITY_INFO;
		}
		INTERSECTED = null;
	}
}
