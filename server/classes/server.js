'use strict';

var node_ssh = require('node-ssh');
var Promise = require('bluebird');
var dns = Promise.promisifyAll(require('dns'));
var parseApacheConfig = require('../functions/parse-apache-config');
var Website = require('./website');
const mongoose = require('mongoose');
const getConnection = require('../functions/getConnection');

var serverSchema = mongoose.Schema({
    name: String,
    hostname: String,
    username: String,
    privateKey: String,
    vhosts: String,
    ip: String
});

serverSchema.methods.refresh = function(){
    console.log(this.name, "--> Refreshing IP address..");
    return this.refreshIp().then(ip => {
        console.log(this.name, "--> IP adress:", ip);
        console.log(this.name, "--> Refreshing vhosts..");
        return this.refreshVhosts();
    }).then(() => {
        console.log(this.name, "--> Done.");
    });
};

serverSchema.methods.refreshIp = function(){
    return dns
        .lookupAsync(this.hostname)
        .then(ip => {
            this.ip = ip;
            this.save();
            return ip;
        }).catch(err => {
            console.error(err);
        });
};

serverSchema.methods.refreshVhosts = function() {

    /**
     * Get all apache files in the vhosts folder
     */
    return getConnection(this)
        .execCommand('cat *', {
            cwd: this.vhosts
        }).then(apacheConfig => {
        /**
         * Parse all apache files
         */
        var virtualHosts = parseApacheConfig(apacheConfig.stdout);

        return Promise.map(virtualHosts, virtualHost => {
            return Promise.map(virtualHost.domains, domain => {

                var a = {
                    domain: domain,
                    server: this,
                    root: virtualHost.root
                };

                return Website.findOneAndUpdate(a, a, {upsert: true}).exec();
            }, {concurrency: 1})
        }, {concurrency: 1});
    });
};


serverSchema.methods.ping = function(){
    console.log('PING!', this.name);
    return Promise.resolve();
};

var Server = mongoose.model('Server', serverSchema);

module.exports = Server;