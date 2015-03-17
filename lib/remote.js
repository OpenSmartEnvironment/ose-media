'use strict';

var O = require('ose').class(module, C);

var Remote = require('ose-control/lib/remote');

/** Doc {{{1
 * @submodule media.player
 */

/**
 * @caption Remote controller command group class for media player
 *
 * @readme
 * Facilitates configuration of controlling the media player with
 * remote controllers.
 *
 * See the [control.remote] component.
 *
 * @class media.lib.player.remote
 * @type class
 */

// }}}1
// Public {{{1
function C(player) {  // {{{2
  this.timeout = 10000;

  this.target = player;

  this.actions = {
    mute: {
      command: 'mute',
      data: 'toggle',
      firstOnly: true,
    },
    stop: {
      command: 'stop',
      data: true,
      firstOnly: true,
    },
    pause: {
      command: 'pause',
      data: true,
      firstOnly: true,
    },
    play: {
      command: 'play',
      data: true,
      firstOnly: true,
    },
    playpause: {
      command: 'playPause',
      data: true,
      firstOnly: true,
    },
    forward: {
      command: 'next',
      data: true,
    },
    back: {
      command: 'previous',
      data: true,
    },
    volumeup: {
      command: 'volume',
      data: 'up'
    },
    volumedown: {
      command: 'volume',
      data: 'down'
    },
  };

  this.actions.rewind = this.actions.back;
};

exports.selected = function() {  // {{{2
//  delete this.light;
};

exports.addSource = function(group, space, sid, data) {  // {{{2
/**
 * Sets up a media source as a single remote controller group
 *
 * @param group {Object} Group to be used
 * @param space {String} Space containing media sid
 * @param sid {String} Media sid
 * @param data {Object} List of media items
 *
 * @method add
 */

  if (typeof data === 'string') {
    data = require(data);
  }

  for (var key in data) {
    var o = data[key];

    if (o.preset) {
      Remote.add(group, o.preset, {
        command: 'playItem',
        data: {
          id: key
          sid: sid,
          space: space,
        }
      });
    }
  }
};

// }}}1
