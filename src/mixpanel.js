/* global module  */

var ajax = require('ajax');
var btoa = require('shims').btoa;
var MIXPANEL_TOKEN = '6229cfb42de97ef516b9da89c4f96ac1';

module.exports.track = function(event, properties) {
    properties = properties || {};
    properties.distinct_id = Pebble.getAccountToken();
    properties.token = MIXPANEL_TOKEN;

    var data = {
        event: event,
        properties: properties
    };

    console.log('Tracking ' + JSON.stringify(data) + ' ' + btoa(JSON.stringify(data)));

    if (require('./screen-main').DEMO_MODE) {
        console.log('----> No tracking b/C DEMO MODE');
        return;
    }
    
    if (properties.distinct_id === 'edd1127067e0c5e0b046c8c7fbd1ae43') {
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