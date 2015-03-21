'use strict';

//var O = require('ose').module(module);

//var List = require('ose-gaia/lib/pagelet/list');

// Public
exports.tapItem = require('../../item/gaia/list').tapItem;
/*
exports.tapItem = function(entry, ev) {
  this.stop(ev);

  var e = this.stateObj.media;
  e = e && e.player;
  if (e) {
    entry.postTo(this.stateObj.media.player, 'playItem', entry.identify());
  } else {
    List.tapItem.apply(this, arguments);
  }
};*/

