'use strict';

module.exports.schema = {
    status: Number,
    responseTime: Number
};

module.exports.display = [
    {
        name: "Response code",
        value: (website) => website.status ? `${website.status}` : null
    }
];

module.exports.ping = (website, response) => {
    console.log('[PING]', website.domain, response.elapsedTime);
    website.status = response.statusCode;
    website.responseTime = response.elapsedTime / 1000;
    website.save();
};