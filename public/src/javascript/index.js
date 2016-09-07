var $ = require('jquery');
require('expose?$!expose?jQuery!jquery');
require('bootstrap/dist/js/bootstrap.js');
require('datatables.net');


$.getJSON('api/websites').then(function(data){
    $("#websites").DataTable(Object.assign(data, {
        ajax: {
            url: 'api/websites'
        }
    }));
});
$.getJSON('api/servers').then(function(data){
    $("#servers").DataTable(Object.assign(data, {
        ajax: {
            url: 'api/servers'
        }
    }));
});

/**
 * App
 */
function refresh() {
    $("#websites").DataTable().ajax.reload(null, false);
    $("#servers").DataTable().ajax.reload(null, false);
}

setInterval(refresh, 1000);