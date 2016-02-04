/* global module */

var UI = require('ui');
var Settings = require('settings');

var mixpanel = require('./mixpanel');

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
            backgroundColor: '#00aaff',
            textColor: '#FFFFFF',
            highlightBackgroundColor: '#FFFFFF',
            highlightTextColor: '#00aaff',
            sections: [{
                title: 'Choose a Kodi host',
                items: getHostsForMenu()
            }]
        });
        screen.on('select', function(event) {
            if (!event.item) {
                return;
            }
            
            var oldIp = Settings.option('ip');
            Settings.option('ip', event.item.subtitle);
            currentlyActiveItem = event.itemIndex;
            require('./handler-main').updatePlayerState();
            screen.hide();
            
            mixpanel.track('Host Selector, Selected host', {
                hosts: Settings.option('hosts'),
                kodiIpOld: oldIp,
                kodiIp: Settings.option('ip'),
                itemIndex: currentlyActiveItem,
                hostCount: Settings.option('hosts')
            });
        });
        screen.on('show', function(event) {
            mixpanel.track('Host Selector viewed', {
                hosts: Settings.option('hosts'),
                kodiIp: Settings.option('ip')
            });
            var hosts = Settings.option('hosts') || [];
            if (hosts.length && hosts.length > currentlyActiveItem) {
                screen.selection(0, currentlyActiveItem);
            }
        });
    }
    return screen;
};
