(function () {
    var config;

    // Get query variables
    function getQueryParam(variable, defaultValue) {
        // Find all URL parameters
        var query = location.search.substring(1);
        var vars = query.split('&');
        for (var i = 0; i < vars.length; i++) {
            var pair = vars[i].split('=');

            // If the query variable parameter is found, decode it to use and return it for use
            if (pair[0] === variable) {
                return decodeURIComponent(pair[1]);
            }
        }
        return defaultValue || false;
    }

    function saveSettings() {
        var settings = getStateFromUi();

        log('Saved.<br />' + JSON.stringify(settings) + '<br/> &nbsp; ' + encodeURIComponent(JSON.stringify(settings)) + ' &nbsp;<br/>&nbsp; ');

        mixpanel.track("Config saved", settings);

        setTimeout(function () {
            // Set the return URL depending on the runtime environment
            document.location = getQueryParam('return_to', 'pebblejs://close#') + encodeURIComponent(JSON.stringify(settings));
        }, 300);
    }

    document.getElementById('form').addEventListener('submit', function(event) {
        event.preventDefault();
        event.stopPropagation();
        saveSettings();
    });

    document.getElementById('add-host').addEventListener('click', function (event) {
        var config = getStateFromUi();
        config.hosts.push({
            name: 'New Kodi Host',
            address: ''
        });
        setUiFromState(config);
    });

    function log(text) {
        setTimeout(function () {
            document.getElementById('log').innerHTML = text;
        }, 1000);
    }

    function sendKodiRequest() {
        var request = new XMLHttpRequest();
        var data = {
            'jsonrpc': '2.0',
            'method': 'JSONRPC.Ping',
            'id': Math.ceil(Math.random() * 10000)
        };

        request.addEventListener('load', function (data) {
            log('success' + JSON.stringify(data));
        });
        request.addEventListener('error', function (error) {
            log('error' + JSON.stringify(error));
        });
        request.open('GET', 'http://' + document.getElementById('ip').value + '/jsonrpc?jsonCallback=bummm&request=' + encodeURIComponent(JSON.stringify(data)));
        request.setRequestHeader('Content-type', 'application/javascript');
        request.send();
    }




    (function init() {
        if (window.location.hash.substr(1)) {
            try {
                config = JSON.parse(decodeURIComponent(window.location.hash.substr(1)));
                mixpanel.identify(config.uid);
            } catch (e) {
                config = {};
                mixpanel.track('Config, Parsing error', {
                    detectedHash: decodeURIComponent(window.location.hash.substr(1))
                });

                log('Could not parse current configuration.');
            }
        }

        setUiFromState(config);
        mixpanel.track('Config viewed');
    })();
})();
