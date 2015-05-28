
function CardComposer() {
}

CardComposer.prototype.compose = function(aCanvas, aText, aName, aAvatarUrl, aImageUrl) {

	var lListImages = [];
	this.avatarSize = aCanvas.width * 0.15;
	this.padding = aCanvas.width * 0.05;
	var context = aCanvas.getContext('2d');


	if(aAvatarUrl) {
		lListImages['avatar'] = aAvatarUrl;
	}

	if(aImageUrl) {
		lListImages['image'] = aImageUrl;
	}

	var that = this;

	LoadingUtils.load(lListImages, function(aImages) {
		var lAvatarImg = aImages['avatar'];
		var lImageImg = aImages['image'];

		that.clear(aCanvas);

		that.drawSurface(aCanvas, false);
		// this will restraint the next drawings to the rounded frame.

		if(lImageImg) {
			that.drawSurface(aCanvas, true);
			that.drawImage(aCanvas, lImageImg);
			context.restore();
			//that.drawTextWithImage(aCanvas, aText);
		}
		else {
			that.drawAvatar(aCanvas, lAvatarImg, aName);
			that.drawTextNoImage(aCanvas, aText);
		}
	});
}

CardComposer.prototype.clear = function(aCanvas) {
	aCanvas.width = aCanvas.width;
}

CardComposer.prototype.drawSurface = function(aCanvas, aClip) {
	var lOptions = {
		cornerRadius:50
		, width:aCanvas.width
		, height:aCanvas.height
		, fill:'white'
		, clip: aClip
	}
	CanvasUtils.drawRoundedRectangle(aCanvas.getContext('2d'), lOptions);
}

CardComposer.prototype.drawAvatarFrame = function(aCanvas, aOptions) {
	CanvasUtils.drawRoundedRectangle(aCanvas.getContext('2d'), aOptions);
	aOptions.clip = true;
	CanvasUtils.drawRoundedRectangle(aCanvas.getContext('2d'), aOptions);
}

CardComposer.prototype.drawAvatar = function(aCanvas, aAvatar, aName) {
	var lSize = this.avatarSize;
	var lOptions = {
		width:lSize
		, height:lSize
		, x:this.padding
		, y:this.padding
	};

	var context = aCanvas.getContext('2d');
	context.save();
	this.drawAvatarFrame(aCanvas, lOptions);
	CanvasUtils.drawImage(context, aAvatar, lOptions);
	context.restore();

	this.drawAvatarName(aCanvas, aName, lOptions);
}

CardComposer.prototype.drawAvatarName = function(aCanvas, aText, aOptions) {
	var lOptions = {
		color:'#333'
		,wrap:true
		,maxLines:1
		,paddingLeft:aOptions.x + aOptions.width  + this.padding
		,paddingTop:aOptions.y + aOptions.height * 0.1
		,width:aCanvas.width
	};

	CanvasUtils.drawText(aCanvas, aText, lOptions);
}

CardComposer.prototype.drawImage = function(aCanvas, aAvatar) {

	var lRatioCanvas = aCanvas.width / aCanvas.height;
	var lRatioAvatar = aAvatar.width / aAvatar.height;

	var lOptions = {}

	if(lRatioCanvas < lRatioAvatar) {
		lOptions.height = aCanvas.height;
		lOptions.width = lOptions.height * lRatioAvatar;
		lOptions.x = (aCanvas.width - lOptions.width) * 0.5;
	}
	else {
		lOptions.width = aCanvas.width;
		lOptions.height = lOptions.width / lRatioAvatar;
		lOptions.y = (aCanvas.height - lOptions.height) * 0.5;
	}

	CanvasUtils.drawImage(aCanvas.getContext('2d'), aAvatar, lOptions);
}

CardComposer.prototype.drawTextWithImage = function(aCanvas, aText) {
	var lOptions = {
		color:'#000'
		,wrap:true
		,maxLines:4
		,paddingLeft:this.padding
		,paddingRight:this.padding
		,paddingBottom:this.padding
		,paddingTop:this.avatarSize + this.padding
		,width:aCanvas.width * 0.5
	};
	CanvasUtils.drawText(aCanvas, aText, lOptions);
}

CardComposer.prototype.drawTextNoImage = function(aCanvas, aText) {
	var lOptions = {
		color:'#000'
		,wrap:true
		,maxLines:4
		,paddingLeft:this.padding
		,paddingRight:this.padding
		,paddingBottom:this.padding
		,paddingTop:this.avatarSize + this.padding
		,width:aCanvas.width
	};
	CanvasUtils.drawText(aCanvas, aText, lOptions);
}