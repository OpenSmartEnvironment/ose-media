'use strict';

var O = require('ose');

// Public
exports.displayData = function() {
  var scope = O.getScope(this.entry.data.scope);
  var kind = scope.kinds[this.entry.data.kind];

  kind.printMediaHistory(this.$().empty(), this.entry);
};

