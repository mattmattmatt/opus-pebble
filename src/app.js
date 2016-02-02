var Vibe = require('ui/vibe');
var Settings = require('settings');

var mixpanel = require('./mixpanel');
var mainUiComponents = require('./screen-main');
var mainScreen = mainUiComponents.screen();
var mainHandler = require('./handler-main');
var startupUiComponents = require('./screen-startup');
var startupScreen = startupUiComponents.screen();

var updateInterval;

//function setDefaultText() {
//    if (!mainUiComponents.DEMO_MODE) {
//        updateText('Opus', (Settings.option('ip') || 'No Kodi IP defined. Open phone settings.'));
////    updateText('I I I I I I I I I I I I I I I I I I I I I I I I I I I I I I I I I I I I I I I I I I I I I I', 'I I I I I I I I I I I I I I I I I I I I I I I I I I I I I I I I I I I I I I I I I I I I I I');
//    }
//}

function checkUiUpdateability() {
    clearInterval(updateInterval);
    if (Settings.option('updateUi') !== false) {
        updateInterval = setInterval(function() {
            if (Settings.option('updateUi') === false) {
                clearInterval(updateInterval);
            } else {
                mainHandler.updatePlayerState();
            }
        }, 10000);
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
