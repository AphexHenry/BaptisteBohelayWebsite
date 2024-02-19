
(function() {
    'use strict';
    // Wrapper around camera plugin
    app.factory('stateManagerService', ['$timeout', 'cameraService', 'updateCallService', 'particleManagerService', 'audioMovementService', 'blurService',
        function($timeout, cameraService, updateCallService, particleManagerService, audioMovementService, blurService) {

            var stateManagerService = {};

            var events = [];
            var lastIndexEvent = 0;

            updateCallService.attach(render);

            audioMovementService.whenReady(function() {
                $('#loading').fadeOut(1500);
                $timeout(function(){$('#fader').fadeOut(2000);}, 1500);
                $timeout(audioMovementService.play, 3000);
                cameraService.setDistance(3);
                cameraService.pickNewAngle();
                cameraService.setNoisyFocal(true);
            });

            audioMovementService.whenFinnished(function() {
                $('#credits').fadeIn(2000);
            });


            audioTimeout(function() {
            //    cameraService.setDistance(3);
            //    cameraService.pickNewAngle();
            //    audioMovementService.setSoundPosition(117);
            }, 0.1);

            audioTimeout(function() {
                cameraService.setDistance(2);
                //cameraService.forceAngle(0);
                cameraService.pickNewAngle();
                    //audioMovementService.setSoundPosition(120000);
            }, 5);

            audioTimeout(function() {
                cameraService.setDistance(1);
                cameraService.pickNewAngle();
            }, 10);

            audioTimeout(function() {
                cameraService.setDistance(0.4);
                cameraService.forceAngle(Math.PI);
                cameraService.pickNewAngle();
            }, 13);

            audioTimeout(function() {
                cameraService.setDistance(1);
                cameraService.pickNewAngle();
            }, 20);

            audioTimeout(function() {
                particleManagerService.setState(1);
            }, 23);

            audioTimeout(function() {
                cameraService.pickNewAngle();
            }, 25);

            audioTimeout(function() {
                pickNewAngle();
            }, 29);

            audioTimeout(function() {
                cameraService.setDistanceFree();
            }, 40);

            audioTimeout(function() {
                cameraService.setDistance(2);
                cameraService.pickNewAngle();
            }, 68);

            audioTimeout(function() {
                audioMovementService.setString(0.5);
            }, 73);

            //audioTimeout(function() {
            //    cameraService.setDistance(1.5);
            //    cameraService.pickNewAngle();
            //}, 73500);

            audioTimeout(function() {
                audioMovementService.setString(0);
            }, 76);



            audioTimeout(function() {
                audioMovementService.setString(1);
            }, 80);

            audioTimeout(function() {
                audioMovementService.setString(0);
            }, 83);

            audioTimeout(function() {
                audioMovementService.setString(0.3);
            }, 88);

            audioTimeout(function() {
                audioMovementService.setString(0);
            }, 91);

            audioTimeout(function() {
                audioMovementService.setString(1);
            }, 95);

            audioTimeout(function() {
                audioMovementService.setString(0);
            }, 98);

            audioTimeout(function() {
                cameraService.setDistance(3);
            }, 107);


            audioTimeout(function() {
                //audioMovementService.setString(0.8);
            }, 108);

            audioTimeout(function() {
                audioMovementService.setString(0);
            }, 113);


            audioTimeout(function() {
                cameraService.setDistance(0.5);
                cameraService.setNoisyFocal(false);
                cameraService.pickNewAngle();
            }, 117);

            function audioTimeout(aCallback, aTime) {
                events.push({callback:aCallback, time:aTime})
            }

            function render() {
                if(lastIndexEvent >= events.length)
                    return;
                var lastIndexTime = events[lastIndexEvent].time;
                var currentTimeAudioMs = audioMovementService.getTimeElapsedS();
                if(currentTimeAudioMs >= lastIndexTime) {
                    events[lastIndexEvent].callback();
                    lastIndexEvent++;
                }
            }

            function pickNewAngle() {
                var particle = particleManagerService.getParticle();
                $timeout(pickNewAngle, particle ? 7000 + Math.random() * 2000 : 500);
                cameraService.pickNewAngle();
            }

            $( window ).keydown(function( event ) {
                switch(event.keyCode - 49) {
                    case 0:
                        particleManagerService.setState(0);
                        break;
                    case 1:
                        particleManagerService.setState(1);
                        break;
                    case 2:
                        particleManagerService.setState(2);
                        cameraService.setDistance(3);
                        lastIndexEvent = 100;
                        pickNewAngle();
                        break;
                    default:
                        break;
                }
            });


            return stateManagerService;

        }]);
})();   // use strict
