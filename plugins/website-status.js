'use strict';

module.exports.ping = (website, response) => {
    console.log('[PING]', website.domain, response.statusCode);
};