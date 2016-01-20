'use strict';

const O = require('ose')(module)
  .singleton('ose/lib/kind')
;

exports = O.init('media', 'item');

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
exports.layout('list', {  // {{{2
  printItem: function(entry) {
    var kind = O.data.schemas[entry.dval.schema];
    kind = kind && kind.kinds[entry.dval.kind];

    if (kind) {
      kind.printMediaHistory(this.li(), entry)
        .on('tap', this.tapItem.bind(this, entry))
      ;
    } else {
      this.li()
        .h3(this.entry.getCaption())
        .p('Kind was not found: ' + entry.dval.schema + '.' + entry.dval.kind)
      ;
    }

    return this.endUpdate();
  }
});

exports.getCaption = function(entry) {  // {{{2
  // TODO: call getCaption of item entry.
  return entry.dval.title ||
    entry.dval.data && (entry.dval.data.title || entry.dval.data.url)
  ;
};

