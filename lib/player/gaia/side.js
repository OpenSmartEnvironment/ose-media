'use strict';

var O = require('ose').module(module);

var Common = require('./common');

// Public {{{1
exports.displayLayout = function() {  // {{{2
  $('<section>', {
    'data-type': 'list',
  })
  .appendTo(this.$())
  .append(
    $('<ul>').append([
      $('<li>').append([
//        $('<p>').text('Now playing'),
        $('<p>', {'class': 'title'}).text('')
        ])
      .on('click',
        O.ui.tapBit({
          space: this.key.space,
          bit: 'detail',
          shard: 'media',
          entry: 'player'
        })
      )
    ])
  );

  this.$().append(Common.controls(this));

  updateTitle(this);
};

exports.updateState = function(state) {  // {{{2
  for (var key in state) {
    switch (key) {
    case 'canPause':
      if (state.canPause) {
        this.$('playPause').parent('div.ui-checkbox').show();
      } else {
        this.$('playPause').parent('div.ui-checkbox').hide();
      }
      break;
    case 'player':
      /*
      if (state.player === 'playing') {
        this.button('pause', {label: 'Pause'});
      } else {
        this.button('pause', {label: 'Play'});
      }
      */

      updateTitle(this);

      break;
    case 'fullscreen':
      O.log.todo();

//        this.button('fullscreen', state.fullscreen);
      break;
    case 'artist':
    case 'organization':
    case 'title':
    case 'playing':
      updateTitle(this);

      break;
    }
  }
};

// }}}1
// Private {{{1
function updateTitle(that) {  // {{{2
  if (! that.entry.isSynced()) {
    that.$(' .title').text('Not connected to player');
    return;
  }

  switch (that.entry.sval.player) {
    case undefined:
    case null:
    case '':
    case 'stop':
      that.$(' .title').text('Stopped');
      return;
    case 'playing':
      that.$(' .title').text(Common.getTitle(that.entry.sval));
      return;
    default:
      that.$(' .title').text('Unhandled');
      O.log.unhandled('State', that.entry.sval.player);
      return;
  }
}

// }}}1
