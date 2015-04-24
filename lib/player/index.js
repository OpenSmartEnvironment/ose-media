'use strict';

var O = require('ose').object(module, 'ose/lib/kind');
exports = O.exports;

var Dvb = O.class('./dvb');
var Playback = O.class('./playback');
var Volume = O.class('./volume');

/** Doc {{{1
 * @caption Media player
 *
 * @readme
 * The media player [kind] contains the logic for media control. It
 * controls the volume, playback and DVB streamer on Linux boxes. In
 * the [OSE UI] it displays information about currently playing media
 * and allows to control the player remotely. It's possible to display
 * one of registered media sources and select an item.
 *
 * @module media
 * @submodule media.player
 * @main media.player
 */

/**
 * @caption Media player kind
 *
 * @readme
 * On each entry initialization, [links] to volume control, playback
 * and optional DVB streamer entries are established. Every entry of
 * this kind handles commands to control media playback.
 *
 * @kind player
 * @class media.lib.player
 * @main  media.lib.player.index
 * @extend ose.lib.kind
 * @type singleton
 */

// Public  {{{1
exports.init = function() {  // {{{2
  this.on(require('./commands'));
};

exports.homeInit = function(entry) {  // {{{2
  entry.state = {
    status: 'stopped',
    synced: {},
  };

//  entry.queueStateTimeout = 50;  // TODO: Magic const.

  new Volume(entry);
  new Playback(entry);

  if (entry.data.dvb) {
    entry.dvb = [];

    if (Array.isArray(entry.data.dvb)) {
      for (var i = 0; i < entry.data.dvb.length; i++) {
        new Dvb(entry, entry.data.dvb[i]);
      }
    } else {
      new Dvb(entry, entry.data.dvb);
    }
  }
};

exports.cleanup = function(entry) {
  O.link.close(entry.boon, null, true);
  O.link.close(entry.volumeSocket, null, true);
  O.link.close(entry.playbackSocket, null, true);

  if (entry.dvb) {
    var dvb = entry.dvb;
    delete entry.dvb;

    for (var i = 0; i < dvb.length; i++) {
      O.link.close(dvb[i], null, true);
    }
  }
};

exports.setBoon = function(socket) {  // {{{2
/**
 * @param socket {Object}
 *
 * @method setBoon
 * @internal
 */

  var p = socket.player;
  var pl = p.boon;

  p.boon = socket;

  if (pl) {
    O.link.close(pl);
  }
};

exports.closeBoon = function(socket) {  // {{{2
/**
 * @param socket {Object}
 *
 * @method closeBoon
 * @internal
 */

  var p = socket.player;
  delete socket.player;

  if (! p) return;
  if (p.boon !== socket) return;

  delete p.boon;
  p.post('stop', true);
};

// }}}1
