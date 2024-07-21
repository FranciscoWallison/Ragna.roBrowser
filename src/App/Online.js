/**
 * App/Online.js
 *
 * Start roBrowser
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @autor Vincent Thibault
 */

import GameEngine from '../Engine/GameEngine.js';
import Context from '../Core/Context.js';
import Plugins from '../Plugins/PluginManager.js';

// Errors Handler (hack)
window.onerror = function (err) {
    'use strict';

    import('./UI/Components/Error/Error.js').then(Errors => {
        Errors.default.addTrace(err);
    }).catch(error => console.error('Failed to load error module', error));
};

Plugins.init();
GameEngine.init();

if (!Context.Is.APP) {
    window.onbeforeunload = function() {
        return 'Are you sure to exit roBrowser ?';
    };
}
