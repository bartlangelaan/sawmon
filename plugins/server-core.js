/**
 * An array of objects, defining the fields that can be edited.
 * Also shown when creating a new item
 */
module.exports.fields = [
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
        type: 'text',
        placeholder: './id_dsa'
    }
];