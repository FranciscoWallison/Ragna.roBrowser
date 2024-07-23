/**
 * UI/Components/WinLogin/WinLogin.js
 *
 * Login Window
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 */

var publicName = "WinLogin";

import WinLogin from "./WinLogin/WinLogin.js"
import WinLoginV2 from "./WinLoginV2/WinLoginV2.js"

import UIVersionManager from "../../../UI/UIVersionManager.js"

var versionInfo = {
	default: WinLogin,
	common: {
		20181114: WinLoginV2,
	},
	re: {},
	prere: {},
};

var Controller = UIVersionManager.getUIController(publicName, versionInfo);

export default Controller;
