'use strict';

var O = require('ose').module(module);

// Public {{{1
exports.tools = function(view, parent) {  // {{{2
  var res = parent.append('span', 'buttons char')
    .hook()
  ;

  button('stop');
  button('play');
  button('left');
  button('right');
  button('shuffle');
  button('data');
  button('mute');

  return res;

  function button(name) {
    res.append('i', 'button char')
//      .text(' ')
      .attr('tabindex', 0)
      .attr('act', name)
      .on('click', Buttons[name].bind(view))
    ;
  }
};

exports.getTitle = function(item, info) {  // {{{2
  var result = '';

  if (item) {
    if (item.dval) {
      result += item.kind.name + ' ' + item.getCaption();
    }
  }

  if (info) {
    if (info.organization) {
      if (result) result += ' – ';
      result += info.organization;
      result += '; ';
    }
   
    if (info.title) {
      if (result) result += ' – ';
      result += info.title;
      result += '; ';
    } 
   
    if (info.artist) {
      if (result) result += ' – ';
      result += info.artist;
    }
   
    if (info.nowplaying) {
      if (result) result += ' – ';
      result += info.nowplaying;
    } 
  }

  return result;
};

// Button Event Handlers {{{1
// "this" is bound to view object.

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

Buttons.left = function(ev) {  // {{{2
  this.stop(ev);

  this.entry.post('previous', true);
};

Buttons.right = function(ev) {  // {{{2
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

