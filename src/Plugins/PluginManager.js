/**
 * Plugins/PluginManager.js
 *
 * Plugin Manager - Load and execute plugins
 * Plugins have to be globals, can not be server specific (multiple server in one clientinfo)
 * You alter memory, so you can't restore it if you change server.
 *
 * It's a work in progress, and subject to changes.
 *
 * To add plugins use the "plugins" param to list plugins in the ROBrowser Config. Plugins must be located in the /Plugin/ folder.
 *
 * Usage:
 *      plugins: {
 *                  <plugin_1_name>: '<plugin_1_path>',
 *                  <plugin_2_name>: '<plugin_2_path>',
 *                  <plugin_3_name>: '<plugin_3_path>',
 *                  ...
 *                  <plugin_n_name>: '<plugin_n_path>'
 *              },
 *
 * Example:
 *      plugins:        { KeyboardControl: 'KeyToMove_v1/KeyToMove' },
 *
 *
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author Vincent Thibault
 */

import Configs from '../Core/Configs.js';

class Plugins {
    constructor() {
        this.list = [];
    }

    init(context) {
        const paths = [];
        const params = [];
        const configList = Configs.get('plugins', {});

        for (const [pluginName, value] of Object.entries(configList)) {
            if (typeof value === 'string') {
                paths.push('./' + value);
                params.push(null);
            } else if (typeof value === 'object' && value !== null) {
                if (value.path) {
                    paths.push('./' + value.path);

                    if (value.pars) {
                        params.push(value.pars);
                    } else {
                        params.push(null);
                    }
                }
            }
        }

        const count = paths.length;
        Promise.all(paths.map(path => import(path))).then(modules => {
            modules.forEach((module, i) => {
                if (module.default(params[i])) {
                    console.log('[PluginManager] Initialized plugin: ' + paths[i]);
                } else {
                    console.error('[PluginManager] Failed to initialize plugin: ' + paths[i]);
                }
            });
        }).catch(error => {
            console.error('[PluginManager] Error loading plugins:', error);
        });
    }
}

export default new Plugins();
