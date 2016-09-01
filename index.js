var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var http = require('http');
const chalk = require('chalk');
const mongoose = require('mongoose');
const mongo_express = require('mongo-express/lib/middleware');

/**
 * Create the server
 */
var app = express();
var port = process.env.PORT || 3000;
console.log(chalk.green('Starting application on port '+chalk.green.underline(port)+'..'));
app.listen(port);

/**
 * Connect to database
 */
const dbUrl = 'mongodb://localhost/sawmon';
console.log(chalk.green('Connecting to database '+chalk.green.underline(dbUrl)+'..'));
mongoose.connect(dbUrl);

//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
//app.use(logger('dev'));
app.use(express.static(path.join(__dirname, 'public')));

require('./server')(app);

var mongo_express_config = require('mongo-express/config.default.js');
mongo_express_config.mongodb.auth = [{
    database: 'sawmon'
}];
mongo_express_config.site.useBasicAuth = false;

app.use('/mongo', mongo_express(mongo_express_config));

// error handlers
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.json({
        message: err.message,
        error: err
    });
});
