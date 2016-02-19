/* global module */
/* jshint browser:true */

var V = require('vector2');
var UI = require('ui');
var Settings = require('settings');

var lib = require('./lib');

var mainScreen;
var volumeBar;
var volumeBg;
var volumeDesc;
var volumeBarTimeout;
var volumeLabelBack;
var volumeLabelFront;

module.exports.DEMO_MODE = false;

module.exports.demoProps = {
    artist: 'Moderat',
    album: 'Moderat',
    song: 'A New Error',
    song: 'The Rains of Castamere',
    album: 'Game of Thrones',
    artist: '',
    song: 'Nothing playing',
    album: 'Press play to start the last active playlist.',
    album: 'Press play to start the party!',
    song: 'Open Eye Signal',
    artist: 'Jon Hopkins',
    album: 'Immunity',
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
    if (!mainScreen) {
        mainScreen = new UI.Window({
            fullscreen: true,
            action: module.exports.actionDef
        });

        var bg = new UI.Rect({
            position: new V(0, 0),
            size: new V(144, 168),
            backgroundColor: lib.getWatchInfo().platform === 'aplite' ? '#000000' : '#00AAFF'
        });

        mainScreen.add(bg);
    }

    return mainScreen;
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
        size: new V(114, 14),
        font: 'gothic-14',
        color: '#ffffff',
        text: Settings.option('showClock') === true ? '%H:%M' : ''
    });
};

function setSizeOfElm(sizeValue, elm) {
    var size = elm.size();
    size.y = sizeValue;
    elm.size(size);
}

module.exports.setVolume = function(oldVolume, volume) {
    var maxVolInPixels = 128;
    var margin = 20;
    var textShadeOffset = 2;
    
    clearTimeout(volumeBarTimeout);
    
    if (!volumeBar) {
        volumeBar = new UI.Rect({
            position: new V(20, margin),
            size: new V(74, 0),
            backgroundColor: '#ffffff'
        });
        volumeBg = new UI.Rect({
            position: new V(0, 14),
            size: new V(144, 0),
            backgroundColor: lib.getWatchInfo().platform === 'aplite' ? '#000000' : '#00aaff'
        });
        
        volumeDesc = new UI.Text({
            textAlign: 'center',
            position: new V(20, maxVolInPixels + margin - 42 - 2 - 28),
            size: new V(74, 0),
            font: 'gothic-28',
            color: lib.getWatchInfo().platform === 'aplite' ? '#000000' : '#00aaff',
            text: 'Volume'
        });
        
        volumeLabelBack = new UI.Text({
            textAlign: 'center',
            position: new V(20 + textShadeOffset, maxVolInPixels + margin - 42 - 6 + textShadeOffset),
            size: new V(74, 0),
            font: 'leco-42-numbers',
            color: '#ffffff',
            text: volume
        });
        
        volumeLabelFront = new UI.Text({
            textAlign: 'center',
            position: new V(20, maxVolInPixels + margin - 42 - 6),
            size: new V(74, 0),
            font: 'leco-42-numbers',
            color: lib.getWatchInfo().platform === 'aplite' ? '#000000' : '#00aaff',
            text: volume
        });
        
        mainScreen.add(volumeBg);
        mainScreen.add(volumeLabelBack);
        mainScreen.add(volumeBar);
        mainScreen.add(volumeLabelFront);
        mainScreen.add(volumeDesc);
    }
    
    volumeLabelBack.text(volume);
    volumeLabelFront.text(volume);
    
    setSizeOfElm(154, volumeBg);
    setSizeOfElm(42, volumeDesc);
    setSizeOfElm(42, volumeLabelFront);
    setSizeOfElm(42, volumeLabelBack);
    setSizeOfElm(Math.round(maxVolInPixels / 100 * oldVolume), volumeBar);
    
    var pos = volumeBar.position();
    var size = volumeBar.size();
    pos.y = maxVolInPixels - size.y + margin;
    volumeBar.position(pos);
    
    // animate new size and position of volume bar
    size.y = maxVolInPixels / 100 * volume;
    pos.y = maxVolInPixels - size.y + margin;
    volumeBar.animate({
        position: pos,
        size: size
    }, 150);

    volumeBarTimeout = setTimeout(function() {
        setSizeOfElm(0, volumeBar);
        setSizeOfElm(0, volumeBg);
        setSizeOfElm(0, volumeDesc);
        setSizeOfElm(0, volumeLabelBack);
        setSizeOfElm(0, volumeLabelFront);
    }, 2200);
};
