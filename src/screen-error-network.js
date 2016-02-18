/* global module */
/* jshint browser:true */

var UI = require('ui');
var Settings = require('settings');

var errorScreen;
var killInterval;
var killCallback = function() {};

function clearTimer() {
    console.log('Kill timer stop');
    clearTimeout(killInterval);
}

function startTimer() {
    console.log('Kill timer start');
    clearTimeout(killInterval);
    killInterval = setTimeout(killCallback, 3 * 60 * 1000);
}

function setupEventListeners() {
    errorScreen.on('show', startTimer);
    errorScreen.on('hide', clearTimer);
}

module.exports.update = function(error, killCb) {
    killCallback = killCb || killCallback;
    
    var bodyString = 'Please ensure Kodi\'s IP ' + 
        Settings.data('activeHost').address + 
        ' is accessible from your phone. Remember to correctly specify port number (e.g. 8080) and username/password combinations if necessary.\nError log: ' + 
        JSON.stringify(error);
    
    if (errorScreen) {
        errorScreen.body(bodyString);        
    }
};

module.exports.screen = function(error, killCb) {
    if (!errorScreen) {
        errorScreen = new UI.Card({
            fullscreen: true,
            scrollable: true,
            backgroundColor: '#AA0000',
            titleColor: '#ffffff',
            subtitleColor: '#ffffff',
            bodyColor: '#ffffff',
            title: 'Network Error',
            subtitle: 'Opus can\'t access Kodi',
            body: ''
        });
        setupEventListeners();
    }
    return errorScreen;
};
