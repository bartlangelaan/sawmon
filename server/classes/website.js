'use strict';

var Promise = require('bluebird');
var dns = Promise.promisifyAll(require('dns'));
var platforms = require('../functions/platforms');

class Website{
    
    constructor(config){
        /**
         * The domain of this website
         * @type {string}
         */
        this.domain = config.domain;

        /**
         * The path on the server where the webroot is located
         * @type {string}
         */
        this.root = config.root;

        /**
         * The server this website is hosted
         * @type {Server}
         */
        this.server = config.server;

        /**
         * Is true if the ip address points to the server
         * @type {boolean|undefined}
         */
        this.active = undefined;

        this.errors = [];
    }

    toJSON(){
        return {
            domain: this.domain,
            root: this.root,
            server: this.server.name,
            active: this.active,
            errors: this.errors,
            platform: this.platform ? this.platform.toJSON() : undefined
        }

    }

    refresh(){
        return this.checkIfActive().then(() => {
            return this.setPlatform();
        });
    }

    checkIfActive(){
        return dns.lookupAsync(this.domain).then(ip => {
            this.active = (ip == this.server.ip);
        }).catch({code: 'ENOTFOUND'}, () => {
            this.errors.push("The hostname does not exist");
            this.active = false;
        });
    }

    setPlatform(){
        return Promise
            .reduce(platforms, (prevPlatform, platform) => {
                // First, check if a platform was already detected
                if(prevPlatform) return;

                // Then, test the platform
                return platform.Test(this).then(testResult => {
                    if(testResult) {
                        this.platform = new platform(this, testResult);
                        return true;
                    }
                });
            }, 0);
    }
    
}

module.exports = Website;