// Add a new function to player sandbox space

module.exports = function(config) {
    if(config.engine) {

        var oldCallback = config.engine.onPlayerSandbox;

        config.engine.onPlayerSandbox = function(sandbox) {

            oldCallback(sandbox);

            sandbox.test = function() {
                sandbox.console.log('Current game tick is:', sandbox.Game.time);
            }
        }
    }
};