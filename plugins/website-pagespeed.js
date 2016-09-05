'use strict';

const request = require('request-promise');

module.exports.schema = {
    pageSpeedScore: Number
};

module.exports.display = [
    {
        name: 'Google Pagespeed score',
        value: (website) => website.pageSpeedScore ? `${website.pageSpeedScore}%` : null
    }
];

module.exports.ping = website => {
    if(website.status != 200) return;

    return request('https://www.googleapis.com/pagespeedonline/v2/runPagespeed', {
        qs: {
            url: 'http://' + website.domain
        },
        json: true
    }).then(result => {
        if(result && result.ruleGroups && result.ruleGroups.SPEED && result.ruleGroups.SPEED.score){
            website.pageSpeedScore = result.ruleGroups.SPEED.score;
            website.save();
        }
    }).catch(() => {
        // Let it go
    });
};