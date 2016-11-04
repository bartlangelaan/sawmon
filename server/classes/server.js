'use strict';

const Promise = require('bluebird');

const mongoose = require('mongoose');
const PluginManager = require('../classes/plugin-manager');
const ActionStatus = require('./action-status');

const serverSchema = mongoose.Schema(Object.assign({
    name: String,
    hostname: String,
    username: String,
    privateKey: {
        type: String,
        select: false
    },
    pingStatus: {
        type: ActionStatus,
        default: {}
    },
    refreshStatus: {
        type: ActionStatus,
        default: {}
    }
}, ...PluginManager.getPlugins('servers').map(plugin => {

    if (plugin.schema) return plugin.schema;

    return {};

})));

serverSchema.methods.refresh = function () {

    if (this.refreshStatus.running == true) return Promise.reject('Refresh is already running..');

    this.refreshStatus.running = true;
    this.refreshStatus.started = new Date();

    return this
        .save()
        .then(() => PluginManager.getPromise('servers', 'refresh', {instance: this}))
        .then(() => {

            this.refreshStatus.finished = new Date();
            this.refreshStatus.running = false;

            return this.save();

        });

};

serverSchema.methods.ping = function () {

    if (this.pingStatus.running == true) return Promise.reject('Ping is already running..');

    this.pingStatus.running = true;
    this.pingStatus.started = new Date();

    return this
        .save()
        .then(() => PluginManager.getPromise('servers', 'ping', {instance: this}))
        .then(() => {

            this.pingStatus.finished = new Date();
            this.pingStatus.running = false;

            return this.save();

        });

};

const Server = mongoose.model('Server', serverSchema);

module.exports = Server;
