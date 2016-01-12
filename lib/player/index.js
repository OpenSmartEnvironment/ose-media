'use strict';

var O = require('ose').object(module, 'ose/lib/kind');
exports = O.init('media', 'player');

var Dvb = O.class('./dvb');
var Playback = O.class('./playback');
var Volume = O.class('./volume');

/** Doc {{{1
 * @caption Media player
 *
 * @readme
 * The media player [kind] contains the logic for media control. It
 * controls the volume, playback and DVB streamer on Linux boxes. In
 * the [OSE UI] it displays information about currently playing media
 * and allows to control the player remotely. It's possible to display
 * one of registered media sources and select an item.
 *
 * @module media
 * @submodule media.player
 * @main media.player
 */

/**
 * @caption Media player kind
 *
 * @readme
 * On each entry initialization, [links] to volume control, playback
 * and optional DVB streamer entries are established. Every entry of
 * this kind handles commands to control media playback.
 *
 * @kind player
 * @class media.lib.player
 * @main  media.lib.player.index
 * @extend ose.lib.kind
 * @type singleton
 */

// Public  {{{1
exports.ddef = O.new('ose/lib/orm/object')()  // {{{2
  .text('name')  // {{{3
    .detail('header')
    .parent

  .text('alias')  // {{{3
    .detail(10)
    .parent

  .entry('playback')  // {{{3
    .detail(11)
    .parent

  .entry('volume')  // {{{3
    .detail(12)
    .parent

  .entry('dvb')  // {{{3
    .detail(13)
    .parent

  .map('sources')  // {{{3
    .query().parent
    .detail(9)
    .params({extendView: function(wrap, view) {  // TODO: this method must be defined on "detail" layout
      if (! view.extend) view.extend = {};

      view.extend.tapItem = function(entry, ev) {
        if (entry.kind.tapMediaItem) {
          entry.kind.tapMediaItem(view, wrap.owner.view.entry, entry);
        } else {
          wrap.owner.view.entry.post('playItem', entry.identify());
        }

        return false;
      };
    }})
    .parent

  // }}}3
;

exports.sdef = O.new('ose/lib/orm/object')()  // {{{2
  .text('status')  // {{{3
    .detail(1, statusDetail)
    .parent

  .object('info')  // {{{3
    .detail(100, function(view, wrap){
      wrap.onPatch(function(patch) {
        updateInfoDetail(view);
      });
    })
    .parent

  .entry('item')  // {{{3
    .detail(100, function(view, wrap) {
      wrap.onPatch(function(patch) {
        checkMediaItem(view, wrap.value);
      });
    })
    .parent

  .object('playback')  // {{{3
    .parent

  .object('volume')  // {{{3
    .number('value')
      .params({
        title: 'Volume',
        unit: '%',
        decimal: 0,
        min: 0,
        max: 1,
        post: 'volume',
      })
      .detail(2)
      .parent
    .boolean('mute')
      .detail(100, function(view, wrap) {
        wrap.onPatch(function(patch) {
          view.find('span.buttons>i[data-icon="mute"]').attr('value', patch);
        })
      })
      .parent
    .boolean('synced').parent
    .parent

  .object('pos')  // {{{3
    .detail(4, posDetail)
  /*
    .number('value')
      .params({
        unit: '%',
        decimal: 0,
        min: 0,
        max: 1,
        post: 'volume',
      })
      .detail(4)
      .parent
  */
    .parent

  .boolean('shuffle')  // {{{3
    .detail(3, shuffleDetail)
    .parent

  .boolean('fullscreen')  // {{{3
    .detail(101, function(view, wrap) {
      wrap.onPatch(function(patch) {
        view.find('span.buttons>i[data-icon="data"]').attr('value', patch);
      });
    })
    .parent

  .object('can')  // {{{3
    .boolean('goNext').parent
    .boolean('goPrevious').parent
    .boolean('seek').parent
    .boolean('setFullscreen').parent
    .boolean('pause').parent
    .parent

  // }}}3
