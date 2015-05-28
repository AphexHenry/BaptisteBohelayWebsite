
function CardManager() {
	this.canvas = [];
	this.waitingList = [];
	this.cardComposer = new CardComposer();

	var lListText = [];
	var lSize = 512;

	var lNames = ['henriette!', 'Marie;)', 'Ron Hubbard', 'Blondy Love'];
	var lIcons = ['icon1.png', 'icon2.jpg', 'icon3.jpg'];
	var lPictures = ['jazzConcert.jpg', 'jazzConcert2.jpg'];

	for(var i = 0; i < 10; i++) {
		lListText.push("this is a text " + i);
	}

	for(var i = 0; i < 10; i++) {
		lListText.push("Then the perilous path was planted:And a river, and a spring On every cliff and tomb; And on the bleached bones Red clay brought forth."
			+"Till the villain left the paths of ease, To walk in perilous paths, and drive The just man into barren climes."
		);
	}

	for(var i = 0; i < lListText.length; i++) {
		var lCanvas = document.createElement('canvas');
		lCanvas.width  = lSize * 2;
		lCanvas.height = lSize;

		var lAvatarPath = 'textures/' + lIcons[Math.floor(Math.random() * lIcons.length)];
		var lImagePath = i%2 ?  'textures/' + lPictures[Math.floor(Math.random() * lPictures.length)] : null;
		var lUserName = lNames[Math.floor(Math.random() * lNames.length)];

		this.cardComposer.compose(lCanvas, lListText[i], lUserName, lAvatarPath, lImagePath );

		var lTexture = new THREE.Texture(lCanvas);
		lTexture.needsUpdate = true;
		this.canvas.push(lTexture);
		this.waitingList.push(lTexture);
	}

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

CardManager.prototype.GetCardCound = function() {
	return this.canvas.length;
}