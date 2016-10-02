'use strict';

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const PluginManager = require('./server/classes/plugin-manager');

mongoose.Promise = require('bluebird');

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

    require('./server/classes/server').update({}, {$set: {'refreshStatus.running': false, 'pingStatus.running': false}}, {multi: true}).exec();
    require('./server/classes/website').update({}, {$set: {'refreshStatus.running': false, 'pingStatus.running': false}}, {multi: true}).exec();


    /**
     * Create the server
     */
    const app = express();
    const port = process.env.PORT || 3000;
    console.log('Starting application on port ' + port);
    app.listen(port);

    app.use(express.static(path.join(__dirname, 'public')));

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded());

    require('./server')(app);

    app.use(function (err, req, res) {

        if (err.stack) {

            console.error(err.stack);
            res.sendStatus(500);

        }
        else {

            req.sendStatus(404);

        }

    });

}).catch(e => {

    console.error(e);

});
