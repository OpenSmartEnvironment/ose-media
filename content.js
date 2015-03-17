'use strict';

var O = require('ose').object(module, Init, 'ose/lib/http/content');
exports = O.init();

/** Docs  {{{1
 * @module media
 */

/**
 * @caption Media content
 *
 * @readme
 * Provides files of Media package to the browser.
 *
 * @class media.content
 * @type singleton
 * @extends ose.lib.http.content
 */

// Public {{{1
function Init() {  // {{{2
  O.super.call(this);

  this.addModule('lib/index');
  this.addModule('lib/item/gaia/listItem');
  this.addModule('lib/item/index');
  this.addModule('lib/player/gaia/common');
  this.addModule('lib/player/gaia/detail');
  this.addModule('lib/player/gaia/side');
  this.addModule('lib/player/commands');
  this.addModule('lib/player/index');
  this.addModule('lib/player/volume');
  this.addModule('lib/player/playback');
  this.addModule('lib/stream/gaia/listItem');
  this.addModule('lib/stream/browser');
  this.addModule('lib/stream/index');
  this.addModule('lib/sources');
};

// }}}1
