'use strict';

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const PluginManager = require('./server/classes/plugin-manager');
const debug = require('debug')('sawmon:init');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);

const status = {
    error: false,
    db: false,
    plugins: false,
    express: false
};

mongoose.Promise = require('bluebird');

/**
 * Create the server
 */
const app = express();
const port = process.env.PORT || 3000;

debug(`Starting application on port ${port}`);
app.listen(port);

app.use((req, res, next) => {

    if (status.express) return next();

    return res.send(`
<pre>
SAWMON LOADER

[X] Binding to port ${port}
[${status.db ? 'X' : ' '}] Connecting to MongoDB
[${status.plugins ? 'X' : ' '}] Installing plugins
[${status.express ? 'X' : ' '}] Load all Express middleware

${status.error ? status.error : ''}
</pre>
<script>
setTimeout(function(){
   window.location.reload(1);
}, 200);
</script>
`);

});

/**
 * Connect to database
 */
const dbUrl = process.env.MONGODB_URI || 'mongodb://localhost/sawmon';

debug(`Connecting to database ${dbUrl}..`);

mongoose.connect(dbUrl).then(() => {

    status.db = true;

    debug('Connected to database.');
    debug('Installing all plugins..');

    return PluginManager.initialize();

}).then(() => {

    /* eslint max-statements: 0 */

    status.plugins = true;

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

    status.express = true;

}).catch(error => {

    status.error = error.message;

    debug(error);

});
