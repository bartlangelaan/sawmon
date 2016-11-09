'use strict';

const routes = require('./routes/index');
const CronjobManager = require('./classes/cronjob-manager');

module.exports = app => {

    app.use('/api', routes);

    /**
     * Make sure all servers and websites are refreshed every x seconds
     */
    setInterval(() => {

        CronjobManager.run();

    }, 1 * 1000);

};
