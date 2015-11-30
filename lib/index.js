'use strict';

var O = require('ose').module(module);
O.package = 'ose-media';
O.scope = 'media';

/** Docs {{{1
 * @caption Media
 *
 * @readme
 * The Media package implements a general media player into your
 * environment. Together with other OSE packages (e.g. [ose-pa],
 * [ose-videolan] and [ose-dvb]), it can be used to create a
 * multi-instance media application.
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
 * @scope media
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

exports.config = function(name, val, deps) {
  O.kind('./item', 'item', deps);
  O.kind('./player', 'player', deps);
  O.kind('./stream', 'stream', deps);

  O.content('../content');
};

exports.addStreams = function(trans, streams) {
  for (var key in streams) {
    var item = streams[key];
    item.alias = key;
    trans.add('stream', item);
  }
};

O.scope.getHomeSchema = function(config) {
  switch (config) {
  case undefined:
  case 'cache':
    return require('ose/lib/schema/cache');
  case 'leveldown':
  case 'memdown':
    return require('./level');
  }

  throw O.log.error(this, 'Invalid schema', config);
};

