var $ = require('jquery');

var serverTemplate = require('./sites-template.handlebars');
var websiteTemplate = require('./websites-template.handlebars');

var lastResponseServer;
var lastResponseWebsite;
function refresh(){
    $.getJSON('api/servers').then(function(servers){
        if(lastResponseServer == JSON.stringify(servers)) return;
        lastResponseServer = JSON.stringify(servers);
        console.log(servers);
        $("#servers").html(serverTemplate(servers));
    });

    $.getJSON('api/websites').then(function(servers){
        if(lastResponseWebsite == JSON.stringify(servers)) return;
        lastResponseWebsite = JSON.stringify(servers);
        console.log(servers);
        $("#websites").html(websiteTemplate(servers));
    });
}

setInterval(refresh, 1000);
refresh();