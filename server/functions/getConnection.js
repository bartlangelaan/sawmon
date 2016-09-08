'use strict';

var node_ssh = require('node-ssh');
const Queue = require('promise-queue');

var connections = {};

function connect(queue, server, connection){
    return queue.add(() => {
        return connection.connect({
            host: server.hostname,
            username: server.username,
            privateKey: require('fs').readFileSync(server.privateKey).toString()
        });
    });
}

module.exports = server => {
    var serverId = server._id ? server._id.toString() : server.toString();
    if(connections[serverId]) return connections[serverId];

    console.log('Creating new server connection for server',server);

    var connection = new node_ssh();
    var queue = new Queue(1);

    connections[serverId] = {
        execCommand: (...args) => {
            return queue.add(() => {
                return Promise.resolve(connection.execCommand(...args))
                    .catch(err => {
                        /**
                         * When error, check if connected to server
                         */
                        if(err.message != 'Not connected to server') throw err;

                        /**
                         * Connect, then try again
                         */
                        return connect(queue, server, connection).then(() => {
                            return connection.execCommand(...args);
                        });
                    });
            });
        }
    };

    connect(queue, server, connection);

    return connections[serverId];
};