# Open Smart Environment Media package

The OSE Media package implements a general media player into your
environment. It makes use of various media applications. The logic
of controlling these applications is contained in separate packages
([ose-pa](http://opensmartenvironment.github.io/doc/modules/pa.html), [ose-videolan](http://opensmartenvironment.github.io/doc/modules/videolan.html)).

## Features
- Media sources extended by other npm packages
- Predefined media streams, files and playback history
- Media playback using a configurable set of applications
  (currently DVBlast as DVB stramer, PulseAudio as audio backend
  and VLC as media player)

## Status
- Pre-alpha stage (insecure and buggy)
- Unstable API
- Gaps in the documentation
- No test suite

This is not yet a piece of download-and-use software. Its important
to understand the basic principles covered by this documentation.

Use of this software is currently recommended only for users that
wish participate in the development process, see
[Contributions](#contributions).

## Getting started
To get started with OSE, refer to the [ose-bundle](http://opensmartenvironment.github.io/doc/modules/bundle.html) package and
[Media player example application](http://opensmartenvironment.github.io/doc/modules/bundle.media.html). You can read the entire OSE
documentation [here]( http://opensmartenvironment.github.io/doc).

## Components
Open Smart Environment Media package consists of the following components:
- Media history
- Media player
- Media streams
- Media sources

### Media history
OSE Media package keeps track of played media items. These items
can be displayed in the player history and played again.

Read more about [Media history](http://opensmartenvironment.github.io/doc/modules/media.history.html) ...


### Media player
The media player [kind](http://opensmartenvironment.github.io/doc/classes/ose.lib.kind.html) contains the logic for media control. It
controls the volume, playback and DVB streamer on one or more Linux
boxes. In the [OSE UI](http://opensmartenvironment.github.io/doc/modules/bb.html) it displays information about currently
playing media and allows to control the player remotely. It's
possible to display one of registered media sources and select an
item. Some sources support searching.

Read more about [Media player](http://opensmartenvironment.github.io/doc/modules/media.player.html) ...


### Media streams
It is possible to predefine favourite streams or files into the OSE
Media player. These can be easily selected and played.

Read more about [Media streams](http://opensmartenvironment.github.io/doc/modules/media.stream.html) ...


### Media sources
Each media source is a reference to some [entry kind](http://opensmartenvironment.github.io/doc/classes/ose.lib.kind.html) describing
source of media items. Media player use sources to select media to
play. Registration to sources is done during initialization of the
npm package containing the source. Any OSE package can contain one
or more media sources. Examples are the [DVB](http://opensmartenvironment.github.io/doc/modules/dvb.html), [Icecast](http://opensmartenvironment.github.io/doc/modules/icecast.html) or
[YouTube](http://opensmartenvironment.github.io/doc/modules/youtube.html) packages.

Read more about [Media sources](http://opensmartenvironment.github.io/doc/modules/media.source.html) ...


## Modules
Open Smart Environment Media package consists of the following modules:
- OSE Media core
- OSE Media content

### OSE Media core
Core singleton of [ose-media](http://opensmartenvironment.github.io/doc/modules/media.html) npm package. Registers [entry kinds](http://opensmartenvironment.github.io/doc/classes/ose.lib.kind.html)
defined by this package to the `media` [scope](http://opensmartenvironment.github.io/doc/classes/ose.lib.scope.html).

Module [OSE Media core](http://opensmartenvironment.github.io/doc/classes/media.lib.html) reference ... 

### OSE Media content
Provides files of OSE Media package to the browser.

Module [OSE Media content](http://opensmartenvironment.github.io/doc/classes/media.content.html) reference ... 

## <a name="contributions"></a>Contributions
To get started contributing or coding, it is good to read about the
two main npm packages [ose](http://opensmartenvironment.github.io/doc/modules/ose.html) and [ose-bb](http://opensmartenvironment.github.io/doc/modules/bb.html).

This software is in the pre-alpha stage. At the moment, it is
premature to file bugs. Input is, however, much welcome in the form
of ideas, comments and general suggestions.  Feel free to contact
us via
[github.com/opensmartenvironment](https://github.com/opensmartenvironment).

## Licence
This software is released under the terms of the [GNU General
Public License v3.0](http://www.gnu.org/copyleft/gpl.html) or
later.
