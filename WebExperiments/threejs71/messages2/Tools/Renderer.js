/**
 * Created by baptistebohelay on 15-05-29.
 */

function Renderer() {
    this.container = document.createElement( 'div' );
    document.body.appendChild( this.container );

    this.postprocessing = {};


    this.camera = new THREE.PerspectiveCamera( 70, width / height, 1, 3000 );
    this.camera.position.z = 200;

    this.scene = new THREE.Scene();

    this.renderer = new THREE.WebGLRenderer( { antialias: true, alpha:true } );
    this. renderer.setPixelRatio( window.devicePixelRatio );
    this.renderer.setSize( width, height );
    this.renderer.sortObjects = true;
    this.renderer.autoClear = false;
    this.scene.matrixAutoUpdate = false;
    this.container.appendChild( this.renderer.domElement );

    this.InitPostprocessing();

    this.cameraFront = new THREE.OrthographicCamera( getWidth() / - 2, getWidth() / 2, getHeight() / 2, getHeight() / - 2, -10000, 10000 );
    this.sceneBack = new THREE.Scene();
    this.sceneBack.add( this.cameraFront );

    this.sceneFront = new THREE.Scene();
    this.sceneFront.add( this.cameraFront );

}

Renderer.prototype.InitPostprocessing = function() {
    var renderPass = new THREE.RenderPass( this.scene, this.camera );

    var bokehPass = new THREE.BokehPass( this.scene, this.camera, {
        focus: 		1.0,
        aperture:	0.01,
        maxblur:	1.0,

        width: width,
        height: height
    } );

    bokehPass.renderToScreen = true;

    var composer = new THREE.EffectComposer( this.renderer );

    composer.addPass( renderPass );
    composer.addPass( bokehPass );

    this.postprocessing.composer = composer;
    this.postprocessing.bokeh = bokehPass;
}

Renderer.prototype.matChanger = function( ) {
    this.postprocessing.bokeh.uniforms[ "focus" ].value = effectController.focus;
    this.postprocessing.bokeh.uniforms[ "aperture" ].value = effectController.aperture;
    this.postprocessing.bokeh.uniforms[ "maxblur" ].value = effectController.maxblur;
};

Renderer.prototype.onWindowResize = function() {

    var width = window.innerWidth;
    var height = window.innerHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize( width, height );
    this.postprocessing.composer.setSize( width, height );
}

Renderer.prototype.render = function() {

    var time = Date.now() * 0.00005;

    this.camera.lookAt( this.scene.position );

    this.renderer.setClearColor( new THREE.Color(set.background.r, set.background.g, set.background.b), 1);
    this.renderer.clear();
    // if we want the background, we need to get rid of the blur :(
    if(set.background.enable) {
        this.renderer.render( this.sceneBack, this.cameraFront);
        this.renderer.render( this.scene, this.camera);
    }
    else {
        this.postprocessing.composer.render( 0.1 );
    }
    this.renderer.render(this.sceneFront, this.cameraFront)

}
