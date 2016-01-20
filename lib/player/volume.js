'use strict';

const O = require('ose')(module)
  .class(init)
;

/** Doc {{{1
 * @submodule media.player
 */

/**
 * @caption Media player to volume client socket
 *
 * @readme
 * Establish a [link] to a volume entry.
 *
 * @class media.lib.player.volume
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

  if ('volumeSocket' in entry) {
    throw O.log.error(this, 'DUPLICIT_VOLUME', entry.toString());
  }
  entry.volumeSocket = this;

  this.entry = entry;

  entry.shard.track(entry.dval.volume, this);
};

exports.open = function(entry) {  // {{{2
/**
 * @copyMethod ose.lib.entry.master/open
 * @method open
 */

//  console.log('VOLUME OPEN', {player: this.entry.toString(), volume: entry.toString()});

  this.entry.volume = entry;

  this.patch({spatch: entry.sval});
  this.home(entry.canReachHome());
};

exports.close = function() {  // {{{2
  var e = this.entry;
  delete this.entry;

  e.setState({volume: {synced: null}});
  delete e.volumeSocket;
  delete e.volume;
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

  this.entry.setState({volume: {synced: val}});
};

exports.patch = function(req) {  // {{{2
/**
 * @copyMethod ose.lib.entry.master/patch
 * @method patch
 * @handler
 */

  if (! req.spatch) return;

  var vs = this.entry.volume.sval;

  for (var key in req.spatch) {
    var value = req.spatch[key];

    switch (key) {
    case 'mute':
      this.entry.setState({volume: {mute: value}});
      break;
    case 'max':
    case 'volume':
      if (vs.max && typeof vs.volume === 'number') {
        this.entry.setState({volume: {value: vs.volume / vs.max}});
      }
      break;
    }
  }
  return;
};

// }}}1
