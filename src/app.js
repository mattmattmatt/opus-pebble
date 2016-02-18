/* jshint browser:true */

var Settings = require('settings');

var mixpanel = require('./mixpanel');
var mainScreen = require('./screen-main').screen();
var startupScreen = require('./screen-startup').screen();
var hostScreen = require('./screen-host-selector').screen();
var errorScreen = require('./screen-error-network').screen();
var UpdateNotificationScreen = require('./screen-update-notification');
var mainHandler = require('./handler-main');

var updateRef;

function getUpdateInterval() {
    if (mainHandler.getPlayerType() === 'audio') {
        return 12 * 1000;
    } else if (mainHandler.getPlayerType() === 'video') {
        return 3 * 60 * 1000;
    } else {
        return 60 * 1000;
    }
}

function checkUiUpdateability() {
    clearTimeout(updateRef);
    if (Settings.option('updateUi')) {
        console.log('auto-updating, next update in ' + (getUpdateInterval() / 1000) + 's');
        mainHandler.updatePlayerState();
        updateRef = setTimeout(checkUiUpdateability, getUpdateInterval());
    }  
}

function onSettingsUpdated() {
    mainHandler.reset();
    showMainScreen();
    require('./screen-host-selector').updateHostList();
    
    // give the UI a bit to cool down, that's necessary for some reason :(
    setTimeout(function() {
        checkUiUpdateability();
        if (!Settings.option('updateUi')) {
            mainHandler.updatePlayerState();
        }
    }, 500);
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
        return false;
    }
    
    var hosts = Settings.option('hosts') || [];
    
    errorScreen.hide();
    
    if (!hosts.length) {
        startupScreen.show();
        mainScreen.hide();
        hostScreen.hide();
        console.log('showMainScreen: no hosts');
        return false;
    } else {
        mainScreen.show();
        // ensure the value of activeHost is a member of the hosts array, otherwise show host selector
        if (Settings.data('activeHost') && hosts.some(function(host) {
            return JSON.stringify(host) === JSON.stringify(Settings.data('activeHost'));
        })) {
            hostScreen.hide();
            startupScreen.hide();
            console.log('showMainScreen: hosts and valid active host. hosts, activeHost: ' + JSON.stringify(hosts) + ', ' +  JSON.stringify(Settings.data('activeHost')));
            return true;
        } else {
            if (hosts.length === 1) {
                Settings.data('activeHost', hosts[0]);
                hostScreen.hide();
                startupScreen.hide();
                console.log('showMainScreen: hosts but no valid active host but choosing only available host. hosts: ' + JSON.stringify(hosts));                
                return true;
            } else {
                hostScreen.show();
                startupScreen.hide();                
                console.log('showMainScreen: hosts but no valid active host. hosts: ' + JSON.stringify(hosts));
                return false;
            }
        }
    }
}

function killApp() {
    mixpanel.track('App killed');
    console.log('--> Killing the app.');
    if (UpdateNotificationScreen.getScreen()) {
        UpdateNotificationScreen.getScreen().hide();
    }
    startupScreen.hide();
    hostScreen.hide();
    mainScreen.hide();
    errorScreen.hide();
}

function onNetworkError(error) {
    clearTimeout(updateRef);
    if (require('./screen-main').DEMO_MODE) {
        return;
    }

    if (UpdateNotificationScreen.getScreen()) {
        UpdateNotificationScreen.getScreen().hide();
    }
    if (Settings.option('hosts').length > 1) {
        hostScreen.show();
    }
    
    require('./screen-error-network').update(error, killApp);
    errorScreen.show();
    
    mixpanel.track('Network error', {
        kodiIp: Settings.data('activeHost').address
    });
} 

(function init() {
    if (require('./screen-main').DEMO_MODE) {
        console.log('--------> DEMO MODE <---------');
    }
    Settings.option('uid', Pebble.getAccountToken());
    
    mixpanel.trackAppOpened();

    require('./settings-loader').init(onSettingsUpdated);

    mainHandler.init(mainScreen, onNetworkError);
    showMainScreen();
    
    checkUiUpdateability();
    
    UpdateNotificationScreen.init();
})();
