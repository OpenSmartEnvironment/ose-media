'use strict';

var Ose = require('ose');
var M = Ose.package(module);
exports = M.init();

/** Docs {{{1
 * @caption Open Smart Environment Media package
 *
 * @readme
 * The OSE Media package implements a general media player into your
 * environment. It makes use of various media applications. The logic
 * of controlling these applications is contained in separate packages
 * ([ose-pa], [ose-videolan]).
 *
 * @features
 * - Media sources extended by other npm packages
 * - Predefined media streams, files and playback history
 * - Media playback using a configurable set of applications
 *   (currently DVBlast as DVB stramer, PulseAudio as audio backend
 *   and VLC as media player)
 *
 * @aliases oseMediaPlayer
 * @module media
 * @main media
 */

/**
 * @caption OSE Media core
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

var Sources = require('ose-media/lib/sources');
Sources.add('history', 'media', 'item');
Sources.add('stream', 'media', 'stream');
