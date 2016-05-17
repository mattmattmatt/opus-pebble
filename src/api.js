/* global module */

var ajax = require('ajax');
var Settings = require('settings');

var SHOULD_LOG = true;

module.exports.send = function(method, params, callback, errorCallback) {
    if (require('./screen-main').DEMO_MODE) {
        return;
    }
    
    var kodiHost = Settings.data('activeHost');
    callback = callback || function() {};
    errorCallback = errorCallback || function() {};

    if (!kodiHost) {
        return false;
    }
    
    var data = {
        "jsonrpc": "2.0",
        "method": method,
        "params": params,
        "id": Math.ceil(Math.random() * 10000)
    };
    
    // Now comes the hacky party that works around a bug in Android webview URIdecoding strings twice
    var un;
    var pw;
    try {
        un = decodeURIComponent(kodiHost.username);
        pw = decodeURIComponent(kodiHost.password);
    } catch(e) {
        un = kodiHost.username;
        pw = kodiHost.password;
    }

    var authPart = (un && pw) ? encodeURIComponent(un) + ':' + encodeURIComponent(pw) + '@' : '';
    
    if (SHOULD_LOG) console.log('Sending ' + (authPart ? 'with auth ' + un + ':' + pw : 'without auth') + ': ' + JSON.stringify(data, null, ''));

    ajax(
        {
            url: 'http://' + authPart + kodiHost.address + '/jsonrpc?Base',
            method: 'post',
            type: 'json',
            data: data
        },
        function(data, status, request) {
            if (SHOULD_LOG) console.log(status + ': ' + JSON.stringify(data));
            callback(data);
        },
        function(error, status, request) {
            if (SHOULD_LOG) console.log('ajax error: ' + method);
            var newError = {
                httpStatusCode: status,
                serverMessage: error
            };
            if (SHOULD_LOG) console.log(JSON.stringify(newError));
            errorCallback(newError);
        }
    );
};