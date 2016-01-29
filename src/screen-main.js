var V = require('vector2');
var UI = require('ui');

module.exports.main = function() {
    var screen = new UI.Window({
        fullscreen: true,
        action: {
            up: 'images/previous.png',
            select: 'images/pause.png',
            down: 'images/next.png',
            backgroundColor: '#ffffff'
        }
    });

    var bg = new UI.Rect({
        position: new V(0, 0),
        size: new V(144, 168),
        backgroundColor: '#0099cc'
    });

    screen.add(bg);

    return screen;
};

module.exports.title = function(text) {
   return new UI.Text({
        position: new V(10, 10),
        size: new V(104, 48),
        font: 'gothic-28',
        color: '#ffffff',
        text: text || ''
    });
};

module.exports.description = function(text) {
    return new UI.Text({
        position: new V(10, 104),
        size: new V(104, 56),
        font: 'gothic-18',
        color: '#ffffff',
        text: text || ''
    });
};
