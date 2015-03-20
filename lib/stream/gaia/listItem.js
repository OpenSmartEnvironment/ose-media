'use strict';

// Public
exports.displayLayout = function() {
  this.$()
    .empty()
    .append($('<aside>', {'class': 'pack-end'})
//      .append($('<div role="toolbar"><button data-icon="play"></div>'))
    )
    .append($('<p>').text(this.entry.data.name))
    .append($('<p>').text(this.entry.data.url))
  ;
};
