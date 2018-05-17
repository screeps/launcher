const net = require('net');
const q = require('q');
const fs = require('fs');
const path = require('path');
const os = require('os');

module.exports = function cli(host, port, rlInterface) {

    var defer = q.defer();

    var historyFile = path.join(os.homedir(), '.screeps-history');
    try {
        rlInterface.history = JSON.parse(fs.readFileSync(historyFile));
    } catch (err) {}

    var socket = net.connect(port, host);

    socket.on('connect', () => {
        defer.resolve();
        rlInterface.output.write(`Screeps CLI connected on ${host}:${port}.\r\n-----------------------------------------\r\n`);
    });

    rlInterface.on('line', line => {
        socket.write(line+"\r\n");
    });

    rlInterface.on('close', () => {
        fs.writeFileSync(historyFile, JSON.stringify(rlInterface.history));
    });

    socket.on('data', data => {
        data = data.toString('utf8');
        rlInterface.output.write(data.replace(/^< /, '').replace(/\n< /, ''));
        if(/^< /.test(data) || /\n< /.test(data)) {
            rlInterface.prompt();
        }
    });

    socket.on('error', error => {
        defer.reject(error);
    });

    return defer.promise;
};
