
function AudioInput()
{
	that = this;
	this.buflen = 1024;
	this.buf = new Uint8Array( this.buflen );
	this.analyser;
	this.bufferNorm = [];
	this.bufferLong = [];
	this.bass = 0.;
	this.rms = 0.;
	this.spectrum = new Uint8Array( this.buflen );
	var audioContext = new window.webkitAudioContext();	

	function convertToMono( input ) {
    var splitter = audioContext.createChannelSplitter(2);
    var merger = audioContext.createChannelMerger(2);

    input.connect( splitter );
    splitter.connect( merger, 0, 0 );
    splitter.connect( merger, 0, 1 );
    return merger;
	}

	function error() {
    alert('Stream generation failed.');
	}

	function getUserMedia(dictionary, callback) {
	    try {
	        if (!navigator.getUserMedia)
	        	navigator.getUserMedia = navigator.webkitGetUserMedia;
	        navigator.getUserMedia(dictionary, callback, error);
	    } catch (e) {
	        alert('getUserMedia threw exception :' + e);
	    }
	}

	function gotStream(stream) {
	    // Create an AudioNode from the stream.
	    var mediaStreamSource = audioContext.createMediaStreamSource(stream);

	    // Connect it to the destination.
	    that.analyser = audioContext.createAnalyser();
	    that.analyser.fftSize = 2048;
	    convertToMono( mediaStreamSource ).connect( that.analyser );
	    // updatePitch();
	}

	function toggleLiveInput() {
    	getUserMedia({audio:true}, gotStream);
	}

	toggleLiveInput();
}

AudioInput.prototype.Update = function()
{
	var filterOrder = 10;
	var coeffMult = (1. / (filterOrder));
	var amortissementRMS = 0.02;
	if(this.analyser != undefined)
	{
		this.analyser.getByteTimeDomainData( this.buf );
		this.UpdateBass();
		var rmsFrame;
		for(var i = 0; i < this.buf.length; i++)
		{
			if(i > filterOrder - 1)
			{
				this.bufferNorm[i] = ((this.buf[i] / 256.) - 0.5) * coeffMult;
				for(var k = 1; k < filterOrder; k++)
				{
					 this.bufferNorm[i] += this.bufferNorm[i - k] * coeffMult;
				}
			}
			else
			{
				this.bufferNorm[i] = ((this.buf[i] / 256.) - 0.5);
			}
			rmsFrame += this.bufferNorm[i];
		}
		rmsFrame = rmsFrame / this.bufferNorm.length;

		this.rms = amortissementRMS * rmsFrame + (1. - amortissementRMS) * this.rms;
		this.bufferLong = this.bufferLong.concat(this.bufferNorm);
		if(this.bufferLong.length > 200000)
		{
			this.bufferLong.splice(0, this.buf.length);
		}
	}
}

AudioInput.prototype.UpdateBass = function()
{
	this.analyser.getByteFrequencyData(this.spectrum);
	var bass = 0.;
	var numPt = this.spectrum.length / 15;
	for(var i = 0; i < numPt; i++)
	{
		bass += this.spectrum[i] / 256;
	}

	this.bass = (bass * 0.5 / (numPt)) + this.bass * 0.5;
}

AudioInput.prototype.GetBuffer = function()
{
	return this.bufferLong;
}

AudioInput.prototype.GetBass = function()
{

	return this.bass;
}
