'use strict';

const Promise = require('bluebird');
const dns = Promise.promisifyAll(require('dns'));
const PluginManager = require('../classes/plugin-manager');
const getConnection = require('../functions/getConnection');
const request = require('request-promise');
const ActionStatus = require('./action-status');

const mongoose = require('mongoose');

const websiteSchema = mongoose.Schema(Object.assign({
    domain: String,
    root: String,
    server: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Server',
        autopopulate: true
    },
    platform: String,
    active: Boolean,
    pingStatus: {
        type: ActionStatus,
        default: {}
    },
    refreshStatus: {
        type: ActionStatus,
        default: {}
    }
}, ...PluginManager.getPlugins('websites').map(plugin => {

    if (plugin.schema) return plugin.schema;
    return {};

})));

websiteSchema.plugin(require('mongoose-autopopulate'));

websiteSchema.methods.refresh = function () {

    if (this.refreshStatus.started == true) return Promise.reject('Refresh is already running..');

    this.refreshStatus.running = true;
    this.refreshStatus.started = new Date();

    return this
        .save()
        .then(() => PluginManager.getPromise('websites', 'refresh'))
        .then(() => {

            this.refreshStatus.finished = new Date();
            this.refreshStatus.running = false;
            return this.save();

        });

};

websiteSchema.methods.ping = function () {

    if (this.pingStatus.started == true) return Promise.reject('Refresh is already running..');

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

            return {statusCode: err.error.code == 'ETIMEDOUT' ? 408 : 520};

        })
        .then(res => PluginManager.getPromise('websites', 'refresh', {instance: this, response: res}))
        .then(() => {

            this.pingStatus.finished = new Date();
            this.pingStatus.running = false;
            return this.save();

        });

};

const Website = mongoose.model('Website', websiteSchema);

module.exports = Website;
