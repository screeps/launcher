#!/usr/bin/env node
var lib = require('../lib/index'),
    _ = require('lodash'),
    commander = require('commander'),
    fs = require('fs'),
    ini = require('ini'),
    readline = require('readline'),
    stream = require('stream');

commander.usage('[options] <command>\n\n  Use "screeps <command> --help" to learn about specific command usage.');

commander
    .command('init [<dir>]')
    .description('Create new Screeps world data in the specified folder (current working directory by default).')
    .action(function(dir) {
        lib.init(dir || process.cwd());
    });

commander
    .command('start')
    .description('Start all processes. Launch options can be configured from command line or using the .screepsrc file in the same folder.')
    .option('--db <path>', 'The path to the database file.')
    .option('--logdir <path>', 'The path to directory where logs will be created.')
    .option('--modfile <path>', 'The path to JSON file with the list of custom mods to load. Defaults to mods.json.')
    .option('--assetdir <path>', 'The path to directory where static assets are located.')
    .option('--port <port>', 'The port number on which the game server should listen. Defaults to 21025.')
    .option('--host <host>', 'The hostname on which the game server should listen. Defaults to 0.0.0.0.')
    .option('--password <password>', 'The server password which should be provided on user sign in. Default is empty.')
    .option('--cli_port <port>', 'The port number on which the CLI server should listen. Defaults to port+1.')
    .option('--cli_host <host>', 'The hostname on which the CLI server should listen. Defaults to 127.0.0.1.')
    .option('--runner_threads <num>', 'The number of parallel runner threads in which player scripts are executed. Don\'t set this option greater than the number of your physical CPU cores. Default is 4.')
    .option('--processors_cnt <num>', 'The number of parallel processor worker processes to launch. Don\'t set this option greater than the number of your physical CPU cores. Default is 2.')
    .option('--steam_api_key <key>', 'If you launch the server without running the local Steam client, then the Steam Web API key is required for authenticating users. It can be obtained on this page: http://steamcommunity.com/dev/apikey')
    .option('--log_console', 'If set, forward console messages to terminal. Not set by default.')
    .option('--log_rotate_keep <num>', 'How many log files to keep when rotating. Defaults to 5.')
    .option('--storage_disabled', 'If set, disable built-in storage, useful when you use some other implementation. Not set by default.')
    .option('--restart_interval <seconds>', 'Automatically restart child processes. Defaults to 3600 seconds.')
    .action(function() {

        lib.start(this.opts(), process.stdout).then(result => {
        })
        .catch(err => {
            console.error(err);
            process.exit();
        });

    });

commander
    .command('cli')
    .description('Connect to the CLI interface of the main process.')
    .option('-p, --port <port>', 'Default is 21026', 21026)
    .option('-h, --host <host>', 'Default is localhost', 'localhost')
    .action(function() {

        const rl = readline.createInterface(({
            input: process.stdin,
            output: process.stdout,
            prompt: '> '
        }));

        lib.cli(this.host, this.port, rl);
    });

commander.command('*').action(() => {
    console.log('Unknown command. Type "screeps --help" to get the list of all commands.');
    process.exit();
});

if (process.argv.length === 2) {
    commander.help();
}
else {
    commander.parse(process.argv);
}

