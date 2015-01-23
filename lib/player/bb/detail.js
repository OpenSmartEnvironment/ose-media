'use strict';

var Ose = require('ose');
var M = Ose.module(module);

var Common = require('./common');
var Sources = require('../../sources');

// Public {{{1
exports.tapDiscard = null;

exports.profile = {  // {{{2
  name: {
    place: 'caption',
    required: true
  }
};

exports.update = function() {  // {{{2
  // Refresh workaround: defer bindSourceItemTap on rightBox

  var that = this;
  Ose._.defer(function() {
    bindSourceItemTap(that);
  });
};

exports.displayLayout = function() {  // {{{2
  var that = this;

  this.sources = {};

  this.$(' > ul')
    .append($('<li>', {'class': 'nowplaying'})
    .on('click', onClickNowPlaying.bind(this))
    /*.hammer({
        dragup: false,
        dragdown: false
      }) // TODO: Solve scolling issue caused by Hammer.

      .on('dragleft dragright', onDragNowPlaying.bind(this))*/
      .append('<p />')
      .append('<p />')
    )
    .append(this.printVolume())
    .append($('<li>')
      .css('height', 'auto')
      .append(this.newWidget('toolbar', 'toolbar'))
      .append('<br />')
      .append(this.newWidget('slider', 'pos', {
        hide: true,
        change: Ose._.debounce(onPos.bind(this), 500),
      }))
    )
  ;

  Common.controls(this, this.$('toolbar'))

  Sources.each(function(name, scope, kind) {  // Create list item for each registered source. {{{3
    var source = {
      id: Ose._.uniqueId(),
      name: name,
      scope: Ose.scope(scope)
    };

    source.kind = source.scope.kinds[kind];

    $('<li>')
      .on('click', tapSource.bind(that))
      .prop('source', source)
      .append($('<p>').text(name))
      .appendTo(that.$(' > ul'))
    ;
  });

  Ose._.defer(function() {  // {{{3
    // Refresh workaround: defer bindSourceItemTap on rightBox
    bindSourceItemTap(that);
    updatePlaybackStatus(that);
  });

  // }}}3
};

exports.updateStateKey = function(key, value, state) {  // {{{2
  var that = this;

  switch (key) {
  case 'synced':
  case 'can':  // TODO
    // can.goNext
    // can.goPrevious
    // can.seek
    // can.setFullscreen
    // can.pause
    return;
  case 'info':
    updateMediaInfo(this);
    return;
  case 'item':
    if (value) {
      this.entry.find(that.entry.state.item, onItemEntry);
    } else {
      this.mediaItem = null;
      updateMediaInfo(that);
    };

    return;
  case 'status':
    updatePlaybackStatus(this);
    return;
  case 'pos':
    updatePos(this);
    return;
  case 'volume':
    if (! value) {
      return;
    }

    for (var key in value) {
      switch (key) {
      case 'value':
        this.widget('volume', value.value * 100);
        break;
      case 'mute':
        this.widget('volume', {state: ! value.mute});
        break;
      }
    }
    return;
  case 'shuffle':
    this.widget('toolbar', {'shuffle': value});
    return;
  case 'fullscreen':
    this.widget('toolbar', {'data': value});
    return;
  }

  return false;

  function onItemEntry(err, entry) {
    if (err) {
      that.mediaItem = null;
      M.log.unhandled('Media entry not found. ', err);
      updateMediaInfo(that);
    } else {
      entry.find({
        space: entry.data.space,
        shard: entry.data.shard,
        entry: entry.data.id
      }, onMediaEntry);
    }
  }

  function onMediaEntry(err, entry) {
    if (err) {
      that.mediaItem = null;
      M.log.unhandled('Media entry not found. ', err);
    } else {
      that.mediaItem = entry;
    }

    updateMediaInfo(that);
  }
};

exports.printVolume = function() {  // {{{2
  var vol = this.newWidget('slider', 'volume', {
    change: Ose._.throttle(onVolume.bind(this), 200),
    state: onMute.bind(this)
  });

  var li = $('<li>')
    .append($('<p>').text('Volume'))
    .append(vol)
  ;

  return li;
};

