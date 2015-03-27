'use strict';

var O = require('ose').class(module, C);

/** Doc {{{1
 * @submodule media.player
 */

/**
 * TODO
 * @caption Media player to volume client socket
 *
 * @readme
 * Establishes a [link] to a volume player.
 *
 * @class media.lib.player.volume
 * @type class
 */

// Public {{{1
function C(player, ident) {  // {{{2
/**
 * Socket constructor
 *
 * @method constructor
 */

  player.dvb.push(this);
  this.player = player;
  this.ident = ident;

  player.linkTo(ident, true, true, this);
};

exports.open = function(req) {  // {{{2
/**
 * Open handler
 *
 * @param req {Object}
 *
 * @method open
 */

  O.log.liftSuppress(this);
};

exports.close = function(req) {  // {{{2
/**
 * Close handler
 *
 * @param req {Object}
 *
 * @method close
 */

  var that = this;
  if (this.player.isRemoved()) {
    delete this.player;
    return;
  }

  setTimeout(function() {
    O.link.reuse(that);
    that.player.linkTo(that.ident, true, true, that);
  }, 10000);
  return;
};

exports.error = function(err) {  // {{{2
  O.log.error(err, 'DVB streamer was not connected', 2);

  this.close();
};

exports.home = function(val) {  // {{{2
/**
 * Home handler
 *
 * @param val {Boolean} Update request
 *
 * @method home
 */

};

exports.patch = function(req) {  // {{{2
/**
 * Patch handler
 *
 * @param req {Object} Update request
 *
 * @method patch
 */

};

// }}}1
