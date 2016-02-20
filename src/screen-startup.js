/* global module */

var V = require('vector2');
var UI = require('ui');
var Settings = require('settings');

var lib = require('./lib');
var mixpanel = require('./mixpanel');

module.exports.screen = function() {
    var startupScreen = new UI.Window({
        fullscreen: true
    });

    var bg = new UI.Rect({
        position: new V(0, 0),
        size: new V(144, 168),
        backgroundColor: lib.getWatchInfo().platform === 'aplite' ? '#000000' : '#00aaff'
    });

    var text = new UI.Text({
        textAlign: 'center',
        position: new V(10, 32),
        size: new V(124, 126),
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

    startupScreen.add(bg);
    startupScreen.add(text);
    startupScreen.add(time);
    
    startupScreen.on('show', function() {
        mixpanel.track('Startup screen viewed');
    });
    
    startupScreen.on('hide', function() {
        var windowStack = require('ui/windowstack');
        var length = 0;
        windowStack.each(function(wind, i) {
            length++;
        });
        if (length === 0) {
            mixpanel.track('App closed', {
                lastScreen: 'startup'
            });
        }
    });

    return startupScreen;
};
