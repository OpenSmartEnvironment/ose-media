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
    '<li class=info><div><h3></h3><p></p></div><gaia-button><i data-icon="more"></i></gaia-button></li>',
    '<li class=expanded></li>',
    '<li class=volume><div><h3>Volume</h3></div></li>',
    '<li class=pos><div><h3>Progress</h3></div></li>',
  ].join(''));

  this.find('li.info > gaia-button')
    .on('click', tapInfo.bind(this))
  ;

  this.find('li.expanded')
    .hide()
    .append('gaia-list')
  ;

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
  for (var key in this.entry.dval.sources) {
    var so = JSON.parse(JSON.stringify(this.entry.dval.sources[key]));

    if (! so.view) so.view = 'list';

    so.media = {player: this.entry.identify()};

    var src = that.append('<li><div><h3></h3></div></li>')
      .on('click', tapSource.bind(that))
    ;

    src.find('h3').text(key);

    src.el.ose = src;
    src.stateObj = so;
  }
};

exports.updateStateKey = function(key, value, sval) {  // {{{2
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

// }}}1
// Event Handlers {{{1
function tapSource(ev) {  // {{{2
  var w = ev.currentTarget.ose;

  if (this.source) {
    this.source.view.hide();
    if (this.source === w) {
      delete this.source;
      return;
    }
  }

  this.source = w;

  if (w.view) {
    w.view.show();
    w.view.update(w.stateObj, true);
    return;
  }

  w.view = w.view2(w.stateObj);
  w.find('div').append(w.view);
  w.view.loadData();
  return;
}

function tapInfo(ev) {  // {{{2
  this.stop(ev);

  var el = this.find('li.expanded');

  if (el.style('display') === 'none') {
    el.show();
    updateExpanded(this);
    return;
  }

  if (this.updatePosTextHandle) {
    clearTimeout(this.updatePosTextHandle);
    delete this.updatePosTextHandle;
  }

  el.find('gaia-list').empty();
  el.hide();

  return;
}

function onVolume(ev) {  // {{{2
  this.stop(ev);

  if (! this.updating) {
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
  var s = that.entry.sval.pos;
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
    value: that.entry.sval.pos.value,
  };

  if (that.entry.sval.status === 'playing') {
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

  printInfoPos(that, that.find('li.expanded > gaia-list'), s);
  return;
}, 200, {leading: false});

var updatePlaybackStatus = O._.throttle(function(that) {  // {{{2
  var h = that.find('li.info>div>h3');

  h.text(that.entry.sval.status || 'stopped');

  switch (that.entry.sval.status) {
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
  var s = that.entry.sval;
  that.find('li.info > div > p').text(Common.getTitle(that.mediaEntry, s.info));
  var li = that.find('li.expanded');
  if (li.style('display') !== 'none') updateExpanded(that);
}, 10, {leading: false});

function updateExpanded(that) {  // {{{2
  var s = that.entry.sval;

  if (that.updatePosTextHandle) {
    clearTimeout(that.updatePosTextHandle);
    delete that.updatePosTextHandle;
  }

  var list = that.find('li.expanded > gaia-list').empty();

  if (that.mediaEntry) {
    list.append('li').append('div').add([
      that.new('h3').text('kind'),
      that.new('p').text(that.mediaEntry.shard.schema.name + ' - ' + that.mediaEntry.kind.name),
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
}

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

  that.entry.shard.find(that.entry.sval.item, function(err, entry) {
    if (err) {
      O.log.error(err);
      that.mediaEntry = null;
      updateMediaInfo(that);
    } else {
      that.mediaItemEntry = entry;
      entry.shard.find(entry.dval.ident, onMediaEntry);
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
    if (that.entry.sval.pos) {
      if (that.entry.sval.status === 'playing') {
        el.text(Math.round(that.entry.sval.pos.value + (new Date().getTime() - that.entry.sval.pos.at - that.entry.shard.masterTimeOffset) / 1000));
      } else {
        el.text(that.entry.sval.pos.value);
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

  if (this.entry.sval.status === 'playing') {
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

  this.entry.post('shuffle', ! this.entry.sval.shuffle);
};

Buttons.data = function(ev) {  // fullscreen {{{2
  this.stop(ev);

  this.entry.post('fullscreen', ! this.entry.sval.fullscreen);
};

Buttons.mute = function(ev) {  // fullscreen {{{2
  this.stop(ev);

  this.entry.post('mute', ! this.entry.sval.volume.mute);
};

// }}}1
