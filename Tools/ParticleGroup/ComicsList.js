/**
 * Comics image catalog. Files live under assets/comics/{year}/.
 * Add new entries here when you add images to that folder.
 */
var ComicsList = {};

ComicsList.ENTRIES = [
	{ year: 2018, file: "20180609_015500.jpg" },
	{ year: 2018, file: "20180720_161239.jpg" },
	{ year: 2018, file: "20180721_143318.jpg" },
	{ year: 2018, file: "20180909_002342 copy.jpg" },
	{ year: 2018, file: "20180909_005421.jpg" },
	{ year: 2018, file: "20180909_005507.jpg" },
	{ year: 2018, file: "1+2.jpg" },
	{ year: 2018, file: "23.jpg" },
	{ year: 2018, file: "2kindsofpeople.jpg" },
	{ year: 2018, file: "3.jpg" },
	{ year: 2018, file: "74%woman.jpg" },
	{ year: 2018, file: "acceptable2.jpg" },
	{ year: 2018, file: "bird-autumn.jpg" },
	{ year: 2018, file: "bzz.jpg" },
	{ year: 2018, file: "colourHeyOui2.jpg" },
	{ year: 2018, file: "compil.jpg" },
	{ year: 2018, file: "couleurLSD.jpg" },
	{ year: 2018, file: "da.jpg" },
	{ year: 2018, file: "fluids.jpg" },
	{ year: 2018, file: "free.jpg" },
	{ year: 2018, file: "happy in a box.jpg" },
	{ year: 2018, file: "hill-of-honesty2.jpg" },
	{ year: 2018, file: "ice-cream-copy3.jpg" },
	{ year: 2018, file: "Image-006 8.jpg" },
	{ year: 2018, file: "Image-006 9.jpg" },
	{ year: 2018, file: "mefuture.jpg" },
	{ year: 2018, file: "message-adi.jpg" },
	{ year: 2018, file: "moves_monsters.jpg" },
	{ year: 2018, file: "old-nightmare.jpg" },
	{ year: 2018, file: "peace2.jpg" },
	{ year: 2018, file: "philo.jpg" },
	{ year: 2018, file: "quiere-mas.jpg" },
	{ year: 2018, file: "space.jpg" },
	{ year: 2018, file: "technique.jpg" },
	{ year: 2018, file: "too-early2.jpeg" },
];

ComicsList.pathForEntry = function (entry)
{
	return "assets/comics/" + entry.year + "/" + entry.file;
};

ComicsList.titleFromEntry = function (entry)
{
	var stamp = entry.file.match(/^(\d{4})(\d{2})(\d{2})_/);
	if (stamp)
	{
		return stamp[1] + "-" + stamp[2] + "-" + stamp[3];
	}
	return entry.file.replace(/\.[^.]+$/, "").replace(/[-_]/g, " ");
};
