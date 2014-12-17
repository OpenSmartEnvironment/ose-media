'use strict';

var Ose = require('ose');
var Sources = require('ose-media/lib/sources');

// Public
exports.displayData = function() {
  var scope = Ose.scope(this.entry.data.scope);
  var kind = scope.kinds[this.entry.data.kind];

  kind.printMediaHistory(this.$().empty(), this.entry);
};

