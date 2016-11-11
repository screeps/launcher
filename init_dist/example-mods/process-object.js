// Disable Source Keepers spawning

module.exports = function(config) {
    if(config.engine) {

        var oldCallback = config.engine.onProcessObject;

        config.engine.onProcessObject = function(object) {

            oldCallback.apply(this, arguments);

            if(object.type == 'keeperLair') {
                return false; // This object will not be processed
            }
        }
    }
};