var Settings = require('settings');

module.exports.init = function(onSettingsUpdated) {
    Settings.config(
        {
            url: 'https://mattmattmatt.github.io/opus-pebble/config.html?' + Math.ceil(Math.random()*100000)
        },
        function beforeOpen(e) {
        },
        function onClose(e) {
            console.log('Received settings: ' + JSON.stringify(Settings.option()));
            (onSettingsUpdated || function() {})();
        }
    );
};
