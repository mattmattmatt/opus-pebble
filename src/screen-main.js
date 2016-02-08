/* global module */
/* jshint browser:true */

var V = require('vector2');
var UI = require('ui');
var Settings = require('settings');

var mainScreen;
var volumeBar;
var volumeBg;
var volumeDesc;
var volumeBarTimeout;

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
    if (!mainScreen) {
        mainScreen = new UI.Window({
            fullscreen: true,
            action: module.exports.actionDef
        });

        var bg = new UI.Rect({
            position: new V(0, 0),
            size: new V(144, 168),
            backgroundColor: '#00aaff'
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

module.exports.setVolume = function(oldVolume, volume) {
    var maxVolInPixels = 128;
    var margin = 20;
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
            backgroundColor: '#00aaff'
        });
        
        volumeDesc = new UI.Text({
            textAlign: 'left',
            position: new V(20, maxVolInPixels + margin - 4),
            size: new V(74, 0),
            font: 'gothic-18',
            color: '#ffffff',
            text: 'Volume'
        });
        
        mainScreen.add(volumeBg);
        mainScreen.add(volumeBar);
        mainScreen.add(volumeDesc);
    }
    
    var bgSize = volumeBg.size();
    bgSize.y = 154;
    volumeBg.size(bgSize);
    
    var descSize = volumeDesc.size();
    descSize.y = 18;
    volumeDesc.size(descSize);
    
    var size = volumeBar.size();
    size.y = Math.round(maxVolInPixels / 100 * oldVolume);
    volumeBar.size(size);
    
    var pos = volumeBar.position();
    pos.y = maxVolInPixels - size.y + margin;
    volumeBar.position(pos);
    
    size.y = maxVolInPixels / 100 * volume;
    pos.y = maxVolInPixels - size.y + margin;
    volumeBar.animate({
        position: pos,
        size: size
    }, 150);

    volumeBarTimeout = setTimeout(function() {
        size.y = 0;
        volumeBar.size(size);
        
        bgSize.y = 0;
        volumeBg.size(bgSize);
        
        descSize.y = 0;
        volumeDesc.size(descSize);
    }, 2000);
};
