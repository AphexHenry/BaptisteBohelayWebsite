
function CardManager() {
	this.canvas = [];
	this.waitingList = [];
	this.cardComposer = new CardComposer();
	this.canvasNext = 0;
	var lSize = 512;

	for(var i = 0; i < 100; i++) {
		var lCanvas = document.createElement('canvas');
		lCanvas.width  = lSize * 1.7;
		lCanvas.height = lSize;

		this.cardComposer.composeEmpty(lCanvas);

		this.canvas.push(lCanvas);
	}
}

CardManager.prototype.GetCanvas = function(aIndex) {
	return this.canvas[aIndex % this.canvas.length];
}

CardManager.prototype.add = function(aObject) {
	console.log("new card");
	this.canvasNext++;
	if(this.canvasNext >= this.canvas.length) {
		this.canvasNext = 0;
	}

	var lCanvas = this.canvas[this.canvasNext];
	var that = this;
	this.cardComposer.compose(lCanvas, aObject.text, aObject.userName, aObject.userIcon, aObject.image, function() {
		sParticlesManager.SetCanvasFilled(lCanvas);
		that.waitingList.push(lCanvas);
	});
}

CardManager.prototype.GetTexture = function() {
	if(this.waitingList.length > 0) {
		var lReturn = this.waitingList[0];
		this.waitingList.splice(0,1);
		return lReturn;
	}
	else {
		return null;
	}
}

CardManager.prototype.GetCardCount = function() {
	return this.canvas.length;
}