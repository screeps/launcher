var cp = require('child_process'),
    path = require('path'),
    common = require('@screeps/common'),
    _ = require('lodash'),
    q = require('q'),
    ini = require('ini'),
    fs = require('fs');

module.exports = function start(_opts, output) {

    var opts = {};
    try {
        opts = ini.parse(fs.readFileSync('./.screepsrc', {encoding: 'utf8'}));
    }
    catch(e) {
        if(e.code == 'ENOENT') {
            console.error(`Warning: file .screepsrc not found. Did you run "screeps init" in this directory?`);
        }
    }
    for(var i in _opts) {
        if(_opts[i]) {
            opts[i] = _opts[i];
        }
    }
    if(!opts.moddir) {
        throw new Error('`moddir` option is not defined!')
    }
    if(!opts.assetdir) {
        throw new Error('`assetdir` option is not defined!')
    }

    if(!opts.runners_cnt) {
        opts.runners_cnt = 2;
    }
    if(!opts.processors_cnt) {
        opts.processors_cnt = 2;
    }

    try {
        fs.statSync('./steam_appid.txt');
    }
    catch(e) {
        fs.writeFileSync('./steam_appid.txt', '464350');
    }

    var result = {
        processes: {}
    };

    return q.when()
    .then(() => {
        if(opts.port) {
            result.gamePort = +opts.port;
            return;
        }
        return common.findPort(21025).then(port => result.gamePort = port);
    })
    .then(() => {
        if(opts.cli_port) {
            result.cliPort = +opts.cli_port;
            return;
        }
        return common.findPort(result.gamePort+1).then(port => result.cliPort = port);
    })
    .then(() => common.findPort(result.cliPort+1))
    .then(port => {
        result.storagePort = port;

        if(output) {
            try {
                output.write(`Server build ${require('screeps').screeps_build}\r\n`);
            }
            catch(e) {}
            output.write(`Starting all processes. Ports: ${result.gamePort} (game), ${result.cliPort} (cli)\r\n`);
        }


        var timestamp = Date.now(), stat;

        result.logdir = path.resolve(opts.logdir, ""+timestamp);

        try {
            stat = fs.statSync(opts.logdir);
        }
        catch(e) {
            fs.mkdirSync(opts.logdir);
        }
        if(stat && !stat.isDirectory()) {
            throw new Error(opts.logdir+' is not a directory!');
        }

        fs.mkdirSync(result.logdir);


        function _startProcess(name, execPath, env) {
            var fd = fs.openSync(path.resolve(result.logdir, name+'.log'), 'a');

            result.processes[name] = cp.fork(path.resolve(execPath), {
                stdio: [0, fd, fd, 'ipc'],
                env
            });

            if(output) {
                output.write(`[${name}] process ${result.processes[name].pid} started\r\n` );
            }

            result.processes[name].on('exit', code => {
                if(output) {
                    output.write(`[${name}] process ${result.processes[name].pid} exited with code ${code}, restarting...\r\n` );
                }
                fs.closeSync(fd);
                setTimeout(() => _startProcess(name, execPath, env), 1000);
            });

            return result.processes[name];
        }

        var errorTimeout = setTimeout(() => {
            throw new Error('Could not launch the storage process');
        }, 5000);

        var defer = q.defer();

        var storageProcess = _startProcess('storage',
            path.resolve(path.dirname(require.resolve('@screeps/storage')), '../bin/start.js'), {
            STORAGE_PORT: result.storagePort,
            MOD_DIR: opts.moddir,
            DB_PATH: opts.db
        });

        storageProcess.on('message', message => {
            if(message == 'storageLaunched') {

                clearTimeout(errorTimeout);

                _startProcess('backend',
                    path.resolve(path.dirname(require.resolve('@screeps/backend')), '../bin/start.js'), {
                        GAME_PORT: result.gamePort,
                        GAME_HOST: opts.host,
                        CLI_PORT: result.cliPort,
                        CLI_HOST: opts.cli_host,
                        STORAGE_PORT: result.storagePort,
                        MOD_DIR: opts.moddir,
                        ASSET_DIR: opts.assetdir,
                        SERVER_PASSWORD: opts.password,
                        STEAM_KEY: opts.steam_api_key
                    });

                _startProcess('engine_main',
                    path.resolve(path.dirname(require.resolve('@screeps/engine')), 'main.js'), {
                        STORAGE_PORT: result.storagePort,
                        MOD_DIR: opts.moddir,
                        DRIVER_MODULE: '@screeps/driver'
                    });

                for(var i=1; i<=opts.runners_cnt; i++) {
                    _startProcess('engine_runner'+i,
                        path.resolve(path.dirname(require.resolve('@screeps/engine')), 'runner.js'), {
                            STORAGE_PORT: result.storagePort,
                            MOD_DIR: opts.moddir,
                            DRIVER_MODULE: '@screeps/driver'
                        });
                }

                for(var i=1; i<=opts.processors_cnt; i++) {
                    _startProcess('engine_processor'+i,
                        path.resolve(path.dirname(require.resolve('@screeps/engine')), 'processor.js'), {
                            STORAGE_PORT: result.storagePort,
                            MOD_DIR: opts.moddir,
                            DRIVER_MODULE: '@screeps/driver'
                        });
                }

                defer.resolve(result);
            }
        });

        return defer.promise;
    });
};
