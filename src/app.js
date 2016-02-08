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
    showMainScreen();
    require('./screen-host-selector').updateHostList();
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
        return false;
    }
    
    var ip = Settings.option('ip');
    var hosts = Settings.option('hosts') || [];
    
    Settings.option('ip', null);
    
    if (!ip && !hosts.length) {
        startupScreen.show();
        mainScreen.hide();
        hostScreen.hide();
        console.log('showMainScreen: no IP and no hosts');
        return false;
    }

    // legacy case of no hosts but ip, should be removed soon
    if (ip && !hosts.length) {
        mainScreen.show();
        startupScreen.hide();
        hostScreen.hide();
        
        console.log('showMainScreen: IP but no hosts, upgrading. IP: ' + ip);
        
        // upgrade old clients to new settings
        Settings.option('hosts', [{name: 'Kodi', address: ip}]);
        Settings.data('activeHost', Settings.option('hosts')[0]);
        return true;
    }  
    
    if (ip && hosts.length) {
        // ensure the value of IP is a member of the hosts array, otherwise show host selector
        var validHostIndex;
        if (hosts.some(function(host, index) {
            var isValid = (host.address === ip);
            if (isValid) {
                validHostIndex = index;
            }
            return isValid;
        })) {
            mainScreen.show();
            startupScreen.hide();
            hostScreen.hide();
            Settings.data('activeHost', Settings.option('hosts')[validHostIndex]);
            console.log('showMainScreen: IP and hosts. IP, hosts: ' + ip + ', ' + JSON.stringify(hosts));
            return true;
        } else {
            console.log('showMainScreen: IP not member of hosts, deleting IP. IP, hosts: ' + ip + ', ' + JSON.stringify(hosts));
            ip = undefined;
        }
    }
    
    if (!ip && hosts.length) {
        mainScreen.show();
        if (Settings.data('activeHost') && hosts.some(function(host) {
            return JSON.stringify(host) === JSON.stringify(Settings.data('activeHost'));
        })) {
            hostScreen.hide();
            startupScreen.hide();
            console.log('showMainScreen: no IP but hosts and valid active host. hosts, activeHost: ' + JSON.stringify(hosts) + ', ' +  JSON.stringify(Settings.data('activeHost')));
            return true;
        } else {
            if (hosts.length === 1) {
                Settings.data('activeHost', hosts[0]);
                hostScreen.hide();
                startupScreen.hide();
                console.log('showMainScreen: no IP but hosts but no valid active host but choosing only available host. hosts: ' + JSON.stringify(hosts));                
                return true;
            } else {
                hostScreen.show();
                startupScreen.hide();                
                console.log('showMainScreen: no IP but hosts but no valid active host. hosts: ' + JSON.stringify(hosts));
                return false;
            }
        }
    }
}

function onNetworkError(error) {
    clearInterval(updateRef);
    var errorScreen = require('./screen-error-network').screen(error);
    hostScreen.show();
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

    mixpanel.track('App opened');

    require('./settings-loader').init(onSettingsUpdated);

    mainHandler.init(mainScreen, onNetworkError);
    showMainScreen();
    
    checkUiUpdateability();
})();
