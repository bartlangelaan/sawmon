'use strict';

const nodeSsh = require('node-ssh');
const Queue = require('promise-queue');
const debug = require('debug')('sawmon:get-connection');

const connections = {};

function connect (queue, server, connection) {

    return queue.add(() => {

        debug('Connecting..');

        // Get the private key
        return require('../classes/server').findOne({_id: server._id}).select('+privateKey').exec().then(serverWithPrivateKey =>

            // Connect
            connection.connect({
                host: serverWithPrivateKey.hostname,
                username: serverWithPrivateKey.username,
                privateKey: serverWithPrivateKey.privateKey
            }).then(() => debug('Connected!'))

        );

    });

}

module.exports = server => {

    const serverId = server._id ? server._id.toString() : server.toString();

    if (connections[serverId]) return connections[serverId];

    debug('Creating new server connection for server', server);

    const connection = new nodeSsh();
    const queue = new Queue(1);

    connections[serverId] = {
        execCommand: (...args) =>

            queue.add(() => {

                debug('Executing', ...args);

                return Promise.resolve(connection.execCommand(...args));

            }).catch(err => {


                /**
                 * On error, check if connected to server
                 */
                if (err.message != 'Not connected' && err.message != 'Not connected to server') throw err;

                debug('Not connected anymore, trying to reconnect..');

                /**
                 * Connect, then try again
                 */
                return connect(queue, server, connection).then(() => connection.execCommand(...args));

            })
    };

    connect(queue, server, connection);

    return connections[serverId];

};
