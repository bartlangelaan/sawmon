'use strict';

var router = require('express').Router();
var servers = require('../functions/servers');

router.get('/', function(req, res){
    res.json({
        servers: servers.servers.map(server => server.toJSON())
    });
});

module.exports = router;