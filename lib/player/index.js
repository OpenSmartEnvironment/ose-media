'use strict';

var Ose = require('ose');
var M = Ose.singleton(module, 'ose/lib/kind');
exports = M.exports;

var Volume = M.class('./volume');
var Playback = M.class('./playback');

/** Doc {{{1
 * @caption Media player
 *
 * @readme
 * The media player [kind] contains the logic for media control. It
 * controls the volume, playback and DVB streamer on one or more Linux
 * boxes. In the [OSE UI] it displays information about currently
 * playing media and allows to control the player remotely. It's
 * possible to display one of registered media sources and select an
 * item. Some sources support searching.
 *
 * @module media
 * @submodule media.player
 * @main media.player
 */

/**
 * @caption Media player kind
 *
 * @readme
 * On each entry initialization, [links] to volume control and playback entries are established. Every entry of this kind
 * handles commands to control media playback.
 *
 * @class media.lib.player
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

  entry.queueStateTimeout = 50;  // TODO: Magic const.

  this.volumeSocket = new Volume(entry);
  this.playbackSocket = new Playback(entry);
};

exports.setPledge = function(socket) {  // {{{2
  var p = socket.player;
  var pl = p.pledge;

  p.pledge = socket;

  if (pl) {
    Ose.link.close(pl);
  }
};

exports.closePledge = function(socket) {  // {{{2
  var p = socket.player;
  delete socket.player;

  if (! p) return;
  if (p.pledge !== socket) return;

  delete p.pledge;
  p.post('stop', true);
};

// }}}1
