/**
 * Programming grid entries. Each item: name, description, assets (paths or URLs).
 * Edit PROJECTS to match your 12 portfolio items.
 */
var ProgrammingProjects = {};

ProgrammingProjects.PROJECTS = [
	{ name: "PES", description: "", assets: [] },
	{ name: "Horse Life", description: "", assets: [] },
	{ name: "Voice Changer", description: "", assets: [] },
	{ name: "Lulu’s Unreal Exploration", description: "", assets: [] },
	{ name: "Social Mosa", description: "", assets: [] },
	{ name: "Cortex", description: "", assets: [] },
	{ name: "Triber", description: "", assets: [] },
	{ name: "Badly Drawn", description: "", assets: [] },
	{ name: "Orchview", description: "", assets: [] },
	{ name: "Orchplay", description: "", assets: [] },
	{ name: "Pi-Schedule", description: "", assets: [] },
	{ name: "Much More", description: "", assets: [] },
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
