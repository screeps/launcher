var npm = require('npm');
var fs = require('fs');
var path = require('path');

function runNpmCommand(command, args, callback) {
    npm.load({
        loaded: false
    }, (err) => {
        if(err) {
            callback(err);
        }
        npm.commands[command](args, callback);
    });
}

function installNpmModules(modules, callback) {
    runNpmCommand('install', modules.map(i => i+'@latest'), function(err, data) {
        if(err) {
            callback(err);
            return;
        }
        var result = [];
        data.forEach(mod => {
            var [modName,modDir] = mod;

            var modPackage = require(path.resolve(modDir, 'package.json'));

            var jsonFilename = path.resolve('mods.json');

            if(modPackage.screeps_mod || modPackage.screeps_bot) {

                var json;
                try {
                    json = JSON.parse(fs.readFileSync(jsonFilename, {encoding: 'utf8'}));
                }
                catch(e) {
                    if(e.code == 'ENOENT') {
                        json = {};
                    }
                    else {
                        throw e;
                    }
                }

                json.mods = json.mods || [];
                json.bots = json.bots || {};

                if (!modPackage.main) {
                    alert(`Module "${modPackage.name}" has no "main" defined`);
                }
                else {
                    if (modPackage.screeps_mod) {
                        var modMain = path.relative(path.dirname(jsonFilename), path.resolve(modDir, modPackage.main));
                        if (json.mods.indexOf(modMain) === -1) {
                            json.mods.push(modMain);
                        }
                    }
                    if (modPackage.screeps_bot) {
                        var botDir = path.relative(path.dirname(jsonFilename), path.dirname(path.resolve(modDir, modPackage.main)));
                        json.bots[modPackage.name] = botDir;
                    }
                    fs.writeFileSync(jsonFilename, JSON.stringify(json, undefined, 2));
                    result.push(modPackage.name+'@'+modPackage.version);
                }

            }

        });
        callback(null, result);
    });
}