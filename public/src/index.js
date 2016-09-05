'use strict';

var $ = require('jquery');
require( 'datatables.net' );


$.getJSON('api/websites').then(function(data){
    $('#websites').DataTable(Object.assign(data, {
        ajax: {
            url: 'api/websites'
        }
    }));
});
$.getJSON('api/servers').then(function(data){
    $('#servers').DataTable(data);
});

/**
 * App
 */
function refresh() {
    $('#websites').DataTable().ajax.reload();
}

setInterval(refresh, 1000);