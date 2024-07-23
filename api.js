class ROBrowser {
	constructor(options = {}) {
		this.config = Object.assign(
			{
				width: 0,
				height: 0,
				grfList: null,
				servers: "data/clientinfo.xml",
				remoteClient: "http://grf.robrowser.com/",
				packetver: "auto",
				charBlockSize: 0,
				clientHash: null,
				calculateHash: false,
				hashFiles: [],
				application: ROBrowser.APP.ONLINE,
				type: ROBrowser.TYPE.POPUP,
				target: null,
				development: false,
				loadLua: false,
				onReady: null,
				api: false,
				socketProxy: null,
				packetDump: false,
				packetKeys: false,
				saveFiles: true,
				skipServerList: true,
				skipIntro: false,
				autoLogin: [],
				enableCashShop: false,
				enableBank: false,
				enableMapName: false,
				enableCheckAttendance: false,
				clientVersionMode: "PacketVer",
				version: "",
				worldMapSettings: {},
				forceUseAddress: false,
				BGMFileExtension: ["mp3"],
				plugins: {},
				ThirdPersonCamera: false,
				FirstPersonCamera: false,
				CameraMaxZoomOut: 5,
			},
			options
		);
	}

	static TYPE = {
		POPUP: 1,
		FRAME: 2,
	};

	static APP = {
		ONLINE: 1,
		MAPVIEWER: 2,
		GRFVIEWER: 3,
		MODELVIEWER: 4,
		STRVIEWER: 5,
		GRANNYMODELVIEWER: 6,
		EFFECTVIEWER: 7,
	};

	start() {
		if (this.config.type === ROBrowser.TYPE.POPUP) {
			this.openPopup();
		} else if (this.config.type === ROBrowser.TYPE.FRAME) {
			this.insertFrame();
		}

		this.initializeROConfig(this.config);
	}

	openPopup() {
		this.config.width = this.config.width || "800";
		this.config.height = this.config.height || "600";

		this._APP = window.open(
			this.baseUrl + "?" + this.config.version,
			"_blank",
			[
				"directories=0",
				"fullscreen=0",
				"top=" +
					((window.innerHeight || document.body.clientHeight) -
						this.config.height) /
						2,
				"left=" +
					((window.innerWidth || document.body.clientWidth) -
						this.config.width) /
						2,
				"height=" + this.config.height,
				"width=" + this.config.width,
				"location=0",
				"menubar=0",
				"resizable=0",
				"scrollbars=0",
				"status=0",
				"toolbar=0",
			].join(",")
		);
	}

	insertFrame() {
		this.config.width = this.config.width || "100%";
		this.config.height = this.config.height || "100%";

		const frame = document.createElement("iframe");
		// frame.src = this.baseUrl + "?" + Math.random() + location.hash; // fix bug on firefox
		frame.width = this.config.width;
		frame.height = this.config.height;
		frame.style.border = "none";

		frame.setAttribute("allowfullscreen", "true");
		frame.setAttribute("webkitallowfullscreen", "true");
		frame.setAttribute("mozallowfullscreen", "true");

		if (this.config.target) {
			while (this.config.target.firstChild) {
				this.config.target.removeChild(this.config.target.firstChild);
			}
			this.config.target.appendChild(frame);
		}

		this._APP = frame.contentWindow;
	}

	initializeROConfig(config) {
		console.log("Initializing ROConfig:", config);

		// Get back application name
		let appModule;
		switch (config.application) {
			case ROBrowser.APP.ONLINE:
				appModule = "Online";
				break;
			case ROBrowser.APP.MAPVIEWER:
				appModule = "MapViewer";
				break;
			case ROBrowser.APP.GRFVIEWER:
				appModule = "GrfViewer";
				break;
			case ROBrowser.APP.MODELVIEWER:
				appModule = "ModelViewer";
				break;
			case ROBrowser.APP.STRVIEWER:
				appModule = "StrViewer";
				break;
			case ROBrowser.APP.GRANNYMODELVIEWER:
				appModule = "GrannyModelViewer";
				break;
			case ROBrowser.APP.EFFECTVIEWER:
				appModule = "EffectViewer";
				break;
			default:
				throw new Error(
					`Unknown application type: ${config.application}`
				);
		}
console.log('====================================');
console.log(config.development);
console.log(appModule)
console.log(`./src/App/${appModule}.js?${config.version}`)
console.log('====================================');
		if (config.development) {
			import(`./src/App/${appModule}.js`)
				.then((module) => {
					console.log(`${appModule} module loaded`, module);
				})
				.catch((error) => {
					console.error(`Error loading ${appModule} module:`, error);
				});
		} else {
			import(`./${appModule}.js`)
				.then((module) => {
					console.log(`${appModule} module loaded`, module);
				})
				.catch((error) => {
					console.error(`Error loading ${appModule} module:`, error);
				});
		}
	}
}

export default ROBrowser;
