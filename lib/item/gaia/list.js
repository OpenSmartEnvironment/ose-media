'use strict';

var O = require('ose').module(module);

var List = require('ose-gaia/lib/view/list');

// Public
exports.tapItem = function(entry, ev) {
  var e = this.stateObj.media;
  e = e && e.player;
  if (e) {
    this.stop(ev);
    entry.postTo(e, 'playItem', entry.identify());
  } else {
    List.tapItem.apply(this, arguments);
  }
};

exports.printItem = function(entry) {
  var kind = O.getKind(entry.dval);

  if (kind) {
    var li = kind.printMediaHistory(this.append('li'), entry);
    li.on('click', exports.tapItem.bind(this, entry));
    return li;
  }

  var li = List.printItem.call(this, entry);
  this.new('p')
    .text('<p>Kind was not found: ' + entry.dval.scope + '.' + entry.dval.kind + '</p>')
    .appendTo(li.find('div'))
  ;
  return li;
};
