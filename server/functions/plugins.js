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
module.exports.websites = glob.sync('plugins/**/website-*.js').map(file =>
    require('../../' + file)
);

/**
 * All website plugins
 */
module.exports.servers = glob.sync('plugins/**/server-*.js').map(file =>
    require('../../' + file)
);
