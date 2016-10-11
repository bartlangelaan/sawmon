'use strict';

const mongoose = require('mongoose');
const Promise = require('bluebird');
const debug = require('debug')('sawmon:plugin-manager');
const npmi = Promise.promisify(require('npmi'));
const toposort = require('toposort');

const pluginSchema = mongoose.Schema({
    name: {
        type: String,
        unique: true
    },
    version: String
});

const Plugin = mongoose.model('Plugin', pluginSchema);


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

class PluginManager {

    /**
     * This should only be called once.
     * @returns {Promise}
     */
    initialize () {

        debug('Initializing PluginManager');

        /**
         * Holds the internal array of plugins.
         * @type {Array.<Plugin>}
         * @private
         */
        this._plugins = [
            {
                require: require('../../plugins/core'),
                database: {
                    name: 'core',
                    version: '0.0.0'
                }
            }
        ];

        debug('Finding plugins saved in database');

        return Plugin.find().then(plugins => {

            debug('Installing all saved plugins');

            return Promise.map(plugins, plugin => this.addPlugin(plugin));

        });

    }

    /**
     * Installs a plugin, and adds it to the database on success
     */
    addPlugin (plugin) {

        if (plugin.name.charAt(0) == '.') {

            plugin.localInstall = true;

        }
        debug('Installing plugin %s', plugin.name);

        return npmi(plugin).then(() => {

            const nameToRequire = (plugin.localInstall ? '../../' : '') + plugin.name;
            const pluginInstance = {
                require: require(nameToRequire),
                package: require(`${nameToRequire}/package.json`),
                database: plugin
            };

            /**
             * Add plugin to internal array
             */
            this._plugins.push(pluginInstance);

            this.sortPlugins();

            debug('Installed %s', plugin.name);

            /**
             * Check if already in database
             */
            if (!plugin._id) {


                /**
                 * Get package.json and save in database
                 */
                const modulePackage = require(`${nameToRequire}/package.json`);
                const dbPlugin = new Plugin({
                    name: plugin.name,
                    version: modulePackage.version
                });

                pluginInstance.database = dbPlugin;

                return dbPlugin.save().then(() => {

                    debug('Saved %s', plugin.name);

                });

            }

            return Promise.resolve();

        }).catch(err => {

            debug('Failed installing plugin', err);

        });

    }

    /**
     * This function uses the toposort module to sort all plugins based on their dependencies.
     * So first all the dependencies, then the dependents.
     * @returns {undefined}
     */
    sortPlugins () {

        const edges = [];
        const pluginsByName = {};

        this._plugins.forEach(plugin => {

            const name = plugin.package ? plugin.package.name : plugin.database.name;

            pluginsByName[name] = plugin;

            if (!plugin.require.dependencies) return;

            plugin.require.dependencies.forEach(dependency => {

                edges.push([dependency, name]);

            });

        });

        const sorted = toposort.array(Object.keys(pluginsByName), edges);

        this._plugins = sorted.map(key => pluginsByName[key]);
    }

    removePlugin (pluginId) {

        return Plugin.findOne({_id: pluginId}).exec().then(plugin => {

            // Remove from database
            plugin.remove();

            // Require module
            const nameToRequire = (plugin.localInstall ? '../../' : '') + plugin.name;
            const PluginInstance = require(nameToRequire);

            // Delete from _plugins array
            const index = this._plugins.indexOf(PluginInstance);

            if (index > -1) {

                this._plugins.splice(index, 1);

            }

        });

    }

    /**
     * Gets an array of plugins, given a category
     * @param {string} category
     * @param {boolean} onlyReturnCategory
     * @returns PluginCategory
     */
    getPlugins (category, onlyReturnCategory = true) {

        let plugins = this._plugins;

        if (!plugins) return [];

        /**
         * Filter on category
         */
        if (category) {

            plugins = plugins.filter(plugin =>

                typeof plugin.require[category] == 'object'

            );

        }

        /**
         * Only return the category itself
         */
        if (onlyReturnCategory) {

            plugins = plugins.map(plugin => plugin.require[category]);

        }

        return plugins;

    }

    /**
     * Returns a promise of all plugin promises.
     * @param {string} category
     * @param {string} func
     * @param {object} passTrough
     * @returns Promise
     */
    getPromise (category, func, passTrough) {

        const promises = {};

        this

            /**
             * Get all plugins of this category
             */
            .getPlugins(category, false)

            /**
             * That have the specified function
             */
            .filter(plugin =>

                typeof plugin.require[category][func] == 'function'

            )
            .forEach(plugin => {


                /**
                 * Get all the dependencies as promises
                 */
                const dependencies = plugin.require.dependencies ? plugin.require.dependencies.map(dependency => promises[dependency]) : [];

                /**
                 * Execute this after all dependencies
                 */
                promises[plugin.database.name] = Promise.all(dependencies).then(() => plugin.require[category][func](passTrough));

            });


        /**
         * Resolve all promises
         */
        return Promise
            .all(Object.keys(promises).map(key => promises[key]))
            .catch(err => debug(
                'A plugin did\'n t catch all problems. Please report this to the plugin module author.', err
            ));

    }

    /**
     * Get all installed plugins, as defined in the database
     * @returns {Promise.<Array.<Object>>}
     */
    getInstalledPlugins () {

        return Plugin.find();

    }
}

module.exports = new PluginManager();
