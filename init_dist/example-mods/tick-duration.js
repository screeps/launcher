// Change tick duration to 200 ms

module.exports = function(config) {
    if(config.engine) {
        config.engine.mainLoopMinDuration = 200;
    }
};