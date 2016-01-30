var Settings = require('settings');

module.exports.init = function() {
    Settings.config(
        {
            url: 'https://mattmattmatt.github.io/opus-pebble/config.html?' + Math.ceil(Math.random()*100000)
        },
        function beforeOpen(e) {
            // Reset color to red before opening the webview
            Settings.option('color', 'red');
        },
        function onClose(e) {
            console.log(JSON.stringify(Settings.option()));
        }
    );
};
