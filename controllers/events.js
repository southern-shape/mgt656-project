'use strict';

var events = require('../models/events');
var validator = require('validator');

/**
 * Controller that renders a list of events in HTML.
 */
function listEvents(request, response) {
  var currentTime = new Date();
  var contextData = {
    'events': events.all,
    'time': currentTime
  };
  response.render('event.html', contextData);
}

/**
 * Controller that renders a page for creating new events.
 */
function newEvent(request, response){
  console.log(request.body);
  var contextData = {};
  response.render('create-event.html', contextData);
}

/**
 * Controller to which new events are submitted.
 * Validates the form and adds the new event to
 * our global list of events.
 */
function saveEvent(request, response){
  var contextData = {};
  var submittedTitle = request.body.title;

  if (validator.isLength(submittedTitle, 5, 100) === true) {
    var newEvent = {
      title: submittedTitle,
      location: 'NOT YET SET',
      image: null,
      attending: []
    };
    events.all.push(newEvent);
    response.redirect('/events');
  }else{
    contextData.errors = ['Your title should be between 5 and 100 letters.'];
    response.render('create-event.html', contextData);
  }
}


/**
 * Export all our functions (controllers in this case, because they
 * handles requests and render responses).
 */
module.exports = {
  'listEvents': listEvents,
  'eventDetail': null,
  'newEvent': newEvent,
  'saveEvent': saveEvent
};