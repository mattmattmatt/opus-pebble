/* global module */

var UI = require('ui');
var Settings = require('settings');

var screen;

module.exports.screen = function(error) {
    if (!screen) {
        screen = new UI.Card({
            fullscreen: true,
            scrollable: true,
            backgroundColor: '#ff4422',
            title: 'Network Error',
            subtitle: 'Opus can\'t connect to Kodi',
            body: 'When trying to access the IP address set for Kodi, Opus encountered an error. Please ensure Kodi\'s IP ' + Settings.option('ip') + ' is accessible from your phone.\nError log: ' + JSON.stringify(error)
        });
    }
    return screen;
};
