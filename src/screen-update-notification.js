/* global module */
/* jshint browser:true */

var ajax = require('ajax');
var UI = require('ui');

var notificationScreen;

function showUpdateNotification(newestVersion, runningVersion) {
    var bodyString = 'You are running Opus version ' + 
        runningVersion + 
        '. Visit the Pebble App Store to update to version ' +
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
            url: 'https://raw.githubusercontent.com/mattmattmatt/opus-pebble/master/appinfo.json',
            method: 'get'
        },
        function(data, status, request) {
            try {
                var newestVersion = JSON.parse(data).versionLabel;
                var runningVersion = require('../appinfo.json').versionLabel;
                console.log(newestVersion + ' ' + runningVersion);

                if (newestVersion !== runningVersion) {
                    showUpdateNotification(newestVersion, runningVersion);
                }
            } catch(e) {}
        },
        function(error, status, request) {
            console.log('ajax error: ' + JSON.stringify(error));
        }
    );
};
