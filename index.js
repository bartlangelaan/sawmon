var express = require('express');
var path = require('path');
const chalk = require('chalk');
const mongoose = require('mongoose');
const mongo_express = require('mongo-express/lib/middleware');
const bodyParser = require('body-parser');

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

app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded());

require('./server')(app);

var mongo_express_config = require('mongo-express/config.default.js');
mongo_express_config.mongodb.auth = [{
    database: 'sawmon'
}];
mongo_express_config.site.useBasicAuth = false;

app.use('/mongo', mongo_express(mongo_express_config));

app.use(function(err, req, res) {
    if(err.stack){
        console.error(err.stack);
        res.sendStatus(500);
    }
    else{
        req.sendStatus(404);
    }
});