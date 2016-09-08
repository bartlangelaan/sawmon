/**
 * An array of objects, defining the fields displayed in the table
 */
module.exports.display = [
    {
        name: 'Domain',
        value: (website) => website.domain ? `${website.domain}` : null
    },
    {
        name: 'Webroot',
        value: (website) => website.root ? `${website.root}` : null
    },
    {
        name: 'Server',
        value: (website) => website.server.name ? `${website.server.name}` : null
    },
    {
        name: 'Platform',
        value: (website) => website.platform ? `${website.platform}` : null
    },
    {
        name: 'Active',
        value: (website) => website.active ? 'yes' : 'no'
    },
    {
        name: 'Actions',
        value: (website) =>
            `<a href="api/websites/${website._id}/refresh" class='btn btn-default btn-sm' target="iframe" onclick="this.classList.add('disabled')">Refresh</a>` +
            `<a href="api/websites/${website._id}/ping" class='btn btn-default btn-sm' target="iframe" onclick="this.classList.add('disabled')">Ping</a>`
    }
];