// Add test() method to the CLI sandbox environment

module.exports = function(config) {
    if(config.cli) {
        var oldCallback = config.cli.onCliSandbox;

        config.cli.onCliSandbox = function(sandbox) {

            oldCallback(sandbox);

            sandbox.test = function() {
                sandbox.print('This is the test!');
                return 'Test result';
            };

            return sandbox;
        }
    }
};