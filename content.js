'use strict';

var O = require('ose').object(module, 'ose/lib/http/content');
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
exports.addModule('lib/index');
exports.addModule('lib/item/index');
exports.addModule('lib/player/commands');
exports.addModule('lib/player/dvb');
exports.addModule('lib/player/index');
exports.addModule('lib/player/volume');
exports.addModule('lib/player/playback');
exports.addModule('lib/stream/index');

// }}}1
