'use strict';

var $ = require('jquery');
require('expose?$!expose?jQuery!jquery');
require('bootstrap/dist/js/bootstrap.js');
require('datatables.net');
require('datatables.net-bs');


$.getJSON('api/websites').then(function(data){
    $('#websites').DataTable(Object.assign(data, {
        ajax: {
            url: 'api/websites'
        }
    }));
});
$.getJSON('api/servers').then(function(data){
    $('#servers').DataTable(Object.assign(data, {
        ajax: {
            url: 'api/servers'
        }
    }));
});

/**
 * App
 */
function refresh() {
    $('#websites').DataTable().ajax.reload(null, false);
    $('#servers').DataTable().ajax.reload(null, false);
}

setInterval(refresh, 1000);

$('#newServer').submit(function(){
    var $this = $(this);
    var $alert = $this.find('.alert');

    /**
     * Hide the error alert
     */
    $alert.hide();

    /**
     * Get all data
     */
    var data = $this.serializeArray().reduce(function(obj, item) {
        obj[item.name] = item.value;
        return obj;
    }, {});

    /**
     * Do the request
     */
    $.ajax({
        data: data,
        dataType: 'json',
        method: $this.attr('method'),
        url: $this.attr('action')
    }).done(function(){

        /**
         * When successful, close model and reset form
         */
        $this.closest('.modal').one('hidden.bs.modal', function(){
            $this[0].reset();
        }).modal('hide');

    }).fail(function(data){

        /**
         * When unsuccessful, show the error alert
         */
        $alert.text(data.responseJSON.error).show();

    });

    /**
     * Prevent form from submitting
     */
    return false;
});