'use strict';

var Website = require('../server/classes/website');
const Promise = require('bluebird');

module.exports.schema = {
    vhosts: String
};

module.exports.display = [
    {
        name: 'Virtual hosts path',
        value: (website) => website.vhosts ? `${website.vhosts}` : null
    }
];

module.exports.fields = [
    {
        name: 'Virtual hosts path',
        key: 'vhosts',
        type: 'text',
        placeholder: '/etc/apache2/sites-enabled'
    }
];

/**
 * Get all apache files in the vhosts folder
 */
module.exports.refresh = (server, ssh) => {
    console.log('[SERVER] [VHOSTS] Getting vhosts..');
    return ssh
        .execCommand('cat *', {
            cwd: server.vhosts
        })
        .then(apacheConfig => {
            /**
             * Parse all apache files
             */
            var virtualHosts = parseApacheConfig(apacheConfig.stdout);

            return Promise.map(virtualHosts, virtualHost => {
                return Promise.map(virtualHost.domains, domain => {

                    var a = {
                        domain: domain,
                        server: server,
                        root: virtualHost.root
                    };

                    console.log('[SERVER] [VHOSTS] Website found:', a.domain);

                    return Website.findOneAndUpdate(a, a, {upsert: true}).exec();
                }, {concurrency: 1});
            }, {concurrency: 1});
        });
};

function parseApacheConfig(apacheConfig){
    // Split all virtual hosts
    var virtualHosts = apacheConfig.split('<VirtualHost');

    // Delete everything before the first virtualhost
    virtualHosts.shift();

    return virtualHosts.map(function(virtualHost){
        var vh = {
            domains: [],
            root: undefined
        };
        virtualHost.split('\n').forEach(function(line){
            var split = line.trim().split(' ');
            if(split[0] == 'ServerName' || split[0] == 'ServerAlias'){
                split.shift();
                Array.prototype.push.apply(vh.domains, split);
            }
            else if(split[0] == 'DocumentRoot'){
                vh.root = split[1];
            }
        });

        if(!vh.root) {
            console.log('No root found!', virtualHost);
        }
        return vh;
    });
}