'use strict';

const node_ssh = require('node-ssh');
const Queue = require('promise-queue');

const connections = {};

function connect (queue, server, connection) {

    return queue.add(() => {

        console.log('Connecting..');
        // Get the private key
        return require('../classes/server').findOne({_id: server._id}).select('+privateKey').exec().then(server => {

            // Connect
            return connection.connect({
                host: server.hostname,
                username: server.username,
                privateKey: server.privateKey
            }).then(() => console.log('Connected!'));

        });

    });

}

module.exports = server => {

    const serverId = server._id ? server._id.toString() : server.toString();
    if (connections[serverId]) return connections[serverId];

    console.log('Creating new server connection for server', server);

    const connection = new node_ssh();
    const queue = new Queue(1);

    connections[serverId] = {
        execCommand: (...args) => {

            return queue.add(() => {

                console.log('Executing', ...args);
                return Promise.resolve(connection.execCommand(...args));

            }).catch(err => {


                /**
                 * On error, check if connected to server
                 */
                if (err.message != 'Not connected' && err.message != 'Not connected to server') throw err;

                console.log('Not connected anymore, trying to reconnect..');

                /**
                 * Connect, then try again
                 */
                return connect(queue, server, connection).then(() => {

                    return connection.execCommand(...args);

                });

            });

        }
    };

    connect(queue, server, connection);

    return connections[serverId];

};
