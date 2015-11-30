'use strict';

var O = require('ose').module(module);

var Entry = O.class('ose/lib/entry');

/** Doc {{{1
 * @submodule media.player
 */

/**
 * @caption Media player command handlers
 *
 * @readme
 * Command handlers for entries of media player kind
 *
 * @class media.lib.player
 */

// Public  {{{1
exports.mute = function(req, socket) {  // {{{2
/**
 * Toggle mute
 *
 * @param req {Boolean} Whether to mute
 * @param [socket] {Object} Client socket
 *
 * @method mute
 * @handler
 */

//  console.log('PLAYER MUTE', req);

  var e = this.entry;

  if (e.sval.volume.synced) {
    e.shard.post(e.volume, 'mute', req, socket);
    O.link.close(socket);
    return;
  }

  O.link.error(socket, O.error(this, 'Volume not connected'));
  return;
};

exports.volume = function(req, socket) {  // {{{2
/**
 * Change volume
 *
 * @param req {Number|String} (0 .. 1) or "up"/"down"
 * @param [socket] {Object} Client socket
 *
 * @method volume
 * @handler
 */

  var e = this.entry;

  switch (req) {
  case 'up':
    req = (e.sval.volume && e.sval.volume.value ? e.sval.volume.value : 0) + 0.01;
    if (req > 1) req = 1;
    break;
  case 'down':
    req = (e.sval.volume && e.sval.volume.value ? e.sval.volume.value : 0) - 0.01;
    if (req < 0) req = 0;
    break;
  }

  if (e.sval.volume.synced) {
    e.shard.post(e.volume, 'volume', req);

    if (e.sval.volume.mute && (typeof req === 'number') || (req === 'up')) {
      e.shard.post(e.volume, 'mute', false)
    }
  } else {
    e.setState({volume: {value: req}});
  }

  O.link.close(socket);
};

exports.playItem = function(req, socket) {  // {{{2
/**
 * Play media item.
 *
 * @param req {Object} Media item entry identification.
 * @param [socket] {Object} Client socket
 *
 * @method playItem
 * @handler
 */

  var media;
  var e = this.entry;

  O.link.close(socket);

  return e.shard.find(req, function(err, entry) {  // {{{3
    if (err) return O.log.error(err);

    if (entry.kind === O.scope.kinds.item) {
      return playItem(e, entry);
    }

    media = entry;
    return e.shard.query('history', {filter: {
      space: media.shard.space.name,
      shard: media.shard.id,
      entry: media.id,
    }}, onQuery);
  });

  function onQuery(err, resp) {  // {{{3
    if (err) return O.log.error(err);

    switch (resp.length) {
    case 0:
      var trans = e.shard.startTrans();
      var entry = trans.add('item', {
        ident: media.identify({shard: e.shard}),
        scope: media.shard.scope.name,
        kind: media.kind.name,
        score: -Date.now(),
        media: media.dval,
        playlist: 'history',
      });

      return trans.commit(function(err) {
        if (err) return O.log.error(err);
        return playItem(e, entry);
      });
    case 1:
      return e.shard.get(resp[0], function(err, entry) {
        if (err) return O.log.error(err);
        return playItem(e, entry);
      });
    }

    return O.log.error(e, 'Duplicit media history item', resp);
  }

  // }}}3
};

exports.stop = function(req, socket) {  // {{{2
/**
 * Stop playback
 *
 * @param req {Undefined}
 * @param [socket] {Object} Client socket
 *
 * @method stop
 * @handler
 */

  var e = this.entry;

  if (ps(e)) {
    e.shard.post(e.playback, 'stop', req);
  }

  if (e.boon) {
    O.link.close(e.boon);
  }

  O.link.close(socket);
};

exports.pause = function(req, socket) {  // {{{2
/**
 * Pause playback
 *
 * @param req {Undefined}
 * @param [socket] {Object} Client socket
 *
 * @method pause
 * @handler
 */

  var e = this.entry;

  if (ps(e)) {
    e.shard.post(e.playback, 'pause', req);
  }

  O.link.close(socket);
};

exports.playPause = function(req, socket) {  // {{{2
/**
 * Play or pause current media
 *
 * @param req {Undefined}
 * @param [socket] {Object} Client socket
 *
 * @method playPause
 * @handler
 */

  var e = this.entry;

  switch (e.sval.status) {
  case 'playing':
    e.shard.post(e.playback, 'pause', true);
    return;
  case 'paused':
    e.shard.post(e.playback, 'play', true);
    return;
  default:
    playLast(e);
    return;
  }

  O.link.close(socket);
};

exports.play = function(req, socket) {  // {{{2
/**
 * Play
 *
 * @param req {Undefined}
 * @param [socket] {Object} Client socket
 *
 * @method play
 * @handler
 */

  var e = this.entry;

  if (ps(e) && (e.sval.status === 'paused')) {
    e.shard.post(e.playback, 'play', req);
  } else {
    playLast(e);
  }

  O.link.close(socket);
};

