/* global module */
/* jshint browser:true */

var Vibe = require('ui/vibe');
var Settings = require('settings');

var api = require('./api');
var mixpanel = require('./mixpanel');
var mainUiComponents = require('./screen-main');

var volume = 0;
var playerid = 0;
var playertype = 'audio';
var playState = 0;
var errors = 0;
var networkSuccessTracked = false;

var titleUi;
var descriptionUi;
var timeUi;
var mainScreen;
var retryTimeout;
var onErrorCallback = function() {};


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

function onNetworkError(error) {
    errors++;
    if (errors < 4) {
        clearTimeout(retryTimeout);
        retryTimeout = setTimeout(module.exports.updatePlayerState, 1000);
        console.log('Error, retrying in ' + (1000) + ' ms');
    } else {
        console.log('Error limit reached. ' + JSON.stringify(error));
        updateText('Can\'t connect to Kodi', 'Ensure Kodi\'s IP is accessible from your phone.');
        onErrorCallback(error);
    }
}

function onNetworkSuccess() {
    if (!networkSuccessTracked) {
        networkSuccessTracked = true;
        require('./mixpanel').track('Network success');
    }
}

function updateActionBar(field, value) {
    var actionDef = mainUiComponents.actionDef;
    if (playState > 1) {
        actionDef.select = 'images/pause.png';
    } else {
        actionDef.select = 'images/play.png';
    }
    if (field && value) {
        actionDef[field] = value;
    }
    mainScreen.action(actionDef);
}

module.exports.updatePlayerState = function() {
    if (!Settings.data('activeHost')) {
        updateText('No IP set', 'Please open the settings app on your phone.');
        return;
    }

    api.send('Application.GetProperties', [['volume', 'muted']], function onSuccess(data) {
        errors = 0;
        volume = data.result.volume;
        
        onNetworkSuccess();

        api.send('Player.GetActivePlayers', [], function(data) {
            if (data.result.length > 0) {
                playerid = data.result[0].playerid;
                playertype = data.result[0].type;

                api.send('Player.GetProperties', [playerid, ['percentage', 'speed']], function(data) {
                    if (data.result.speed > 0) {
                        playState = 2;
                    } else {
                        playState = 1;
                    }
                    updateActionBar();
                });

                api.send('Player.GetItem', {'properties': ['title', 'album', 'artist', 'duration', 'runtime', 'showtitle'], 'playerid': playerid}, function(data) {
                    var playingItem = data.result.item;
                    if (playertype === 'audio') {
                        updateText(playingItem.title, playingItem.artist[0].toUpperCase() + '\n' + playingItem.album);
                    } else if (playertype === 'video') {
                        updateText(playingItem.title, playingItem.showtitle || '');
                    }
                });
            } else {
                playState = 0;
                updateText('Nothing playing', 'Press play to ' + (Settings.option('playActionWhenStopped') === 'playLast' ? 'start the last active playlist' : 'start the party'));
                updateActionBar();
            }
            onNetworkSuccess();
        });
    },  onNetworkError);

};

module.exports.reset = function() {
    clearUi();
    addUi();
    module.exports.updatePlayerState();
};

module.exports.init = function(m, errorCallback) {
    onErrorCallback = errorCallback || onErrorCallback;
    mainScreen = m;
    addUi();
    module.exports.updatePlayerState();

    mainScreen.on('click', 'select', function(e) {
        function onSuccessfulPlay() {
            module.exports.updatePlayerState();
            // make sure we update display after this initial playing action as callback is earlier than playing state
            setTimeout(module.exports.updatePlayerState, 800);
            setTimeout(module.exports.updatePlayerState, 1600);
            setTimeout(module.exports.updatePlayerState, 3200);
            setTimeout(module.exports.updatePlayerState, 5000);
        }

        if (playState > 0) {
            api.send('Player.PlayPause', [playerid, 'toggle'], module.exports.updatePlayerState);
        } else {
            switch (Settings.option('playActionWhenStopped')) {
                case 'playLast':
                    api.send('Input.ExecuteAction', {'action': 'play'}, onSuccessfulPlay, onNetworkError);  
                    break;
                case 'partymode':
                    /*falls through*/
                default:
                    api.send('Player.SetPartymode', [0, 'toggle'], onSuccessfulPlay, onNetworkError);
                    break;
            }
        }
        mixpanel.track('Button pressed, PlayPause', {
            playState: playState
        });
    });

    mainScreen.on('longClick', 'select', function(e) {
        updateActionBar('select', 'images/ellipsis.png');
        
        setTimeout(function() {
            updateActionBar();
        }, 1000);
        
        if (Settings.option('vibeOnLongPress') !== false) {
            Vibe.vibrate('short');
        }
        if (Settings.option('hosts') && Settings.option('hosts').length > 0) {
            require('./screen-host-selector').screen().show();            
        } else {
            require('./screen-startup').screen().show();
            mainScreen.hide();
        }
        
        mixpanel.track('Button pressed, Host Selector');
    });

    mainScreen.on('longClick', 'up', function(e) {
        updateActionBar('up', 'images/previous.png');
        
        setTimeout(function() {
            updateActionBar('up', 'images/volume_up.png');
        }, 1000);
        
        if (Settings.option('vibeOnLongPress') !== false) {
            Vibe.vibrate('short');
        }
        api.send('Player.GoTo', [playerid, 'previous'], module.exports.updatePlayerState);

        mixpanel.track('Button pressed, Previous');
    });

    mainScreen.on('longClick', 'down', function(e) {
        updateActionBar('down', 'images/next.png');
        
        setTimeout(function() {
            updateActionBar('down', 'images/volume_down.png');
        }, 1000);
        
        if (Settings.option('vibeOnLongPress') !== false) {
            Vibe.vibrate('short');
        }
        api.send('Player.GoTo', [playerid, 'next'], module.exports.updatePlayerState);

        mixpanel.track('Button pressed, Next');
    });

    mainScreen.on('click', 'up', function(e) {
        var oldVolume = volume;
        volume += 4;
        volume = Math.min(volume, 100);
        api.send('Application.SetVolume', [volume], function(data) {
            volume = data.result;
            module.exports.updatePlayerState();
        }, onNetworkError);
        
        mainUiComponents.setVolume(oldVolume, volume);

        mixpanel.track('Button pressed, Volume up', {
            volume: volume,
            oldVolume: oldVolume
        });
    });

    mainScreen.on('click', 'down', function(e) {
        var oldVolume = volume;
        volume -= 5;
        volume = Math.max(volume, 0);
        api.send('Application.SetVolume', [volume], function(data) {
            volume = data.result;
            module.exports.updatePlayerState();
        }, onNetworkError);
        
        mainUiComponents.setVolume(oldVolume, volume);

        mixpanel.track('Button pressed, Volume down', {
            volume: volume,
            oldVolume: oldVolume
        });
    });

    mainScreen.on('accelTap', module.exports.updatePlayerState);
};

