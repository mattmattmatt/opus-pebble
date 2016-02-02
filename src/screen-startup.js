var V = require('vector2');
var UI = require('ui');
var Settings = require('settings');

module.exports.screen = function() {
    var screen = new UI.Window({
        fullscreen: true
    });

    var bg = new UI.Rect({
        position: new V(0, 0),
        size: new V(144, 168),
        backgroundColor: '#00aaff'
    });

    var text = new UI.Text({
        textAlign: 'left',
        position: new V(8, 8),
        size: new V(100, 72),
        font: 'gothic-18',
        color: '#ffffff',
        text: 'Opus is not configured yet.\nOpen the settings screen on your phone to enter Kodi\'s IP address.'
    });

    var time = new UI.TimeText({
        textAlign: 'center',
        position: new V(0, 0),
        size: new V(144, 14),
        font: 'gothic-14',
        color: '#ffffff',
        text: '%H:%M'
    });

    screen.add(bg);
    screen.add(text);
    screen.add(time);

    return screen;
};
