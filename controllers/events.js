'use strict';

var events = require('../models/events');
var validator = require('validator');

// Date data that would be useful to you
// completing the project These data are not
// used a first.
//

var allowedDateInfo = {
  months: {
    0: 'January',
    1: 'February',
    2: 'March',
    3: 'April',
    4: 'May',
    5: 'June',
    6: 'July',
    7: 'August',
    8: 'September',
    9: 'October',
    10: 'November',
    11: 'December'
  },
  minutes: [0, 30],
  hours: [
    0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11,
    12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23
  ]
};




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
  var contextData = {};
  response.render('create-event.html', contextData);
}

// Custom function to do a couple of checks.. ha ha ha  :P
function checkIntRange(request, fieldName, minVal, maxVal, contextData){
  var value = null;
  if (validator.isInt(request.body[fieldName]) == false) {
    contextData.errors.push('Your ' + fieldName + 'should be an integer');
  }else{
    value = parseInt (request.body[fieldName], 10);
    if (value > maxVal || value < minVal) {
    contextData.errors.push('Your ' + [fieldName] + 'should be between' + minVal + 'and' + maxVal);
    }
  }
  return value;
}


// Custom function To fix should redirect the user to the event detail page if the form is valid
// Essentially we figured a way to pass the next Id
function getNewId (){
  var maxId = 0;
  var allEvents = events.all;
  for (var i = allEvents.length - 1; i >= 0; i--) {
    if (maxId < allEvents[i].id){
      maxId = allEvents[i].id;
    }
  }
   maxId++;
   return maxId;
}



/**
 * Controller to which new events are submitted.
 * Validates the form and adds the new event to
 * our global list of events.
 */
function saveEvent(request, response){
  var contextData = {errors: []};

  if (validator.isLength(request.body.title, 5, 50) === false) {
    contextData.errors.push('Your title should be between 5 and 100 letters.');
  }
  
  if (validator.isURL(request.body.image) === false) {
    contextData.errors.push('Your image should be a URL Dude!');
  }
  
  if (validator.matches(request.body.image, /\.(png|gif)$/) === false) {
    contextData.errors.push('Your image should be a PNG or GIF!');
  }
  
  if (validator.isLength(request.body.location, 1, 50) === false) {
    contextData.errors.push('Your location is empty or too long. Fix it!');
  }
  
  var year = checkIntRange(request, 'year', 2015, 2016, contextData);
  var month = checkIntRange(request, 'month', 0, 11, contextData);  
  var day = checkIntRange(request, 'day', 1, 31, contextData);
  var mahina = new Array();
  mahina[0] = "January";
  mahina[1] = "February";
  mahina[2] = "March";
  mahina[3] = "April";
  mahina[4] = "May";
  mahina[5] = "June";
  mahina[6] = "July";
  mahina[7] = "August";
  mahina[8] = "September";
  mahina[9] = "October";
  mahina[10] = "November";
  mahina[11] = "December";
  
  
  // Checking the month and deciding if 30/31 days
  if (month === 3 || month === 5 || month === 8 || month === 10) {
    if(day === 31) {
      contextData.errors.push('We don\'t have 31 days in ' + mahina[month]);  
    }
  }
  
  
  // Checking if leap year and deciding which days are allowed in Feb
  if (new Date(year, 1, 29).getMonth() === 1){
      if (month === 1) {
        if (day === 30 || day === 31) {
          contextData.errors.push('We don\'t have ' + day + ' days in ' + mahina[month]);       
        }
      }
  }    
  else{
        if (month === 1) {
          if (day === 29 || day === 30 || day === 31) {
            contextData.errors.push('We don\'t have ' + day + ' days in ' + mahina[month]);       
        }
      }
  }
  
  
  var hour = checkIntRange(request, 'hour', 0, 23, contextData);
  
  if (contextData.errors.length === 0) {
    var newId = getNewId();
    var newEvent = {
      id: newId,
      title: request.body.title,
      location: request.body.location,
      image: request.body.image,
      date: new Date(year, month, day, hour),
      attending: []
    };
    events.all.push(newEvent);
    response.redirect('/events/'+newId);
  }
  else{
    response.render('create-event.html', contextData);
  }
}



// Detail page function
function eventDetail (request, response) {
  var ev = events.getById(parseInt(request.params.id,10));
  if (ev === null) {
    response.status(404).send('No such event');
  }
  response.render('event-detail.html', {event: ev});
}



// RSVP ka jugaad
function rsvp (request, response){
  var ev = events.getById(parseInt(request.params.id));
  if (ev === null) {
    response.status(404).send('No such event');
  }
var at = request.body.email.indexOf('@');
var end = request.body.email.substring(at +1, request.body.email.length);

  if((validator.isEmail(request.body.email)) && (end.toLowerCase() === 'yale.edu'))
  {
    ev.attending.push(request.body.email);
    response.redirect('/events/' + ev.id);
  }
  else
  {
    var contextData = {errors: [], event: ev};
    contextData.errors.push('Invalid email');
    response.render('event-detail.html', contextData);    
  }

}



// API Call - JSON response
function api (request, response){
  var output =  {events: []};
  var search = request.query.search;
  
  if(search){
      for(var i = 0; i < events.all.length; i++){
        if(events.all[i].title.indexOf(search) !== -1){
        output.events.push(events.all[i]);
        }
      }
    }else{
  output.events = events.all;
    }
  response.json(output);
}



/**
 * Export all our functions (controllers in this case, because they
 * handles requests and render responses).
 */
module.exports = {
  'listEvents': listEvents,
  'eventDetail': eventDetail,
  'newEvent': newEvent,
  'saveEvent': saveEvent,
  'rsvp': rsvp, 
  'api': api
};