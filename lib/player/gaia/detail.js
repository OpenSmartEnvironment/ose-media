'use strict';

var O = require('ose').module(module);

var Common = require('./common');

// Public {{{1
exports.profile = {  // {{{2
  name: {
    place: 'caption',
    required: true
  }
};

exports.displayLayout = function() {  // {{{2
  var that = this;

  this.add([
    '<li class="nowplaying"><div><h3></h3><p></p></div></li>',
    '<li class=volume><div><h3>Volume</h3></div></li>',
    '<li class=pos><div></div></li>',
  ].join(''));

  this.new('gaia-slider')
    .on('input', onVolume.bind(this))
    .appendTo(this.find('li.volume>div'))
  ;
    
  this.new('gaia-slider')
    .on('input', onPos.bind(this))
    .appendTo(this.find('li.pos>div'))
  ;

  this.find('li.pos').hide();

  /*
  this.new('gaia-list', 'sourceView')
    .hide()
    .after(this.find('li.nowplaying'))
  ;
  */

  var tb = this.append('li', 'mediaToolbar');
  for (var key in Buttons) {
    tb.append('gaia-button', {
      circular: 'circular'
    }).on('click', Buttons[key].bind(this)).append('a', { 'data-icon': key});
  }

  for (var key in this.entry.data.sources) {
    var so = JSON.parse(JSON.stringify(this.entry.data.sources[key]));
    if (! so.ident) so = {ident: so};
    if (! so.ident.scope) so.ident.scope = 'media';
    if (! so.pagelet) so.pagelet = 'list';

    if (so.ident.kind) {
      if (! O.getKind(so.ident)) {
        O.log.warn('Media source kind was not found, not adding as a source to the media player', {id: key, data: so});
        continue;
      }
    } else if (so.ident.scope) {
      if (! O.scopeExist(so.ident.scope)) {
        O.log.warn('Media source scope was not found, not adding as a source to the media player', {id: key, data: so});
        continue;
      }
    }

    so.media = {player: this.entry.identify()};

    var src = that.append('<li><div><h3></h3></div></li>')
      .on('click', tapSource.bind(that))
    ;

    src.find('h3').text(key);

    src.el.ose = src;
    src.stateObj = so;
  }
};

exports.updateStateKey = function(key, value, state) {  // {{{2
  var that = this;

  switch (key) {
  case 'playback':
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
        this.find('li.volume gaia-slider').val(value.value * 100);
        break;
      case 'mute':
        updateButton(this, 'mute', value.mute);
        break;
      }
    }
    return;
  case 'shuffle':
    updateButton(this, 'shuffle', value);
    return;
  case 'fullscreen':
    updateButton(this, 'data', value);
    return;
  }

  return false;

  function onItemEntry(err, entry) {
    if (err) {
      that.mediaItem = null;
      O.log.unhandled('Media entry not found. ', err);
      updateMediaInfo(that);
    } else {
      entry.find(entry.data.ident, onMediaEntry);
    }
  }

  function onMediaEntry(err, entry) {
    if (err) {
      that.mediaItem = null;
      O.log.unhandled('Media entry not found. ', err);
    } else {
      that.mediaItem = entry;
    }

    updateMediaInfo(that);
  }
};

exports.updateHome = function(val) {  // {{{2
  // TODO
};

// }}}1
// Event Handlers {{{1
function tapSource(ev) {  // {{{2
  var src = ev.currentTarget.ose;
  var so = {
    pagelet: 'list',
    ident: {
      space: src.space && src.space.name,
      scope: src.kind && src.kind.scope.name,
      kind: src.kind && src.kind.name,
    },
    media: {
      player: this.entry.identify(),
    },
  };

  if (this.source) {
    this.source.pagelet.hide();
    if (this.source === src) {
      delete this.source;
      return;
    }
  }

  this.source = src;

  if (src.pagelet) {
    src.pagelet.show();
    src.pagelet.update(so);
    return;
  }

  src.pagelet = src.pagelet2(so);
  src.find('div').append(src.pagelet);
  src.pagelet.loadData();
  return;
}

