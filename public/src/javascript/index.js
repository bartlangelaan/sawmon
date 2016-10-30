/* eslint-disable */
'use strict';

const $ = require('jquery');

require('expose?$!expose?jQuery!jquery');
require('bootstrap/dist/js/bootstrap.js');
require('datatables.net');
require('datatables.net-bs');
require('datatables.net-colreorder');
require('datatables.net-buttons');
require('datatables.net-buttons-bs');
require('datatables.net-buttons/js/buttons.colVis.js');


$.getJSON('api/websites').then(function (data) {

    if(!data || !data.columns){
        $('#websites').text('No websites added. Please add a website and refresh this page!');
        return;
    }
    $('#websites').DataTable(Object.assign(data, {
        ajax: {url: 'api/websites'},
        buttons: ['colvis'],
        colReorder: true,
        dom: 'l<"row"<"col-sm-6"B><"col-sm-6"f>>' +
        '<"row"<"col-sm-12"tr>>' +
        '<"row"<"col-sm-5"i><"col-sm-7"p>>'
    }));

});
$.getJSON('api/servers').then(function (data) {

    if(!data || !data.columns){
        $('#websites').text('No servers added. Please add a server and refresh this page!');
        return;
    }

    $('#servers').DataTable(Object.assign(data, {
        ajax: {url: 'api/servers'},
        buttons: ['colvis'],
        colReorder: true,
        dom: 'l<"row"<"col-sm-6"B><"col-sm-6"f>>' +
        '<"row"<"col-sm-12"tr>>' +
        '<"row"<"col-sm-5"i><"col-sm-7"p>>'
    }));

});

/**
 * App
 */
function refresh () {

    $('#websites').DataTable().ajax.reload(null, false);
    $('#servers').DataTable().ajax.reload(null, false);
    $.ajax('api/plugins').then(plugins => {

        $('#plugins-table').html(plugins.map(plugin =>
            `<tr><td>${plugin.name}</td>` +
            `<td>${plugin.version}</td>` +
            `<td><a href="api/plugins/${plugin._id}/delete" class='btn btn-default btn-sm' target="iframe" onclick="this.classList.add('disabled')">Delete</a></td></tr>`
        ));

    });

}

setInterval(refresh, 1000);


$('.container').on('click', '.edit-item', function () {

    $('#editor-modal').modal('show');
    const $button = $(this);

    $('#editor-modal').find('.modal-title').text(
        ($button.data('itemId') ? 'Edit ' : 'New ') +
        $button.data('itemType')
    );

    $('#editor-submit').text($button.data('itemId') ? 'Edit' : 'Create');

    /**
     * Get all fields for this item type
     */
    $.getJSON('api/' + $button.data('itemType') + 's/fields').then(function (fields) {

        /**
         * Print fields
         */
        $('#editor-fields').html(
            fields.map(function (field) {

                const random = Array(5 + 1).join((Math.random().toString(36) + '00000000000000000').slice(2, 18)).slice(0, 5);

                const inputs = {
                    'textarea': () => `<textarea rows="3" class="form-control ${field.secret ? 'secret' : ''}" name="${field.key}" placeholder="${field.placeholder}" ${field.secret ? 'readonly' : ''}>${field.secret ? '[click to edit]' : ''}</textarea>`,
                    'default': () => `<input type="${field.type}" class="form-control ${field.secret ? 'secret' : ''}" name="${field.key}" id="${field.key + random}" placeholder="${field.placeholder}" ${field.secret ? 'readOnly value="[click to edit]"' : ''}>`
                };
                return `<div class="form-group">
                            <label for="${field.key + random}" class="col-sm-3 control-label">${field.name}</label>
                            <div class="col-sm-9">
                                ${(inputs[field.type] || inputs['default'])()}
                            </div>
                        </div>`;

            })
        );

        /**
         * When editing an item, load existing data
         */
        if ($button.data('itemId')) {

            $.getJSON('api/' + $button.data('itemType') + 's/' + $button.data('itemId')).then(function (fields) {

                const editor = $('#editor')[0];
                Object.keys(fields).forEach(function (field) {

                    if (editor[field]) editor[field].value = fields[field];

                });

            });

        }

    });

    let url = 'api/' + $button.data('itemType') + 's';
    if ($button.data('itemId')) {

        url = 'api/' + $button.data('itemType') + 's/' + $button.data('itemId');

    }

    $('#editor').attr('action', url);

    return false;

});

$('#editor').submit(function () {

    const $this = $(this);
    const $alert = $this.find('.alert');

    /**
     * Make all secret inputs disabled, so they won't update
     */
    $('.secret', this).attr('disabled', true);

    /**
     * Hide the error alert
     */
    $alert.hide();

    /**
     * Get all data
     */
    const data = $this.serializeArray().reduce(function (obj, item) {

        obj[item.name] = item.value;
        return obj;

    }, {});

    /**
     * Do the request
     */
    $.ajax({
        data,
        dataType: 'json',
        method: $this.attr('method'),
        url: $this.attr('action')
    }).done(function () {

        /**
         * When successful, close model and reset form
         */
        $('#editor-modal').one('hidden.bs.modal', function () {

            $('#editor-fields').html('');

        }).modal('hide');

    }).fail(function (data) {

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

$('#editor-modal').on('click', '.secret', function () {

    $(this).removeClass('secret').val('').removeAttr('readOnly');

});
