// Disable Source Keepers spawning

module.exports = function(config) {
    if(config.engine) {
        config.engine.onProcessObject = function(object) {
            if(object.type == 'keeperLair') {
                return false; // This object will not be processed
            }
        }
    }
};