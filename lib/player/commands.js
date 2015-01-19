'use strict';

var Ose = require('ose');
var M = Ose.module(module);

var Entry = M.class('ose/lib/entry');

/** Doc {{{1
 * @submodule media.player
 */

/** 
 * @caption Media player command handlers
 *
 * @readme
 * Command handlers for entries of media player kind
 *
 * @class media.lib.player.commands
 * @type class
 */

// Public  {{{1
exports.mute = function(req) {  // {{{2
/**
 * [Command handler]
 *
 * Toggle mute
 *
 * @param req {Boolean}
 *
 * @method mute
 */

  var e = this.entry;

  if (e.state.volume.synced) {
    e.postTo(e.volume, 'mute', req);
  }
};

exports.volume = function(req) {  // {{{2
/**
 * [Command handler]
 *
 * Change volume
 *
 * @param req {Number} (0 .. 1)
 *
 * @method volume
 */

  var e = this.entry;

  switch (req) {
  case 'up':
    req = (e.state.volume && e.state.volume.value ? e.state.volume.value : 0) + 0.01;
    if (req > 1) req = 1;
    break;
  case 'down':
    req = (e.state.volume && e.state.volume.value ? e.state.volume.value : 0) - 0.01;
    if (req < 0) req = 0;
    break;
  }

  if (e.state.volume.synced) {
    e.postTo(e.volume, 'volume', req);

    if (e.state.volume.mute && (typeof req === 'number') || (req === 'up')) {
      e.postTo(e.volume, 'mute', false)
    }
  } else {
    e.setState({volume: {value: req}});
  }
};

exports.playItem = function(req) {  // {{{2
/**
 * [Command handler]
 *
 * Play media item.
 *
 * @param req {Object} Media item entry identification.
 *
 * @method playItem
 */

  var id;
  var media;
  var e = this.entry;

  e.find(req, onMedia);

  function onMedia(err, entry) {  // {{{3
    if (err) {
      M.log.error(err);
      return;
    }

    if (entry.kind === Ose.scope('media').kinds.item) {
      id = entry.id;
      onItem(null, entry);
      return;
    }

    media = entry;
    id = 'history_' + entry.shard.space.name + '_' + entry.shard.sid + '_' + entry.id;
    e.shard.get(id, onItem);
    return;
  }

  function onItem(err, entry) {  // {{{3
    /*
    if (e.state.synced.dvb) {
      e.dvbSocket.link.stop();
    }
    */

    switch (err && err.code) {
    case null:
    case undefined:  // No error => item found, let's play it.
      playItem(e, entry);
      return;
    case 'ENTRY_NOT_FOUND':  // Item not found, try to create new based on media entry and play it.
      if (! M.isSuper(Entry, media)) {
        M.log.error(Ose.error(e, 'invalidMedia', media));
        return;
      }

      entry = e.shard.entry(id, 'item', {
        space: media.shard.space.name,
        shard: media.shard.sid,
        scope: media.shard.scope.name,
        kind: media.kind.name,
        id: media.id,
        count: 0,
        media: media.data,
        playlist: 'history',
      });

      playItem(e, entry);
      return;
    default:
      M.log.error(err);
      return;
    }

  }

  // }}}3
};

exports.stop = function(req) {  // {{{2
/**
 * [Command handler]
 *
 * Stop playback
 *
 * @method stop
 */

  var e = this.entry;

  /*
  if (e.state.synced.dvb) {
    e.dvbSocket.link.stop();
  }
  */

  if (e.state.synced.playback) {
    e.postTo(e.playback, 'stop', req);
  }
};

exports.pause = function(req) {  // {{{2
/**
 * [Command handler]
 *
 * Pause playback
 *
 * @method pause
 */

  var e = this.entry;

  if (e.state.synced.playback) {
    e.postTo(e.playback, 'pause', req);
  }
};

exports.playPause = function(req) {  // {{{2
/**
 * [Command handler]
 *
 * Play or pause current media
 *
 * @param req {Object} Media item entry identification.
 *
 * @method playPause
 */

  var e = this.entry;

  switch (e.state.status) {
  case 'playing':
    e.postTo(e.playback, 'pause', true);
    return;
  case 'paused':
    e.postTo(e.playback, 'play', true);
    return;
  default:
    playLast(e);
    return;
  }
};

exports.play = function(req) {  // {{{2
/**
 * [Command handler]
 *
 * Play
 *
 * @method play
 */

  var e = this.entry;

  if (e.state.synced.playback && (e.state.status === 'paused')) {
    e.postTo(e.playback, 'play', req);
  } else {
    playLast(e);
  }
};

