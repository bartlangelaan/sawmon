'use strict';

const Promise = require('bluebird');
const PluginManager = require('../classes/plugin-manager');

const mongoose = require('mongoose');

const websiteSchema = mongoose.Schema(Object.assign(
    ...PluginManager.getPlugins('websites').map(plugin => plugin.schema || {})
));

websiteSchema.plugin(require('mongoose-autopopulate'));

websiteSchema.methods.refresh = function () {

    if (this.refreshStatus.running == true) return Promise.reject('Refresh is already running..');

    this.refreshStatus.running = true;
    this.refreshStatus.started = new Date();

    return this
        .save()
        .then(() => PluginManager.getPromise('websites', 'refresh', {instance: this}))
        .then(() => {

            this.refreshStatus.finished = new Date();
            this.refreshStatus.running = false;

            return this.save();

        });

};

websiteSchema.methods.ping = function () {

    if (this.pingStatus.running == true) return Promise.reject('Ping is already running..');

    this.pingStatus.running = true;
    this.pingStatus.started = new Date();

    return this
        .save()
        .then(() => PluginManager.getPromise('websites', 'ping', {instance: this}))
        .then(() => {

            this.pingStatus.finished = new Date();
            this.pingStatus.running = false;

            return this.save();

        });

};

const Website = mongoose.model('Website', websiteSchema);

module.exports = Website;
