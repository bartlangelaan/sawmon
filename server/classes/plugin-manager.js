'use strict';

const mongoose = require('mongoose');
const Promise = require('bluebird');
const debug = require('debug')('sawmon:plugin-manager');
const npmi = Promise.promisify(require('npmi'));
const toposort = require('toposort');


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
    initialize (plugins) {

        debug('Initializing PluginManager');

        /**
         * Holds the internal array of plugins.
         * @type {Array.<Plugin>}
         * @private
         */
        this._plugins = plugins;
        this._plugins.unshift(require('../../plugins/core'));

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

                typeof plugin[category] === 'object'

            );

        }

        /**
         * Only return the category itself
         */
        if (onlyReturnCategory) {

            plugins = plugins.map(plugin => plugin[category]);

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

                typeof plugin[category][func] == 'function'

            )
            .forEach(plugin => {


                /**
                 * Get all the dependencies as promises
                 */
                const dependencies = plugin.dependencies ? plugin.dependencies.map(dependency => promises[dependency]) : [];

                /**
                 * Execute this after all dependencies
                 */
                promises[this.getName(plugin)] = Promise.all(dependencies).then(() => plugin[category][func](passTrough)).catch(err => {

                    debug('The plugin %s didn\'t catch all problems. Please report this to the plugin module author.', plugin.database.name);
                    debug('The error the plugin generated: ', err);

                });

            });


        /**
         * Resolve all promises
         */
        return Promise
            .all(Object.keys(promises).map(key => promises[key]))
            .catch();

    }

    getAll (...path) {

        return this.getPlugins(null, false).map(plugin =>
            path.reduce(
                (plug, property) => {

                    if (!plug) return null;

                    return plug[property];

                },
                plugin
            )
        ).filter(pluginProperty => pluginProperty);

    }

    getArray (...path) {

        return this.getAll(...path).reduce((a, b) => a.concat(b), []);

    }

    getObject (...path) {

        return Object.assign({}, ...this.getAll(...path));

    }
}

module.exports = new PluginManager();
