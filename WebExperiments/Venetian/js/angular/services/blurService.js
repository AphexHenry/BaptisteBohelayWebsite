(function() {
    'use strict';

    // Wrapper around camera plugin
    app.factory('blurService', ['settingsService', 'particleManagerService', function(settingsService, particleManagerService) {

        var blurService = {};
        var postprocessing = {};
        var height = window.innerHeight;
        var shaderSettings = {
            rings: 3,
            samples: 4
        };
        var distanceFocus = 100;
        var distanceFocusSpeed = 0;
        var sDistanceFocusTarget = 100;
        var sSlidingFocus = 0;
        var material_depth = new THREE.MeshDepthMaterial();
        var effectController = {};
        var sCamera = null;


        function initPostprocessing() {

            postprocessing.scene = new THREE.Scene();

            postprocessing.camera = new THREE.OrthographicCamera( window.innerWidth / - 2, window.innerWidth / 2,  window.innerHeight / 2, window.innerHeight / - 2, -10000, 10000 );
            postprocessing.camera.position.z = 100;

            postprocessing.scene.add( postprocessing.camera );

            var pars = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBFormat };
            postprocessing.rtTextureDepth = new THREE.WebGLRenderTarget( window.innerWidth, height, pars );
            postprocessing.rtTextureColor = new THREE.WebGLRenderTarget( window.innerWidth, height, pars );

            var bokeh_shader = THREE.BokehShader;

            postprocessing.bokeh_uniforms = THREE.UniformsUtils.clone( bokeh_shader.uniforms );

            postprocessing.bokeh_uniforms[ "tColor" ].value = postprocessing.rtTextureColor;
            postprocessing.bokeh_uniforms[ "tDepth" ].value = postprocessing.rtTextureDepth;

            postprocessing.bokeh_uniforms[ "textureWidth" ].value = window.innerWidth;

            postprocessing.bokeh_uniforms[ "textureHeight" ].value = height;

            postprocessing.materialBokeh = new THREE.ShaderMaterial( {

                uniforms: postprocessing.bokeh_uniforms,
                vertexShader: bokeh_shader.vertexShader,
                fragmentShader: bokeh_shader.fragmentShader,
                defines: {
                    RINGS: shaderSettings.rings,
                    SAMPLES: shaderSettings.samples
                }

            } );

            postprocessing.quad = new THREE.Mesh( new THREE.PlaneBufferGeometry( window.innerWidth, window.innerHeight ), postprocessing.materialBokeh );
            postprocessing.quad.position.z = - 500;
            postprocessing.scene.add( postprocessing.quad );

        }

        function setupGUI() {
            effectController  = {

                enabled: true,
                jsDepthCalculation: true,
                shaderFocus: false,
                shaderLength: 35,

                fstop: 7.2,
                maxblur: 1.5,

                showFocus: false,
                //focalDepth: 2.8,
                manualdof: false,
                vignetting: false,
                depthblur: false,

                threshold: 0.5,
                gain: 2.0,
                bias: 0.5,
                fringe: 0.7,

                focalLength: 55,
                noise: true,

                dithering: 0.0001,
                myFocalDistance:100
            };

            var shaderSettings = {
                rings: 3,
                samples: 3
            };

            var matChanger = function( ) {

                for (var e in effectController) {
                    if (e in postprocessing.bokeh_uniforms)
                        postprocessing.bokeh_uniforms[ e ].value = effectController[ e ];
                }

                postprocessing.enabled = effectController.enabled;
                var camera = sCamera;//cameraService.getCamera();
                postprocessing.bokeh_uniforms[ 'znear' ].value = camera.near;
                postprocessing.bokeh_uniforms[ 'zfar' ].value = camera.far;
                //camera.setLens(effectController.focalLength);
            };

            function shaderUpdate() {
                postprocessing.materialBokeh.defines.RINGS = shaderSettings.rings;
                postprocessing.materialBokeh.defines.SAMPLES = shaderSettings.samples;

                postprocessing.materialBokeh.needsUpdate = true;
            }

            var gui = settingsService.getGUI();

            gui.add( effectController, "enabled" ).onChange( matChanger );
            //gui.add( effectController, "jsDepthCalculation" ).onChange( matChanger );
            //gui.add( effectController, "shaderFocus" ).onChange( matChanger );
            //gui.add( effectController, "focalDepth", 0.0, 200.0 ).listen().onChange( matChanger );
            //gui.add( effectController, "focalLength", 16, 80, 0.001 ).onChange( matChanger );


            gui.add( effectController, "fstop", 0.1, 22, 0.001 ).onChange( matChanger );
            gui.add( effectController, "maxblur", 0.0, 5.0, 0.025 ).onChange( matChanger );

            gui.add( effectController, "showFocus" ).onChange( matChanger );
            gui.add( effectController, "manualdof" ).onChange( matChanger );
            gui.add( effectController, "vignetting" ).onChange( matChanger );

            gui.add( effectController, "depthblur" ).onChange( matChanger );

            gui.add( effectController, "threshold", 0, 1, 0.001 ).onChange( matChanger );
            gui.add( effectController, "gain", 0, 100, 0.001 ).onChange( matChanger );
            gui.add( effectController, "bias", 0,3, 0.001 ).onChange( matChanger );
            gui.add( effectController, "fringe", 0, 5, 0.001 ).onChange( matChanger );

            //gui.add( effectController, "focalLength", 1, 80, 0.001 ).onChange( matChanger );

            //gui.add( effectController, "noise" ).onChange( matChanger );

            gui.add( effectController, "dithering", 0, 0.001, 0.0001 ).onChange( matChanger );

            gui.add( effectController, "myFocalDistance", 0, 500 ).onChange(blurService.setDistanceFocal);

            gui.add( shaderSettings, "rings", 1, 8).step(1).onChange( shaderUpdate );
            gui.add( shaderSettings, "samples", 1, 13).step(1).onChange( shaderUpdate );
            gui.close();
            matChanger();
            shaderUpdate();
        }

        blurService.init = function(scene, camera, renderer) {
            sCamera = camera;
            initPostprocessing();
            setupGUI();
        };

        blurService.updateDistanceFocal = function(aDistance) {

            var camera = sCamera;

            var targetDistance = aDistance;

            distanceFocusSpeed += (targetDistance - distanceFocus) * 0.03;
            distanceFocus += distanceFocusSpeed * 0.03;
            distanceFocusSpeed *= 0.985;

            var sdistance = smoothstep(camera.near, camera.far, distanceFocus);

            var depth = 1 -  sdistance;
            var zfar = camera.far;
            var znear = camera.near;
            var ldistance = -zfar * znear / (depth * (zfar - znear) - zfar);

            postprocessing.bokeh_uniforms[ 'focalDepth' ].value = ldistance;
        };

        blurService.render = function(scene, renderer, camera) {
            //postprocessing.composer.render( 0.1 );

            var particle = particleManagerService.getParticle();
            if(!particle)
                return;

            var distanceFocal = particle.getWorldPosition().distanceTo(camera.position);// 400;// + (1 + Math.cos(Date.now() / 1000)) * 200;
            sSlidingFocus += 0.01;//Math.abs(particle.getScale());
            blurService.updateDistanceFocal(sDistanceFocusTarget - sSlidingFocus);
            //blurService.updateDistanceFocal(effectController.myFocalDistance);

            scene.overrideMaterial = null;
            renderer.render( scene, camera, postprocessing.rtTextureColor, true );

            // Render depth into texture

            scene.overrideMaterial = material_depth;
            renderer.render( scene, camera, postprocessing.rtTextureDepth, true );

            // Render bokeh composite

            renderer.render( postprocessing.scene, postprocessing.camera );
        };

        blurService.setDistanceFocal = function(aDistanceFocal) {sDistanceFocusTarget = aDistanceFocal; sSlidingFocus = 0;};
        blurService.setDistanceFocalNow = function(aDistanceFocal) {distanceFocus = aDistanceFocal;};
        return blurService;

    }]);
})();   // use strict
