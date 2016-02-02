/* global module */

var Vibe = require('ui/vibe');
var Settings = require('settings');

var api = require('./api');
var mixpanel = require('./mixpanel');
var mainUiComponents = require('./screen-main');

var volume = 0;
var playerid = 0;
var isPlaying = false;

var titleUi;
var descriptionUi;
var timeUi;
var mainScreen;


function clearUi() {
    titleUi.remove();
    descriptionUi.remove();
    timeUi.remove();
}

function addUi() {
    mainScreen.add(titleUi = mainUiComponents.title());
    mainScreen.add(descriptionUi = mainUiComponents.description());
    mainScreen.add(timeUi = mainUiComponents.time());
}

function updateText(title, desc) {
    titleUi.text(title);
    descriptionUi.text(desc);
}

module.exports.updatePlayerState = function() {
    if (!Settings.option('ip')) {
        return;
    }
    api.send('Application.GetProperties', [['volume', 'muted']], function(data) {
        volume = data.result.volume;
    });

    api.send('Player.GetActivePlayers', [], function(data) {
        if (data.result.length > 0) {
            playerid = data.result[0].playerid;

            api.send('Player.GetProperties', [playerid, ['percentage', 'speed']], function(data) {
                isPlaying = data.result.speed > 0;

                var actionDef = mainUiComponents.actionDef;
                if (isPlaying) {
                    actionDef.select = 'images/pause.png';
                    mainScreen.action(actionDef);
                } else {
                    actionDef.select = 'images/play.png';
                    mainScreen.action(actionDef);
                }
            });

            api.send('Player.GetItem', {"properties": ["title", "album", "artist", "duration"], "playerid": playerid}, function(data) {
                var playingItem = data.result.item;
                updateText(playingItem.title, playingItem.artist[0].toUpperCase() + '\n' + playingItem.album);
            });
        }
    });
};

module.exports.reset = function() {
    clearUi();
    addUi();
    module.exports.updatePlayerState();
};

module.exports.init = function(m) {
    mainScreen = m;
    addUi();
    module.exports.updatePlayerState();

    mainScreen.on('click', 'select', function(e) {
        api.send('Player.PlayPause', [playerid, 'toggle'], module.exports.updatePlayerState);

        mixpanel.track('Button pressed, PlayPause');
    });

    mainScreen.on('longClick', 'up', function(e) {
        if (Settings.option('vibeOnLongPress') !== false) {
            Vibe.vibrate('short');
        }
        api.send('Player.GoTo', [playerid, 'previous'], module.exports.updatePlayerState);

        mixpanel.track('Button pressed, Previous');
    });

    mainScreen.on('longClick', 'down', function(e) {
        if (Settings.option('vibeOnLongPress') !== false) {
            Vibe.vibrate('short');
        }
        api.send('Player.GoTo', [playerid, 'next'], module.exports.updatePlayerState);

        mixpanel.track('Button pressed, Next');
    });

    mainScreen.on('click', 'up', function(e) {
        volume += 4;
        api.send('Application.SetVolume', [volume], function(data) {
            volume = data.result;
        });

        mixpanel.track('Button pressed, Volume up', {
            volume: volume
        });
    });

    mainScreen.on('click', 'down', function(e) {
        volume -= 5;
        api.send('Application.SetVolume', [volume], function(data) {
            volume = data.result;
        });

        mixpanel.track('Button pressed, Volume down', {
            volume: volume
        });
    });
};

