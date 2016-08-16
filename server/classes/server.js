'use strict';

var node_ssh = require('node-ssh');
var Promise = require('bluebird');
var dns = Promise.promisifyAll(require('dns'));
var parseApacheConfig = require('../functions/parse-apache-config');
var Website = require('./website');

class Server{
    constructor(config){
        this.config = config;
        this._ssh = new node_ssh();
        this.websites = [];
    }

    toJSON(){
        return {
            config: this.config,
            websites: this.websites.map(website => website.toJSON())
        }
    }

    refresh(){
        console.log(this.config.name, "--> Refreshing IP address..");
        this.getIp().then(ip => {
            console.log(this.config.name, "--> IP adress:", ip);
            console.log(this.config.name, "--> Connecting with SSH..");
            return this.connect();
        }).then(() => {
            console.log(this.config.name, "--> Connected!");
            console.log(this.config.name, "--> Getting all websites");
            return this.getWebsites();
        }).then(() => {
            console.log(this.config.name, "--> Done. Disconnecting..");
            return this.disconnect();
        });
    }

    getIp(){
        if(this._ip){
            return Promise.resolve(this._ip);
        }

        var self = this;
        return dns
            .lookupAsync(this.config.host)
            .then((ip) => {
                self.ip = ip;
                return ip;
            })
    }

    connect(){
        return this._ssh.connect({
            host: this.config.host,
            username: this.config.username,
            privateKey: require('fs').readFileSync(this.config.privateKey).toString()
        });
    }

    disconnect(){
        return this._ssh.end();
    }

    getWebsites(){
        /**
         * Get all .conf files in the vhosts folder
         */
        return this._ssh.execCommand('cat *conf', {
            cwd: this.config.vhosts
        }).then(apacheConfig => {
            /**
             * Parse all conf files
             */
            var virtualHosts = parseApacheConfig(apacheConfig.stdout);

            /**
             * Clear all sites
             */
            this.websites = [];

            return Promise.map(virtualHosts, virtualHost => {
                return Promise.map(virtualHost.domains, domain => {

                    // TODO: Check if website already exists
                    var website = new Website({
                        domain: domain,
                        server: this,
                        root: virtualHost.root
                    });
                    this.websites.push(website);

                    return website.refresh();
                }, {concurrency: 1})
            }, {concurrency: 1});
        })
    }
}

module.exports = Server;