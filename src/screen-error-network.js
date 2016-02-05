/* global module */

var UI = require('ui');
var Settings = require('settings');

var screen;

module.exports.screen = function(error) {
    var bodyString = 'Please ensure Kodi\'s IP ' + 
        Settings.data('activeHost').address + 
        ' is accessible from your phone. Remember to correctly specify port number (e.g. 8080) and username/password combinations if necessary.\nError log: ' + 
        JSON.stringify(error);
    
    if (!screen) {
        screen = new UI.Card({
            fullscreen: true,
            scrollable: true,
            backgroundColor: '#AA0000',
            titleColor: '#ffffff',
            subtitleColor: '#ffffff',
            bodyColor: '#ffffff',
            title: 'Network Error',
            subtitle: 'Opus can\'t access Kodi',
            body: bodyString
        });
    } else {
        screen.body(bodyString);
    }
    return screen;
};