exports.updateSync = function(val) {  // {{{2
//  console.log('MEDIA PLAYER UPDATE SYNC', val, this.entry.isSynced(), JSON.stringify(this.entry.state));

  if (val) {
    this.$(' > ul > li').show();

    var li = this.$(' > ul > li.nowplaying');

    if (li.hasClass('expanded')) {
      li.html('<p />');
    } else {
      li.html('<p /><p>&nbsp</p>');
    }

    this.updateState(this.entry.state);
/*
    updatePlaybackStatus(this);
    updatePos(this);
    updateMediaInfo(this);
*/
  } else {
    this.$(' > ul > li').hide();

    this.$(' > ul > li.nowplaying')
      .show()
      .html($('<p>').text('notConnected'))
      .append($('<p>').html('&nbsp'))
    ;

    this.widget('pos', {
      value: 0,
      duration: null
    });

    if (this.updatePosTextHandle) {
      clearTimeout(this.updatePosTextHandle);
      delete this.updatePosTextHandle;
    }
  }
};

// }}}1
// Event Handlers {{{1
function onPos() {  // {{{2
  this.entry.post('setPos', this.widget('pos'));
}

function tapSource(ev) {  // {{{2
  printSource(this, $(ev.currentTarget).prop('source'));
};

function onMute(ev) {  // {{{2
  if (! this.updatingState) {
    this.entry.post('mute', ! this.entry.state.volume.mute);
  }

  return false;
}

function onVolume(ev, isTriggered) {  // {{{2
  if (this.updatingState || isTriggered) {
    return false;
  }

  this.entry.post('volume', this.widget('volume') / 100);

  ev.gesture && ev.gesture.preventDefault();
  ev.preventDefault();

  return false;
}

function onClickNowPlaying(ev) {  // {{{2
  var el = $(ev.currentTarget);

  if (el.hasClass('expanded')) {
    el
      .removeClass('expanded')
      .html('<p /><p />')
    ;
  } else {
    el
      .addClass('expanded')
      .html('<p />')
    ;
  }

  updatePlaybackStatus(this);
  updateMediaInfo(this);

  return false;
}

function onDragNowPlaying(ev) {
  // TODO: Make this work perfectly.
  var direction = ev.gesture.direction;
  var p = $(ev.currentTarget).find('p:last');
  var overflow = checkOverflow(p[0]);
  //console.log('overflow: ', overflow);

/*
  if ((overflow[1] === direction) && (overflow[1] !== 'both')) {
    console.log('not dragging');
    return false;
  }
*/

  if (overflow[0]) {
    var distance = ev.gesture.deltaX;
    //var offset = p.offset().left
    //console.log('direction: ', direction);

    //if (direction) return false;

    p.offset({left: distance});
  }

  ev.gesture.stopPropagation();
  return false;
}

// }}}1
// Private {{{1
var updatePos = Ose._.throttle(function(that) {  // {{{2
  var pos = 0;
  var duration = 0;
  var s = that.entry.state.pos;

  if (s && s.length) {
    pos = that.entry.state.pos.value;

    if (that.entry.state.status === 'playing') {
      pos += (new Date().getTime() - s.at - that.entry.shard.masterTimeOffset) / 1000;
      duration = s.length * 1000;
    }
  } else {
    s = null;
  }

  that.widget('pos', {
    value: pos,
    hide: ! s,
    max: (s && s.length) || 1,
    duration: duration,
  });
}, 200, {leading: false});

var updatePlaybackStatus = Ose._.throttle(function(that) {  // {{{2
  var p = that.$(' li.nowplaying > p:first');

  if (that.entry.state.status === 'playing') {
    $('span[role="toolbar"] > span[data-icon="play"]')
      .attr('data-icon', 'pause')
    ;
  } else {
    $('span[role="toolbar"] > span[data-icon="pause"]')
      .attr('data-icon', 'play')
    ;
  }

  p.text(that.entry.state.status || 'stopped');

  return;
}, 10, {leading: false});

