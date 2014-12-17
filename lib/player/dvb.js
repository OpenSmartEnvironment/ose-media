'use strict';

var Ose = require('ose');
var M = Ose.class(module, C, 'ose/lib/entry/command');

/** Doc {{{1
 * @submodule media.player
 */

/**
 * @caption Media player to dvb client socket
 *
 * @readme
 * Establishes [link] to a dvb entry.
 *
 * @class media.lib.player.dvb
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

  if ('dvbSocket' in entry) {
    throw Ose.error(this, 'DUPLICIT_DVB', entry.identify());
  }

  entry.dvbSocket = this;

  M.super.call(this,
    entry,
    entry.data.dvb,
    'register'
  );
};

exports.sync = function(value) {  // {{{2
/**
 * Open handler
 *
 * @param value {Boolean} Socket is linked to entry home.
 *
 * @method open
 */

//  console.log('DVB SYNCED', value);

  if (this.link) {
    this.entry.dvb = this.link.entry;
  } else {
    delete this.entry.dvb;
  }

  this.entry.setState({synced: {dvb: value}});
};

exports.end = function(err, req) {  // {{{2
/**
 * Close handler
 *
 * @param req {Object}
 *
 * @method end
 */

  console.log('DVB ENDED', {player: this.entry.id, dvb: req.id});

  var e = this.entry;
  e.setState({synced: {dvb: false}});

  delete e.dvbSocket;
  delete e.dvb;
//  delete this.entry;

  M.log.todo('Register', this.entry);

//  setTimeout(connect.bind(null, this), 1000);
};

// }}}1
