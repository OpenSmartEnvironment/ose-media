'use strict';

var O = require('ose').module(module);
O.package = 'ose-media';
O.scope = 'media';

/** Docs {{{1
 * @caption Media
 *
 * @readme
 * The Media package implements a general media player into your
 * environment. It makes use of various media applications. The logic
 * of controlling these applications is contained in separate packages
 * ([ose-pa], [ose-videolan]).
 *
 * See [Media player example].
 *
 * @features
 * - Media sources extended by other npm packages
 * - Predefined media streams, files and playback history
 * - Media playback using a configurable set of applications
 *   (currently DVBlast as DVB stramer, PulseAudio as audio backend
 *   and VLC as media player)
 *
 * @planned
 * - Control audio amplifier and display devices.
 *
 * @aliases oseMediaPlayer
 * @module media
 * @main media
 */

/**
 * @caption Media core
 *
 * @readme
 * Core singleton of [ose-media] npm package. Registers [entry kinds]
 * defined by this package to the `media` [scope].
 *
 * @class media.lib
 * @type singleton
 */

// Public {{{1
exports.browserConfig = true;

exports.config = function(name, data, deps) {
  O.kind('./item', 'item', deps);
  O.kind('./player', 'player', deps);
  O.kind('./stream', 'stream', deps);

  O.content('../content');
};
