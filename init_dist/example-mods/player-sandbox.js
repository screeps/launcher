// Add a new function to player sandbox space
// Try to run `test()` using your in-game console

module.exports = function(config) {
    if(config.engine) {
        config.engine.on('playerSandbox', function(sandbox, userId) {
            sandbox.set('myInValue', 123);
            sandbox.run(`function test() {
                console.log('Current game tick is:', Game.time, 'myInValue:', global.myInValue);
                global.myOutValue = 999; 
            }`);
            console.log(`User ${userId} global.myOutValue=${sandbox.get('myOutValue')}`);
        });
    }
};