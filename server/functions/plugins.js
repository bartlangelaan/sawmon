/**
 * All platforms available for testing
 * @type {Platform[]}
 */

module.exports.platforms = new Map([
    ['Drupal', require('./../../plugins/platform-drupal')],
    ['Custom', require('../classes/platform')]
]);