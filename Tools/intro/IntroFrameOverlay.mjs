var INTRO_FRAME_DRAW_DURATION_SEC = 1.5;
var INTRO_FRAME_MARGIN_RATIO = 0.03;

export function IntroFrameOverlay() {
	this.canvas = null;
	this.context = null;
	this.canvasWidth = 0;
	this.canvasHeight = 0;
	this.elapsed = 0;
	this.isDrawing = false;
	this.isComplete = false;
	this.isExiting = false;
	this.exitRafId = 0;
	this.lastExitFrameTime = 0;
}

IntroFrameOverlay.prototype.start = function () {
	if (this.isDrawing || this.isComplete) {
		return;
	}
	this.cancelExitLoop();
	this.isExiting = false;
	this.elapsed = 0;
	this.isDrawing = true;
	this.ensureCanvas();
	this.draw(0);
};

IntroFrameOverlay.prototype.out = function () {
	if (this.isExiting) {
		return;
	}
	if (!this.isDrawing && !this.isComplete) {
		return;
	}
	this.isDrawing = false;
	this.isComplete = false;
	this.isExiting = true;
	this.lastExitFrameTime = performance.now();
	this.startExitLoop();
};

IntroFrameOverlay.prototype.startExitLoop = function () {
	var self = this;
	if (this.exitRafId) {
		return;
	}
	function tick(now) {
		if (!self.isExiting) {
			self.exitRafId = 0;
			return;
		}
		var delta = (now - self.lastExitFrameTime) / 1000;
		self.lastExitFrameTime = now;
		self.update(delta);
		if (self.isExiting) {
			self.exitRafId = requestAnimationFrame(tick);
		} else {
			self.exitRafId = 0;
		}
	}
	this.exitRafId = requestAnimationFrame(tick);
};

IntroFrameOverlay.prototype.cancelExitLoop = function () {
	if (this.exitRafId) {
		cancelAnimationFrame(this.exitRafId);
		this.exitRafId = 0;
	}
	this.lastExitFrameTime = 0;
};

IntroFrameOverlay.prototype.update = function (delta) {
	if (!this.isDrawing && !this.isComplete && !this.isExiting) {
		return;
	}

	if (this.isDrawing) {
		this.elapsed = Math.min(INTRO_FRAME_DRAW_DURATION_SEC, this.elapsed + delta);
		if (this.elapsed >= INTRO_FRAME_DRAW_DURATION_SEC) {
			this.isDrawing = false;
			this.isComplete = true;
		}
	} else if (this.isExiting) {
		this.elapsed = Math.max(0, this.elapsed - delta);
		if (this.elapsed <= 0) {
			this.isExiting = false;
			this.remove();
			return;
		}
	}

	var progress = Math.min(1, this.elapsed / INTRO_FRAME_DRAW_DURATION_SEC);
	progress = progress * progress * (3. - 2. * progress);
	this.draw(progress);
};

IntroFrameOverlay.prototype.ensureCanvas = function () {
	if (this.canvas) {
		return;
	}

	this.canvas = document.createElement('canvas');
	this.canvas.setAttribute('id', 'introFrameOverlay');
	this.canvas.style.position = 'fixed';
	this.canvas.style.left = '0px';
	this.canvas.style.top = '0px';
	this.canvas.style.width = '100%';
	this.canvas.style.height = '100%';
	this.canvas.style.pointerEvents = 'none';
	this.canvas.style.zIndex = '101';
	document.body.appendChild(this.canvas);
	this.context = this.canvas.getContext('2d');
};

IntroFrameOverlay.prototype.resize = function () {
	var dpr = window.devicePixelRatio || 1;
	var width = window.innerWidth;
	var height = window.innerHeight;
	var pixelWidth = Math.max(1, Math.round(width * dpr));
	var pixelHeight = Math.max(1, Math.round(height * dpr));

	this.ensureCanvas();
	if (this.canvasWidth !== pixelWidth || this.canvasHeight !== pixelHeight) {
		this.canvas.width = pixelWidth;
		this.canvas.height = pixelHeight;
		this.canvasWidth = pixelWidth;
		this.canvasHeight = pixelHeight;
	}
	this.context.setTransform(dpr, 0, 0, dpr, 0, 0);
};

