'use strict';

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
        placeholder: '-----BEGIN RSA PRIVATE KEY-----\nMIICWgIBAAKBgE8/Mu5DFlbyNuUoTktDTd0gqAXvvJJ0RrTteAJYeC8hMJsoegT5...',
        secret: true
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
        value: server =>
        `<a href="api/servers/${server._id}/refresh" class='btn btn-default btn-sm ${server.refreshStatus.running ? 'disabled' : ''}' target="iframe" onclick="this.classList.add('disabled')">Refresh</a>` +
        `<a href="api/servers/${server._id}/ping" class='btn btn-default btn-sm ${server.pingStatus.running ? 'disabled' : ''}'' target="iframe" onclick="this.classList.add('disabled')">Ping</a>` +
        `<a href='#' class='btn btn-default btn-sm edit-item' data-item-type='server' data-item-id="${server._id}">Edit</a>`
    }
];

module.exports.websites = {};

/**
 * An array of objects, defining the fields that can be edited.
 * Also shown when creating a new item
 */
module.exports.websites.fields = [
    {
        name: 'Domain',
        key: 'domain',
        type: 'text',
        placeholder: 'www.example.com'
    }
];

/**
 * An array of objects, defining the fields displayed in the table
 */
module.exports.websites.display = [
    {
        name: 'Domain',
        value: website => (website.domain ? `${website.domain}` : null)
    },
    {
        name: 'Webroot',
        value: website => (website.root ? `${website.root}` : null)
    },
    {
        name: 'Server',
        value: website => (website.server.name ? `${website.server.name}` : null)
    },
    {
        name: 'Platform',
        value: website => (website.platform ? `${website.platform}` : null)
    },
    {
        name: 'Active',
        value: website => (website.active ? 'yes' : 'no')
    },
    {
        name: 'Actions',
        value: website =>
        `<a href="api/websites/${website._id}/refresh" class='btn btn-default btn-sm ${website.refreshStatus.running ? 'disabled' : ''}' target="iframe" onclick="this.classList.add('disabled')">Refresh</a>` +
        `<a href="api/websites/${website._id}/ping" class='btn btn-default btn-sm ${website.pingStatus.running ? 'disabled' : ''}' target="iframe" onclick="this.classList.add('disabled')">Ping</a>`
    }
];