'use strict';

const Promise = require('bluebird');
const dns = Promise.promisifyAll(require('dns'));

module.exports.refresh = (server, ssh) => {
    return dns
        .lookupAsync(server.hostname)
        .then(ip => {
            server.ip = ip;
            console.log('[SERVER] [REFRESH IP]', ip);
            server.save();
        }).catch(err => {
            console.error('[SERVER] [REFRESH IP] Error', err.code);
        });
};