var Promise = require('bluebird');

class Platform{

    /**
     * Initializes the Platform
     * @param {Website} website
     */
    constructor(website){
        /**
         * The name of the platform
         * @type {string}
         */
        this.name = "Custom";

        /**
         * Stores the website for further use.
         * @type {Website}
         * @private
         */
        this._website = website;

        this.updates = [];
    }

    toJSON(){
        return {
            name: this.name,
            updates: this.updates
        }
    }

    /**
     * Checks if the website is built on this platform
     * @param {Website} website
     * @returns {Promise.<boolean>}
     * @constructor
     */
    static Test(website){
        return Promise.resolve(true);
    }
}

module.exports = Platform;