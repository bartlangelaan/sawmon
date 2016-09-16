const mongoose = require('mongoose');
const Promise = require('bluebird');

const npmi = Promise.promisify(require('npmi'));

let pluginSchema = mongoose.Schema({
    name: String,
    version: String
});

var Plugin = mongoose.model('Plugin', pluginSchema);


/**
 * @name PluginCategory
 * @type {Object}
 * @property {Function} ping
 */

/**
 * @name Plugin
 * @type {Object}
 * @property {PluginCategory} websites
 * @property {PluginCategory} servers
 */

class PluginManager{
    /**
     * This should only be called once.
     * @returns {Promise}
     */
    initialize(){

        /**
         * Holds the internal array of plugins.
         * @type {Array.<Plugin>}
         * @private
         */
        this._plugins = [];

        this._plugins.push(require('../../plugins/sawmon-server-core'));
        this._plugins.push(require('../../plugins/sawmon-website-core'));

        /**
         * Find all saved plugins
         */
        return Plugin.find().then(plugins => {
            /**
             * Install all saved plugins
             */
            return Promise.map(plugins, plugin => this.addPlugin(plugin));
        });
    }

    /**
     * Installs a plugin, and adds it to the database on success
     */
    addPlugin(plugin){
        console.log('Installing plugin ', plugin);
        return npmi(plugin).then(() => {
            /**
             * Add plugin to internal array
             */
            this._plugins.push(require(plugin.name));

            /**
             * Check if already in database
             */
            if(!plugin._id){
                /**
                 * Get package.json and save in database
                 */
                var modulePackage = require(plugin.name + '/package.json');
                var dbPlugin = new Plugin({
                    name: modulePackage.name,
                    version: modulePackage.version
                });
                return dbPlugin.save().then(() => {
                    console.log('Installed', plugin);
                });
            }
        }).catch(err => {
            console.error('Failed installing plugin', err);
        });
    }

    /**
     * Gets an array of plugins, given a category
     * @param {string} category
     * @returns PluginCategory
     */
    getPlugins(category){
        return this._plugins.filter(plugin => {
            return typeof plugin[category] == 'object';
        }).map(plugin => plugin[category]);
    }

    /**
     * Get all installed plugins, as defined in the database
     * @returns {Promise.<Array.<Object>>}
     */
    getInstalledPlugins(){
        return Plugin.find();
    }
}

module.exports = new PluginManager();