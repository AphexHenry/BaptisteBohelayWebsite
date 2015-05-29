
var GuiLogoFolder;

var Settings = function()
{
    this.set = {};
    this.set.background = {};
    this.set.background.enable = false;
    this.set.background.r = 0;
    this.set.background.g = 0;
    this.set.background.b = 0;

    this.set.cards = {};
    this.set.cards.sizeShow = 1;

    this.save = function() {
        $.cookie("settings-data", JSON.stringify(this.set));
    }

    this.load();
    this.setup();

}

Settings.prototype.get = function() {
    return this.set;
}

Settings.prototype.load = function() {
    var lSettings = JSON.parse($.cookie("settings-data"));
    if(lSettings) {
        this.set = lSettings;
    }
}

Settings.prototype.setup = function()
{
    this.gui = new dat.GUI({width: 300});

    var fg = this.gui.addFolder('Background');
    fg.add(this.set.background, 'enable', true).name("enable").listen();
    fg.add(this.set.background, 'r', 0, 1).name("red").listen();
    fg.add(this.set.background, 'g', 0, 1).name("green").listen();
    fg.add(this.set.background, 'b', 0, 1).name("blue").listen();

    var fC = this.gui.addFolder('Cards');
    fC.add(this.set.cards, 'sizeShow', 0.1, 4.).name("Size show").step(0.05).listen();

    this.gui.add(this, 'save');
}
