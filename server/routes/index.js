'use strict';

var router = require('express').Router();
var Server = require('../classes/server');
var Website = require('../classes/website');

var servers = router.route('/servers');
var websites = router.route('/websites');

var plugins = require('../functions/plugins');

function convertToDataTable(data, plugins){
    var dt = {
        columns: []
    };
    dt.data = data.map(item =>
        /**
         * For each item (website / server)
         */
        plugins.reduce((displayData, plugin) => {
            /**
             * For each plugin, check if there is a display array
             */
            if (plugin.display) {
                return plugin.display.reduce((displayData, displayMode) => {
                    /**
                     * For every display item,
                     */
                    displayData[displayMode.name] = displayMode.value(item);

                    if(dt.columns.indexOf(displayMode.name) == -1){
                        dt.columns.push(displayMode.name);
                    }

                    return displayData;
                }, displayData);
            }
            return displayData;
        }, {})
    );
    dt.columns = dt.columns.map(function(column){
        return {title: column, data: column};
    });
    return dt;
}

servers.get(function(req, res){
    Server.find().then(servers => res.json(
        convertToDataTable(servers, plugins.servers)
    ));
});

websites.get(function(req, res){
    Website.find().then(websites => res.json(
       convertToDataTable(websites, plugins.websites)
   ));
});

module.exports = router;