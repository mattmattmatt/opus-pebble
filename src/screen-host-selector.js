/* global module */

var UI = require('ui');
var Settings = require('settings');

var mixpanel = require('./mixpanel');

var screen;

function getHostsForMenu() {
    var hosts = Settings.option('hosts') || [];
    return hosts.map(function(host, index) {
        return {
            title: host.name,
            subtitle: host.address + (host.username && host.password ? ' (auth)' : '')
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

            var oldHost = Settings.data('activeHost');
            var newHost = Settings.option('hosts')[event.itemIndex];
            Settings.data('activeHost', newHost);
            Settings.data('activeHostIndex', event.itemIndex);
            require('./handler-main').updatePlayerState();
            screen.hide();

            mixpanel.track('Host Selector, Selected host', {
                hosts: Settings.option('hosts'),
                kodiIpOld: oldHost.address,
                kodiIp: newHost.address,
                usingAuth: !!(newHost.username && newHost.password),
                itemIndex: event.itemIndex,
                hostCount: Settings.option('hosts')
            });
        });
        screen.on('show', function(event) {
            mixpanel.track('Host Selector viewed', {
                hosts: Settings.option('hosts'),
                kodiIp: Settings.data('activeHost').address
            });
            var hosts = Settings.option('hosts') || [];
            if (hosts.length && hosts.length > Settings.data('activeHostIndex')) {
                screen.selection(0, Settings.data('activeHostIndex'));
            }
        });
    }
    return screen;
};
