/**
 * Programming grid entries. Each item: name, description, assets (paths or URLs).
 * Edit PROJECTS to match your 12 portfolio items.
 */
var ProgrammingProjects = {};

ProgrammingProjects.PROJECTS = [
	{ name: "Slug Journey", description: "", assets: [] },
	{ name: "Moving Mirror", description: "", assets: [] },
	{ name: "3D Videos", description: "", assets: [] },
	{ name: "Plane Forest", description: "", assets: [] },
	{ name: "Sound Visu", description: "", assets: [] },
	{ name: "Lulu", description: "", assets: [] },
	{ name: "Musical Baguette", description: "", assets: [] },
	{ name: "Musical Box", description: "", assets: [] },
	{ name: "Cocoons", description: "", assets: [] },
	{ name: "Interactive Dance", description: "", assets: [] },
	{ name: "PIP", description: "", assets: [] },
	{ name: "Sound Monsters", description: "", assets: [] },
];

ProgrammingProjects.shortDescription = function (description, maxLen)
{
	if (!description || String(description).length === 0) return "";
	var s = String(description).replace(/\s+/g, " ").trim();
	if (s.length <= maxLen) return s;
	return s.slice(0, maxLen - 1) + "…";
};

/**
 * Flyer object for ParticleCircleNavigate (name label + optional subtitle).
 */
ProgrammingProjects.toFlyer = function (project, size)
{
	return {
		name: project.name,
		subTitle: ProgrammingProjects.shortDescription(project.description, 56),
		size: isdefined(size) ? size : 0.75,
		programmingProject: project,
	};
};
