var cp = require('child_process'),
    path = require('path'),
    common = require('@screeps/common'),
    _ = require('lodash'),
    q = require('q'),
    ini = require('ini'),
    fs = require('fs');


const DEFAULTS = {
    modfile: 'mods.json',
    runners_cnt: 2,
    processors_cnt: 2,
    storage_timeout: 5000,
    storage_enabled: true,
    log_console: false,
    log_rotate_keep: 5,
    restart_interval: 3600
}

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
    opts = Object.assign({}, DEFAULTS, opts);
    for(var i in _opts) {
        if(_opts[i]) {
            opts[i] = _opts[i];
        }
    }
    if(!opts.assetdir) {
        throw new Error('`assetdir` option is not defined!')
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
    .then(() => {
        if(opts.storage_port) {
            result.storagePort = +opts.storage_port;
            return;
        }
        return common.findPort(result.cliPort+1).then(port => result.storagePort = port);
    })
    .then(() => {
        if(output) {
            try {
                output.write(`Server version ${require('screeps').version}\r\n`);
            }
            catch(e) {}
            output.write(`Starting all processes. Ports: ${result.gamePort} (game), ${result.cliPort} (cli)\r\n`);
        }

        var timestamp = Date.now(), stat;

        try {
            stat = fs.statSync(opts.logdir);
        }
        catch(e) {
            fs.mkdirSync(opts.logdir);
        }
        if(stat && !stat.isDirectory()) {
            throw new Error(opts.logdir+' is not a directory!');
        }

        function rotateLogs (logPath) {
            for(let i = opts.log_rotate_keep; i > 1; i--) {
                let oldName = `${logPath}.${i - 1}`
                let newName = `${logPath}.${i}`
                try {
                    fs.renameSync(oldName, newName)
                } catch(e) {}
            }
            try {
                fs.renameSync(logPath, `${logPath}.1`)
            } catch(e) {}
        }

        function _startProcess(name, execPath, env, restartInterval = 0) {
            let logPath = path.resolve(opts.logdir, name+'.log')
            rotateLogs(logPath)
            
            var str = fs.createWriteStream(logPath, 'utf-8');

            result.processes[name] = cp.fork(path.resolve(execPath), {
                stdio: [0, 'pipe', 'pipe', 'ipc'],
                env
            });
            result.processes[name].stdout.pipe(str);
            result.processes[name].stderr.pipe(str);

            if (opts.log_console) {
                result.processes[name].stdout.on('data', data => output.write(`[${name}] ${data.toString()}`))
                result.processes[name].stderr.on('data', data => output.write(`[${name}] ${data.toString()}`))
            }

            if(output) {
                output.write(`[${name}] process ${result.processes[name].pid} started\r\n` );
            }

            if (restartInterval) {
                setTimeout(() => result.processes[name].kill(), restartInterval * 1000)
            }

            result.processes[name].on('exit', code => {
                if(output) {
                    output.write(`[${name}] process ${result.processes[name].pid} exited with code ${code}, restarting...\r\n` );
                }
                str.close();
                setTimeout(() => _startProcess(name, execPath, env), result.processes[name].killed ? 1 : 1000);
            });

            return result.processes[name];
        }

        function _waitForLaunch (storageProcess) {
            return new Promise((resolve, reject) => {
                var errorTimeout = setTimeout(() => {
                    reject(new Error('Could not launch the storage process'));
                }, opts.storage_timeout);

                let handler = (msg) => {
                    if (msg === 'storageLaunched') {
                        clearTimeout(errorTimeout)
                        storageProcess.removeListener('message', handler);
                        resolve();
                    }
                };
                storageProcess.on('message', handler);
            })
        }

        let prom = q.when()
        if (opts.storage_enabled) {
            let storageProcess = _startProcess('storage',
                path.resolve(path.dirname(require.resolve('@screeps/storage')), '../bin/start.js'), {
                STORAGE_PORT: result.storagePort,
                MODFILE: opts.modfile,
                DB_PATH: opts.db
            })
            prom = prom.then(() => _waitForLaunch(storageProcess))
        }
        return prom.then(() => {
            _startProcess('backend',
                path.resolve(path.dirname(require.resolve('@screeps/backend')), '../bin/start.js'), {
                    GAME_PORT: result.gamePort,
                    GAME_HOST: opts.host,
                    CLI_PORT: result.cliPort,
                    CLI_HOST: opts.cli_host,
                    STORAGE_PORT: result.storagePort,
                    MODFILE: opts.modfile,
                    ASSET_DIR: opts.assetdir,
                    SERVER_PASSWORD: opts.password,
                    STEAM_KEY: opts.steam_api_key
                });

            _startProcess('engine_main',
                path.resolve(path.dirname(require.resolve('@screeps/engine')), 'main.js'), {
                    STORAGE_PORT: result.storagePort,
                    MODFILE: opts.modfile,
                    DRIVER_MODULE: '@screeps/driver'
                });

            for(var i=1; i<=opts.runners_cnt; i++) {
                _startProcess('engine_runner'+i,
                    path.resolve(path.dirname(require.resolve('@screeps/engine')), 'runner.js'), {
                        STORAGE_PORT: result.storagePort,
                        MODFILE: opts.modfile,
                        DRIVER_MODULE: '@screeps/driver'
                    });
            }

            for(var i=1; i<=opts.processors_cnt; i++) {
                _startProcess('engine_processor'+i,
                    path.resolve(path.dirname(require.resolve('@screeps/engine')), 'processor.js'), {
                        STORAGE_PORT: result.storagePort,
                        MODFILE: opts.modfile,
                        DRIVER_MODULE: '@screeps/driver'
                    });
            }
        });
    });
};
