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
    '<li class=info><div><h3></h3><p></p></div></li>',
    '<li class=volume><div><h3>Volume</h3></div></li>',
    '<li class=pos><div><h3>Progress</h3></div></li>',
  ].join(''));

  this.find('li.info').on('click', tapInfo.bind(this));

  this.new('gaia-slider')
    .on('input', onVolume.bind(this))
    .appendTo(this.find('li.volume>div'))
  ;

  this.find('li.pos')
    .hide()
    .find('div')
      .append('gaia-progress')
  ;

  // Display toolbar
  var tb = this.append('li', 'mediaToolbar');
  for (var key in Buttons) {
    tb.append('gaia-button', {circular: 'circular'})
      .on('click', Buttons[key].bind(this))
      .append('a', { 'data-icon': key})
    ;
  }

  // Display sources
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
    checkMediaItem(this, value);
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
};

exports.updateHome = function(val) {  // {{{2
  // TODO
};

// }}}1
// Event Handlers {{{1
function tapSource(ev) {  // {{{2
  var w = ev.currentTarget.ose;

  if (this.source) {
    this.source.pagelet.hide();
    if (this.source === w) {
      delete this.source;
      return;
    }
  }

  this.source = w;

  if (w.pagelet) {
    w.pagelet.show();
    w.pagelet.update(w.stateObj, true);
    return;
  }

  w.pagelet = w.pagelet2(w.stateObj);
  w.find('div').append(w.pagelet);
  w.pagelet.loadData();
  return;
}

function tapInfo(ev) {  // {{{2
  var el = this.target(ev);

  if (el.hasClass('expanded')) {
    el
      .removeClass('expanded')
      .html('<div><h3></h3><p></p></div>')
    ;
  } else {
    el
      .addClass('expanded')
      .html('<div><h3></h3><gaia-list></gaia-list></div>')
    ;
  }

  updatePlaybackStatus(this);
  updateMediaInfo(this);

  return false;
}

function onVolume(ev) {  // {{{2
  this.stop(ev);

  if (! this.updatingState) {
    this.entry.post('volume', ev.currentTarget.els.input.value / 100);
  }
}

function onPos(ev) {  // {{{2
  this.stop(ev);

  this.entry.post('setPos', this.find('li.pos gaia-progress').val());
}

// }}}1
// Private {{{1
var updatePos = O._.throttle(function(that) {  // {{{2
  var w = that.find('li.pos');
  var s = that.entry.state.pos;
  var wpos = that.find('li.pos-text');

  if (! s || ! s.length) {
    w.find('gaia-progress').val(0);
    w.hide();
    s = null;
    if (wpos) wpos.remove();
    return;
  }

  var val = {
    max: s.length,
    value: that.entry.state.pos.value,
  };

  if (that.entry.state.status === 'playing') {
    val.value += (new Date().getTime() - s.at - that.entry.shard.masterTimeOffset) / 1000;
    val.aim = s.length;
    val.duration = s.length * 1000;
  }

  w.show();
  w.find('gaia-progress').val(val);

  if (wpos) {
    wpos.find('.pos-length').text(' of ' + Math.round(s.length));
    return;
  }

  printInfoPos(that, that.find('li.info gaia-list'), s);
  return;
}, 200, {leading: false});

var updatePlaybackStatus = O._.throttle(function(that) {  // {{{2
  var h = that.find('li.info>div>h3');

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
  var s = that.entry.state;
  var li = that.find('li.info');

  if (that.updatePosTextHandle) {
    clearTimeout(that.updatePosTextHandle);
    delete that.updatePosTextHandle;
  }

  if (! li.hasClass('expanded')) {
    li.find('p').text(Common.getTitle(that.mediaEntry, s.info));
    return;
  }

  var list = li.find('gaia-list').empty();

  if (that.mediaEntry) {
    list.append('li').append('div').add([
      that.new('h3').text('kind'),
      that.new('p').text(that.mediaEntry.shard.scope.name + ' - ' + that.mediaEntry.kind.name),
    ]);

    var mediaKeys = that.mediaEntry.kind.getMediaKeys(that.mediaEntry);

    for (var key in mediaKeys) {
      list.append('li').append('div').add([
        that.new('h3').text(key),
        that.new('p').text(mediaKeys[key]),
      ]);
    }
  }

  for (var key in s.info) {
    if (key === 'url') {
      var value = decodeURIComponent(s.info[key]);
    } else {
      var value = s.info[key];
    }

    list.append('li').append('div').add([
      that.new('h3').text(key),
      that.new('p').text(value),
    ]);
  }

  if (s.pos && s.pos.length) {
    printInfoPos(that, list, s.pos);
  }

  return;
}, 10, {leading: false});

function printInfoPos(that, list, pos) {
  if (! list) return;

  list.append('li', 'pos-text').append('div').add([
    that.new('h3').text('position'),
    that.new('p').add([
      updatePosText(that, that.new('span', 'pos-value')),
      that.new('span', 'pos-length').text(' of ' + Math.round(pos.length)),
    ]),
  ]);

  return;
}

function checkMediaItem(that, value) {  // {{{2
  if (! value) {
    that.mediaEntry = null;
    updateMediaInfo(that);
    return;
  }

  that.entry.find(that.entry.state.item, function(err, entry) {
    if (err) {
      O.log.error(err);
      that.mediaEntry = null;
      updateMediaInfo(that);
    } else {
      that.mediaItemEntry = entry;
      entry.find(entry.data.ident, onMediaEntry);
    }
  });

  function onMediaEntry(err, entry) {
    if (err) {
      O.log.error(err);
      that.mediaEntry = null;
    } else {
      that.mediaEntry = entry;
    }

    updateMediaInfo(that);
  }
};

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
