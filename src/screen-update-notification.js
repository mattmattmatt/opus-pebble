/* global module */
/* jshint browser:true */

var ajax = require('ajax');
var UI = require('ui');

var notificationScreen;

function getMessage(data, runningVersion) {
    var message = '';
    var changelogs = data.changelog;
    var foundNewVersions = false;
    var applicableChangelogs = changelogs.filter(function(entry) {
        if (entry.version === runningVersion) {
            foundNewVersions = true;
        }
        return !foundNewVersions;
    });
    applicableChangelogs.forEach(function(item) {
        if (item.release_notes) {
            message += item.release_notes + '\n';            
        }
    });
    return message;
}

function showUpdateNotification(newestVersion, runningVersion, message) {
    var bodyString = 'New since your version ' + runningVersion + ':\n';
    bodyString += message || 'General bugfixes and stability improvements.\n';
    bodyString += '\nVisit the Pebble App Store to update to version ' +
        newestVersion + 
        ' for free. 👍';

    if (!notificationScreen) {
        notificationScreen = new UI.Card({
            fullscreen: false,
            scrollable: true,
            backgroundColor: '#00AA55',
            titleColor: '#ffffff',
            subtitleColor: '#ffffff',
            bodyColor: '#ffffff',
            title: 'Update available 😃',
            body: bodyString
        });
    } else {
        notificationScreen.body(bodyString);
    }
    notificationScreen.show();
}

module.exports.getScreen = function() {
    return notificationScreen;
};

module.exports.init = function() {
    ajax(
        {
            url: 'https://api2.getpebble.com/v2/apps/id/56ac4a755319ec979400000d',
            method: 'get'
        },
        function(data) {
            try {
                data = JSON.parse(data).data[0];
                var newestVersion = data.latest_release.version;
                var runningVersion = require('../appinfo.json').versionLabel;
                console.log(newestVersion + ' is available; you are running ' + runningVersion);

                if (newestVersion !== runningVersion) {
                    showUpdateNotification(newestVersion, runningVersion, getMessage(data, runningVersion));
                }
            } catch(e) {
                console.log('JSON error: ' + JSON.stringify(e));
            }
        },
        function(error) {
            console.log('ajax error: ' + JSON.stringify(error));
        }
    );
};
