'use strict';

/** Doc {{{1
 * @caption Media sources
 *
 * @readme
 * Each media source is a reference to some [entry kind] describing
 * source of media items. Media player use sources to select media to
 * play. Registration to sources is done during initialization of the
 * npm package containing the source. Any OSE package can contain one
 * or more media sources. Examples are the [DVB], [Icecast] or
 * [Youtube] packages.
 *
 *
 * @description
 *
 * ## Description
 * Media source kind must implement two methods:
 * - `getMediaKeys()`
 * - `playItem()`
 *
 * Description of these methods can be found at [Media stream kind].
 *
 * @module media
 * @submodule media.source
 * @main media.source
 */

/**
 * @caption Media sources singleton
 *
 * @readme
 * Singleton containing all media sources.
 *
 * @class media.lib.sources
 * @type singleton
 */

// Public  {{{1
exports.add = function(name, scope, kind) {  // {{{2
/**
 * Adds new media source
 *
 * @param name {String} Media source name
 * @param scope {String} Media source scope
 * @param kind {String} Media source kind
 *
 * @return {Object} Media source reference
 *
 * @method add
 */

  return Sources[name] = {
    id: name,
    scope: scope,
    kind: kind
  };
};

exports.get = function(name) {  // {{{2
/**
 * Returns media source by name
 *
 * @param name {String} Media source name
 *
 * @return {Object} Media source reference
 *
 * @method get
 */

  return Sources[name];
};

exports.each = function(cb) {  // {{{2
/**
 * Iterates all media sources
 *
 * @param cb {Function} Callback
 *
 * @method each
 */

  for (var key in Sources) {
    var source = Sources[key];
    cb(key, source.scope, source.kind);
  }
}

// Private {{{1
var Sources = {};
