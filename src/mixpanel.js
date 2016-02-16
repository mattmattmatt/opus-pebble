/* global module  */

var ajax = require('ajax');
var btoa = require('shims').btoa;

var appinfo = require('../appinfo.json');

var MIXPANEL_TOKEN = '6229cfb42de97ef516b9da89c4f96ac1';

module.exports.track = function(event, properties) {
    properties = properties || {};
    properties.distinct_id = Pebble.getAccountToken();
    properties.token = MIXPANEL_TOKEN;
    properties.appVersion = appinfo.versionLabel;

    var data = {
        event: event,
        properties: properties
    };

    console.log('Tracking ' + JSON.stringify(data) + ' ' + btoa(JSON.stringify(data)));

    if (require('./screen-main').DEMO_MODE) {
        console.log('----> No tracking b/C DEMO MODE');
        return;
    }
    
    ajax(
        {
            url: 'https://api.mixpanel.com/track/?ip=1&&data=' + btoa(JSON.stringify(data)),
            method: 'get'
        },
        function(data, status, request) {
            console.log('Tracking response ' + status + ': ' + JSON.stringify(data));
        },
        function(error, status, request) {
            console.log('Tracking error');
            console.log(status + ': ' + JSON.stringify(error));
        }
    );
};

module.exports.trackAppOpened = function() {
    module.exports.engage({
        $set_once: {
            'First Seen': (new Date()).toISOString().split('.')[0]
        }
    });
    module.exports.engage({
        $set: {
            'App Version': appinfo.versionLabel
        }
    });
    module.exports.track('App opened');
};

module.exports.engage = function(properties) {
    properties = properties || {};
    properties.$distinct_id = Pebble.getAccountToken();
    properties.$token = MIXPANEL_TOKEN;

    console.log('Tracking set ' + JSON.stringify(properties) + ' ' + btoa(JSON.stringify(properties)));

    if (require('./screen-main').DEMO_MODE) {
        console.log('----> No tracking b/C DEMO MODE');
        return;
    }
    
    ajax(
        {
            url: 'https://api.mixpanel.com/engage/?ip=1&&data=' + btoa(JSON.stringify(properties)),
            method: 'get'
        },
        function(data, status, request) {
            console.log('Tracking set response ' + status + ': ' + JSON.stringify(data));
        },
        function(error, status, request) {
            console.log('Tracking set error');
            console.log(status + ': ' + JSON.stringify(error));
        }
    );
};
