'use strict';

var Ose = require('ose');
var M = Ose.package(module);
exports = M.init();

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

M.content();

M.scope = 'media';
M.kind('./item', 'item');
M.kind('./player', 'player');
M.kind('./stream', 'stream');

Ose.media = exports;
Ose.media.sources = require('ose-media/lib/sources');
Ose.media.sources.add('history', 'media', 'item');
Ose.media.sources.add('stream', 'media', 'stream');
