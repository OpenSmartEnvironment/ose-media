'use strict';

var O = require('ose').object(module, 'ose/lib/kind');
exports = O.exports;

/** Doc {{{1
 * @caption Media history
 *
 * @readme
 * OSE Media package keeps track of played media items. These items
 * can be displayed in the player history and played again.
 *
 * @module media
 * @submodule media.history
 * @main media.history
 */

/**
 * @caption Media item kind
 *
 * @readme
 * The media item entry represents a single media item that can be
 * played back. It contains a reference to another entry and
 * additional data depending on the source.
 *
 * @kind item
 * @class media.lib.item
 * @extend ose.lib.kind
 * @type singleton
 */

// Public  {{{1
exports.getCaption = function(entry) {  // {{{2
  // TODO get rid of data.data and call getCaption of item entry.
  return entry.data.title ||
    entry.data.data && (entry.data.data.title ||entry.data.data.url)
  ;
};

// }}}1
