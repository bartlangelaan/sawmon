'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const PluginManager = require('./plugin-manager');

const settingsSchema = Schema({
    key: String,
    value: Schema.Types.Mixed
});

const Setting = mongoose.model('Setting', settingsSchema);

class SettingsManager {

    get (key) {

        return Setting.findOne({key}).exec().then(result => {

            if (!result) {

                const setting = PluginManager.getArray('settings').filter(set => (set.key == key))[0];

                if (!setting) return null;

                return setting.default;

            }

            return result.value;
        });

    }

    // update (data) {
    //
    // }

}

module.exports = new SettingsManager();
