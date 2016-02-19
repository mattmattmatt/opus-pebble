/* global module */

module.exports.getWatchInfo = function() {
    if (Pebble.getActiveWatchInfo) {
        return Pebble.getActiveWatchInfo();
    } else {
        return {};
    }
};