'use strict';

const routes = require('./routes/index');
// const refresh = require('./functions/refresh');
// const ping = require('./functions/ping');

// const refreshTime = 60 * 60 * 1000;
// const pingTime = 5 * 60 * 1000;

module.exports = app => {

    app.use('/api', routes);

    // setInterval(refresh, refreshTime);
    // refresh();
    //
    // setInterval(() => ping(pingTime), pingTime);
    // ping(pingTime);

};
