
function CardManager() {
	this.canvas = [];
	this.waitingList = [];
	this.cardComposer = new CardComposer();
	this.canvasNext = 0;
	var lSize = 512;

	for(var i = 0; i < 30; i++) {
		var lCanvas = document.createElement('canvas');
		lCanvas.width  = lSize * 2;
		lCanvas.height = lSize;

		this.cardComposer.composeEmpty(lCanvas);

		this.canvas.push(lCanvas);
	}
}

CardManager.prototype.GetCanvas = function(aIndex) {
	return this.canvas[aIndex % this.canvas.length];
}

CardManager.prototype.add = function(aObject) {
	this.canvasNext++;
	if(this.canvasNext >= this.canvas.length) {
		this.canvasNext = 0;
	}

	var lCanvas = this.canvas[this.canvasNext];
	this.cardComposer.compose(lCanvas, aObject.text, aObject.userName, aObject.userIcon, aObject.image);
	sParticlesManager.SetCanvasFilled(lCanvas);

	//var lTexture = new THREE.Texture(lCanvas);
	//lTexture.needsUpdate = true;
	//this.canvas.push(lTexture);
	this.waitingList.push(lCanvas);
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