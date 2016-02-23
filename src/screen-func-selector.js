/* global module */
/* jshint browser:true */

var UI = require('ui');
// var Settings = require('settings');

var mixpanel = require('./mixpanel');
var lib = require('./lib');

var selectorScreen;

function getMenuItems() {
    return [
        {
            title: 'Host Selection'
        },
        {
            title: 'Play, Pause & Volume'
        },
        {
            title: 'Skip & Stop'
        },
        {
            title: 'Menu Navigation'
        }
    ];
}

function setupEventListeners() {
    selectorScreen.on('show', function() {
        mixpanel.track('Function selector viewed');
    });
    selectorScreen.on('hide', function() {
        mixpanel.track('Function selector hidden');
    });
    selectorScreen.on('select', function(event) {
        switch (event.itemIndex) {
            default:
            case 0:
                require('./screen-host-selector').screen().show();
                break;
            case 1:
                require('./handler-main').setMenuMode('player');
                require('./screen-func-selector').screen().hide();
                break;
            case 2:
                require('./handler-main').setMenuMode('skipper');
                require('./screen-func-selector').screen().hide();
                break;
            case 3:
                require('./handler-main').setMenuMode('menu');
                require('./screen-func-selector').screen().hide();
                break;
        }
        
        mixpanel.track('Function selector, Selected function', {
            itemIndex: event.itemIndex
        });
    });
}

module.exports.screen = function(error, killCb) {
    if (!selectorScreen) {
        selectorScreen = new UI.Menu({
            fullscreen: true,
            backgroundColor: lib.getWatchInfo().platform === 'aplite' ? '#000000' : '#00aaff',
            textColor: '#FFFFFF',
            highlightBackgroundColor: '#FFFFFF',
            highlightTextColor: lib.getWatchInfo().platform === 'aplite' ? '#000000' : '#00aaff',
            sections: [{
                items: getMenuItems()
            }]
        });
        setupEventListeners();
    }
    return selectorScreen;
};
