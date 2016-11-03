'use strict';

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const PluginManager = require('./server/classes/plugin-manager');
const debug = require('debug')('sawmon:init');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);

mongoose.Promise = require('bluebird');

/**
 * Create the server
 */
const app = express();
const port = process.env.PORT || 3000;

debug(`Starting application on port ${port}`);
app.listen(port);

/**
 * Connect to database
 */
const dbUrl = process.env.MONGODB_URI || 'mongodb://localhost/sawmon';

debug(`Connecting to database ${dbUrl}..`);

mongoose.connect(dbUrl).then(() => {

    debug('Connected to database.');
    debug('Installing all plugins..');

    return PluginManager.initialize();

}).then(() => {

    /* eslint max-statements: 0 */

    debug('All plugins installed.');

    require('./server/classes/server').update({}, {
        $set: {
            'refreshStatus.running': false,
            'pingStatus.running': false
        }
    }, {multi: true}).exec();

    require('./server/classes/website').update({}, {
        $set: {
            'refreshStatus.running': false,
            'pingStatus.running': false
        }
    }, {multi: true}).exec();

    app.use(require('cookie-parser')());
    app.use(session({
        resave: true,
        saveUninitialized: true,
        store: new MongoStore({mongooseConnection: mongoose.connection}),
        secret: 'very secret'
    }));

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended: true}));

    const middleware = PluginManager.getPlugins(null, false)
        .filter(plugin => plugin.require.middleware)
        .map(plugin => plugin.require.middleware);

    if (middleware.length) {

        app.use(middleware);

    }

    app.use(express.static(path.join(__dirname, 'public')));

    require('./server')(app);

    app.use((err, req, res) => {

        if (err.stack) {

            debug(err.stack);
            res.sendStatus(500);

        } else {

            req.sendStatus(404);

        }

    });

}).catch(error => {

    debug(error);

});
