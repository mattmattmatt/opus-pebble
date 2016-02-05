/* global module */

var ajax = require('ajax');
var Settings = require('settings');

module.exports.send = function(method, params, callback, errorCallback) {
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

    var authPart = (kodiHost.username && kodiHost.password) ? kodiHost.username + ':' + kodiHost.password + '@' : '';
    
    console.log('Sending ' + (authPart ? 'with auth ' + kodiHost.username : 'without auth') + ': ' + JSON.stringify(data, null, ''));

    ajax(
        {
            url: 'http://' + authPart + kodiHost.address + '/jsonrpc?Base',
            method: 'post',
            type: 'json',
            data: data
        },
        function(data, status, request) {
            console.log(status + ': ' + JSON.stringify(data));
            callback(data);
        },
        function(error, status, request) {
            console.log('ajax error: ' + method);
            var newError = {
                httpStatusCode: status,
                serverMessage: error
            };
            console.log(JSON.stringify(newError));
            errorCallback(newError);
        }
    );
};