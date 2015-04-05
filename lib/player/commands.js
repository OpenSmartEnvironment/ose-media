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
 * @class media.lib.player.commands
 * @type class
 */

// Public  {{{1
exports.mute = function(req, socket) {  // {{{2
/**
 * [Command handler]
 *
 * Toggle mute
 *
 * @param req {Boolean}
 *
 * @method mute
 */

  console.log('PLAYER MUTE', req);

  var e = this.entry;

  if (e.state.volume.synced) {
    e.postTo(e.volume, 'mute', req, socket);
  } else {
    O.link.error(socket, O.error(this, 'Volume not connected'));
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
      O.log.error(err);
      return;
    }

    if (entry.kind === O.getScope('media').kinds.item) {
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
    switch (err && err.code) {
    case null:
    case undefined:  // No error => item found, let's play it.
      playItem(e, entry);
      return;
    case 'ENTRY_NOT_FOUND':  // Item not found, try to create new based on media entry and play it.
      if (! (media instanceof Entry)) {
        O.log.error(O.error(e, 'invalidMedia', media));
        return;
      }

      entry = e.shard.entry(id, 'item', {
        ident: media.identify(),
        scope: media.shard.scope.name,
        kind: media.kind.name,
        count: 0,
        media: media.data,
        playlist: 'history',
      });

      playItem(e, entry);
      return;
    default:
      O.log.error(err);
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

  if (ps(e)) {
    e.postTo(e.playback, 'stop', req);
  }

  if (e.boon) {
    O.link.close(e.boon);
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

  if (ps(e)) {
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

  if (ps(e) && (e.state.status === 'paused')) {
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

  if (ps(e)) {
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

  if (ps(e)) {
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

  if (ps(e)) {
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

  if (ps(e)) {
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

  if (! (e.state.pos && ps(e))) {
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

  if (ps(e)) {
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

function ps(entry) {  // {{{2
  return entry.state.playback && entry.state.playback.synced;
};

function playItem(player, entry, socket) {  // {{{2
  // Close the current boon if any
  if (player.boon) {
    O.link.close(player.boon, null, true);
    delete player.boon;
  }
  player.post('stop', true);

  // Validat media item entry
  if (
    ! entry ||
    ! entry.data ||
    typeof entry.data !== 'object'
  ) {
    done(O.error(player, 'Invalid entry', entry));
    return;
  }

  // Find kind of item
  var kind = O.getKind(entry.data);
  if (! kind) {
    done(O.error(player, 'Kind was not found', entry.data.kind));
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

    if (player.state.volume.mute) {
      player.volume.post('volume', 0.15);
      player.volume.post('mute', false);
    }

    O.link.close(socket);
    return;
  }
};

// }}}1
