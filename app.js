var express = require('express');
var path = require('path');
var logger = require('morgan');
var nunjucks = require('nunjucks');
var bodyParser = require('body-parser');
var expressValidator = require('express-validator');


var app = express();

// view engine setup
nunjucks.configure('views', {
    autoescape: true,
    express: app
});

app.use(logger('dev'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({extended: true}));


var indexController = require('./routes/index');
var aboutController = require('./routes/about');
var eventControllers = require('./routes/events');
app.get('/', indexController);
app.get('/about', aboutController);
app.get('/events', eventControllers.listEvents);
app.get('/events/new', eventControllers.newEvent);
app.post('/events/new', eventControllers.saveEvent);


var server = app.listen(3000, function() {
    console.log('Listening on port %d', server.address().port);
});