'use strict';

const debug = require('debug')('sawmon:server');

const Promise = require('bluebird');

const mongoose = require('mongoose');
const getConnection = require('../functions/getConnection');
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

    if (this.refreshStatus.started == true) {

        debug('Tried to start refresh but already running..');

        return Promise.reject('Refresh is already running..');

    }

    debug('Starting refresh');

    this.refreshStatus.running = true;
    this.refreshStatus.started = new Date();

    return this
        .save()
        .then(() => PluginManager.getPromise('servers', 'refresh'))
        .then(() => {

            this.refreshStatus.finished = new Date();
            this.refreshStatus.running = false;
            debug('Refresh done!');

            return this.save();

        });

};

serverSchema.methods.ping = function () {

    if (this.pingStatus.started == true) return Promise.reject('Ping is already running..');

    this.pingStatus.running = true;
    this.pingStatus.started = new Date();

    return this
        .save()
        .then(() => Promise.map(PluginManager.getPlugins('servers'), plugin => {

            if (typeof plugin.ping == 'function')
                return plugin.ping(this, getConnection(this));

            return Promise.resolve();

        }))
        .catch(err => debug('A plugin did\'n t catch all problems. Please report this to the plugin module author.', err))
        .then(() => {

            this.pingStatus.finished = new Date();
            this.pingStatus.running = false;

            return this.save();

        });

};

const Server = mongoose.model('Server', serverSchema);

module.exports = Server;
