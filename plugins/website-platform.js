'use strict';

const Promise = require('bluebird');
const plugins = require('../server/functions/plugins');

module.exports.schema = {
    platform: String,
    updates: [{
        name: String,
        existingVersion: String,
        candidateVersion: String
    }]
};

module.exports.refresh = (website, ssh) => {
    if(!website.platform) return;
    var platform = plugins.platforms.get(website.platform);
    if(platform && typeof platform.refresh == 'function')
        platform.refresh(website, ssh);
};

module.exports.ping = (website, response) => {
    if(!website.platform) return;
    var platform = plugins.platforms.get(website.platform);
    if(platform && typeof platform.ping == 'function')
        platform.ping(website, response);
};