;

exports.on(require('./commands'));  // {{{2

exports.homeInit = function(entry) {  // {{{2
  entry.setState({
    status: 'stopped',
  });

  new Volume(entry);
  new Playback(entry);

  if (entry.dval.dvb) {
    entry.dvb = [];

    if (Array.isArray(entry.dval.dvb)) {
      for (var i = 0; i < entry.dval.dvb.length; i++) {
        new Dvb(entry, entry.dval.dvb[i]);
      }
    } else {
      new Dvb(entry, entry.dval.dvb);
    }
  }
};

exports.cleanup = function(entry) {  // {{{2
  O.link.close(entry.boon, null, true);
  O.link.close(entry.volumeSocket, null, true);
  O.link.close(entry.playbackSocket, null, true);

  if (entry.dvb) {
    var dvb = entry.dvb;
    delete entry.dvb;

    for (var i = 0; i < dvb.length; i++) {
      O.link.close(dvb[i], null, true);
    }
  }
};

exports.setBoon = function(socket) {  // {{{2
/**
 * @param socket {Object}
 *
 * @method setBoon
 * @internal
 */

  var p = socket.player;
  var pl = p.boon;

  p.boon = socket;

  if (pl) {
    O.link.close(pl);
  }
};

exports.closeBoon = function(socket) {  // {{{2
/**
 * @param socket {Object}
 *
 * @method closeBoon
 * @internal
 */

  var p = socket.player;
  delete socket.player;

  if (! p) return;
  if (p.boon !== socket) return;

  delete p.boon;
  p.post('stop', true);
};

// Button Event Handlers {{{1
// "this" is bound to view object.

var Buttons = {};

Buttons.stop = function(ev) {  // {{{2
  this.entry.post('stop', true);
  return false;
};

Buttons.play = function(ev) {  // {{{2
  if (this.entry.sval.status === 'playing') {
    this.entry.post('pause', true);
  } else {
    this.entry.post('play', true);
  }
  return false;
};

Buttons.left = function(ev) {  // {{{2
  this.entry.post('previous', true);
  return false;
};

Buttons.right = function(ev) {  // {{{2
  this.entry.post('next', true);
  return false;
};

Buttons.shuffle = function(ev) {  // {{{2
  this.entry.post('shuffle', ! this.entry.sval.shuffle);
  return false;
};

Buttons.data = function(ev) {  // fullscreen {{{2
  this.entry.post('fullscreen', ! this.entry.sval.fullscreen);
  return false;
};

Buttons.mute = function(ev) {  // fullscreen {{{2
  this.entry.post('mute', ! this.entry.sval.volume.mute);
  return false;
};

// Private {{{1
function statusDetail(view, wrap) {  // {{{2
  var li = view.li('status row')
    .attr('focusable', undefined)
    .on('tap', tapMore)
    .section('stretch')
      .h3()
      .p()
      .parent()
    .button('char', 'more', tapMore, {readonly: undefined})
  ;

  var info = view.li('info').hide().stub('ul');

  wrap.onPatch(function(patch) {
    updateStatusDetail(view);
  });

  function tapMore(ev) {
    if (info.style('display') === 'none') {
      info.show();
      updateExpanded(view);
      return false;
    }

    info.find('ul').empty();
    info.hide();
    return false;
  }
}

function posDetail(view, wrap) {  // {{{2
  var li = view.li('pos').hide();

  li.section('row')
    .h3('Position', 'stretch')
    .span()
  ;

  li.slider(function(val) {
    view.post('setPos', val.value);
  });

  wrap.onPatch(function(patch) {
    updatePosDetail(view);
  });
}

function shuffleDetail(view, wrap) {  // {{{2
  var res = view.li('row').tree('span', 'tools buttons char');

  button('stop');
  button('play');
  button('left');
  button('right');
  button('shuffle');
  button('data');
  button('mute');

  function button(name) {
    return res.tree('i', 'button char')
      .attr('data-icon', name)
      .attr('focusable', undefined)
      .on('tap', Buttons[name].bind(view))
    ;
  }

  wrap.onPatch(function(patch) {
    res.find('i[data-icon="shuffle"]').attr('value', patch);
  });
}

