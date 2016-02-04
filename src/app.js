/* jshint browser:true */

var Settings = require('settings');

var mixpanel = require('./mixpanel');
var mainScreen = require('./screen-main').screen();
var startupScreen = require('./screen-startup').screen();
var hostScreen = require('./screen-host-selector').screen();
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
    require('./screen-host-selector').updateHostList();
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
    
    var ip = Settings.option('ip');
    var hosts = Settings.option('hosts') || [];
    
    if (!ip && !hosts.length) {
        startupScreen.show();
        mainScreen.hide();
        hostScreen.hide();
        console.log('showMainScreen: no IP and no hosts');
        return;
    }
    
    if (ip && !hosts.length) {
        mainScreen.show();
        startupScreen.hide();
        hostScreen.hide();
        
        console.log('showMainScreen: IP but no hosts, upgrading. IP: ' + ip);
        
        // upgrade old clients to new settings
        Settings.option('hosts', [{name: 'Kodi', address: ip}]);
        return;
    }  
    
    if (ip && hosts.length) {
        // ensure the value of IP is a member of the hosts array, otherwise show host selector
        if (!hosts.some(function(host) {
            return host.address === ip;
        })) {
            console.log('showMainScreen: IP not member of hosts, deleting IP. IP, hosts: ' + ip + ', ' + JSON.stringify(hosts));
            ip = undefined;
            Settings.option('ip', null);
        } else {
            mainScreen.show();
            startupScreen.hide();
            hostScreen.hide();
            console.log('showMainScreen: IP and hosts. IP, hosts: ' + ip + ', ' + JSON.stringify(hosts));
            return;
        }
    }
    
    if (!ip && hosts.length) {
        mainScreen.show();
        hostScreen.show();
        startupScreen.hide();
        console.log('showMainScreen: no IP but hosts. hosts: ' + JSON.stringify(hosts));
        return;
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
    if (require('./screen-main').DEMO_MODE) {
        console.log('--------> DEMO MODE <---------');
    }
    Settings.option('uid', Pebble.getAccountToken());
    mixpanel.track('App opened');

    require('./settings-loader').init(onSettingsUpdated);

    mainHandler.init(mainScreen, onNetworkError);
    showMainScreen();
    
    checkUiUpdateability();
})();
