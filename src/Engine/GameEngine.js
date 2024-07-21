/**
 * Engine/GameEngine.js
 *
 * Game Engine
 * Global game Engine
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author Vincent Thibault
 */

import jQuery from "../Utils/jquery.js";
import Queue from "../Utils/Queue.js";
import Sound from "../Audio/SoundManager.js";
import BGM from "../Audio/BGM.js";
import DB from "../DB/DBManager.js";
import Configs from "../Core/Configs.js";
import Client from "../Core/Client.js";
import Thread from "../Core/Thread.js";
import Context from "../Core/Context.js";
import LoginEngine from "../Engine/LoginEngine.js";
import Network from "../Network/NetworkManager.js";
import Renderer from "../Renderer/Renderer.js";
import MapRenderer from "../Renderer/MapRenderer.js";
import UIManager from "../UI/UIManager.js";
import Cursor from "../UI/CursorManager.js";
import Scrollbar from "../UI/Scrollbar.js";
import Background from "../UI/Background.js";
import Intro from "../UI/Components/Intro/Intro.js";
import WinList from "../UI/Components/WinList/WinList.js";

let _servers = [];
let _thread_ready = false;

function init() {
	const q = new Queue();

	q.add(function () {
		if (!_thread_ready) {
			Thread.hook("THREAD_ERROR", onThreadError);
			Thread.hook("THREAD_LOG", onThreadLog);
			Thread.hook("THREAD_READY", function () {
				_thread_ready = true;
				q._next();
			});
			Thread.init();
		} else {
			q._next();
		}
	});

	q.add(function () {
		Renderer.init();
		q._next();
	});

	q.add(function () {
		Client.onFilesLoaded = function (count) {
			if (!Configs.get("remoteClient") && !count && !window.requireNode) {
				if (!Context.Is.APP) {
					alert("No client to initialize roBrowser");
				} else {
					// FIXME: no window.alert() in chrome app.
				}
				Intro.remove();
				Intro.append();
				return;
			}
			q._next();
		};

		if (Configs.get("skipIntro")) {
			Client.init([]);
			return;
		}

		Intro.onFilesSubmit = Client.init.bind(Client);
		Intro.append();
	});

	q.add(function () {
		DB.onReady = function () {
			Background.setImage("bgi_temp.bmp"); // remove loading
			q._next();
		};
		DB.onProgress = function (i, count) {
			Background.setPercent(Math.floor((i / count) * 100));
		};
		UIManager.removeComponents();
		Background.init();
		Background.resize(Renderer.width, Renderer.height);
		Background.setImage("bgi_temp.bmp", function () {
			DB.init();
		});
	});

	q.add(function () {
		Thread.send("CLIENT_FILES_ALIAS", DB.mapalias);
		loadClientInfo(q.next);
	});

	q.add(function () {
		Scrollbar.init();
		Cursor.init(q.next);
	});

	q.add(function () {
		reload();
	});

	Context.checkSupport();

	q.run();
}

function reload() {
	BGM.setAvailableExtensions(Configs.get("BGMFileExtension", ["mp3"]));
	BGM.play("01.mp3");

	UIManager.removeComponents();
	Network.close();

	Background.init();
	Background.resize(Renderer.width, Renderer.height);
	Background.setImage("bgi_temp.bmp", function () {
		const list = new Array(_servers.length);
		const count = list.length;

		if (count === 0) {
			UIManager.showMessageBox("Sorry, no server found.", "ok", init);
		} else if (count === 1 && Configs.get("skipServerList")) {
			LoginEngine.onExitRequest = reload;
			LoginEngine.init(_servers[0]);
		} else {
			for (let i = 0; i < count; ++i) {
				list[i] = _servers[i].display;
			}

			WinList.append();
			WinList.setList(list);
		}

		Renderer.stop();
		MapRenderer.free();
		BGM.play("01.mp3");
	});

	WinList.onIndexSelected = onLoginServerSelected;
	WinList.onExitRequest = onExit;
}

function onLoginServerSelected(index) {
	Sound.play("\xB9\xF6\xC6\xB0\xBC\xD2\xB8\xAE.wav");

	WinList.remove();
	LoginEngine.onExitRequest = reload;
	LoginEngine.init(_servers[index]);
}

function onExit() {
	Sound.stop();
	Renderer.stop();
	UIManager.removeComponents();
	Background.remove(init);
}

function loadClientInfo(callback) {
	const servers = Configs.get("servers", "data/clientinfo.xml");

	if (Array.isArray(servers)) {
		_servers = servers;
		callback();
		return;
	}

	_servers.length = 0;
	Client.loadFile(
		servers,
		function (xml) {
			xml = xml.replace(/^.*<\?xml/, "<?xml");
			const parser = new DOMParser();
			const doc = parser.parseFromString(xml, "application/xml");

			const connections = jQuery(doc).find("clientinfo connection");
			const stop = connections.length - 1;

			if (!connections.length) {
				callback();
			}

			connections.each(function (index, element) {
				const connection = jQuery(element);

				_servers.push({
					display: connection.find("display:first").text(),
					desc: connection.find("desc:first").text(),
					address: connection.find("address:first").text(),
					port: connection.find("port:first").text(),
					version: connection.find("version:first").text(),
					langtype: connection.find("langtype:first").text(),
					packetver: connection.find("packetver:first").text(),
					renewal: ["true", "1", 1, true].includes(
						connection.find("renewal:first").text().toLowerCase()
					),
					adminList: (function () {
						const list = [];
						connection
							.find("yellow admin, aid admin")
							.each(function () {
								list.push(parseInt(this.textContent, 10));
							});
						return list;
					})(),
				});

				if (index === stop) {
					callback();
				}
			});
		},
		callback
	);
}

function onThreadError(data) {
	console.warn(...data);
}

function onThreadLog(data) {
	console.log(...data);
}

export default {
	init,
	reload,
};
