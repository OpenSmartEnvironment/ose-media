'use strict';

var O = require('ose').object(module, 'ose-level');
exports = O.init(O.scope);

// Public {{{1
exports.map('history', {  // {{{2
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

exports.map({  // {{{2
  kind: 'stream',
  field: 'name',
  unique: false,
});

exports.map({  // {{{2
  kind: 'item',
  field: 'score',
  unique: false,
});

