module.exports.servers = {};

/**
 * An array of objects, defining the fields that can be edited.
 * Also shown when creating a new item
 */
module.exports.servers.fields = [
    {
        name: 'Name',
        key: 'name',
        type: 'text',
        placeholder: 'Server #459'
    },
    {
        name: 'Hostname',
        key: 'hostname',
        type: 'text',
        placeholder: 'server459.example.com'
    },
    {
        name: 'Username',
        key: 'username',
        type: 'text',
        placeholder: 'example'
    },
    {
        name: 'Private key',
        key: 'privateKey',
        type: 'textarea',
        placeholder: '-----BEGIN RSA PRIVATE KEY-----\nMIICWgIBAAKBgE8/Mu5DFlbyNuUoTktDTd0gqAXvvJJ0RrTteAJYeC8hMJsoegT5...'
    }
];

/**
 * An array of objects, defining the fields displayed in the table
 */
module.exports.servers.display = [
    {
        name: 'Name',
        value: server => server.name
    },
    {
        name: 'Hostname',
        value: server => server.hostname
    },
    {
        name: 'Username',
        value: server => server.username
    },
    {
        name: 'Actions',
        value: (server) =>
        `<a href="api/servers/${server._id}/refresh" class='btn btn-default btn-sm' target="iframe" onclick="this.classList.add('disabled')">Refresh</a>` +
        `<a href="api/servers/${server._id}/ping" class='btn btn-default btn-sm' target="iframe" onclick="this.classList.add('disabled')">Ping</a>` +
        `<a href='#' class='btn btn-default btn-sm edit-item' data-item-type='server' data-item-id="${server._id}">Edit</a>`
    }
];