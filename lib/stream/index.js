'use strict';

var O = require('ose').object(module, 'ose/lib/kind');
exports = O.append('browser').exports;

/** Doc {{{1
 * @caption Media streams
 *
 * @readme
 * It is possible to predefine streams or files into the OSE
 * Media player. These can be easily selected and played.
 *
 * @module media
 * @submodule media.stream
 * @main media.stream
 */

/**
 * @caption Media stream kind
 *
 * @readme
 * Media stream entry represents a single media stream that can be
 * played back.
 *
 * @kind stream
 * @class media.lib.stream
 * @extend ose.lib.kind
 * @type singleton
 */

// Public  {{{1
exports.initChildren = function() {  // {{{2
  this.newField('name', 'text');
};

exports.matchQuery = function(entry, params) {  // {{{2
  if (params.filter && params.filter.voice) {
    var val = params.filter.voice;

    if (
      (val !== entry.id.toLowerCase()) &&
      (val !== entry.dval.voice) &&
      (parseInt(val) !== entry.dval.preset)
    ) {
      return false;
    }
  }

  return true;
};

exports.getMediaKeys = function(entry) {  // {{{2
/**
 * Returns an object containing information about media entry to
 * display in the player detail view.
 *
 * @param entry {Object} Entry to display
 *
 * @result {Object} Media info keys.
 *
 * @method getMediaKeys
 */

  return {
    name: entry.dval.name
  };
};

exports.playItem = function(player, item, cb) {  // {{{2
/**
 * Send media item to to playback
 *
 * @param player {Object} Media player entry
 * @param item {Object} Media item entry
 */

  player.playback.post(
    'playUri',
    item.dval.media.url,
    cb
  );
};

// }}}1
