'use strict';

const O = require('ose')(module)
  .class(init)
;

/** Doc {{{1
 * @submodule media.player
 */

/**
 * @caption Media player-to-playback client socket
 *
 * @readme
 * Establish a [link] to a playback entry.
 *
 * @class media.lib.player.playback
 * @type class
 */

// Public {{{1
function init(entry) {  // {{{2
/**
 * Socket constructor
 *
 * @param entry {Object} Media player entry
 *
 * @method constructor
 */

  if ('playbackSocket' in entry) {
    throw O.log.error(this, 'DUPLICIT_PLAYBACK', entry.toString());
  }

  entry.playbackSocket = this;
  this.entry = entry;

  entry.shard.track(entry.dval.playback, this);
};

exports.open = function(resp) {  // {{{2
/**
 * @copyMethod ose.lib.entry.master/open
 * @method open
 */

  this.entry.playback = this._link.entry;

  if (resp.dval) {
    dpatch(this.entry, resp.dval);
  }
  if (resp.sval) {
    spatch(this.entry, resp.sval);
  }
  this.home(resp.canReachHome());
};

exports.close = function() {  // {{{2
  var e = this.entry;
  delete this.entry;

  e.setState({playback: {synced: null}});
  delete e.playbackSocket;
  delete e.playback;
};

exports.error = function(err) {  // {{{2
  O.log.error(err);
  this.close();
};

exports.home = function(val) {  // {{{2
/**
 * @copyMethod ose.lib.entry.master/home
 * @method home
 * @handler
 */

  this.entry.setState({playback: {synced: val}});
};

exports.patch = function(req) {  // {{{2
/**
 * @copyMethod ose.lib.entry.master/patch
 * @method patch
 * @handler
 */

  var e = this.entry;

  if (req.dpatch) {
    dpatch(this.entry, req.dpatch);
  }

  if (req.spatch) {
    spatch(this.entry, req.spatch);
  }
};

// }}}1
// Private {{{1
function dpatch(entry, patch) {  // {{{2
  if (! ('mcast' in patch)) return

  delete entry.mcast;

  if (! patch.mcast) return;

  entry.playback.shard.find(patch.mcast, function(err, resp) {
    entry.mcast = resp;
  });
}

function spatch(entry, patch) {  // {{{2
  var p = {};

  for (var key in patch) {
    var v = patch[key];

    switch (key) {
    case 'status':
    case 'pos':
    case 'info':
    case 'can':
    case 'shuffle':
    case 'fullscreen':
      p[key] = JSON.parse(JSON.stringify(v));
      break;
    default:
      O.log.todo('Player state', {key: key, v: v});
    }
  }

  if (! O._.isEmpty(p)) {
    entry.setState(p);
  }
};

// }}}1
