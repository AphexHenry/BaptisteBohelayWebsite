/**
 * DOM controller for #textDescription / #textDescriptionArea — set copy, typography, fade in/out.
 * Requires jQuery. Instantiated as sTextDescriptionDOMController after load.
 */
function TextDescriptionDOMController()
{
	this.$container = $('#textDescription');
	this.$textarea = $('#textDescriptionArea');
	this.defaultFadeMs = 400;
}

TextDescriptionDOMController.prototype.setText = function ( text )
{
	if (!this.$textarea.length)
	{
		return;
	}
	var s = text != null ? String(text) : '';
	if (this.$textarea.is('textarea') || this.$textarea.is('input'))
	{
		this.$textarea.val(s);
	}
	else
	{
		this.$textarea.text(s);
	}
};

TextDescriptionDOMController.prototype.getText = function ()
{
	if (!this.$textarea.length)
	{
		return '';
	}
	if (this.$textarea.is('textarea') || this.$textarea.is('input'))
	{
		return this.$textarea.val();
	}
	return this.$textarea.text();
};

/**
 * @param {Object} style — CSS properties in camelCase (e.g. { fontSize: '18px', color: '#333', fontFamily: 'Georgia, serif' })
 */
TextDescriptionDOMController.prototype.setStyle = function ( style )
{
	if (!style || !this.$textarea.length)
	{
		return;
	}
	this.$textarea.css(style);
};

/**
 * Fade panel in (opacity). Optional duration in ms.
 */
TextDescriptionDOMController.prototype.show = function ( durationMs )
{
	if (!this.$container.length)
	{
		return;
	}
	var ms = durationMs != null ? durationMs : this.defaultFadeMs;
	this.$container.css({ visibility: 'visible', pointerEvents: 'auto' });
	this.$container.stop(true).fadeTo(ms, 1);
};

/**
 * Fade panel out. Optional duration in ms.
 */
TextDescriptionDOMController.prototype.hide = function ( durationMs )
{
	if (!this.$container.length)
	{
		return;
	}
	var ms = durationMs != null ? durationMs : this.defaultFadeMs;
	var self = this;
	this.$container.stop(true).fadeTo(ms, 0, function ()
	{
		self.$container.css({ visibility: 'hidden', pointerEvents: 'none' });
	});
};

TextDescriptionDOMController.prototype.isVisible = function ()
{
	if (!this.$container.length)
	{
		return false;
	}
	return this.$container.css('visibility') === 'visible' && parseFloat(this.$container.css('opacity')) > 0.01;
};

var sTextDescriptionDOMController = new TextDescriptionDOMController();
