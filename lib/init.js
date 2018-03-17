const ncp = require('ncp').ncp;
const path = require('path');
const fs = require('fs');
const prompt = require('prompt');

function createConfig(dir, steamApiKey) {
    ncp(path.resolve(__dirname, '../init_dist'), dir, (err) => {
        if (err) {
            console.error("Error while creating world data:", err);
        }
        else {
            var configFilename = path.resolve(dir, '.screepsrc');
            var config = fs.readFileSync(configFilename, {encoding: 'utf8'});
            config = config.replace(/{{STEAM_KEY}}/, steamApiKey);
            fs.writeFileSync(configFilename, config);
            fs.chmodSync(path.resolve(dir, 'node_modules/.hooks/install'), '755');
            fs.chmodSync(path.resolve(dir, 'node_modules/.hooks/uninstall'), '755');
            try {
                fs.writeFileSync(path.resolve(dir, 'package.json'), JSON.stringify({
                    name: 'my-screeps-world',
                    version: '0.0.1',
                    private: true
                }, undefined, '  '), {encoding: 'utf8', flag: 'wx'});
            }
            catch(e) {}
            console.log(`Screeps world data created in "${dir}".\nRun "screeps start" to launch your server.`);
        }
    });
};

module.exports = function(dir, steamApiKey) {

    dir = path.resolve(dir);
    try {
        var stat = fs.statSync(dir);
        if (stat && !stat.isDirectory()) {
            console.error(`${dir} is not a directory!`);
            return;
        }
        try {
            stat = fs.statSync(path.resolve(dir, '.screepsrc'));
            if(stat) {
                console.error(`Existing .screepsrc found in this directory!`);
                return;
            }
        }
        catch(e) {}
    }
    catch (e) {
        if (e.code == 'ENOENT') {
            fs.mkdirSync(dir);
        }
        else {
            throw e;
        }
    }

    if(steamApiKey) {
        createConfig(dir, steamApiKey);
    } else {
        prompt.message = 'A Steam Web API key is required to run the server without the Steam client installed.\nYou can obtain a key on this page: https://steamcommunity.com/dev/apikey\n';
        prompt.delimiter = '';
        prompt.start();

        prompt.get([{
            name: 'steamApiKey',
            description: 'Enter your Steam API key:',
            type: 'string'
        }], function(err, results) {

            if(err) {
                console.error(err);
                return;
            }

            createConfig(dir, results.steamApiKey);
        });
    }
};
