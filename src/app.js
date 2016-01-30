/**
 * Welcome to Pebble.js!
 *
 * This is where you write your app.
 */

var Vibe = require('ui/vibe');
var Settings = require('settings');

var api = require('./api');
var ui = require('./screen-main');
var main = ui.main();

var volume = 0;
var playerid = 0;
var isPlaying = false;

var titleUi;
var descriptionUi;

main.on('click', 'select', function(e) {
    api.send('Player.PlayPause', [playerid, 'toggle'], getPlayerState);
});

main.on('longClick', 'up', function(e) {
    Vibe.vibrate('short');
    api.send('Player.GoTo', [playerid, 'previous'], getPlayerState);
});

main.on('click', 'up', function(e) {
    volume += 4;
    api.send('Application.SetVolume', [volume], function(data) {
        volume = data.result;
    });
});

main.on('longClick', 'down', function(e) {
    Vibe.vibrate('short');
    api.send('Player.GoTo', [playerid, 'next'], getPlayerState);
});

main.on('click', 'down', function(e) {
    volume -= 5;
    api.send('Application.SetVolume', [volume], function(data) {
        volume = data.result;
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
                titleUi.text(playingItem.title);
                descriptionUi.text(playingItem.artist[0].toUpperCase() + '\n' + playingItem.album);
            });
        }
    });    
}

(function init() {
    main.show();

    titleUi = ui.title('Kodi');
    main.add(titleUi);

    descriptionUi = ui.description('Rock\'n\'roll, baby.\n' + (Settings.option('ip') || 'No Kodi IP defined.'));
    main.add(descriptionUi);

    require('./settings-loader').init();
    
    getPlayerState();
//    setInterval(getPlayerState, 10000);
})();
