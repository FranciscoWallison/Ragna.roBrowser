/**
 * UI/CursorManager.js
 *
 * Display Cursor
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author Vincent Thibault
 */

import jQuery from '../Utils/jquery.js';
import Client from '../Core/Client.js';
import MemoryManager from '../Core/MemoryManager.js';
import Graphics from '../Preferences/Graphics.js';
import Sprite from '../Loaders/Sprite.js';
import Action from '../Loaders/Action.js';
import Preferences from '../Preferences/Controls.js';
import EntityManager from '../Renderer/EntityManager.js';
import Entity from '../Renderer/Entity/Entity.js';
import SpriteRenderer from '../Renderer/SpriteRenderer.js';
import Mouse from '../Controls/MouseEventHandler.js';

'use strict';

/**
 * Cursor Constructor
 */
const Cursor = {};

/**
 * Cursor animation Constant
 */
Cursor.ACTION = {
  DEFAULT: 0,
  TALK: 1,
  CLICK: 2,
  LOCK: 3,
  ROTATE: 4,
  ATTACK: 5,
  WARP: 7,
  PICK: 9,
  TARGET: 10,
  NOWALK: 13,
};

/**
 * @var {boolean} block change ?
 */
Cursor.freeze = false;

/**
 * @var {boolean} magnetism while picking entities ?
 */
Cursor.magnetism = true;

/**
 * @var {boolean} force disabled magnetism
 * Used to cast zone skill to ground
 */
Cursor.blockMagnetism = false;

/**
 * @var {integer} Cursor.ACTION.* constant
 */
let _type = Cursor.ACTION.DEFAULT;

/**
 * @var {integer} tick
 */
let _tick = 0;

/**
 * @var {boolean} repeat animation ?
 */
let _norepeat = false;

/**
 * @var {integer} animation frame
 */
let _animation = 0;

/**
 * @var {boolean} play animation ?
 */
let _play = true;

/**
 * @var {number} last style id rendered
 */
let _lastStyleId = -1;

/**
 * @var {number} last rendered position x
 */
let _lastX = 0;

/**
 * @var {number} last renderer position y
 */
let _lastY = 0;

/**
 * @var {Array} css style list
 */
let _compiledStyle = [];

/**
 * @var {Sprite} sprite
 */
let _sprite;

/**
 * @var {Action} action
 */
let _action;

/**
 * Define sprite informations (hardcoded)
 */
const ActionInformations = {};
ActionInformations[Cursor.ACTION.DEFAULT] = { drawX: 1, drawY: 19, startX: 0, startY: 0, delayMult: 2.0 };
ActionInformations[Cursor.ACTION.TALK] = { drawX: 20, drawY: 40, startX: 20, startY: 20, delayMult: 1.0 };
ActionInformations[Cursor.ACTION.WARP] = { drawX: 10, drawY: 32, startX: 0, startY: 0, delayMult: 1.0 };
ActionInformations[Cursor.ACTION.ROTATE] = { drawX: 18, drawY: 26, startX: 10, startY: 0, delayMult: 1.0 };
ActionInformations[Cursor.ACTION.PICK] = { drawX: 20, drawY: 40, startX: 15, startY: 15, delayMult: 1.0 };
ActionInformations[Cursor.ACTION.TARGET] = { drawX: 20, drawY: 50, startX: 20, startY: 28, delayMult: 0.5 };
ActionInformations[Cursor.ACTION.NOWALK] = { drawX: 13, drawY: 25, startX: 14, startY: 6, delayMult: 1.0 };

/**
 * Load cursor data (action, sprite)
 */
Cursor.init = function init(fn) {
  // Already loaded
  if (_sprite) {
    fn();
    return;
  }

  Client.getFiles(['data/sprite/cursors.spr', 'data/sprite/cursors.act'], function (spr, act) {
    try {
      _sprite = new Sprite(spr);
      _action = new Action(act);
    } catch (e) {
      console.error('Cursor::init() - ' + e.message);
      return;
    }

    // Load it properly later using webgl
    MemoryManager.remove(null, 'data/sprite/cursors.spr');
    MemoryManager.remove(null, 'data/sprite/cursors.act');

    bindMouseEvent();
    preCompiledAnimations();
    fn();
  });
};

/**
 * Change the cursor for the button click event
 */
function bindMouseEvent() {
  // Convert an image from an action to a blob url
  function generateImage(index) {
    let canvas, binary, data;
    let i, count;

    canvas = _sprite.getCanvasFromFrame(index);
    if (!canvas) {
      return '';
    }

    binary = atob(canvas.toDataURL('image/png').replace(/^data[^,]+,/, ''));
    count = binary.length;
    data = new Uint8Array(count);

    for (i = 0; i < count; ++i) {
      data[i] = binary.charCodeAt(i);
    }

    return URL.createObjectURL(new Blob([data], { type: 'image/png' }));
  }

  // Add default CSS rule with cursor
  const action = _action.actions[Cursor.ACTION.CLICK];
  const hover = generateImage(action.animations[0].layers[0].index);
  const down = generateImage(action.animations[1].layers[0].index);
  const action_text = _action.actions[Cursor.ACTION.DEFAULT];
  const hover_text = generateImage(action_text.animations[0].layers[0].index);

  // Append CSS to head
  jQuery('head').append(
    [
      '<style type="text/css">',
      'button { cursor: url(' + hover + '), auto; }',
      'button:active { cursor: url(' + down + '), auto; }',
      // add event de click
      '.event_add_cursor { cursor: url(' + hover + '), auto; }',
      '.event_add_cursor:active { cursor: url(' + down + '), auto; }',
      // add default cursor for text field
      'input[type=text] { cursor: url(' + hover_text + '), auto; }',
      'textarea { cursor: url(' + hover_text + '), auto; }',
      '</style>',
    ].join('\n')
  );
}

