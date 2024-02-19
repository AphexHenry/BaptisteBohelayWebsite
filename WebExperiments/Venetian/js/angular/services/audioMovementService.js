(function() {
	'use strict';

	// Wrapper around camera plugin
	app.factory('audioMovementService', ['settingsService', 'updateCallService', 'analyzeParserService', function(settingsService, updateCallService, analyzeParserService) {

		var audioMovementFactory = {};

		var position = new THREE.Vector3();
		var scale = 1;
		var timer = 0;
		var volume = 100;
		var readyCallback = [];
		var finnishCallback = null;

		updateCallService.attach(render);

		var peakDataStereo = {};
		var sSoundAmplitude = 0;
		var sProcessedAmp = 0;
		var sAttackVar = 0;
		var sound;
		var string = 0;
		var stringTarget = 0;

		var setup = function() {

				setSound(gRoot + "/audio/VSA.mp3");
		}

		function Sound(source,volume,loop, whilePlayingCallback, finnishCallback, onCanPlayCallback)
		{
			this.source=source;
			this.volume=volume;
			this.loop=loop;
			var son;
			this.son=son;
			this.finish=false;
			this.stop=function()
			{
				document.body.removeChild(this.son);
			};

			this.start=function()
			{
				if(this.finish)return false;
				this.son=document.createElement("audio");
				this.son.setAttribute("src",this.source);
				this.son.setAttribute("hidden","true");
				this.son.setAttribute("volume",this.volume);
				this.son.setAttribute("autostart",false);
				//this.son.setAttribute("loop",this.loop);
				this.son.pause();
				this.son.oncanplay = onCanPlayCallback;
				this.son.onended = finnishCallback;
				this.son.ontimeupdate = whilePlayingCallback;
				document.body.appendChild(this.son);
				this.play();
			};

			this.play=function()
			{
				this.son.play();
			};

			this.remove=function()
			{
				document.body.removeChild(this.son);
				this.finish=true;
			};
			this.init=function(volume,loop)
			{
				this.finish=false;
				this.volume=volume;
				this.loop=loop;
			};

			this.getPosition=function()
			{
				return this.son.currentTime;
			};

			this.getDuration=function()
			{
				return this.son.duration;
			};

			this.setPosition=function(aTime)
			{
				this.son.currentTime = aTime;
			};
		}

		var setSound = function(aPath) {
			var eventsSound = {
				whileplaying: function() {

					//sSoundAmplitude = 0.9 * sSoundAmplitude +(nPeak*0.1);

					sAttackVar *= 0.1;

					if(analyzeParserService.getAttack(sound.getPosition() * 1000 + 200)) {
						console.log("bang!" + sAttackVar);
						sAttackVar = 1;
					}

					//sProcessedAmp = Math.sqrt(Math.max(nPeak, 0.0001)) * 10;

					//peakDataStereo.left = (peakDataStereo.left * 0.9 +(this.peakData.left*0.1));
					//peakDataStereo.right = (peakDataStereo.right * 0.9 +(this.peakData.right*0.1));
				},

				finnishCallback: function()
				{
					finnishCallback();
				},

				onload:function() {
					for(var callbck in readyCallback)
					{
						readyCallback[callbck]();
					}
				}
			}; // events{}

			// create sound
			sound = new Sound(aPath, 100, false, eventsSound.whileplaying, eventsSound.finnishCallback, eventsSound.onload);
			sound.start();
			//sound = soundManager.createSound({
			//	id:'sound' + aName,
			//	url:aPath,
			//	useWaveformData:true,
			//	useEQData:false,
			//	usePeakData:true,
			//	volume:100,
			//	whileplaying:eventsSound.whileplaying,
			//	onstop:eventsSound.stop,
			//	onfinish:finnishCallback,
			//	autoLoad: true,
			//	autoPlay: false,
			//	onload:eventsSound.onload
			//});

			var gui = settingsService.getGUI();
			var obj = {toggle : function() {
				if(sound.playState == 0){
					sound.play();
				}
				else {
					sound.stop();
				}
			}};

			gui.add(obj,'toggle');
			peakDataStereo = sound.peakData;
		};

		function render(aDelta) {
			//timer += aDelta * 0.1;// * sProcessedAmp;
			timer = getTimeElapsedS() * 0.39 + 8;
			position = getPositionWithDelay();
			string += (stringTarget - string) * aDelta * 0.2;
		}

		var getPositionWithDelay = function(aDelay) {
			var lTimer = timer * 0.5 + (aDelay || 0) ;
			var lPosition = new THREE.Vector3();
			lPosition.x = Math.sin(lTimer);
			lPosition.y = Math.cos(lTimer);
			lPosition.z = Math.sin(lTimer * 0.7);
			lPosition.multiplyScalar(0.07);
			return lPosition;
		};

		audioMovementFactory.getPosition = function(delay) {
			if(delay) {
				return getPositionWithDelay(delay);
			}
			else {
				return position.clone();
			}
		};

		var setPosition = function(aTime) {
			sound.setPosition(aTime);
		};

		var setString = function(aValue) {
			console.log('string ' + aValue);

			stringTarget = aValue;
		};

		var getString = function() {
			return string;
		};

		var getTimeLeftS = function() {
			return (sound.getDuration() - sound.getPosition());
		};

		var getTimeElapsedS = function() {
			return sound ? sound.getPosition() : 0;
		};

		var getScale = function(aPart, aPosition) {
			return sAttackVar;
		};

		var whenReady = function(aCallback) {
			readyCallback.push(aCallback);
		};

		var whenFinnished = function(aCallback) {
			finnishCallback = aCallback;
		};

		var play = function() {
			sound.play();
		};

		audioMovementFactory.setup = setup;
		audioMovementFactory.whenReady = whenReady;
		audioMovementFactory.whenFinnished = whenFinnished;
		audioMovementFactory.getScale = getScale;
		audioMovementFactory.getTimeLeftS = getTimeLeftS;
		audioMovementFactory.getTimeElapsedS = getTimeElapsedS;
		audioMovementFactory.getPositionWithDelay = getPositionWithDelay;
		audioMovementFactory.setSound = setSound;
		audioMovementFactory.play = play;
		audioMovementFactory.setString = setString;
		audioMovementFactory.getString = getString;
		audioMovementFactory.setSoundPosition = setPosition;
		return audioMovementFactory;

	}]);
})();   // use strict