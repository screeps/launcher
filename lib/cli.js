const readline = require('readline');
const net = require('net');
const q = require('q');

module.exports = function cli(host, port, rlInterface) {

    var defer = q.defer();

    var socket = net.connect(port, host);

    socket.on('connect', () => {
        defer.resolve();
        rlInterface.output.write(`Screeps CLI connected on ${host}:${port}.\r\n-----------------------------------------\r\n`);
    });

    rlInterface.on('line', line => {
        socket.write(line+"\r\n");
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