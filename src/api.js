var ajax = require('ajax');

var kodiIp = '192.168.1.140';

module.exports.send = function(method, params, callback) {
    callback = callback || function() {};
    var data = {
        "jsonrpc": "2.0",
        "method": method,
        "params": params,
        "id": Math.ceil(Math.random() * 10000)
    };
    console.log('Sending: ' + JSON.stringify(data, null, ' '));
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
            console.log('error');
            console.log(status + ': ' + JSON.stringify(error));
        }
    );
};