var updateMediaInfo = Ose._.throttle(function(that) {  // {{{2
  var li = $('li.nowplaying');

  if (that.updatePosTextHandle) {
    clearTimeout(that.updatePosTextHandle);
    delete this.updatePosTextHandle;
  }

  if (li.hasClass('expanded')) {
      li.find('ul').remove();

      var ul = $('<ul>').appendTo(li);

      if (that.mediaItem) {
        $('<li>')
          .appendTo(ul)
          .append('<p>kind</p>')
          .append($('<p>').text(that.mediaItem.shard.scope.name + ' - ' + that.mediaItem.kind.name))
        ;

        var mediaKeys = that.mediaItem.kind.getMediaKeys(that.mediaItem);

        for (var key in mediaKeys) {
          $('<li>')
            .appendTo(ul)
            .append($('<p>').text(key))
            .append($('<p>').text(mediaKeys[key]));
          ;
        }
      }

      for (var key in that.entry.state.info) {
        if (key === 'url') {
          var value = decodeURIComponent(that.entry.state.info[key]);
        } else {
          var value = that.entry.state.info[key];
        }

        $('<li>')
          .appendTo(ul)
          .append($('<p>').text(key))
          .append($('<p>').text(value));
        ;
      }

      if (that.entry.state.pos && that.entry.state.pos.length) {
        $('<li>')
          .appendTo(ul)
          .append($('<p>').text('position'))
          .append($('<p>')
            .append(updatePosText(that, $('<span>')))
            .append($('<span>').text(' of ' + that.entry.state.pos.length))
          )
        ;
      }
  } else {
    li.find('p:last').text(Common.getTitle(that.mediaItem, that.entry.state.info));
  }

}, 10, {leading: false});

function updatePosText(that, el) {  // {{{2
  that.updatePosTextHandle = setInterval(function() {
    if (that.entry.state.pos) {
      if (that.entry.state.status === 'playing') {
        el.text(Math.round(that.entry.state.pos.value + (new Date().getTime() - that.entry.state.pos.at - that.entry.shard.masterTimeOffset) / 1000));
      } else {
        el.text(that.entry.state.pos.value);
      }
    }
  }, 1000);

  return el;
};

function printSource(that, source, filter) {  // {{{2
  Ose.ui.display({right: {
    pagelet: 'list',
    mediaSource: true,
    scope: source.scope.name,
    kind: source.kind.name,
    showAdd: false,
    filter: filter
  }});

  bindSourceItemTap(that);
};

function bindSourceItemTap(that) {  // {{{2
  if (! (
    Ose.ui.rightBox.content &&
    Ose.ui.rightBox.content.stateObj.mediaSource
  )) {
    return;
  }

  if (Ose.ui.rightBox.content.tapItem) {
    Ose.ui.rightBox.content.tapMediaItem = tap;
  } else {
    Ose.ui.rightBox.content.tapItem = tap;
  }

  function tap(ev, pagelet) {
    var entry = pagelet.entry;

    that.entry.post(
      'playItem',
      {
        space: entry.shard.space.name,
        shard: entry.shard.sid,
        kind: entry.kind.name,
        entry: entry.id,
      }
    );

    return false;
  };
};

function checkOverflow(el) {
   var curOverflow = el.style.overflow;
   if ( !curOverflow || curOverflow === "visible" )
      el.style.overflow = "hidden";

   var isOverflowingLeft = $(el).offset().left < parseInt($(el).css('padding-left'));
   // TODO: Reliably detect overflow on the right.
   var isOverflowingRight = ($(el).offset().left + el.clientWidth) > $(el).closest('li').width();
   //console.log('offset left: ', $(el).offset().left);
   //console.log('left: ',  isOverflowingLeft);
   //console.log('right: ',  isOverflowingRight);
   //console.log('parent padding: ', parseInt($(el).css('padding-left')));
   //console.log('overfow offset: ', $(el).offset().left);
   //console.log('isOverflowingLeft: ', isOverflowingLeft);

   var isOverflowing = el.clientWidth < el.scrollWidth
      || el.clientHeight < el.scrollHeight;
   var side;

   el.style.overflow = curOverflow;

   if (isOverflowingLeft && !isOverflowingRight) {
     side = 'left';
   } else if (!isOverflowingLeft && isOverflowingRight) {
     side = 'right';
   } else if (isOverflowingLeft && isOverflowingRight) {
     side = 'both';
   }

   return [isOverflowing, side];
}

// }}}1
