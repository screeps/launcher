// Enable storing room history in local JSON files

var fs = require('fs'),
    path = require('path');

module.exports = function(config) {

    var dir = path.resolve(__dirname, 'replay-data');

    if(config.engine) {

        // This event is fired when the history data should be saved to disk
        config.engine.on('saveRoomHistory', function(roomName, baseTime, data) {
            try {
                fs.statSync(dir);
            }
            catch(e) {
                fs.mkdirSync(dir);
            }

            try {
                fs.statSync(path.resolve(dir, roomName));
            }
            catch(e) {
                fs.mkdirSync(path.resolve(dir, roomName));
            }

            fs.writeFile(
                path.resolve(dir, roomName, baseTime+'.json'),
                JSON.stringify(data));
        });
    }

    if(config.backend) {

        // This callback is called when the user client asks for a history chunk to display
        config.backend.onGetRoomHistory = function(roomName, baseTime, callback) {
            try {
                fs.readFile(
                    path.resolve(dir, roomName, baseTime+'.json'),
                    {encoding: 'utf8'},
                    callback);
            }
            catch(error) {
                callback(error);
            }
        }
    }
};