'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const PluginManager = require('./plugin-manager');

class SettingsManager {

    get (key) {

        const setting = PluginManager.getArray('settings').filter(set => (set.key === key))[0];

        if (!setting) return Promise.resolve(null);

        return Promise.resolve(setting.default);

    }

}

module.exports = new SettingsManager();
