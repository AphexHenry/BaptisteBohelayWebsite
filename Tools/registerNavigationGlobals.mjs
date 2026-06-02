/**
 * Registers Navigation on globalThis so classic scripts and inline HTML handlers keep working.
 */
import { Navigation } from './Navigation.mjs';

globalThis.Navigation = Navigation;

const legacyBindings = [
	['GoToIndex', 'goToIndex'],
	['GoBack', 'goBack'],
	['GlobalGroupInit', 'globalGroupInit'],
	['GlobalGroupTeminate', 'globalGroupTerminate'],
	['HtmlToCircles', 'htmlToCircles'],
	['LoadedInitDisplay', 'loadedInitDisplay'],
	['SetHashHTML', 'setHashHTML'],
	['SetHashGroup', 'setHashGroup'],
	['GetHashGroup', 'getHashGroup'],
	['CirclesToHtmlEncoded', 'circlesToHtmlEncoded'],
	['CirclesToHtml', 'circlesToHtml'],
	['inAppCirlceBackOut', 'inAppCirlceBackOut'],
	['inAppCirlceBackIn', 'inAppCirlceBackIn'],
	['changeButtonBackOut', 'changeButtonBackOut'],
	['changeButtonBackIn', 'changeButtonBackIn'],
	['replaceImageSource', 'replaceImageSource'],
	['BackCircle', 'backCircle'],
	['open_in_new_tab', 'openInNewTab'],
	['SetBackButton', 'setBackButton'],
	['removeRoundCorner', 'removeRoundCorner'],
];

for (const [legacyName, methodName] of legacyBindings) {
	globalThis[legacyName] = (...args) => Navigation[methodName](...args);
}

Object.defineProperty(globalThis, 'sIsInHTML', {
	get() {
		return Navigation.isInHTML;
	},
	set(value) {
		Navigation.isInHTML = value;
	},
	enumerable: true,
	configurable: true,
});

Object.defineProperty(globalThis, 'sGroupCurrent', {
	get() {
		return Navigation.groupCurrent;
	},
	set(value) {
		Navigation.goToIndex(value);
	},
	enumerable: true,
	configurable: true,
});
