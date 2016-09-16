'use strict';

var router = require('express').Router();

var PluginManager = require('../classes/plugin-manager');

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

function createRoutes(singular, plural){

    var DBModel = require('../classes/' + singular);

    router.get('/' + plural, (req, res) => {
        DBModel.find().then(models => res.json(
            convertToDataTable(models, PluginManager.getPlugins(plural))
        ));
    });

    router.post('/' + plural, (req, res) => {
        new DBModel(req.body).save().then(() => {
            res.sendStatus(204);
        }).catch(err => {
            res.status(400).json({
                error: err
            });
        });
    });

    router.get('/' + plural + '/fields', (req, res) => {
        res.json([].concat.apply([],
            PluginManager.getPlugins(plural).map(plugin =>
                plugin.fields ? plugin.fields : []
            )
        ));
    });

    router.get('/' + plural + '/:id', (req, res) => {
        DBModel.findOne({_id: req.params.id}).then(model => res.json(
            req.query.parsed ? convertToDataTable([model], PluginManager.getPlugins(plural)) : model
        )).catch(() => res.sendStatus(404));
    });

    router.post('/' + plural + '/:id', (req, res) => {
        DBModel.update({_id: req.params.id}, req.body).then(() => {
            res.sendStatus(204);
        }).catch(err => {
            res.status(400).json({
                error: err
            });
        });
    });

    router.get('/' + plural + '/:id/ping', (req, res) => {
        DBModel.findOne({_id: req.params.id}).then(model => {
            model.ping();
            res.sendStatus(204);
        });
    });

    router.get('/' + plural + '/:id/refresh', (req, res) => {
        DBModel.findOne({_id: req.params.id}).then(model => {
            model.refresh();
            res.sendStatus(204);
        });
    });
}

createRoutes('server', 'servers');
createRoutes('website', 'websites');

module.exports = router;