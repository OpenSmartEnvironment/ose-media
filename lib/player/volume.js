'use strict';

var Ose = require('ose');
var M = Ose.class(module, C);

/** Doc {{{1
 * @submodule media.player
 */

/**
 * @caption Media player to volume client socket
 *
 * @readme
 * Establishes a [link] to a volume entry.
 *
 * @class media.lib.player.volume
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

  if ('volumeSocket' in entry) {
    throw Ose.error(this, 'DUPLICIT_VOLUME', entry.identify());
  }

  this.entry = entry;

  entry.linkTo(entry.data.volume, {srev: true, strack: true}, this);
};

exports.open = function(req) {  // {{{2
/**
 * Open handler
 *
 * @param req {Object}
 *
 * @method open
 */

//  console.log('VOLUME OPEN', {player: this.entry.id, volume: req.id});

  this.entry.volume = this.link.entry;

  req && this.update(req);
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
  e.setState({volume: {synced: false}});
  delete e.volumeSocket;
  delete e.volume;

  return;
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

exports.update = function(req) {  // {{{2
/**
 * Update handler
 *
 * @param req {Object} Update request
 *
 * @method update
 */

  if (req.synced) {
    this.entry.setState({volume: {synced: req.synced}});
  }

  if (req.state) {
    var vs = this.entry.volume.state;

    for (var key in req.state) {
      var value = req.state[key];

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
  }
};

// }}}1
