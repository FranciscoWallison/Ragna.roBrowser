/**
 * Core/Context.js
 *
 * Application Context
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author Vincent Thibault
 */

const Context = {
	Is: {
		APP: !!(window.chrome && window.chrome.app && window.chrome.app.window),
		POPUP: !!window.opener,
		FRAME: window.top !== window.self,
	},

	isFullScreen() {
		return !!(
			document.fullscreenElement ||
			document.mozFullScreenElement ||
			document.webkitFullscreenElement ||
			(Context.Is.APP &&
				window.chrome.app.window.current().isFullscreen())
		);
	},

	requestFullScreen() {
		if (Context.Is.APP) {
			window.chrome.app.window.current().fullscreen();
			return;
		}

		if (!Context.isFullScreen()) {
			const element = document.documentElement;

			if (element.requestFullscreen) {
				element.requestFullscreen();
			} else if (element.mozRequestFullScreen) {
				element.mozRequestFullScreen();
			} else if (element.webkitRequestFullscreen) {
				element.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
			}
		}
	},

	cancelFullScreen() {
		if (Context.Is.APP) {
			window.chrome.app.window.current().restore();
			return;
		}

		if (document.cancelFullScreen) {
			document.cancelFullScreen();
		} else if (document.mozCancelFullScreen) {
			document.mozCancelFullScreen();
		} else if (document.webkitCancelFullScreen) {
			document.webkitCancelFullScreen();
		}
	},

	checkSupport() {
		let div, canvas, element, gl;

		div = document.createElement("div");
		if (
			!("draggable" in div) &&
			!("ondragstart" in div && "ondrop" in div)
		) {
			throw "Your web browser needs to be updated, it does not support Drag 'nd Drop features.";
		}

		canvas = document.createElement("canvas");
		if (!canvas.getContext || !canvas.getContext("2d")) {
			throw "Your web browser needs to be updated, it does not support <canvas> element.";
		}

		if (!window.WebGLRenderingContext) {
			throw "Your web browser needs to be updated, it does not support 3D graphics.";
		}

		element = document.createElement("canvas");
		try {
			gl = element.getContext("webgl2");
		} catch (e) {}
		try {
			gl = gl || element.getContext("webgl");
		} catch (e) {}

		if (!gl) {
			throw 'Your web browser OR your Graphics Card OR Drivers need to be updated, it does not support 3D graphics.\nFor more information check <a href="http://get.webgl.org/" target="_blank">get.webgl.org</a>';
		}

		if (!window.Worker) {
			throw "Your web browser needs to be updated, it does not support Threads (Web Worker API).";
		}

		if (!window.File || !window.FileList || !window.FileReader) {
			throw "Your web browser needs to be updated, it does not support File API.";
		}

		if (!window.DataView || !DataView.prototype.getFloat64) {
			throw "Your web browser needs to be updated, it does not support File API (DataView).";
		}
	},
};

export default Context;
