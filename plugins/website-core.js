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
    }
];