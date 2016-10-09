'use strict';

const Schema = require('mongoose').Schema;

module.exports = new Schema({
    running: Boolean,
    started: Date,
    finished: Date
});
