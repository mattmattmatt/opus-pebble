/* global module */

var V = require('vector2');
var UI = require('ui');
var Settings = require('settings');

module.exports.DEMO_MODE = false;

module.exports.demoProps = {
    song: 'Open Eye Signal',
    artist: 'Jon Hopkins',
    album: 'Immunity',
    artist: 'Moderat',
    album: 'Moderat',
    song: 'A New Error',
    song: 'The Rains of Castamere',
    album: 'Game of Thrones',
    artist: '',
    song: 'Nothing playing',
    album: 'Press play to start the last active playlist.',
    album: 'Press play to start the party!',
    showClock: true,
    isPlaying: false,
    showStartup: false,
};

if (module.exports.DEMO_MODE) {
    Settings.option('showClock', module.exports.demoProps.showClock);
}

module.exports.actionDef = {
    up: 'images/volume_up.png',
    select: module.exports.DEMO_MODE && module.exports.demoProps.isPlaying ? 'images/pause.png' : 'images/play.png',
    down: 'images/volume_down.png',
    backgroundColor: '#ffffff'
};

module.exports.screen = function() {
    var screen = new UI.Window({
        fullscreen: true,
        action: module.exports.actionDef
    });

    var bg = new UI.Rect({
        position: new V(0, 0),
        size: new V(144, 168),
        backgroundColor: '#00aaff'
    });

    screen.add(bg);

    return screen;
};

module.exports.title = function(text) {
    if (module.exports.DEMO_MODE) {
        text = module.exports.demoProps.song;
    }
    return new UI.Text({
        textAlign: 'left',
        position: new V(8, 8 + (Settings.option('showClock') === true ? 6 : 0)),
        size: new V(100, 83),
        font: 'gothic-28',
        color: '#ffffff',
        text: text || ''
    });
};

module.exports.description = function(text) {
    if (module.exports.DEMO_MODE) {
        text = ((module.exports.demoProps.artist && (module.exports.demoProps.artist.toUpperCase() + '\n')) || '') + module.exports.demoProps.album;
    }
    return new UI.Text({
        textAlign: 'left',
        position: new V(8, 104),
        size: new V(100, 53),
        font: 'gothic-18',
        color: '#ffffff',
        text: text || ''
    });
};


module.exports.time = function() {
    return new UI.TimeText({
        textAlign: 'center',
        position: new V(0, 0),
        size: new V(144, 14),
        font: 'gothic-14',
        color: '#ffffff',
        text: Settings.option('showClock') === true ? '%H:%M' : ''
    });
};


