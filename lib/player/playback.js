'use strict';

var O = require('ose').class(module, C);

/** Doc {{{1
 * @submodule media.player
 */

/**
 * @caption Media player-to-playback client socket
 *
 * @readme
 * Establishes a [link] to a playback entry.
 *
 * @class media.lib.player.playback
 * @type class
 */

// Public {{{1
function C(entry) {  // {{{2
/**
 * Socket constructor
 *
 * @method init
 * @constructor
 */

  if ('playbackSocket' in entry) {
    throw O.error(this, 'DUPLICIT_PLAYBACK', entry.identify());
  }

  this.entry = entry;

  entry.linkTo(entry.data.playback, false, true, this);
};

exports.open = function(req) {  // {{{2
/**
 * Open handler
 *
 * @param req {Object}
 *
 * @method open
 */

//  console.log('PLAYBACK OPEN', {player: this.entry.id, playback: req.id});

  this.entry.playback = this._link.entry;

  this.patch(req);
  this.home(req.home);
};

exports.close = function(req) {  // {{{2
/**
 * Close handler
 *
 * @param req {Object}
 *
 * @method close
 */

  var e = this.entry;
  delete this.entry;

  e.setState({playback: {synced: null}});
  delete e.playbackSocket;
  delete e.playback;
};

exports.error = function(err) {  // {{{2
/**
 * Error handler
 *
 * @param err {Object} [Error] instance
 *
 * @method error
 */

  O.log.error(err);
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

  this.entry.setState({playback: {synced: val}});
};

exports.patch = function(req) {  // {{{2
/**
 * Patch handler
 *
 * @param req {Object} Update request
 *
 * @method patch
 */

  if (! req.spatch) return;

  var state = {};

  for (var key in req.spatch) {
    var value = req.spatch[key];

    switch (key) {
    case 'status':
    case 'pos':
    case 'info':
    case 'can':
    case 'shuffle':
    case 'fullscreen':
      var s = {};
      s[key] = null;
      this.entry.setState(s);

      state[key] = JSON.parse(JSON.stringify(value));
      break;
    default:
      O.log.todo('Player state', {key: key, value: value});
    }
  }

  if (O._.isEmpty(state)) return;

  this.entry.setState(state);
  return;
};

// }}}1
