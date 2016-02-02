/* jshint browser:true */

var Settings = require('settings');

var mixpanel = require('./mixpanel');
var mainScreen = require('./screen-main').screen();
var startupScreen = require('./screen-startup').screen();
var mainHandler = require('./handler-main');

var updateRef;

function checkUiUpdateability() {
    clearInterval(updateRef);
    if (Settings.option('updateUi')) {
        mainHandler.updatePlayerState();
        updateRef = setTimeout(checkUiUpdateability, 10000);
    }  
}

function onSettingsUpdated() {
    mainHandler.reset();
    showMainScreen();
    checkUiUpdateability();
}

function showMainScreen() {
    if (Settings.option('ip')) {
        mainScreen.show();
        startupScreen.hide();
    } else {
        startupScreen.show();
        mainScreen.hide();
    }
}

(function init() {
    Settings.option('uid', Pebble.getAccountToken());
    mixpanel.track('App opened');

    require('./settings-loader').init(onSettingsUpdated);

    checkUiUpdateability();

    mainHandler.init(mainScreen);
    showMainScreen();
})();