function onVolume(ev) {  // {{{2
  this.stop(ev);

  if (! this.updatingState) {
    this.entry.post('volume', ev.currentTarget.els.input.value / 100);
  }
}

function onPos(ev) {  // {{{2
  this.stop(ev);

  this.entry.post('setPos', this.find('li.pos gaia-slider').val());
}

// }}}1
// Private {{{1
var updatePos = O._.throttle(function(that) {  // {{{2
  var pos = 0;
  var duration = 0;
  var s = that.entry.state.pos;
  var w = that.find('li.pos');

  if (s && s.length) {
    w.show();
    pos = that.entry.state.pos.value;

    if (that.entry.state.status === 'playing') {
      pos += (new Date().getTime() - s.at - that.entry.shard.masterTimeOffset) / 1000;
      duration = s.length * 1000;
    }
  } else {
    w.hide();
    s = null;
  }

  /*
  that.widget('pos', {
    value: pos,
    hide: ! s,
    max: (s && s.length) || 1,
    duration: duration,
  });
  */
}, 200, {leading: false});

var updatePlaybackStatus = O._.throttle(function(that) {  // {{{2
  var h = that.find('li.nowplaying>div>h3');

  h.text(that.entry.state.status || 'stopped');

  switch (that.entry.state.status) {
  case 'playing':
    var btn = that.find('li.mediaToolbar a[data-icon="play"]');
    btn && btn.attr('data-icon', 'pause');
    break;
  case 'paused':
  case 'stopped':
    var btn = that.find('li.mediaToolbar a[data-icon="pause"]');
    btn && btn.attr('data-icon', 'play');
    break;
  };
}, 10, {leading: false});

var updateMediaInfo = O._.throttle(function(that) {  // {{{2
  var li = that.find('li.nowplaying');

  if (that.updatePosTextHandle) {
    clearTimeout(that.updatePosTextHandle);
    delete that.updatePosTextHandle;
  }

  if (! li.hasClass('expanded')) {
    li.find('p').text(Common.getTitle(that.mediaItem, that.entry.state.info));
    return;
  }

  O.log.todo();

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

  return;
}, 10, {leading: false});

function updateButton(that, name, val) {  // {{{2
  var res = that.find('li.mediaToolbar a[data-icon="' + name + '"]');

  res.el.value = val;
  res.el.style['color'] = val ? 'blue' : 'grey';
};

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

// }}}1
// Button Event Handlers {{{1
// "this" is bound to bit object.

var Buttons = {};
Buttons.stop = function(ev) {  // {{{2
  this.stop(ev);

  this.entry.post('stop', true);
};

Buttons.play = function(ev) {  // {{{2
  this.stop(ev);

  if (this.entry.state.status === 'playing') {
    this.entry.post('pause', true);
  } else {
    this.entry.post('play', true);
  }
};

Buttons.back = function(ev) {  // {{{2
  this.stop(ev);

  this.entry.post('previous', true);
};

Buttons.forward = function(ev) {  // {{{2
  this.stop(ev);

  this.entry.post('next', true);
};

Buttons.shuffle = function(ev) {  // {{{2
  this.stop(ev);

  this.entry.post('shuffle', ! this.entry.state.shuffle);
};

Buttons.data = function(ev) {  // fullscreen {{{2
  this.stop(ev);

  this.entry.post('fullscreen', ! this.entry.state.fullscreen);
};

Buttons.mute = function(ev) {  // fullscreen {{{2
  this.stop(ev);

  this.entry.post('mute', ! this.entry.state.volume.mute);
};

// }}}1



/* CHECK {{{1
function onDragNowPlaying(ev) {  // {{{2
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
* /

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

function onClickNowPlaying(ev) {  // {{{2
  var el = $(ev.currentTarget);

  if (el.hasClass('expanded')) {
    el
      .removeClass('expanded')
      .html('<p></p><p></p>')
    ;
  } else {
    el
      .addClass('expanded')
      .html('<p></p>')
    ;
  }

  updatePlaybackStatus(this);
  updateMediaInfo(this);

  return false;
}

}}}1 */