/**
 * Start pre-compiling animation to avoid building sprites
 * during the rendering loop
 */
function preCompiledAnimations() {
  let i, j, k, count, size, total, pos;
  let action, animation, info;
  let canvas, ctx, entity;
  let binary, data, dataURI;
  let dataURIList, position;

  // Start initializing variables
  canvas = document.createElement('canvas');
  canvas.width = 50;
  canvas.height = 50;
  ctx = canvas.getContext('2d');
  entity = new Entity();
  dataURIList = [];
  _compiledStyle = [];
  position = [0, 0];

  // Start compiling animation
  for (i = 0, count = _action.actions.length; i < count; ++i) {
    action = _action.actions[i];
    info = ActionInformations[i] || ActionInformations[Cursor.ACTION.DEFAULT];

    for (j = 0, size = action.animations.length; j < size; ++j) {
      animation = action.animations[j];

      // Initialize context
      SpriteRenderer.bind2DContext(ctx, info.drawX, info.drawY);
      ctx.clearRect(0, 0, 50, 50);

      // // add borders to debug
      // ctx.strokeStyle = 'red';
      // ctx.strokeRect(0, 0, 50, 50);

      // Render layers
      for (k = 0, total = animation.layers.length; k < total; ++k) {
        entity.renderLayer(animation.layers[k], _sprite, _sprite, 1.0, position, false);
      }

      dataURI = canvas.toDataURL('image/png');
      pos = dataURIList.indexOf(dataURI);

      // Already build
      if (pos > -1) {
        animation.compiledStyleIndex = pos;
        continue;
      }

      // Modify the canvas to a file object
      binary = atob(dataURI.replace(/^data[^,]+,/, ''));
      total = binary.length;
      data = new Uint8Array(total);

      for (k = 0; k < total; ++k) {
        data[k] = binary.charCodeAt(k);
      }

      // Store it.
      animation.compiledStyleIndex = _compiledStyle.length;

      dataURIList.push(dataURI);
      _compiledStyle.push(URL.createObjectURL(new Blob([data.buffer], { type: 'image/png' })));
    }
  }
}

/**
 * Change cursor action
 *
 * @param {number} type - Cursor.ACTION.*
 * @param {boolean} norepeat - repeat animation ?
 * @param {number} animation numero (optional)
 */
Cursor.setType = function SetType(type, norepeat, animation) {
  if (Cursor.freeze) {
    return;
  }

  _type = type;
  _tick = Date.now();
  _norepeat = !!norepeat;

  if (typeof animation !== 'undefined') {
    _animation = animation;
    _play = false;
  } else {
    _animation = animation || 0;
    _play = true;
  }
};

/**
 * Simple method to get the current cursor type
 *
 * @return {number} Cursor.ACTION.*
 */
Cursor.getActualType = function getActualType() {
  return _type;
};

/**
 * Render the cursor (update)
 */
Cursor.render = function render(tick) {
  // Not loaded yet.
  if (!Graphics.cursor || !_compiledStyle.length) {
    return;
  }

  const info = ActionInformations[_type] || ActionInformations[Cursor.ACTION.DEFAULT];
  let action = _action.actions[_type];

  // DEFAULT TO DEFAULT CURSOR in case of unknown action
  if (action === undefined) {
    action = _action.actions[Cursor.ACTION.DEFAULT];
  }

  let anim = _animation;
  const delay = action.delay * info.delayMult;
  let x = info.startX;
  let y = info.startY;
  let animation;

  // Repeat / No-repeat features
  if (_play) {
    const frame = ((tick - _tick) / delay) | 0;
    if (_norepeat) {
      anim = Math.min(frame, action.animations.length - 1);
    } else {
      anim = frame % action.animations.length;
    }
  }

  animation = action.animations[anim];

  // Issue #61 - Not able to reproduce
  // If someone got more informations...
  if (!animation) {
    return;
  }

  // Cursor magnetism
  if (Cursor.magnetism && !Cursor.blockMagnetism) {
    const entity = EntityManager.getOverEntity();

    if (
      entity &&
      (((entity.objecttype === Entity.TYPE_MOB ||
        entity.objecttype === Entity.TYPE_NPC_ABR ||
        entity.objecttype === Entity.TYPE_NPC_BIONIC) &&
        Preferences.snap === true) ||
        (entity.objecttype === Entity.TYPE_ITEM && Preferences.itemsnap === true))
    ) {
      x += Math.floor(
        Mouse.screen.x - (entity.boundingRect.x1 + (entity.boundingRect.x2 - entity.boundingRect.x1) / 2)
      );
      y += Math.floor(
        Mouse.screen.y - (entity.boundingRect.y1 + (entity.boundingRect.y2 - entity.boundingRect.y1) / 2)
      );
    }
  }

  // Rendering if cursor changed
  if (animation.compiledStyleIndex !== _lastStyleId || x !== _lastX || y !== _lastY) {
    _lastStyleId = animation.compiledStyleIndex;
    _lastX = x;
    _lastY = y;

    document.body.style.cursor = 'url(' + _compiledStyle[_lastStyleId] + ') ' + x + ' ' + y + ', auto';
  }
};

export default Cursor;
