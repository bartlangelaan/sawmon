'use strict';

var node_ssh = require('node-ssh');
const Queue = require('promise-queue');

var connections = {};

module.exports = server => {
    var serverId = server._id ? server._id.toString() : server.toString();
    if(connections[serverId]) return connections[serverId];

    var connection = new node_ssh();
    var queue = new Queue(1);

    connections[serverId] = {
        execCommand: (...args) => {
            return queue.add(() => {
                return connection.execCommand(...args);
            });
        }
    };



    queue.add(() => {
        return connection.connect({
            host: server.hostname,
            username: server.username,
            privateKey: require('fs').readFileSync(server.privateKey).toString()
        });
    });

    return connections[serverId];
};