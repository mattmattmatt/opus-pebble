var ajax = require('ajax');
var Settings = require('settings');

module.exports.send = function(method, params, callback) {
    var kodiIp = Settings.option('ip');
    callback = callback || function() {};

    if (!kodiIp) {
        return false;
    }
    
    var data = {
        "jsonrpc": "2.0",
        "method": method,
        "params": params,
        "id": Math.ceil(Math.random() * 10000)
    };
    console.log('Sending: ' + JSON.stringify(data, null, ''));
    ajax(
        {
            url: 'http://' + kodiIp + '/jsonrpc?Base',
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
            console.log(status + ': ' + JSON.stringify(error));
        }
    );
};