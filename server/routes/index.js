'use strict';

var router = require('express').Router();

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

function createRoutes(singular, plural){

    var DBModel = require('../classes/' + singular);

    router.get('/' + plural, (req, res) => {
        DBModel.find().then(models => res.json(
            convertToDataTable(models, plugins[plural])
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

    router.get('/' + plural, (req, res) => {
        DBModel.findOne({_id: req.params.id}).then(model => res.json(
            convertToDataTable([model], plugins[plural])
        ));
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

    router.get('/' + plural + '/fields', (req, res) => {
        res.json([].concat.apply([],
            plugins[plural].map(plugin =>
                plugin.fields ? plugin.fields : []
            )
        ));
    });
}

createRoutes('server', 'servers');
createRoutes('website', 'websites');

module.exports = router;