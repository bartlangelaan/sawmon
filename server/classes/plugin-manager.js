const mongoose = require('mongoose');

const npmi = require('bluebird').promisify(require('npmi'));

let pluginSchema = mongoose.Schema({
    package: String,
    version: String
});

var Plugin = mongoose.model('Plugin', pluginSchema);


class PluginManager{
    /**
     * This should only be called once
     */
    initialize(){
        return Plugin.find().then(plugins => {
            this._plugins = plugins.map(plugin => plugin.toJSON());
            if(this._plugins.length <= 1){
                return this.addPlugin({name: './plugins/sawmon-website-core', localInstall: true}).then(() => {
                    return this.addPlugin({name: './plugins/sawmon-server-core', localInstall: true});
                });
            }
        });
    }

    /**
     * Installs a plugin, and adds it to the database on success
     */
    addPlugin(plugin){
        console.log('Installing plugin ', plugin);
        return npmi(plugin).then(() => {
            var module = require((plugin.localInstall ? '../../' : '') + plugin.name);
            this._plugins.push(module);
        }).catch(err => {
            console.error('Failed installing plugin', err);
        });
    }

    /**
     * Gets an array of plugins, given a category
     * @param category
     */
    getPlugins(category){
        return this._plugins.filter(plugin => {
            return typeof plugin[category] == 'object';
        }).map(plugin => plugin[category]);
    }
}

module.exports = new PluginManager();