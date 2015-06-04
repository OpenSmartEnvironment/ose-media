'use strict';

var O = require('ose').module(module);

// Public {{{1
exports.controls = function(view, toolbar) {
  toolbar.prop('ose')
    .button('stop', bind('stop'))
    .button('pause', bind('playPause'))
    .button('back', bind('back'))
    .button('forward', bind('forward'))
    .button('shuffle', bind('shuffle'))
    .button('data', bind('fullscreen'))
  ;

  function bind(name) {
    return Buttons[name].bind(view);
  }
};

exports.getTitle = function(item, info) {  // {{{2
  var result = '';

  if (item) {
    if (item.data) {
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

// }}}1
// Button Event Handlers {{{1
// "this" is bound to bit object.

var Buttons = {};
Buttons.stop = function(ev, isTrig) {  // {{{2
  if (this.updatingState || isTrig) return;

  this.entry.post('stop', true);
};

Buttons.playPause = function(ev, isTrig) {  // {{{2
  if (this.updatingState || isTrig) return;

  if (this.entry.state.status === 'playing') {
    this.entry.post('pause', true);
  } else {
    this.entry.post('play', true);
  }

  return false;
};

Buttons.fullscreen = function(ev, isTrig) {  // {{{2
  if (this.updatingState || isTrig) return;

  this.entry.post('fullscreen', ! parseInt($(ev.currentTarget).val()));

  return false;
};

Buttons.forward = function(ev) {  // {{{2
  this.entry.post('next', true);

  return false;
};

Buttons.back = function(ev) {  // {{{2
  this.entry.post('previous', true);

  return false;
};

Buttons.shuffle = function(ev, isTrig) {  // {{{2
  this.entry.post('shuffle', ! parseInt($(ev.currentTarget).val()));

  return false;
};

// }}}1
