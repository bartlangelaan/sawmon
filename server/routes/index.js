'use strict';

var router = require('express').Router();
var Server = require('../classes/server');
var Website = require('../classes/website');

router.get('/', function(req, res){
    var servers;

    Server.find().then(s => {
        servers = s;
        return Website.find()
    }).then(websites =>
        res.json({
            servers: servers,
            websites: websites
        })
    );
});

module.exports = router;