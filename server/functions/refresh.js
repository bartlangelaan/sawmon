'use strict';

var Server = require('../classes/server');
var Website = require('../classes/website');

module.exports = () => {
    Server.find().then(servers => {
        servers.forEach(server => server.refresh().then(() => {
            Website.find({server: server._id}).then(websites => websites.forEach(website => website.refresh()));
        }));
    });
};