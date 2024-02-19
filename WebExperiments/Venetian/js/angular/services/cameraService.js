
(function() {
    'use strict';

    // Wrapper around camera plugin
    app.factory('cameraService', ['$timeout', 'settingsService', 'updateCallService', 'particleManagerService', 'audioMovementService', 'blurService',
        function($timeout, settingsService, updateCallService, particleManagerService, audioMovementService, blurService) {

        var NUM_PART = 20;
        var particles = [];

        var lon = 0,
            lat = 0,
            latTarget = 0,
            lonTarget = 0,
            phi = 0, theta = 0;
            var positionTarget = new THREE.Vector3();
        var fov = 70,
            isUserInteracting = false;
        var onPointerDownPointerX = 0, onPointerDownPointerY = 0,
            onPointerDownLon = 0,
            onPointerDownLat = 0;

        var positionToLookAt = new Vec3f();
        var cameraDistance = 3;
        var newAngle = 1.5;
        var distanceFree = false;
        var lastCameraSwitch = 0;
            var setNoisyFocal = false;

        var scene = null;
        var camera = new THREE.PerspectiveCamera( fov, window.innerWidth / window.innerHeight, 1, 1000 );

        //updateCallService.attach(update);

        var cameraFactory = {};

        cameraFactory.init = function(aScene) {
            document.addEventListener( 'mousemove', onDocumentMouseMove, false );
            document.addEventListener( 'mousewheel', onDocumentMouseWheel, false );
            //document.addEventListener( 'MozMousePixelScroll', onDocumentMouseWheel, false);
            window.addEventListener( 'resize', onWindowResized, false );

            scene = aScene;
        };


        function onWindowResized( event ) {

            camera.projectionMatrix.makePerspective( fov, window.innerWidth / window.innerHeight, 1, 1100 );
        }

        function onDocumentMouseMove( event ) {

            lonTarget = ( event.clientX - window.innerWidth * 0.5 ) / window.innerWidth;
            latTarget = ( event.clientY - window.innerHeight * 0.5 ) / window.innerHeight;

        }

        function onDocumentMouseUp( event ) {

            document.removeEventListener( 'mousemove', onDocumentMouseMove, false );
            document.removeEventListener( 'mouseup', onDocumentMouseUp, false );

        }

        function onDocumentMouseWheel( event ) {

            // WebKit

            if ( event.wheelDeltaY ) {

                fov -= event.wheelDeltaY * 0.05;

                // Opera / Explorer 9

            } else if ( event.wheelDelta ) {

                fov -= event.wheelDelta * 0.05;

                // Firefox

            } else if ( event.detail ) {

                fov += event.detail * 1.0;

            }

            camera.projectionMatrix.makePerspective( fov, window.innerWidth / window.innerHeight, 1, 1100 );
        }

        var pickNewAngle = function () {

            var now = Date.now();
            if(now - lastCameraSwitch < 2000) {
                return;
            }
            lastCameraSwitch = now;

            var particle = particleManagerService.getParticle();

            if(particle) {
                //var positionPart = particle.getWorldPosition();
                positionToLookAt = particleManagerService.getGoodCameraPosition();
                positionTarget.copy(positionToLookAt);

                if(distanceFree) {
                    if(Math.random() < 0.7) {
                        cameraDistance = 0.8 + Math.random() * 0.4;
                    }
                    else {
                        cameraDistance = 1.5 + Math.random() * 1.5;
                    }
                }
                var distance = getWidth() * (0.04 + Math.random() * 0.04) * cameraDistance;
                positionTarget.x += Math.cos(newAngle) * distance;
                positionTarget.z += Math.sin(newAngle) * distance;
                positionTarget.y += Math.random() * distance * 0.1;
                if(setNoisyFocal) {
                    blurService.setDistanceFocalNow(Math.random() * 400);
                }
                blurService.setDistanceFocal(positionToLookAt.distanceTo(positionTarget));
                camera.lookAt( positionToLookAt );
                //camera.ro;
                newAngle += (0.5 + Math.random()) * Math.PI;
            }
        };

        cameraFactory.update = function() {
            //lon += .15;

            //lat = Math.max( - 85, Math.min( 85, lat ) );
            //phi = THREE.Math.degToRad( 90 - lat );
            //theta = THREE.Math.degToRad( lon );

            positionTarget.x += 0.01 * cameraDistance;
            camera.position.copy(positionTarget);
            //camera.position.x += lat * 20;
            //camera.position.y += lon * 20;
            camera.lookAt( positionToLookAt);

            lat += (latTarget - lat) * 0.05;
            lon += (lonTarget - lon) * 0.05;

            camera.rotateX(-lat * 0.3);
            camera.rotateY(-lon * 0.3);
            //().add(new THREE.Vector3(lon, -lat,0)));
        };

        var setDistance = function(aDistance) {
            cameraDistance = aDistance;
            distanceFree = false;
        };

        var setDistanceFree = function() {
            distanceFree = true;
        };

        var forceAngle = function(aAngle) {
            newAngle = aAngle;
        };

        cameraFactory.getCamera = function() {
            return camera;
        };

        cameraFactory.pickNewAngle = pickNewAngle;
        cameraFactory.forceAngle = forceAngle;
        cameraFactory.setDistanceFree = setDistanceFree;
        cameraFactory.setDistance = setDistance;
        cameraFactory.setNoisyFocal = function(aValue) {setNoisyFocal = aValue;};

        return cameraFactory;

    }]);
})();   // use strict
