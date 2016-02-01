var Vibe = require('ui/vibe');
var Settings = require('settings');

var api = require('./api');
var mixpanel = require('./mixpanel');
var ui = require('./screen-main');
var main = ui.main();

var volume = 0;
var playerid = 0;
var isPlaying = false;

var updateInterval;
var titleUi;
var descriptionUi;
var timeUi;

main.on('click', 'select', function(e) {
    api.send('Player.PlayPause', [playerid, 'toggle'], getPlayerState);
    
    mixpanel.track('Button pressed, PlayPause');
});


main.on('longClick', 'up', function(e) {
    if (Settings.option('vibeOnLongPress') !== false) {
        Vibe.vibrate('short');        
    }
    api.send('Player.GoTo', [playerid, 'previous'], getPlayerState);
    
    mixpanel.track('Button pressed, Previous');
});

main.on('longClick', 'down', function(e) {
    if (Settings.option('vibeOnLongPress') !== false) {
        Vibe.vibrate('short');        
    }
    api.send('Player.GoTo', [playerid, 'next'], getPlayerState);
    
    mixpanel.track('Button pressed, Next');
});


main.on('click', 'up', function(e) {
    volume += 4;
    api.send('Application.SetVolume', [volume], function(data) {
        volume = data.result;
    });
    
    mixpanel.track('Button pressed, Volume up', {
        volume: volume
    });
});

main.on('click', 'down', function(e) {
    volume -= 5;
    api.send('Application.SetVolume', [volume], function(data) {
        volume = data.result;
    });
    
    mixpanel.track('Button pressed, Volume down', {
        volume: volume
    });    
});


function getPlayerState() {
    api.send('Application.GetProperties', [['volume', 'muted']], function(data) {
        volume = data.result.volume;
    });

    api.send('Player.GetActivePlayers', [], function(data) {
        if (data.result.length > 0) {
            playerid = data.result[0].playerid;

            api.send('Player.GetProperties', [playerid, ['percentage', 'speed']], function(data) {
                isPlaying = data.result.speed > 0;

                var actionDef = ui.actionDef;
                if (isPlaying) {
                    actionDef.select = 'images/pause.png';
                    main.action(actionDef);
                } else {
                    actionDef.select = 'images/play.png';                    
                    main.action(actionDef);
                }
            });

            api.send('Player.GetItem', {"properties": ["title", "album", "artist", "duration"], "playerid": playerid}, function(data) {
                var playingItem = data.result.item;
                updateText(playingItem.title, playingItem.artist[0].toUpperCase() + '\n' + playingItem.album);
            });
        }
    });    
}

function updateText(title, desc) {
    titleUi.text(title);
    descriptionUi.text(desc);
}

function setDefaultText() {
    updateText('Opus', (Settings.option('ip') || 'No Kodi IP defined. Open phone settings.'));
//    updateText('I I I I I I I I I I I I I I I I I I I I I I I I I I I I I I I I I I I I I I I I I I I I I I', 'I I I I I I I I I I I I I I I I I I I I I I I I I I I I I I I I I I I I I I I I I I I I I I');
}

function checkUiUpdateability() {
    clearInterval(updateInterval);
    if (Settings.option('updateUi') !== false) {
        updateInterval = setInterval(function() {
            if (Settings.option('updateUi') === false) {
                clearInterval(updateInterval);
            } else {
                getPlayerState();
            }
        }, 10000);
    }  
}

function onSettingsUpdated() {
    clearUi();
    addUi();
    setDefaultText();
    getPlayerState();
    checkUiUpdateability();
}

function clearUi() {
    titleUi.remove();
    descriptionUi.remove();
    timeUi.remove();
}

function addUi() {
    main.add(titleUi = ui.title());
    main.add(descriptionUi = ui.description());
    main.add(timeUi = ui.time());    
}

(function init() {
    main.show();
    
    Settings.option('uid', Pebble.getAccountToken());

    addUi();

    setDefaultText();
    
    mixpanel.track('App opened');

    require('./settings-loader').init(onSettingsUpdated);

    getPlayerState();
    checkUiUpdateability();
})();
