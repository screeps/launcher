// Add test() method to the CLI sandbox environment

module.exports = function(config) {
    if(config.cli) {
        var oldCreateSandbox = config.cli.createSandbox;
        config.cli.createSandbox = function() {
            var sandbox = oldCreateSandbox.apply(this, Array.prototype.slice.call(arguments));
            sandbox.test = function() {
                sandbox.print('This is the test!');
                return 'Test result';
            };
            return sandbox;
        }
    }
};