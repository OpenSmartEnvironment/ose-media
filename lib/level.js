'use strict';

var O = require('ose').object(module, 'ose-level');
exports = O.init(O.scope);

exports.map('history', {
  kind: 'item',
  unique: true,
  onePerEntry: true,
  map: function(entry, cb) {
    cb(entry.dval.ident, entry.id);
  },
  getId: function(key, value) {
    return value;
  },
  filter: function(key, value, params) {
    switch (key.length) {
    case 3:
      if (key[2] !== params.space) return false;
    case 2:
      if (key[1] !== params.shard) return false;
      if (key[0] !== params.entry) return false;
      break;
    default:
      return false;
    }
    return true;
  },
});

exports.map({
  kind: 'stream',
  field: 'name',
  unique: false,
});

exports.map({
  kind: 'item',
  field: 'score',
  unique: false,
});

/*
exports.map('source', {
  map: function(entry, cb) {
    if (typeof entry.kind.playItem === 'function' && 'data' in entry && 'title' in entry.data) {
      cb([entry.data.title, entry.kind.name, entry.id]);
    }
  },
  getId: function(key, value) {
    return key[2];
  },
  filter: function(key, value, params) {
    if (! params) return true;

    if (params.kind && params.kind !== key[1]) {
      return false;
    }

    return true;
  },
});
*/
