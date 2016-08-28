/**
 * All platforms available for testing
 * @type {Platform[]}
 */

module.exports = new Map([
    ['Drupal', require('./drupal')],
    ['Custom', require('../../classes/platform')]
]);