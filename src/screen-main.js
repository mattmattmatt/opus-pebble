var V = require('vector2');
var UI = require('ui');

module.exports.actionDef = {
    up: 'images/previous.png',
    select: 'images/play.png',
    down: 'images/next.png',
    backgroundColor: '#ffffff'
};

module.exports.main = function() {
    var screen = new UI.Window({
        fullscreen: true,
        action: module.exports.actionDef
    });

    var bg = new UI.Rect({
        position: new V(0, 0),
        size: new V(144, 168),
        backgroundColor: '#00aaff'
    });

    screen.add(bg);

    return screen;
};

module.exports.title = function(text) {
    return new UI.Text({
        position: new V(8, 8),
        size: new V(100, 83),
        font: 'gothic-28',
        color: '#ffffff',
        text: text || ''
    });
};

module.exports.description = function(text) {
    return new UI.Text({
        position: new V(8, 102),
        size: new V(100, 53),
        font: 'gothic-18',
        color: '#ffffff',
        text: text || ''
    });
};
