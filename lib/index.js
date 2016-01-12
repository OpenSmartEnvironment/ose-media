'use strict';

var O = require('ose').object(module, 'ose-level');
O.package = 'ose-media';

exports = O.init('media');

O.content('../content');

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
 * @module media
 * @main media
 */

/**
 * @caption Media core
 *
 * @readme
 * Core singleton of [ose-media] npm package. Registers [entry kinds]
 * defined by this package to the `media` [schema].
 *
 * @class media.lib
 * @type singleton
 */

// Public {{{1
exports.browserConfig = true;

exports.config = function(name, val, deps) {  // {{{2
  require('./item');
  require('./player');
  require('./stream');

  this.map('history', {  // {{{3
    kind: 'item',
    unique: true,
    onePerEntry: true,
    map: function(entry, cb) {
      cb(entry.dval.ident, entry.id);
    },
    getId: function(key, value) {
      return value;
    },
    filter: function(key, value, params) {
      switch (typeof (key || undefined)) {
      case 'string':
      case 'number':
        return key === params.entry;
      case 'object':
        switch (key.length) {
        case 3:
          if (key[2] !== params.space) return false;
        case 2:
          if (key[1] !== params.shard) return false;
          if (key[0] !== params.entry) return false;
          break;
        default:
          return false;
        }
        return true;
      }

      return false;
    },
  });

  this.map({  // Stream name {{{3
    kind: 'stream',
    field: 'name',
    unique: false,
  });

  this.map({  // Item score {{{3
    kind: 'item',
    field: 'score',
    unique: false,
  });

  // }}}3
};

exports.addStreams = function(trans, streams) {  // {{{2
  for (var key in streams) {
    var item = streams[key];
    item.alias = key;
    trans.add('stream', item);
  }
};

