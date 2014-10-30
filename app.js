// Import our requirements
var express = require('express');
var path = require('path');
var logger = require('morgan');
var nunjucks = require('nunjucks');
var bodyParser = require('body-parser');

// Create our express app
var app = express();

// Configure our templating engine: nunjucks
nunjucks.configure('views', {
    autoescape: true,
    express: app
});

// Use 'development' level of logging, ie. verbose
app.use(logger('dev'));

// Serve images, css, and client-side js about of the
// directory named 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Parse the body of incoming requests by default.
// This means we can access the parameters of submitted
// forms and such.
app.use(bodyParser.urlencoded({extended: true}));

// Import our controllers
var indexControllers = require('./controllers/index');
var aboutControllers = require('./controllers/about');
var eventControllers = require('./controllers/events');

// Add routes mapping URLs to controllers
app.get('/', indexControllers.index);
app.get('/about', aboutControllers.about);
app.get('/events', eventControllers.listEvents);
app.get('/events/new', eventControllers.newEvent);
app.post('/events/new', eventControllers.saveEvent);

module.exports = app
