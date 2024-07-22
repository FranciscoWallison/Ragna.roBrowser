/**
 * Core/MemoryManager.js
 *
 * Memory Manager
 *
 * Set up a cache context to avoid re-loading/parsing files each time, files are removed automatically if not used
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author Vincent Thibault
 */

import MemoryItem from './MemoryItem.js';

/**
 * List of files in memory
 * @var List MemoryItem
 */
const _memory = {};

/**
 * Remove files from memory if not used until a period of time
 * @var {number}
 */
const _rememberTime = 2 * 60 * 1000; // 2 min

/**
 * @var {number} last time we clean up variables
 */
let _lastCheckTick = 0;

/**
 * @var {number} perform the clean up every 30 secs
 */
const _cleanUpInterval = 30 * 1000;

/**
 * Get back data from memory
 *
 * @param {string} filename
 * @param {function} onload - optional
 * @param {function} onerror - optional
 * @return mixed data
 */
function get(filename, onload, onerror) {
    if (!_memory[filename]) {
        _memory[filename] = new MemoryItem();
    }

    const item = _memory[filename];

    if (onload) {
        item.addEventListener('load', onload);
    }

    if (onerror) {
        item.addEventListener('error', onerror);
    }

    return item.data;
}

/**
 * Check if the entry exists
 *
 * @param {string} filename
 * @return boolean isInMemory
 */
function exist(filename) {
    return !!_memory[filename];
}

/**
 * Stored data in memory
 *
 * @param {string} filename
 * @param {string|object} data
 * @param {string} error - optional
 */
function set(filename, data, error) {
    if (!_memory[filename]) {
        _memory[filename] = new MemoryItem();
    }

    if (error || !data) {
        _memory[filename].onerror(error);
    } else {
        _memory[filename].onload(data);
    }
}

/**
 * Clean up not used data from memory
 *
 * @param {object} gl - WebGL Context
 * @param {number} now - game tick
 */
function clean(gl, now) {
    if (_lastCheckTick + _cleanUpInterval > now) {
        return;
    }

    const keys = Object.keys(_memory);
    const tick = now - _rememberTime;
    const list = [];

    keys.forEach((key) => {
        const item = _memory[key];
        if (item.complete && item.lastTimeUsed < tick) {
            remove(gl, key);
            list.push(key);
        }
    });

    if (list.length) {
        console.log(`%c[MemoryManager] - Removing ${list.length} unused elements from memory.`, 'color:#d35111', list);
    }

    _lastCheckTick = now;
}

/**
 * Remove Item from memory
 *
 * @param {object} gl - WebGL Context
 * @param {string} filename
 */
function remove(gl, filename) {
    if (!_memory[filename]) {
        return;
    }

    const file = get(filename);
    let ext = '';
    const matches = filename.match(/\.[^\.]+$/);

    if (matches) {
        ext = matches.toString().toLowerCase();
    }

    if (file) {
        switch (ext) {
            case '.spr':
                if (file.frames) {
                    file.frames.forEach((frame) => {
                        if (frame.texture && gl.isTexture(frame.texture)) {
                            gl.deleteTexture(frame.texture);
                        }
                    });
                }
                if (file.texture && gl.isTexture(file.texture)) {
                    gl.deleteTexture(file.texture);
                }
                break;
            case '.pal':
                if (file.texture && gl.isTexture(file.texture)) {
                    gl.deleteTexture(file.texture);
                }
                break;
            default:
                if (file.match && file.match(/^blob\:/)) {
                    URL.revokeObjectURL(file);
                }
                break;
        }
    }

    delete _memory[filename];
}

/**
 * Search files in memory based on a regex
 *
 * @param regex
 * @return string[] filename
 */
function search(regex) {
    const keys = Object.keys(_memory);
    const out = [];

    keys.forEach((key) => {
        if (key.match(regex)) {
            out.push(key);
        }
    });

    return out;
}

export default { get, set, clean, remove, exist, search };
