var routes = require('./routes/index');

module.exports = app => {

    app.use('/api', routes);

    var servers = require('./functions/servers');
    servers.refresh();
};