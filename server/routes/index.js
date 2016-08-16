'use strict';

var router = require('express').Router();
var servers = require('../functions/servers');

router.get('/servers', function(req, res){
    res.json(servers.servers.map(server => server.toJSON()));
});

module.exports = router;