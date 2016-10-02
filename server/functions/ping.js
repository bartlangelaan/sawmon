'use strict';

const Server = require('../classes/server');
const Website = require('../classes/website');

module.exports = time => {

    Server
        .find()
        .then(servers => {

            servers.forEach(server =>
                server.ping()
            );

        });

    Website
        .find({active: true})
        .then(websites => {

            if (!websites) return;

            const timePerWebsite = time / websites.length;
            let startTime = 0;

            websites.forEach(website => {

                setTimeout(() => website.ping(), startTime);
                startTime += timePerWebsite;

            });

        });

};
