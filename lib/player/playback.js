'use strict';

var Ose = require('ose');
var M = Ose.class(module, C);

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

//  console.log('PLAYBACK INIT', entry.identify());

  if ('playbackSocket' in entry) {
    throw Ose.error(this, 'DUPLICIT_PLAYBACK', entry.identify());
  }

  this.entry = entry;

  this.entry.linkTo(entry.data.playback, {srev: true, strack: true}, this);
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

  this.entry.playback = this.link.entry;

  if ('synced' in req) {
    this.synced(req.synced);
  }
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

  e.setState({synced: {playback: false}});
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

  M.log.error(err);
  this.close();
};

exports.synced = function(value) {  // {{{2
/**
 * Synced handler
 *
 * @param value {Boolean} Synced or not
 *
 * @method synced
 */

//  console.log('PLAYBACK SYNCED', value);

  this.entry.setState({synced: {playback: value}});
};

exports.update = function(req) {  // {{{2
/**
 * Update handler
 *
 * @param req {Object} Update request
 *
 * @method update
 */

//  console.log('PLAYBACK UPDATE', req);

  var state = {};

  for (var key in req.state) {
    var value = req.state[key];

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
      M.log.unhandled('Player state', {key: key, value: value});
    }
  }

  if (! Ose._.isEmpty(state)) {
    this.entry.setState(state);
  }
};

// }}}1
