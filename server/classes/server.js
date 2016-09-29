'use strict';

var Promise = require('bluebird');

const mongoose = require('mongoose');
const getConnection = require('../functions/getConnection');
var PluginManager = require('../classes/plugin-manager');
const ActionStatus = require('./action-status');

var serverSchema = mongoose.Schema(Object.assign({
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
    if(plugin.schema) return plugin.schema;
    return {};
})));

serverSchema.methods.refresh = function(){
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

serverSchema.methods.ping = function(){
    if (this.started == true) return Promise.reject('Ping is already running..');

    this.pingStatus.running = true;
    this.pingStatus.started = new Date();

    return this
        .save()
        .then(() => Promise.map(PluginManager.getPlugins('servers'), plugin => {
            if(typeof plugin.ping == 'function')
                return plugin.ping(this, getConnection(this));
        }))
        .catch(err => console.error('A plugin did\'n t catch all problems. Please report this to the plugin module author.',err))
        .then(() => {
            this.pingStatus.finished = new Date();
            this.pingStatus.running = false;
            return this.save();
        });
};

var Server = mongoose.model('Server', serverSchema);

module.exports = Server;