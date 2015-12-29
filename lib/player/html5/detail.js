'use strict';

var O = require('ose').module(module);

var Common = require('./common');

// Public {{{1
exports.displayLayout = function() {  // {{{2
  var that = this;

  this.li('info row')
    .attr('focusable', 1)
    .on('click', tapMore.bind(this))
    .section('stretch')
      .h3()
      .p()
      .parent()
    .append('i', 'button char')
      .attr('act', 'more')
  ;

  this.li('expanded')
    .hide()
    .ul('expanded')
  ;

  this.li('volume')
    .section('row')
      .h3('Volume', 'stretch')
      .span()
      .parent()
    .slider({}, onVolume.bind(this))
  ;

  this.li('pos')
    .h3('Position')
    .slider({}, onPos.bind(this))
  ;

  Common.tools(this, this.li('tools row'));

  // Display sources
  for (var key in this.entry.dval.sources) {
    var so = JSON.parse(JSON.stringify(this.entry.dval.sources[key]));

    if (! so.view) so.view = 'list';

    so.media = {player: this.entry.identify()};

    var src = that.li({tabindex: 0})
      .h3(key)
      .on('click', tapSource.bind(that))
    ;

    src.find('h3').text(key);

    src.el.ose = src;
    src.so = so;
  }
};

exports.updateStateKey = function(key, value, sval) {  // {{{2
  switch (key) {
  case 'playback':
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
    if (! value) return;

    if ('value' in value) {
      this.find('li.volume .slider').val(value.value);
      this.find('li.volume span').text(Math.trunc(value.value * 100).toString() + ' %');
    }

    if ('mute' in value) {
      this.find('li.tools .buttons').val('mute', value.mute ? 1 : 0);
    }

    return;
  case 'shuffle':
    this.find('li.tools .buttons').val('shuffle', value ? 1 : 0);
    return;
  case 'fullscreen':
    this.find('li.tools .buttons').val('data', value ? 1 : 0);
    return;
  }

  return false;
};

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
    w.view.update(w.so, true);
    return;
  }

  w.view = w.view2(w.so);
  w.append(w.view);
  w.view.style('width', 'calc(100% - 32px)');
  w.view.style('padding-left', '16px');
  w.view.style('padding-right', '16px');
  w.view.loadData();
  return;
}

function tapMore(ev) {  // {{{2
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

  el.find('ul').empty();
  el.hide();

  return;
}

function onVolume(val) {  // {{{2
  if (! this.updating) {
    this.entry.post('volume', val);
  }
}

function onPos(ev) {  // {{{2
  this.stop(ev);

  this.entry.post('setPos', this.find('li.pos .slider').val());
}

// Private {{{1
var updatePos = O._.throttle(function(that) {  // {{{2
  var w = that.find('li.pos');
  var s = that.entry.sval.pos;
//  var wpos = that.find('li.pos-text');

  if (! s || ! s.length) {
    w.find('.slider').val(0);
    w.hide();
    s = null;
//    if (wpos) wpos.remove();
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
  w.find('.slider').val(val);

  /*
  if (wpos) {
    wpos.find('.pos-length').text(' of ' + Math.round(s.length));
    return;
  }

  printInfoPos(that, that.find('li.expanded > ul'), s);
  return;
  */
}, 200, {leading: false});

var updatePlaybackStatus = O._.throttle(function(that) {  // {{{2
  var h = that.find('li.info h3');

  h.text(that.entry.sval.status || 'stopped');

  switch (that.entry.sval.status) {
  case 'playing':
    var btn = that.find('li.tools i[act="play"]');
    btn && btn.attr('act', 'pause');
    break;
  case 'paused':
  case 'stopped':
    var btn = that.find('li.tools i[act="pause"]');
    btn && btn.attr('act', 'play');
    break;
  };
}, 10, {leading: false});

var updateMediaInfo = O._.throttle(function(that) {  // {{{2
  var s = that.entry.sval;
  that.find('li.info p').text(Common.getTitle(that.mediaEntry, s.info));
  var li = that.find('li.expanded');
  if (li.style('display') !== 'none') updateExpanded(that);
}, 10, {leading: false});

function updateExpanded(that) {  // {{{2
  var s = that.entry.sval;

  if (that.updatePosTextHandle) {
    clearTimeout(that.updatePosTextHandle);
    delete that.updatePosTextHandle;
  }

  var list = that.find('li.expanded > ul').empty();

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

function printInfoPos(that, list, pos) {  // {{{2
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
  var res = that.find('li.mediaToolbar i[act="' + name + '"]');

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

