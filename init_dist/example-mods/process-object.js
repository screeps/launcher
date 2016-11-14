// Disable Source Keepers spawning

module.exports = function(config) {
    if(config.engine) {
        config.engine.on('processObject', function(object, roomObjects, roomTerrain, gameTime,
                                                   roomInfo, objectsUpdate, usersUpdate) {
            if(object.type == 'keeperLair') {
                object._skip = true; // This object will not be processed
            }
        });
    }
};