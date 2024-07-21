/**
 * Core/Configs.js
 *
 * Manage application configurations
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @autor Vincent Thibault
 */

const _global = {};
const _server = {};

// Constructor
(function init(configs) {
	console.log('==============ROConfig==============');
	console.log(configs);
	console.log('===========Core/Configs.js===========');

    if (typeof configs !== 'object') {
        return;
    }

    Object.keys(configs).forEach(key => {
        set(key, configs[key]);
    });
})(window.ROConfig);

/**
 * Set a config
 *
 * @param {string} key name
 * @param {?} data
 */
function set(key, value) {
    _global[key] = value;
}

/**
 * Get the value of a config
 *
 * @param {string} key name
 * @param {?} default data value
 * @return {?} data
 */
function get(key, defaultValue) {
    if (key in _server) {
        return _server[key];
    }

    if (key in _global) {
        return _global[key];
    }

    return defaultValue;
}

/**
 * Store the server informations
 *
 * @param {object} server config
 */
function setServer(server) {
    _server = server;
}

/**
 * Return the server informations
 *
 */
function getServer() {
    return _server;
}

export default {
    get,
    set,
    setServer,
    getServer
};
