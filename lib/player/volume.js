'use strict';

var O = require('ose').class(module, C);

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
function C(entry) {  // {{{2
/**
 * Socket constructor
 *
 * @param entry {Object} Media player entry
 *
 * @method constructor
 */

  if ('volumeSocket' in entry) {
    throw O.error(this, 'DUPLICIT_VOLUME', entry.identify());
  }

  this.entry = entry;

  entry.linkTo(entry.data.volume, false, true, this);
};

exports.open = function(req) {  // {{{2
/**
 * @copyMethod ose.lib.entry.master/open
 * @method open
 */

//  console.log('VOLUME OPEN', {player: this.entry.id, volume: req.id});

  this.entry.volume = this._link.entry;

  this.patch({spatch: req.state});
  this.home(req.home);
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

  var vs = this.entry.volume.state;

  for (var key in req.spatch) {
    var value = req.spatch[key];

    switch (key) {
    case 'mute':
      this.entry.setState({volume: {mute: value}});
      break;
    case 'max':
    case 'volume':
      if (vs.max && vs.volume) {
        this.entry.setState({volume: {value: vs.volume / vs.max}});
      }
      break;
    }
  }
  return;
};

// }}}1
