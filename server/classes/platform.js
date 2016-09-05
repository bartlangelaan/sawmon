'use strict';

var Promise = require('bluebird');

module.exports.test = () => {
    return Promise.resolve(true);
};