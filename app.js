var express = require('express');
var path = require('path');
var logger = require('morgan');
var nunjucks = require('nunjucks');

var app = express();

// view engine setup
nunjucks.configure('views', {
    autoescape: true,
    express: app
});

app.use(logger('dev'));
app.use(express.static(path.join(__dirname, 'public')));


var indexController = require('./routes/index');
var aboutController = require('./routes/about');
var eventsController = require('./routes/events');
app.get('/', indexController);
app.get('/about', aboutController);
app.get('/events', eventsController);


// module.exports = app;
var server = app.listen(3000, function() {
    console.log('Listening on port %d', server.address().port);
});