IntroFrameOverlay.prototype.clear = function () {
	if (!this.context) {
		return;
	}
	this.context.clearRect(0, 0, window.innerWidth, window.innerHeight);
};

IntroFrameOverlay.prototype.remove = function () {
	this.cancelExitLoop();
	this.isExiting = false;
	if (!this.canvas) {
		return;
	}
	if (this.canvas.parentNode) {
		this.canvas.parentNode.removeChild(this.canvas);
	}
	this.canvas = null;
	this.context = null;
	this.canvasWidth = 0;
	this.canvasHeight = 0;
	this.elapsed = 0;
	this.isDrawing = false;
	this.isComplete = false;
};

IntroFrameOverlay.prototype.draw = function (progress) {
	this.resize();

	var ctx = this.context;
	var width = window.innerWidth;
	var height = window.innerHeight;
	var leftMargin = Math.min(width * INTRO_FRAME_MARGIN_RATIO, 30);
	var verticalMargin = height * INTRO_FRAME_MARGIN_RATIO;
	var bottom = height - verticalMargin;
	var top = 0;
	var right = width - leftMargin;
	var halfHeight = height * 0.5 - leftMargin;
	var lineGap = Math.max(8, Math.min(width, height) * 0.032);
	var drawProgress = Math.min(1, Math.max(0, progress));

	this.clear();
	ctx.lineCap = 'square';
	ctx.lineWidth = Math.max(2, Math.min(width, height) * 0.0025);
	ctx.lineWidth = 3.0;
	
	ctx.strokeStyle = '#f97316';
	ctx.beginPath();
	ctx.moveTo(leftMargin, bottom);
	ctx.lineTo(leftMargin, bottom - (bottom - top) * drawProgress);
	ctx.stroke();

	ctx.strokeStyle = '#555575';
	ctx.lineWidth = 0.8;

	// right line
	for (var i = 0; i < 4; i++) {
		var x = width - lineGap * (i + 1);
		ctx.beginPath();
		ctx.moveTo(x, top);
		ctx.lineTo(x, top + (halfHeight - top) * drawProgress);
		ctx.stroke();
	}
	// bottom line
	for (var j = 0; j < 2; j++) {
		var y = bottom - lineGap * j;
		ctx.beginPath();
		ctx.moveTo(leftMargin, y);
		ctx.lineTo(leftMargin + (right) * drawProgress, y);
		ctx.stroke();
	}

	ctx.fillStyle = '#555575';
	ctx.beginPath();
	ctx.arc(leftMargin, bottom, lineGap * 3, Math.PI / 2, Math.PI / 2 - Math.PI * drawProgress, true);
	ctx.fill();

	ctx.strokeStyle = '#666';
	ctx.lineWidth = 0.5;
	ctx.beginPath();
	ctx.arc(leftMargin, bottom, lineGap * 3.15 * drawProgress, 0, 2 * Math.PI, true);
	ctx.stroke();

	ctx.strokeStyle = '#999';
	ctx.lineWidth = 0.5;
	ctx.beginPath();
	ctx.arc(leftMargin, bottom, lineGap * 3.3 * drawProgress, 0, 2 * Math.PI, true);
	ctx.stroke();

	ctx.strokeStyle = '#bbb';
	ctx.lineWidth = 0.5;
	ctx.beginPath();
	ctx.arc(leftMargin, bottom, lineGap * 3.45 * drawProgress, 0, 2 * Math.PI, true);
	ctx.stroke();

	ctx.strokeStyle = '#eee';
	ctx.lineWidth = 0.5;
	ctx.beginPath();
	ctx.arc(leftMargin, bottom, lineGap * 3.6 * drawProgress, 0, 2 * Math.PI, true);
	ctx.stroke();
};
