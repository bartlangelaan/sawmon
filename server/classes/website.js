'use strict';

var Promise = require('bluebird');
var dns = Promise.promisifyAll(require('dns'));
var PluginManager = require('../classes/plugin-manager');
var getConnection = require('../functions/getConnection');
var request = require('request-promise');
const ActionStatus = require('./action-status');

const mongoose = require('mongoose');

var websiteSchema = mongoose.Schema(Object.assign({
    domain: String,
    root: String,
    server: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Server',
        autopopulate: true
    },
    platform: String,
    active: Boolean,
    pingStatus: ActionStatus,
    refreshStatus: ActionStatus
}, ...PluginManager.getPlugins('websites').map(plugin => {
    if(plugin.schema) return plugin.schema;
    return {};
})));

websiteSchema.plugin(require('mongoose-autopopulate'));

websiteSchema.methods.refresh = function(){
    return this.checkIfActive().then(() => {
        //return this.refreshPlatform();
    }).then(() => {
        // return Promise.map(plugins.websites, plugin => {
        //     if(typeof plugin.refresh == 'function')
        //         return plugin.refresh(this, getConnection(this.server));
        // });
    });
};

websiteSchema.methods.checkIfActive = function(){
    return dns.lookupAsync(this.domain.replace('*', 'star')).then(ip => {
        this.active = (ip == this.server.ip);
    }).catch({code: 'ENOTFOUND'}, () => {
        this.active = false;
    }).catch(err => {
        console.log('[IP CHECK] ERROR', err.code, 'checking', this.domain);
        this.active = false;
    }).then(() =>
        this.save()
    );
};

websiteSchema.methods.refreshPlatform = function(){
    if (this.started == true) return Promise.reject('Refresh is already running..');

    this.refreshStatus.running = true;
    this.refreshStatus.started = new Date();

    return this
        .save()
        .then(() => Promise.reduce(PluginManager.getPlugins('platforms'), (prevPlatform, platform) => {
            // First, check if a platform was already detected
            if(prevPlatform) return;

            // Then, test the platform
            return platform[1].test(this, getConnection(this.server)).then(testResult => {
                if(testResult) {
                    this.platform = platform[0];
                    this.save();
                    return true;
                }
            });
        }, 0))
        .catch(err => console.error('A plugin did\'n t catch all problems. Please report this to the plugin module author.',err))
        .then(() => {
            this.refreshStatus.finished = new Date();
            this.refreshStatus.running = false;
            return this.save();
        });
};

websiteSchema.methods.ping = function(){
    console.log('[PING]', this.domain, 'START');
    if (this.started == true) return Promise.reject('Ping is already running..');

    this.pingStatus.running = true;
    this.pingStatus.started = new Date();

    return this
        .save()
        .then(() => request({
            uri: 'http://' + this.domain,
            resolveWithFullResponse: true,
            time: true
        }))
        .catch(err => {
            return {
                statusCode: (err.error.code == 'ETIMEDOUT') ? 408 : 520
            };
        })
        .then(res => {
            return Promise.map(PluginManager.getPlugins('websites'), plugin => {
                if(typeof plugin.ping == 'function')
                    return plugin.ping(this, res);
            });
        })
        .then(() => {
            console.log('[PING]', this.domain, 'DONE');
        })
        .catch(err => console.error('A plugin did\'n t catch all problems. Please report this to the plugin module author.',err))
        .then(() => {
            this.pingStatus.finished = new Date();
            this.pingStatus.running = false;
            return this.save();
        });
};

var Website = mongoose.model('Website', websiteSchema);

module.exports = Website;