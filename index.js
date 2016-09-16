'use strict';

var express = require('express');
var path = require('path');
const chalk = require('chalk');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const PluginManager = require('./server/classes/plugin-manager');

/**
 * Connect to database
 */
const dbUrl = 'mongodb://localhost/sawmon';
console.log(`Connecting to database ${dbUrl}..`);

mongoose.connect(dbUrl).then(() => {
    console.log('Connected to database.');
    console.log('Installing all plugins..');
    return PluginManager.initialize();
}).then(() => {

    console.log('All plugins installed.');

    /**
     * Create the server
     */
    var app = express();
    var port = process.env.PORT || 3000;
    console.log('Starting application on port ' + port);
    app.listen(port);

    app.use(express.static(path.join(__dirname, 'public')));

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded());

    require('./server')(app);

    app.use(function(err, req, res) {
        if(err.stack){
            console.error(err.stack);
            res.sendStatus(500);
        }
        else{
            req.sendStatus(404);
        }
    });

}).catch(e => {
    console.error(e);
});