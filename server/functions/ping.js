'use strict';

var Server = require('../classes/server');
var Website = require('../classes/website');
var Promise = require('bluebird');

module.exports = (time) => {
    Server
        .find()
        .then(servers => {
            servers.forEach(server =>
                server.ping()
            )
        });

    Website
        .find({active: true})
        .then(websites => {
            if(!websites) return;

            var timePerWebsite = time / websites.length;
            var startTime = 0;

            websites.forEach(website =>{
                setTimeout(() => website.ping(), startTime);
                startTime += timePerWebsite;
            });
        });
};