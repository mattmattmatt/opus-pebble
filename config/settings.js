function getStateFromUi() {
    var settings = {
        vibeOnLongPress: $('#switch-vibe-long-press').prop('checked'),
        updateUi: $('#switch-update-ui').prop('checked'),
        showClock: $('#switch-show-clock').prop('checked'),
        playActionWhenStopped: $('#option-play-last').prop('checked') ? 'playLast' : 'partymode',
        hosts: []
    };
    $('.js-host-address').each(function(index, input) {
        if (input.value.trim()) {
            settings.hosts.push({
                address: input.value.trim(),
                name: $('.js-host-name').get(index).value.trim(),
                username: $('.js-host-username').get(index).value.trim(),
                password: $('.js-host-password').get(index).value.trim()
            });
        }
    });
    return settings;
}

function setUiFromState(config) {
    config = config || {};

    $('#switch-vibe-long-press').prop('checked', config.vibeOnLongPress);
    $('#switch-update-ui').prop('checked', config.updateUi);
    $('#switch-show-clock').prop('checked', config.showClock);
    if (config.playActionWhenStopped === 'playLast') {
        $('#option-play-last').prop('checked', true);
    } else {
        $('#option-partymode').prop('checked', true);
    }

    if (!config.hosts || !config.hosts.length) {
        config.hosts = [{
            name: 'Kodi',
            address: config.ip || '',
            username: '',
            password: ''
        }];
    }

    $('#host-container').empty();
    _.each(config.hosts, function(host, index) {
        var markup = '' +
        '<h6 class="mdl-card__title-text">Host number ' + (index + 1) + '</h6>' +
        '<fieldset class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">' +
            '<input class="mdl-textfield__input js-host-address" type="text" '+ (index === 0 ? 'required="required" ' : ' ') + ' autocapitalize="off" autocorrect="off" id="addr-'+index+'" value="'+host.address+'">' +
            '<label class="mdl-textfield__label" for="addr-'+index+'">' +
                'Kodi IP Address and Port (e.g. 192.168.1.100:8080)' +
            '</label>' +
        '</fieldset>' +
        '<fieldset class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">' +
            '<input class="mdl-textfield__input js-host-name" type="text" id="name-'+index+'" value="'+host.name+'">' +
            '<label class="mdl-textfield__label" for="name-'+index+'">' +
                'Host Name' +
            '</label>' +
        '</fieldset>' +
        '<fieldset class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">' +
            '<input class="mdl-textfield__input js-host-username" type="text" id="username-'+index+'" value="'+host.username+'" autocapitalize="off" >' +
            '<label class="mdl-textfield__label" for="username-'+index+'">' +
                'Username (optional)' +
            '</label>' +
        '</fieldset>' +
        '<fieldset class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">' +
            '<input class="mdl-textfield__input js-host-password" type="text" id="password-'+index+'" value="'+host.password+'" autocapitalize="off" autocorrect="off" autocomplete="off" >' +
            '<label class="mdl-textfield__label" for="password-'+index+'">' +
                'Password (optional)' +
            '</label>' +
        '</fieldset>' +
        ( index > 0 ?
        '<button id="delete-'+index+'" type="button" class="mdl-button mdl-js-button mdl-button--raised js-delete-host">' +
            'Delete this host' +
        '</button>'
        : '') +
        '<hr />';
        $('#host-container').append(markup);
    });
    componentHandler.upgradeElements($('#host-container').get(0));
}
