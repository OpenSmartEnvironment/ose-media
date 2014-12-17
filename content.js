'use strict';

exports = require('ose')
  .singleton(module, 'ose/lib/http/content')
  .exports
;

/** Docs  {{{1
 * @module media
 */

/**
 * @caption OSE Media content
 *
 * @readme
 * Provides files of OSE Media package to the browser.
 *
 * @class media.content
 * @type singleton
 * @extends ose.lib.http.content
 */

// Public {{{1
exports.addFiles = function() {
  this.addModule('lib/index');
  this.addModule('lib/item/bb/listItem');
  this.addModule('lib/item/index');
  this.addModule('lib/player/bb/common');
  this.addModule('lib/player/bb/detail');
  this.addModule('lib/player/bb/side');
  this.addModule('lib/player/commands');
  this.addModule('lib/player/dvb');
  this.addModule('lib/player/index');
  this.addModule('lib/player/volume');
  this.addModule('lib/player/playback');
  this.addModule('lib/stream/bb/listItem');
  this.addModule('lib/stream/browser');
  this.addModule('lib/stream/index');
  this.addModule('lib/sources');
};
