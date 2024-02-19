app.directive('tentaclesBack', function() {
    return {
        restrict: 'A',
        link:function(scope, element, attrs) {

            var options = {};
            options.scrollable = !!attrs.scrollable;
            options.tentacleCount = attrs.tentacleCount || 5;
            options.fog = !!attrs.tentacleFog;
            options.type = attrs.tentacleType;
            options.seed = Math.random();
            options.webGl = false;

            var lastUpdate = 0;
            var snakes = [];

            var renderer;
            var camera;
            var scene;
            var container;

            init();
            animate();


            function init() {

                if(options.webGl) {
                    //container = document.createElement( 'div' );
                    //document.body.appendChild( container );
                    container = element[0];
                    camera = new THREE.OrthographicCamera( -container.clientWidth / 2, container.clientWidth / 2, container.clientHeight / 2, -container.clientHeight / 2, 1, 10000 );
                    camera.position.z = 700;
                    scene = new THREE.Scene();
                    renderer = new THREE.WebGLRenderer( { antialias: true } );
                    renderer.setPixelRatio( window.devicePixelRatio );
                    renderer.setSize( container.clientWidth, container.clientHeight );
                    container.appendChild( renderer.domElement );
                    $('.content').hide();
                    options.scene = scene;
                }
                options.element = element[0];

                for(var i = 0; i < options.tentacleCount; i++) {
                    var obj;
                    switch(options.type) {
                        case 'free':
                        case "0":
                            obj = new TentacleFree();
                            break;
                        case '4':
                        case 'canvas':
                            obj = new TentacleBorder();
                            break;
                        default:
                            obj = new Tentacles();
                            break;
                    }

                    obj.init(options);
                    snakes.push(obj);
                }
            }

            function render() {
                var lTimer = new Date().getTime() / 1000;
                var lDelta =(lTimer - lastUpdate);
                lDelta = Math.min(lDelta, 0.03);
                lastUpdate = lTimer;

                if(options.webGl) {

                    for(var i in snakes) {
                        snakes[i].update(lDelta);
                    }
                    renderer.render( scene, camera );
                }
                else {
                    // erase canvas
                    var canvas = element[0];
                    canvas.width = canvas.width;
                    canvas.height = canvas.height;
                    snakes[0].updateGlobal();
                    for(var i in snakes) {
                        snakes[i].update(lDelta);
                    }
                }
            }

            function animate() {
                requestAnimationFrame( animate );
                if(gAnimated && isElementInViewport(element)) {
                    render();
                }
            }

            function isElementInViewport (el) {

                //special bonus for those using jQuery
                if (typeof jQuery === "function" && el instanceof jQuery) {
                    el = el[0];
                }

                var rect = el.getBoundingClientRect();

                return (
                    (rect.bottom >= 0 && rect.top <= (window.innerHeight || document.documentElement.clientHeight))
                );
            }
        }
    };
});
