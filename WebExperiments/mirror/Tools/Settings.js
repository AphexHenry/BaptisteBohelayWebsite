
var GuiLogoFolder;

var Settings = function()
{
    this.TIME_BEFORE_OUT_LOGO = 2.;
    this.LOGO_TIME_TO_FORM = 2.;

    this.ATTRACTOR_SPACE = 0.2;
    this.STRENGTH_ATTRACTOR = 2.;
    this.STRENGTH_SPRING = 25.;
    this.STRENGTH_SHOW = 2.;
    this.TIME_BEFORE_OUT = 3;
    this.DISTANCE_ATTRACTOR = 0.4;
}

function GUI(aLogoFiles) 
{
    this.gui = new dat.GUI({width: 300});

    var fg = this.gui.addFolder('General');
    fg.add(set, 'LOGO_DURATION', 5, 60).name("Logo Duration").listen();
    fg.add(set, 'TIME_BETWEEN_LOGO', 10, 500).name("Time Between Logo").listen();
    fg.add(set, 'SLIDE_DURATION', 0, 11).name("Slide Duration").listen();//SLIDE_DURATION...
    fg.add(set, 'TIME_BETWEEN_ANIMATION', 10, 1000).name("Animation Period").listen();//ANIMATION_PERIOD

    var fC = this.gui.addFolder('Camera');
    fC.add(set, 'CAMERA_DURATION', 0.1, 4.).name("Motion Duration Camera").step(0.05).listen();// MOTION_DURATION_CAMERA

    var fJ = this.gui.addFolder('Animation: Jump');
    fJ.add(set, 'DIAPO_SIZE').step(0.01).name("Back Slides Size").listen(); // BACK_SLIDES_SIZE_JUMP
    fJ.add(set, 'DIAPO_SIZE_SHOW').step(0.01).name("Slide Size").listen(); // SLIDE_SIZE_JUMP
    fJ.add(set, 'DIAPO_BOUNDS').name("Boundaries").listen(); // BOUNDARIES_JUMP

    var fAt = this.gui.addFolder('Animation: Attractor');
    fAt.add(set, 'ATTRACTOR_SPACE', 0., 0.2).name("Boundaries").step(0.01).listen(); // BOUNDARIES...
    fAt.add(set, 'ATTRACTOR_IDLE_SIZE', 0., 0.2).name("Back Slides").step(0.01).listen(); // BACK_SLIDES...
    fAt.add(set, 'ATTRACTOR_SHOW_SIZE', 0., 0.3).name("Slides Size").step(0.01).listen(); // SLIDES_SIZE
    fAt.add(set, 'STRENGTH_ATTRACTOR', 0.1, 15.).name("Attractor Strength").listen(); // ATTRACTOR_STR..
    fAt.add(set, 'STRENGTH_SPRING', 0.1, 20.).name("Spring Strength").listen(); // 
    fAt.add(set, 'STRENGTH_SHOW', 0.1, 10.).name("Push Through Strength").listen(); // PUSH_THROUGH_STR...
    fAt.add(set, 'TIME_BEFORE_OUT', 5., 9.).name("Time Before Out").listen();
    fAt.add(set, 'DISTANCE_ATTRACTOR', 0.01, 1.5).name("Distance Attractor").listen();

    GuiLogoFolder = this.gui.addFolder('Animation: Logo');
    GuiLogoFolder.add(set, 'LOGO_TIME_TO_FORM', 0.1, 3.).name("Formation Duration").step(0.1).listen(); // FORMATION_DUR
    GuiLogoFolder.add(set, 'TIME_BEFORE_OUT_LOGO', 0.1, 4.).name("Explosion Duration").step(0.1).listen(); // EXPLOSION_DUR...

    this.gui.add(set, 'save');
}     
