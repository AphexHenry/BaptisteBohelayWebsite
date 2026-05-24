function ParticleGroupComics(positionCenter, name)
{
	this.name = name;
	this.particles = [];
	this.comics = ComicsList.ENTRIES;
	this.selectedIndex = 0;
	this.viewerReady = false;

	this.cameraDistance = window.innerWidth * 0.35;
	this.positionCenter = positionCenter;
}

ParticleGroupComics.prototype.GetCameraPosition = function ()
{
	return new THREE.Vector3(
		this.positionCenter.x,
		this.positionCenter.y,
		this.positionCenter.z + this.cameraDistance
	);
};

ParticleGroupComics.prototype.syncCameraToViewer = function ()
{
	cameraTarget = this.positionCenter.clone();
	cameraPosition = this.GetCameraPosition();
	cameraManager.SetControlMode(sTools.CameraControlType.NONE);
};

ParticleGroupComics.prototype.ensureViewer = function ()
{
	if (this.viewerReady)
	{
		return;
	}

	var $viewer = $("#comicsViewer");
	if (!$viewer.length)
	{
		$viewer = $(
			'<div id="comicsViewer" class="comics-viewer">' +
				'<div class="comics-viewer__panel">' +
					'<img class="comics-viewer__image" alt="" />' +
				'</div>' +
				'<div class="comics-viewer__footer">' +
					'<p class="comics-viewer__title"></p>' +
					'<p class="comics-viewer__counter"></p>' +
					'<div class="comics-viewer__slider-wrap">' +
						'<div class="comics-viewer__slider-track" role="slider" tabindex="0" aria-label="Select comic" aria-valuemin="0" aria-valuemax="0" aria-valuenow="0">' +
							'<div class="comics-viewer__slider-line"></div>' +
							'<div class="comics-viewer__slider-thumb"></div>' +
						'</div>' +
					'</div>' +
				'</div>' +
			'</div>'
		);
		$("body").append($viewer);
	}

	this.$viewer = $viewer;
	this.$image = $viewer.find(".comics-viewer__image");
	this.$title = $viewer.find(".comics-viewer__title");
	this.$counter = $viewer.find(".comics-viewer__counter");
	this.$sliderTrack = $viewer.find(".comics-viewer__slider-track");
	this.$sliderThumb = $viewer.find(".comics-viewer__slider-thumb");

	var maxIndex = Math.max(this.comics.length - 1, 0);
	this.$sliderTrack.attr("aria-valuemax", maxIndex);

	this.bindSliderDrag();

	this.$viewer.on("mousedown touchstart click", function (event)
	{
		event.stopPropagation();
	});

	this.viewerReady = true;
};

ParticleGroupComics.prototype.bindSliderDrag = function ()
{
	var self = this;
	var track = this.$sliderTrack[0];
	var dragging = false;

	function stopSceneEvent(event)
	{
		event.preventDefault();
		event.stopPropagation();
	}

	function indexFromClientX(clientX)
	{
		var rect = track.getBoundingClientRect();
		if (rect.width <= 0 || self.comics.length === 0)
		{
			return 0;
		}

		var t = (clientX - rect.left) / rect.width;
		t = Math.max(0, Math.min(1, t));
		return Math.round(t * Math.max(self.comics.length - 1, 0));
	}

	function onPointerDown(event)
	{
		stopSceneEvent(event);
		dragging = true;
		track.setPointerCapture(event.pointerId);
		self.setSelectedIndex(indexFromClientX(event.clientX));
	}

	function onPointerMove(event)
	{
		if (!dragging)
		{
			return;
		}
		stopSceneEvent(event);
		self.setSelectedIndex(indexFromClientX(event.clientX));
	}

	function onPointerEnd(event)
	{
		if (!dragging)
		{
			return;
		}
		dragging = false;
		if (track.hasPointerCapture(event.pointerId))
		{
			track.releasePointerCapture(event.pointerId);
		}
		stopSceneEvent(event);
	}

	track.addEventListener("pointerdown", onPointerDown);
	track.addEventListener("pointermove", onPointerMove);
	track.addEventListener("pointerup", onPointerEnd);
	track.addEventListener("pointercancel", onPointerEnd);

	this.$sliderTrack.on("keydown", function (event)
	{
		var key = event.key || event.which;
		if (key === "ArrowRight" || key === 39)
		{
			stopSceneEvent(event);
			self.setSelectedIndex(self.selectedIndex + 1);
		}
		else if (key === "ArrowLeft" || key === 37)
		{
			stopSceneEvent(event);
			self.setSelectedIndex(self.selectedIndex - 1);
		}
	});
};

ParticleGroupComics.prototype.setSelectedIndex = function (index)
{
	if (!this.comics.length)
	{
		return;
	}

	this.selectedIndex = Math.max(0, Math.min(index, this.comics.length - 1));
	var entry = this.comics[this.selectedIndex];
	var path = ComicsList.pathForEntry(entry);

	this.$image.attr({ src: path, alt: ComicsList.titleFromEntry(entry) });
	this.$title.text(ComicsList.titleFromEntry(entry));
	this.$counter.text((this.selectedIndex + 1) + " / " + this.comics.length);

	if (this.$sliderTrack && this.$sliderTrack.length)
	{
		var maxIndex = Math.max(this.comics.length - 1, 0);
		var percent = maxIndex > 0 ? this.selectedIndex / maxIndex : 0;
		this.$sliderTrack.attr("aria-valuenow", this.selectedIndex);
		this.$sliderThumb.css("left", (percent * 100) + "%");
	}
};

ParticleGroupComics.prototype.showViewer = function ()
{
	this.ensureViewer();
	this.setSelectedIndex(this.selectedIndex);
	this.$viewer.css({ visibility: "visible", pointerEvents: "auto" });
	this.$viewer.stop(true).fadeTo(400, 1);
};

ParticleGroupComics.prototype.hideViewer = function ()
{
	if (!this.viewerReady || !this.$viewer.length)
	{
		return;
	}

	var self = this;
	this.$viewer.stop(true).fadeTo(300, 0, function ()
	{
		self.$viewer.css({ visibility: "hidden", pointerEvents: "none" });
	});
};

ParticleGroupComics.prototype.Init = function ()
{
	this.syncCameraToViewer();
	this.showViewer();
};

ParticleGroupComics.prototype.Terminate = function ()
{
	this.hideViewer();
};

ParticleGroupComics.prototype.MouseUp = function () {};

ParticleGroupComics.prototype.MouseDown = function ()
{
	if (this.viewerReady && this.$viewer && this.$viewer.is(":visible"))
	{
		return;
	}
};

ParticleGroupComics.prototype.Update = function ()
{
	this.syncCameraToViewer();
};
