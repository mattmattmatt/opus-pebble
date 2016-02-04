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
    require('./screen-host-selector').screen().updateHostList();
    showMainScreen();
    checkUiUpdateability();
}

function showMainScreen() {
    if (require('./screen-main').DEMO_MODE) {
        if (require('./screen-main').demoProps.showStartup) {
            startupScreen.show();
            mainScreen.hide();
        } else {
            mainScreen.show();
            startupScreen.hide();
        }
        return;
    }

    if (Settings.option('ip')) {
        mainScreen.show();
        startupScreen.hide();
    } else {
        startupScreen.show();
        mainScreen.hide();
    }
}

function onNetworkError(error) {
    clearInterval(updateRef);
    var errorScreen = require('./screen-error-network').screen(error);
    errorScreen.show();
    mixpanel.track('Network error', {
        kodiIp: Settings.option('ip')
    });
} 

(function init() {
    Settings.option('uid', Pebble.getAccountToken());
    mixpanel.track('App opened');

    require('./settings-loader').init(onSettingsUpdated);

    checkUiUpdateability();

    mainHandler.init(mainScreen, onNetworkError);
    showMainScreen();
})();
