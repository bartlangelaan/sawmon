'use strict';

var Server = require('../classes/server');
var Website = require('../classes/website');
var Promise = require('bluebird');

module.exports = () => {
    Server.find().then(servers => {
        servers.forEach(server => server.refresh().then(() => {
            Website.find({server: server._id}).then(websites => websites.forEach(website => website.refresh()))
        }));
    });
};