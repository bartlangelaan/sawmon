'use strict';

const glob = require('glob');

/**
 * All platforms available for testing
 */
module.exports.platforms = new Map([
    ['Drupal', require('./../../plugins/platform-drupal')],
    ['Custom', require('../classes/platform')]
]);

/**
 * All website plugins
 */
module.exports.websites = [];
glob("plugins/**/website-*.js", {}, (error, files) => {
    files.forEach(file =>
        module.exports.websites.push(require('../../' + file))
    );
});
