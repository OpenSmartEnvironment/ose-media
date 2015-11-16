'use strict';

var O = require('ose').class(module, C);

/** Doc {{{1
 * @submodule media.player
 */

/**
 * @caption Media player to DVB streamer client socket
 *
 * @readme
 * Establish a [link] to a DVB streamer
 *
 * @class media.lib.player.dvb
 * @type class
 */

// Public {{{1
function C(player, ident) {  // {{{2
/**
 * Socket constructor
 *
 * @param player {Object} Media player entry
 * @param ident {Object} DVB streamer identification
 *
 * @method constructor
 */

  player.dvb.push(this);
  this.player = player;
  this.ident = ident;

  player.shard.track(ident, this);
};

exports.open = function(req) {  // {{{2
/**
 * Open handler
 *
 * @param req {Undefined}
 *
 * @method open
 * @handler
 */

  O.log.liftSuppress(this);
};

exports.close = function(req) {  // {{{2
/**
 * Close handler
 *
 * @param req {Undefined}
 *
 * @method close
 * @handler
 */

  var that = this;
  if (this.player.isGone()) {
    delete this.player;
    return;
  }

  setTimeout(function() {
    O.link.reuse(that);
    that.player.shard.track(that.ident, that);
  }, 10000);
  return;
};

exports.error = function(err) {  // {{{2
  O.log.suppressError(err, this, 'DVB streamer was not connected', 2);

  this.close();
};

exports.home = function(val) {  // {{{2
/**
 * @copyMethod ose.lib.entry.master/home
 * @method home
 * @handler
 */
};

exports.patch = function(req) {  // {{{2
/**
 * @copyMethod ose.lib.entry.master/patch
 * @method patch
 * @handler
 */

};

// }}}1
