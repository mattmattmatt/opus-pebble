/* global module */

var UI = require('ui');
var Settings = require('settings');

var screen;
var currentlyActiveItem = 0;

function getHostsForMenu() {
    var hosts = Settings.option('hosts') || [];
    return hosts.map(function(host, index) {
        return {
            title: host.name,
            subtitle: host.address
        };
    });
}

module.exports.updateHostList = function() {
    if (!screen) {
        return;
    }

    screen.items(0, getHostsForMenu());
};

module.exports.screen = function() {
    if (!screen) {
        screen = new UI.Menu({
            fullscreen: true,
            backgroundColor: '#00FFFF',
            textColor: '#FFFFFF',
            highlightBackgroundColor: '#0055FF',
            highlightTextColor: '#FFFFFF',
            sections: [{
                title: 'Choose a Kodi host',
                items: getHostsForMenu()
            }]
        });
        screen.on('select', function(event) {
            Settings.option('ip', event.item.subtitle);
            currentlyActiveItem = event.itemIndex;
            screen.hide();
        });
        screen.on('show', function(event) {
            if (Settings.option('hosts').length && Settings.option('hosts').length > currentlyActiveItem) {
                screen.selection(0, currentlyActiveItem);
            }
        });
    }
    return screen;
};
