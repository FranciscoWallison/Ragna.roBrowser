'use strict';

class ROBrowser {
    constructor(options) {
        if (typeof options === 'object') {
            Object.keys(options).forEach(key => {
                if (ROBrowser.prototype.hasOwnProperty(key)) {
                    this[key] = options[key];
                } else {
                    this[key] = options[key];
                }
            });
        }
    }

    static TYPE = {
        POPUP: 1,
        FRAME: 2
    };

    static APP = {
        ONLINE: 'Online',
        MAPVIEWER: 'MapViewer',
        GRFVIEWER: 'GrfViewer',
        MODELVIEWER: 'ModelViewer',
        STRVIEWER: 'StrViewer',
        GRANNYMODELVIEWER: 'GrannyModelViewer',
        EFFECTVIEWER: 'EffectViewer'
    };

    width = 0;
    height = 0;
    grfList = null;
    servers = 'data/clientinfo.xml';
    remoteClient = 'http://grf.robrowser.com/';
    packetver = 'auto';
    charBlockSize = 0;
    clientHash = null;
    calculateHash = false;
    hashFiles = [];
    application = ROBrowser.APP.ONLINE;
    type = ROBrowser.TYPE.FRAME;
    target = null;
    development = false;
    loadLua = false;
    onReady = null;
    api = false;
    socketProxy = null;
    packetDump = false;
    packetKeys = false;
    saveFiles = true;
    skipServerList = true;
    skipIntro = false;
    autoLogin = [];
    enableCashShop = false;
    enableBank = false;
    enableMapName = false;
    enableCheckAttendance = false;
    clientVersionMode = "PacketVer";
    version = '';
    worldMapSettings = {};
    forceUseAddress = false;
    BGMFileExtension = ['mp3'];
    plugins = {};
    ThirdPersonCamera = false;
    FirstPersonCamera = false;
    CameraMaxZoomOut = 5;

    baseUrl = (function() {
        const script = document.getElementsByTagName('script');
        let src = script[script.length - 1].src;
        src = src.replace(/\/[^\/]+\.js.*/, '/api.html');
        return src;
    })();

    async start() {
        switch (this.type) {
            case ROBrowser.TYPE.POPUP:
                this.width = this.width || '800';
                this.height = this.height || '600';

                this._APP = window.open(
                    `${this.baseUrl}?${this.version}`,
                    '_blank', [
                        'directories=0',
                        'fullscreen=0',
                        `top=${((window.innerHeight || document.body.clientHeight) - this.height) / 2}`,
                        `left=${((window.innerWidth || document.body.clientWidth) - this.width) / 2}`,
                        `height=${this.height}`,
                        `width=${this.width}`,
                        'location=0',
                        'menubar=0',
                        'resizable=0',
                        'scrollbars=0',
                        'status=0',
                        'toolbar=0'
                    ].join(',')
                );
                await this.initializeApplication();
                break;
            case ROBrowser.TYPE.FRAME:
                this.width = this.width || '100%';
                this.height = this.height || '100%';

                const frame = document.createElement('iframe');
                frame.src = `${this.baseUrl}?${Math.random()}${location.hash}`;
                frame.width = this.width;
                frame.height = this.height;
                frame.style.border = 'none';

                frame.setAttribute('allowfullscreen', 'true');
                frame.setAttribute('webkitallowfullscreen', 'true');
                frame.setAttribute('mozallowfullscreen', 'true');

                if (this.target) {
                    while (this.target.firstChild) {
                        this.target.removeChild(this.target.firstChild);
                    }
                    this.target.appendChild(frame);
                } else {
                    console.error('Target element not found.');
                    return;
                }

                await new Promise((resolve, reject) => {
                    frame.onload = () => {
                        this._APP = frame.contentWindow;
                        if (!this._APP) {
                            reject(new Error('Failed to initialize application container.'));
                        } else {
                            resolve();
                        }
                    };
                });

                await this.initializeApplication();
                break;
        }

        if (!this._APP && this.type !== ROBrowser.TYPE.FRAME) {
            console.error('Failed to initialize application container.');
            return;
        }
    }

    async initializeApplication() {
        const applicationName = this.application;
        this.application = applicationName;

        const _this = this;

        function onMessage(event) {
            if (_this.baseUrl.indexOf(event.origin) === 0) {
                clearInterval(_this._Interval);
                window.removeEventListener('message', onMessage, false);

                if (_this.onReady) {
                    _this.onReady();
                }
            }
        }

        this._Interval = setInterval(this.waitForInitialization.bind(this), 100);
        window.addEventListener('message', onMessage, false);
    }

    waitForInitialization() {
        if (this._APP) {
            this._APP.postMessage({
                application: this.application,
                servers: this.servers,
                grfList: this.grfList,
                remoteClient: this.remoteClient,
                packetver: this.packetver,
                development: this.development,
                loadLua: this.loadLua,
                api: this.api,
                socketProxy: this.socketProxy,
                packetKeys: this.packetKeys,
                saveFiles: this.saveFiles,
                skipServerList: this.skipServerList,
                skipIntro: this.skipIntro,
                autoLogin: this.autoLogin,
                enableCashShop: this.enableCashShop,
                enableBank: this.enableBank,
                enableMapName: this.enableMapName,
                enableCheckAttendance: this.enableCheckAttendance,
                version: this.version,
                worldMapSettings: this.worldMapSettings,
                clientHash: this.clientHash,
                calculateHash: this.calculateHash,
                hashFiles: this.hashFiles,
                plugins: this.plugins,
                charBlockSize: this.charBlockSize,
                BGMFileExtension: this.BGMFileExtension,
                ThirdPersonCamera: this.ThirdPersonCamera,
                FirstPersonCamera: this.FirstPersonCamera,
                clientVersionMode: this.clientVersionMode,
                CameraMaxZoomOut: this.CameraMaxZoomOut,
                packetDump: this.packetDump,
                forceUseAddress: this.forceUseAddress
            }, '*');
        } else {
            console.error('Application container is not initialized.');
        }
    }
}

export default ROBrowser;