function getTitle(item, info) {  // {{{2
  var caption;
  var result = '';

  if (item) {
    caption = item.getCaption();
    if (item.dval) {
      result += item.kind.getTitle() + ' – ' + caption;
    }
  }

  if (info) {
    if (info.organization) {
      if (result) result += ' – ';
      result += info.organization;
    }
   
    if (info.title && info.title !== caption) {
      if (result) result += ' – ';
      result += info.title;
    } 
   
    if (info.artist) {
      if (result) result += ' – ';
      result += info.artist;
    }
   
    if (info.nowPlaying) {
      if (result) result += ' – ';
      result += info.nowPlaying;
    } 
  }

  return result;
};

function updateExpanded(view) {  // {{{2
  var s = view.entry.sval;

  var list = view.find('li.info > ul').empty();

  if (view.mediaEntry) {
    list.li()
      .h3(O.translate('kind'))
      .p(O.translate(view.mediaEntry.shard.schema.name) + ' - ' + view.mediaEntry.kind.getTitle())
    ;

    var mediaKeys = view.mediaEntry.kind.getMediaKeys(view.mediaEntry);

    for (var key in mediaKeys) {
      list.li()
        .h3(O.translate(key))
        .p(mediaKeys[key])
      ;
    }
  }

  for (var key in s.info) {
    if (key === 'url') {
      var value = decodeURIComponent(s.info[key]);
    } else {
      var value = s.info[key];
    }

    list.li()
      .h3(O.translate(key))
      .p(value)
    ;
  }

  return;
}

function checkMediaItem(view, value) {  // {{{2
  if (! value) {
    view.mediaEntry = null;
    updateInfoDetail(view);
    return;
  }

  view.entry.shard.find(view.entry.sval.item, function(err, entry) {
    if (err) {
      O.log.error(err);
      view.mediaEntry = null;
      updateInfoDetail(view);
    } else {
      view.mediaItemEntry = entry;
      entry.shard.find(entry.dval.ident, onMediaEntry);
    }
  });

  function onMediaEntry(err, entry) {
    if (err) {
      O.log.error(err);
      view.mediaEntry = null;
    } else {
      view.mediaEntry = entry;
    }

    updateInfoDetail(view);
  }
};

var updatePosDetail = O._.throttle(function(view) {  // {{{2
  var w = view.find('li.pos');
  var s = view.entry.sval.pos;

  if (! s || ! s.length) {
    w.find('.slider').val(0);
    w.hide();
    s = null;
    return;
  }

  var val = {
    max: s.length,
    value: view.entry.sval.pos.value,
  };

  if (view.entry.sval.status === 'playing') {
    val.value += (Date.now() + view.entry.shard.homeTimeOffset - s.at) / 1000;
    val.aim = s.length;
    val.duration = s.length * 1000;
  }

  w.show();
  w.find('.slider').val(val);
}, 200, {leading: false});

var updateStatusDetail = O._.throttle(function(view) {  // {{{2
  var h = view.find('li.status h3');

  h.text(O.translate(view.entry.sval.status || 'stopped'));

  switch (view.entry.sval.status) {
  case 'playing':
    var btn = view.find('span.tools i[data-icon="play"]');
    btn && btn.attr('data-icon', 'pause');
    break;
  case 'paused':
  case 'stopped':
    var btn = view.find('span.tools i[data-icon="pause"]');
    btn && btn.attr('data-icon', 'play');
    break;
  };
}, 10, {leading: false});

var updateInfoDetail = O._.throttle(function(view) {  // {{{2
  var s = view.entry.sval;
  view.find('li.status p').text(getTitle(view.mediaEntry, s.info));

  var li = view.find('li.info');
  if (li.style('display') !== 'none') updateExpanded(view);
}, 10, {leading: false});