exports.fullscreen = function(req) {  // {{{2
/**
 * [Command handler]
 *
 * Toggle fullscreen
 *
 * @param req {Object} Fullscreen? TODO
 *
 * @method fullscreen
 */

  var e = this.entry;

  if (req === 'toggle') {
    req = ! e.state.fullscreen;
  }

  if (e.state.synced.playback) {
    e.postTo(e.playback, 'fullscreen', req);
  } else {
    e.setState({fullscreen: req});
  }
};

exports.playLast = function(req) {  // {{{2
/**
 * [Command handler]
 *
 * Play last media item
 *
 * @param req {Object} Request object
 *
 * @method playLast
 */

  playLast(this.entry);
};

exports.next = function(req) {  // {{{2
/**
 * [Command handler]
 *
 * Skip to next media
 *
 * @param req {Object} Request object TODO
 *
 * @method next
 */

  var e = this.entry;

  if (e.state.synced.playback) {
    e.postTo(e.playback, 'next', req);
  }
};

exports.previous = function(req) {  // {{{2
/**
 * [Command handler]
 *
 * Skip to previous media
 *
 * @param req {Object} Request object TODO
 *
 * @method previous
 */

  var e = this.entry;

  if (e.state.synced.playback) {
    e.postTo(e.playback, 'previous', req);
  }
};

exports.shuffle = function(req) {  // {{{2
/**
 * [Command handler]
 *
 * Toggle shuffle
 *
 * @param req {Boolean} Shuffle? 
 *
 * @method shuffle
 */

  var e = this.entry;

  if (req === 'toggle') {
    req = ! e.state.shuffle;
  }

  if (e.state.synced.playback) {
    e.postTo(e.playback, 'shuffle', req);
  } else {
    e.setState({shuffle: req});
  }
};

exports.setPos = function(req) {  // {{{2
/**
 * [Command handler]
 *
 * Change current pos
 *
 * @param req {Number} Position delta in microseconds
 *
 * @method setPos
 */

  var e = this.entry;

  if (! (e.state.pos && e.state.synced.playback)) {
    return;
  }

  var pos = e.state.pos.value;
  if (e.state.status === 'playing') {
    pos += (new Date().getTime() - e.state.pos.at) / 1000;
  }

  e.postTo(e.playback, 'seek', (req - pos) * 1000000);

  return;
};

exports.seek = function(req) {  // {{{2
/**
 * [Command handler]
 *
 * Seek media
 *
 * @param req {Number} Position in microseconds
 *
 * @method seek
 */

  var e = this.entry;

  if (e.state.synced.playback) {
    e.postTo(e.playback, 'seek', req * 1000000);
  }
};

// }}}1
// Private {{{1
function playLast(that) {  // {{{2
  if (that.state.item) {
    that.find(that.state.item, function(err, item) {
      if (item) {
        playItem(that, item);
      }
    });
  }
};

function playItem(that, entry) {  // {{{2
  if (that.state.volume.mute) {
    that.postTo(that.volume, 'volume', 0.05);
    that.postTo(that.volume, 'mute', false);
  }

  that.setState({item: entry.identify()});

  if (that.playback) {
    Ose.scope(entry.data.scope).kinds[entry.data.kind].playItem(that, entry, done);
  }

  function done(err) {
    if (err) {
      M.log.error(err);
    } else {
      console.log('PLAYER PLAYED', entry.data);
    }
  }
};

// }}}1




/* COMMENTS {{{1
exports.playDvb = function(req, socket) {  // {{{2
/ **
 * [Command handler]
 *
 * Play DVB media item.
 *
 * @param req {Object} DVB data
 *
 * @method playDvb
 * /

  var e = this.entry;

  /*
  if (! e.state.synced.dvb) {
    Ose.link.error(socket, Ose.error(e, 'DISCONNECTED', 'DVB disconnected'));
    return;
  }
* /

  if (! e.state.synced.playback) {
    Ose.link.error(socket, Ose.error(e, 'DISCONNECTED', 'Playback disconnected'));
    return;
  }

  streamDvb(e, req, function(err, dvb) {
    if (err) {
      Ose.link.error(err);
    } else {
      e.dvb = dvb;
      e.postTo(
        e.playback,
        'playUri',
        'rtp://10.166.25.8:5000'
      );
      Ose.link.close(socket);
    }
  });

  /*
  e.dvbSocket.link.stream(req);

  e.postTo(
    e.playback,
    'playUri',
    'rtp://10.166.25.8:5000'
  );

  Ose.link.close(socket);
  * 
};

}}}1 */
