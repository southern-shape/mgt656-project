var events = require('../models/events');
var validator = require('validator');


function listEvents(request, response) {
  var currentTime = new Date();
  var contextData = {
    'events': events,
    'time': currentTime
  };
  response.render('event.html', contextData);
}

function newEvent(request, response){
  console.log(request.body);
  var contextData = {};
  response.render('create-event.html', contextData);
}

function saveEvent(request, response){
  var contextData = {};
  var submittedTitle = request.body['title'];

  if (validator.isLength(submittedTitle, 5, 100) === true) {
    var newEvent = {
      'title': submittedTitle,
      'location': 'NOT YET SET',
      'attending': []
    };
    events.push(newEvent);
    response.redirect('/events');
  }else{
    contextData.errors = ["Your title should be between 5 and 100 letters."];
    response.render('create-event.html', contextData);
  };
}

module.exports = {
  'listEvents': listEvents,
  'eventDetail': null,
  'newEvent': newEvent,
  'saveEvent': saveEvent
}