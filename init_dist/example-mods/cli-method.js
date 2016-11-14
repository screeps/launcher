// Add test() method to the CLI sandbox environment

module.exports = function(config) {
    if(config.cli) {
        config.cli.on('cliSandbox', function(sandbox) {
            sandbox.test = function() {
                sandbox.print('This is the test!');
                return 'Test result';
            };
        });
    }
};