
var AudioContext = new (window.AudioContext || window.webkitAudioContext)();
var AudioCanvas = document.getElementById('canvas');
var Audioctx = AudioCanvas.getContext('2d');
var AudioSource;

function InitAudio(aData) {
    AudioSource = AudioContext.createBufferSource();
    
    if(AudioContext.decodeAudioData) {
        AudioContext.decodeAudioData(aData, function(buffer) {
            AudioSource.buffer = buffer;
            createAudio();
        }, function(e) {
            console.log(e);
        });
    } else {
        AudioSource.buffer = AudioContext.createBuffer(aData, false /*mixToMono*/);
        createAudio();
       }
    
    sLengthLegsSound = {left:0., right:0.};
}

function createAudio() {
    processor = AudioContext.createJavaScriptNode(512 /*bufferSize*/, 1 /*num inputs*/, 1 /*num outputs*/); 
    processor.onaudioprocess = processAudio;

    analyser = AudioContext.createAnalyser();
        
    AudioSource.connect(AudioContext.destination);
    AudioSource.connect(analyser);

    analyser.connect(processor);
    processor.connect(AudioContext.destination);

    AudioSource.noteOn(0);
    setTimeout(disconnectAudio, AudioSource.buffer.duration * 1000 +1000);
}

function disconnectAudio() 
{
    AudioSource.noteOff(0);
    AudioSource.disconnect(0);
    processor.disconnect(0);
    analyser.disconnect(0);

    sFoodArraySoundWait.push(sPlayingSound.particle);
    sFoodArraySound.splice(0,1);
    sMonsterSound.mParent.RemoveSound();

    sWaveFormData = [];
    sLengthLegsSound.left = 0;
    sLengthLegsSound.right = 0;
    sSoundAmplitude = 0;
}

function processAudio(e) 
{
    if(!sPlayingSound)
    {
        return;
    }
    var ByteData = new Uint8Array(analyser.frequencyBinCount);
    
    analyser.getByteTimeDomainData(ByteData);

    // var nPeak = (this.peakData.left||this.peakData.right);
    // GIANT HACK: use EQ spectrum data for bass frequencies
    // var eqSamples = 3;
    // for (i=0; i<eqSamples; i++) 
    // {
    //   nPeak = (nPeak||this.eqData[i]);
    // }
    if((Math.abs(parseInt(ByteData[0] - 127)) + Math.abs(parseInt(ByteData[10] - 127)) + Math.abs(parseInt(ByteData[3] - 127))) != 0)
    {
        var left = true;
        var leftValue = 0.;
        var rightValue = 0.;
        sWaveFormData = [];
        for(var i = 0; i < 512; i += 2)
        {
            sWaveFormData.push((ByteData[i] - 127) / 127);
            if(left)
            {
                leftValue += Math.abs(sWaveFormData[i]);
            }
            else
            {
                rightValue += Math.abs(sWaveFormData[i]);
            }
            left = !left;
        }
        leftValue = leftValue / 128;
        rightValue = rightValue / 128;

        sSoundAmplitude = sSoundAmplitude * 0.9 + 0.5 * 0.1 * (sLengthLegsSound.left + sLengthLegsSound.right);//(0.9+(nPeak*0.1));
        sLengthLegsSound.left = (sLengthLegsSound.left * 0.9 +(leftValue*0.1));
        sLengthLegsSound.right = (sLengthLegsSound.right * 0.9 +(rightValue*0.1));
    }
}