exports.fullscreen = function(req, socket) {  // {{{2
/**
 * Toggle fullscreen
 *
 * @param req {Boolean|Object} Whether to switch to fullscreen or "toggle"
 * @param [socket] {Object} Client socket
 *
 * @method fullscreen
 * @handler
 */

  var e = this.entry;

  if (req === 'toggle') {
    req = ! e.sval.fullscreen;
  }

  if (ps(e)) {
    e.shard.post(e.playback, 'fullscreen', req);
  } else {
    e.setState({fullscreen: req});
  }

  O.link.close(socket);
};

exports.playLast = function(req, socket) {  // {{{2
/**
 * Play last media item
 *
 * @param req {Undefined}
 * @param [socket] {Object} Client socket
 *
 * @method playLast
 * @handler
 */

  playLast(this.entry);

  O.link.close(socket);
};

exports.next = function(req, socket) {  // {{{2
/**
 * Skip to next media
 *
 * @param req {Undefined}
 * @param [socket] {Object} Client socket
 *
 * @method next
 * @handler
 */

  var e = this.entry;

  if (ps(e)) {
    e.shard.post(e.playback, 'next', req);
  }

  O.link.close(socket);
};

exports.previous = function(req, socket) {  // {{{2
/**
 * Skip to previous media
 *
 * @param req {Undefined}
 * @param [socket] {Object} Client socket
 *
 * @method previous
 * @handler
 */

  var e = this.entry;

  if (ps(e)) {
    e.shard.post(e.playback, 'previous', req);
  }

  O.link.close(socket);
};

exports.shuffle = function(req, socket) {  // {{{2
/**
 * Toggle shuffle
 *
 * @param req {Boolean|String} Whether to shuffle or "toggle"
 * @param [socket] {Object} Client socket
 *
 * @method shuffle
 * @handler
 */

  var e = this.entry;

  if (req === 'toggle') {
    req = ! e.sval.shuffle;
  } else {
    req = Boolean(req);
  }

  if (ps(e)) {
    e.shard.post(e.playback, 'shuffle', req);
  } else {
    e.setState({shuffle: req});
  }

  O.link.close(socket);
};

exports.setPos = function(req, socket) {  // {{{2
/**
 * Change current pos
 *
 * @param req {Number} Position delta in microseconds
 * @param [socket] {Object} Client socket
 *
 * @method setPos
 * @handler
 */

  var e = this.entry;

  if (! (e.sval.pos && ps(e))) {
    return;
  }

  var pos = e.sval.pos.value;
  if (e.sval.status === 'playing') {
    pos += (new Date().getTime() - e.sval.pos.at) / 1000;
  }

  e.shard.post(e.playback, 'seek', (req - pos) * 1000000);

  O.link.close(socket);
  return;
};

// TODO: Switch names of seek and setPos methods
exports.seek = function(req, socket) {  // {{{2
/**
 * Seek media
 *
 * @param req {Number} Position in microseconds
 * @param [socket] {Object} Client socket
 *
 * @method seek
 * @handler
 */

  var e = this.entry;

  if (ps(e)) {
    e.shard.post(e.playback, 'seek', req * 1000000);
  }

  O.link.close(socket);
};

// }}}1
// Private {{{1
function playLast(that) {  // {{{2
  if (that.sval.item) {
    that.shard.find(that.sval.item, function(err, item) {
      if (item) {
        playItem(that, item);
      }
    });
  }
};

function ps(entry) {  // {{{2
  return entry.sval.playback && entry.sval.playback.synced;
};

function playItem(player, entry, socket) {  // {{{2
//  console.log('PLAYER PLAY ITEM');

  // Close the current boon if any
  if (player.boon) {
    O.link.close(player.boon, null, true);
    delete player.boon;
  }
  player.post('stop', true);

  // Validat media item entry
  if (
    ! entry ||
    ! entry.dval ||
    typeof entry.dval !== 'object'
  ) {
    done(O.error(player, 'Invalid entry', entry));
    return;
  }

  // Find kind of item
  var kind = O.getKind(entry.dval);
  if (! kind) {
    done(O.error(player, 'Kind was not found', entry.dval.kind));
    return;
  }

  // Write item to player state
  player.setState({item: entry.identify()});

  // Verify playback accessibility
  if (! player.playback) {
    done(O.error(player, 'There is no playback entry defined'));
    return;
  }
  /*
  if (! player.playback.canReachHome()) {
    done(O.error(player, 'Player is not connected to the playback entry'));
    return;
  }
  */

  kind.playItem(player, entry, done);
  return;

  function done(err) {
    if (err) {
      O.link.error(socket, err);
      return;
    }

    if (player.sval.volume.mute) {
      player.volume.post('volume', 0.15);
      player.volume.post('mute', false);
    }

    O.link.close(socket);
    return;
  }
};

// }}}1
