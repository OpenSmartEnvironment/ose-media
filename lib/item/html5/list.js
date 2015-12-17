'use strict';

var O = require('ose').module(module);

var List = require('ose-html5/lib/view/list');

// Public
exports.tapItem = function(entry, ev) {
  var e = this.so.media;
  e = e && e.player;

  if (e) {
    this.stop(ev);
    entry.shard.post(e, 'playItem', entry.identify());
  } else {
    List.tapItem.apply(this, arguments);
  }
};

exports.printItem = function(entry) {
  var kind = O.data.schemas[entry.dval.schema];
  kind = kind && kind.kinds[entry.dval.kind];

  if (kind) {
    var li = kind.printMediaHistory(this.li({tabindex: 0}), entry);
    li.on('click', exports.tapItem.bind(this, entry));
    return li;
  }

  var li = List.printItem.call(this, entry);
  li.p('Kind was not found: ' + entry.dval.schema + '.' + entry.dval.kind);

  return li;
};
