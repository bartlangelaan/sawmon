'use strict';

var Promise = require('bluebird');
var dns = Promise.promisifyAll(require('dns'));
var platforms = require('../functions/platforms');

const mongoose = require('mongoose');

var websiteSchema = mongoose.Schema({
    domain: String,
    root: String,
    server: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Server',
        autopopulate: true
    },
    platform: String,
    active: Boolean
});

websiteSchema.plugin(require('mongoose-autopopulate'));

websiteSchema.methods.refresh = function(){
    return this.checkIfActive().then(() => {
        if(!this.platform)
            return this.refreshPlatform();
    });
};

websiteSchema.methods.checkIfActive = function(){
    return dns.lookupAsync(this.domain).then(ip => {
        this.active = (ip == this.server.ip);
    }).catch({code: 'ENOTFOUND'}, () => {
        this.active = false;
    }).catch(err => {
        console.error(err);
        console.log(err);
        this.active = false;
    }).then(() =>
        this.save()
    );
};

websiteSchema.methods.refreshPlatform = function(){
    return Promise
        .reduce(platforms, (prevPlatform, platform) => {
            // First, check if a platform was already detected
            if(prevPlatform) return;

            // Then, test the platform
            return platform[1].Test(this).then(testResult => {
                if(testResult) {
                    this.platform = platform[0];
                    this.save();
                    return true;
                }
            });
        }, 0);
};

var Website = mongoose.model('Website', websiteSchema);

module.exports = Website;