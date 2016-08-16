'use strict';

var Server = require('../classes/server');

module.exports.servers = [];

module.exports.refresh = function(){
    module.exports.servers = require('../../servers.json').servers.map(function (serverSettings) {
        // TODO: Check if this server already exists, refresh if it does or create if it doesn't
        var server = new Server(serverSettings);

        server.refresh();

        return server;
    });
};