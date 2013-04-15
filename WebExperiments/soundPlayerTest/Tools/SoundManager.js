
var AudioContext = new (window.AudioContext || window.webkitAudioContext)();
var AudioCanvas = document.getElementById('canvas');
var Audioctx = AudioCanvas.getContext('2d');

function InitAudio(aData) {
    source = AudioContext.createBufferSource();
    
    if(AudioContext.decodeAudioData) {
        AudioContext.decodeAudioData(aData, function(buffer) {
            source.buffer = buffer;
            createAudio();
        }, function(e) {
            console.log(e);
        });
    } else {
        source.buffer = AudioContext.createBuffer(aData, false /*mixToMono*/);
        createAudio();
       }
    
    sLengthLegsSound = 0.;
}

function createAudio() {
    processor = AudioContext.createJavaScriptNode(256 /*bufferSize*/, 1 /*num inputs*/, 1 /*num outputs*/); 
    processor.onaudioprocess = processAudio;

    analyser = AudioContext.createAnalyser();
        
    source.connect(AudioContext.destination);
    source.connect(analyser);

    analyser.connect(processor);
    processor.connect(AudioContext.destination);

    source.noteOn(0);
    setTimeout(disconnectAudio, source.buffer.duration * 1000 +1000);
}

function disconnectAudio() {
    source.noteOff(0);
    source.disconnect(0);
    processor.disconnect(0);
    analyser.disconnect(0);

            sFoodArraySoundWait.push(sPlayingSound.particle);
        sFoodArraySound.splice(0,1);
        sMonsterSound.mParent.RemoveSound();
}

function processAudio(e) 
{
    var ByteData = new Uint8Array(analyser.frequencyBinCount);
    
    analyser.getByteTimeDomainData(ByteData);

    var nPeak = (this.peakData.left||this.peakData.right);
    // GIANT HACK: use EQ spectrum data for bass frequencies
    var eqSamples = 3;
    for (i=0; i<eqSamples; i++) 
    {
      nPeak = (nPeak||this.eqData[i]);
    }
    if((Math.abs(parseInt(ByteData[0] - 127)) + Math.abs(parseInt(ByteData[10] - 127)) + Math.abs(parseInt(ByteData[3] - 127))) != 0)
        sWaveFormData = ByteData;

    sSoundAmplitude = (0.9+(nPeak*0.1));
    sLengthLegsSound.left = (sLengthLegsSound.left * 0.9 +(this.peakData.left*0.1));;
    sLengthLegsSound.right = (sLengthLegsSound.right * 0.9 +(this.peakData.right*0.1));

}
