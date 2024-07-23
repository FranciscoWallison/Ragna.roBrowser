// UI/Components/WinLogin/WinLogin.js

import DB from "../../../../DB/DBManager.js";
import Client from "../../../../Core/Client.js";
import Preferences from "../../../../Core/Preferences.js";
import Renderer from "../../../../Renderer/Renderer.js";
import KEYS from "../../../../Controls/KeyEventHandler.js";
import UIManager from "../../../../UI/UIManager.js";
import UIComponent from "../../../../UI/UIComponent.js";

import htmlText from "./WinLogin.html";
import cssText from "./WinLogin.css";

// var htmlText    = require('text!./WinLogin.html');
// var cssText     = require('text!./WinLogin.css');
// import css from '!!raw-loader!./file.txt'; 


class WinLogin extends UIComponent {
	constructor() {
		super("WinLogin", htmlText, cssText);
		this._preferences = Preferences.get(
			"WinLogin",
			{
				saveID: true,
				ID: "",
			},
			1.0
		);

		this._inputUsername = null;
		this._inputPassword = null;
		this._buttonSave = null;
	}

	init() {
		var ui = this.ui;

		this.draggable();

		// Save Elements
		this._inputUsername = ui.find(".user").mousedown((event) => {
			this._inputUsername.focus();
			this._inputUsername.value = "";
			event.stopImmediatePropagation();
			return false;
		});

		this._inputPassword = ui.find(".pass").mousedown((event) => {
			this._inputPassword.focus();
			this._inputPassword.value = "";
			event.stopImmediatePropagation();
			return false;
		});

		this._buttonSave = ui
			.find(".save")
			.mousedown(this.toggleSaveButton.bind(this));

		// Connect / Exit
		ui.find(".connect").click(this.connect.bind(this));
		ui.find(".exit").click(this.exit.bind(this));
	}

	onAppend() {
		// Complete element
		this._inputUsername.val(
			this._preferences.saveID ? this._preferences.ID : ""
		);
		this._inputPassword.val("");

		// Display save button
		Client.loadFile(
			DB.INTERFACE_PATH +
				"login_interface/chk_save" +
				(this._preferences.saveID ? "on" : "off") +
				".bmp",
			(url) => {
				this._buttonSave.css("backgroundImage", "url(" + url + ")");
			}
		);

		if (this._preferences.ID.length) {
			this._inputPassword.focus();
		} else {
			this._inputUsername.focus();
		}
	}

	onKeyDown(event) {
		switch (event.which) {
			case KEYS.ENTER:
				this.connect();
				event.stopImmediatePropagation();
				return false;

			case KEYS.ESCAPE:
				this.exit();
				event.stopImmediatePropagation();
				return false;

			case KEYS.TAB:
				var button =
					document.activeElement === this._inputUsername[0]
						? this._inputPassword
						: this._inputUsername;
				button.focus().select();
				event.stopImmediatePropagation();
				return false;
		}

		return true;
	}

	toggleSaveButton(event) {
		this._preferences.saveID = !this._preferences.saveID;

		Client.loadFile(
			DB.INTERFACE_PATH +
				"login_interface/chk_save" +
				(this._preferences.saveID ? "on" : "off") +
				".bmp",
			(url) => {
				this._buttonSave.css("backgroundImage", "url(" + url + ")");
			}
		);

		event.stopImmediatePropagation();
		return false;
	}

	exit() {
		this.onExitRequest();
		return false;
	}

	connect() {
		var user = this._inputUsername.val();
		var pass = this._inputPassword.val();

		// Store variable in localStorage
		if (this._preferences.saveID) {
			this._preferences.saveID = true;
			this._preferences.ID = user;
		} else {
			this._preferences.saveID = false;
			this._preferences.ID = "";
		}

		this._preferences.save();

		// Connect
		this.onConnectionRequest(user, pass);
		return false;
	}

	onConnectionRequest(user, pass) {
		// Abstract function once user wants to connect
	}

	onExitRequest() {
		// Abstract function when user wants to exit
	}
}

UIManager.addComponent(WinLogin);
export default WinLogin;
