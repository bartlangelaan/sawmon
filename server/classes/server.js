'use strict';

var node_ssh = require('node-ssh');
var Promise = require('bluebird');

const mongoose = require('mongoose');
const getConnection = require('../functions/getConnection');
var plugins = require('../functions/plugins');

var serverSchema = mongoose.Schema(Object.assign({
    name: String,
    hostname: String,
    username: String,
    privateKey: String
}, ...plugins.servers.map(plugin => {
    if(plugin.schema) return plugin.schema;
    return {};
})));

serverSchema.methods.refresh = function(){
    return Promise.map(plugins.servers, plugin => {
        if(typeof plugin.refresh == "function")
            return plugin.refresh(this, getConnection(this));
    }, {concurrency: 1});
};

serverSchema.methods.ping = function(){
    return Promise.map(plugins.servers, plugin => {
        if(typeof plugin.ping == "function")
            return plugin.ping(this, getConnection(this));
    });
};

var Server = mongoose.model('Server', serverSchema);

module.exports = Server;