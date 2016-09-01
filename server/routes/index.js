'use strict';

var router = require('express').Router();
var Server = require('../classes/server');
var Website = require('../classes/website');

var servers = router.route('/servers');
var websites = router.route('/websites');

servers.get(function(req, res){
    Server.find().then(servers => res.json({
        servers
    }));
});

websites.get(function(req, res){
   Website.find().then(websites => res.json({
       websites
   }));
});

module.exports = router;