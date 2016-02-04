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
                name: $('.js-host-name').get(index).value.trim()
            })
        }
    });
    settings.ip = settings.hosts[0] && settings.hosts[0].address || undefined;
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
            address: config.ip || ''
        }];
    }

    $('#host-container').empty();
    _.each(config.hosts, function(host, index) {
        $('#host-container').append('<fieldset class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label"><input class="mdl-textfield__input js-host-address" type="text" '+ (index === 0 ? 'required="required"' : '') + ' autocapitalize="off" autocorrect="off" id="addr-'+index+'" value="'+host.address+'" ><label class="mdl-textfield__label" for="addr-'+index+'">Kodi IP Address</label></fieldset><fieldset class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label"><input class="mdl-textfield__input js-host-name" type="text" id="name-'+index+'"  value="'+host.name+'"><label class="mdl-textfield__label" for="name-'+index+'">Host Name</label></fieldset>');
    });
    componentHandler.upgradeElements($('#host-container').get(0));
}
