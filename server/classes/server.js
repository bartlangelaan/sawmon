'use strict';

var Promise = require('bluebird');

const mongoose = require('mongoose');
const getConnection = require('../functions/getConnection');
var PluginManager = require('../classes/plugin-manager');

var serverSchema = mongoose.Schema(Object.assign({
    name: String,
    hostname: String,
    username: String,
    privateKey: {
        type: String,
        select: false
    }
}, ...PluginManager.getPlugins('servers').map(plugin => {
    if(plugin.schema) return plugin.schema;
    return {};
})));

serverSchema.methods.refresh = function(){
    return Promise.map(PluginManager.getPlugins('servers'), plugin => {
        if(typeof plugin.refresh == 'function')
            return plugin.refresh(this, getConnection(this));
    }, {concurrency: 1});
};

serverSchema.methods.ping = function(){
    return Promise.map(PluginManager.getPlugins('servers'), plugin => {
        if(typeof plugin.ping == 'function')
            return plugin.ping(this, getConnection(this));
    });
};

var Server = mongoose.model('Server', serverSchema);

module.exports = Server;