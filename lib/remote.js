'use strict';

var Ose = require('ose');
var M = Ose.class(module, C);

var Remote = require('ose-control/lib/remote');

/**
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

// Public {{{1
function C(player) {  // {{{2
  this.timeout = 10000;

  this.target = player;

  this.actions = {
    mute: {
      command: 'mute',
      data: 'toggle',
    },
    stop: {
      command: 'stop',
      data: true,
    },
    pause: {
      command: 'pause',
      data: true,
    },
    play: {
      command: 'play',
      data: true,
    },
    playpause: {
      command: 'playPause',
      data: true,
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

exports.addSource = function(group, space, shard, data) {  // {{{2
/**
 * Sets up a media source as a single remote controller group
 *
 * @param group {Object} Group to be used
 * @param space {String} Space containing media shard
 * @param shard {String} Media shard
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
          space: space,
          shard: shard,
          entry: key
        }
      });
    }
  }
};

// }}}1
