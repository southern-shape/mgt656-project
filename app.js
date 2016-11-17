'use strict';

// Import our express and our configuration
var express = require('express');
var configure = require('./config.js');

// Import our controllers
var indexControllers = require('./controllers/index.js');
var aboutControllers = require('./controllers/about.js');
var eventControllers = require('./controllers/events.js');


// Create our express app
var app = express();

// Configure it
configure(app);


// Add routes mapping URLs to controllers
app.get('/', indexControllers.index);
app.get('/about', aboutControllers.about);
app.get('/events', eventControllers.listEvents);
app.get('/events/new', eventControllers.newEvent);
app.post('/events/new', eventControllers.saveEvent);
app.get('/events/:id([0-9]+)', eventControllers.eventDetail); 
app.post('/events/:id([0-9]+)', eventControllers.rsvp);
app.get('/api/events', eventControllers.api);

app.get('/x1', function(request, response){
    response.sendfile('weekly-reports/report1_10_13.html', {root: __dirname });
});

app.get('/x2', function(request, response){
    response.sendfile('weekly-reports/report2_10_27.html', {root: __dirname });
});

app.get('/x3', function(request, response){
    response.sendfile('weekly-reports/report3_11_03.html', {root: __dirname });
});

app.get('/x4', function(request, response){
    response.sendfile('weekly-reports/report4_11_10.html', {root: __dirname });
});

app.get('/x4', function(request, response){
    response.sendfile('weekly-reports/report5_11_17.html', {root: __dirname });
});

module.exports = app;