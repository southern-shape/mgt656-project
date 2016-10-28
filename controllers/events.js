'use strict';

var events = require('../models/events.js');
var validator = require('validator');
//var combodate = require('../combodate.js');

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
 * Controller that renders a list of events in JSON.
 */
function listEventsJSON(request, response) {
  var needle = request.query.search;
  var allEvents = events.all;
  var JSONevents = [];
  if(needle){
    for (var i = allEvents.length - 1; i >= 0; i--) {
      if (allEvents[i].title.toLowerCase().search(needle.toLowerCase())>-1){
        JSONevents.push(allEvents[i]);
      }
    }
  }else{
    JSONevents = allEvents;
  }
  response.type('application/json');
  response.statusCode = 200;
  response.json({'events': JSONevents});
  //response.render('event.html', contextData);
}

/**
 * Controller that renders a page for showing event details.
 * Path: '/events/:id'
 */
function showEvent(request, response){
  var eventId = parseInt(request.param('id'));
  var eventObj = events.getById(eventId);
  if(eventObj === null){
    response.writeHead(404, {'Content-Type': 'text/plain'});
    response.write('404 Not Found\n');
    response.end();
  }else{
    var date = new Date(eventObj.date);
    var month = allowedDateInfo.months[date.getMonth()];
    var day = date.getDate();
    var year = date.getFullYear();
    var contextData = {
      'event': eventObj,
      'year': year,
      'month': month,
      'day': day
    };
  response.render('event-detail.html', contextData);
  }
}



/**
 * Controller that renders a page for creating new events.
 */
function newEvent(request, response){
  var contextData = {};
  response.render('create-event.html', contextData);
}


/**
 * Function to check int, max, min for the input form
 * Decided not to use this as the checking script has some problem
 *
function checkIntRange(request, fieldName, minVal, maxVal, contextData){
  var value = null;
  if (validator.isInt(request.body[fieldName]) === false) {
    contextData.errors.push('Your' + fieldName + 'should be an integer.');
  }
  else{
    value = parseInt(request.body[fieldName], 10);
    if (value > maxVal || value < minVal) {
      contextData.errors.push('Your ' + fieldName + ' should be in the range ' + minVal + '-' + maxVal + '.');
    }
  }
  return value;
}/


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
  

/*  var year = checkIntRange(request, 'year', 2015, 2016, contextData);
  var month = checkIntRange(request, 'month', 0, 11, contextData);
  var day = checkIntRange(request, 'day', 1, 31, contextData);
  var hour = checkIntRange(request, 'hour', 0, 23, contextData);*/

  if (validator.isLength(request.body.location, 1, 50) === false) {
    contextData.errors.push('Your location should be between 1 and 50 letters.');
  }
  var imageURL = request.body.image;
  var suffix = imageURL.substring(imageURL.length - 4,imageURL.length);
  
  if(!validator.isURL(request.body.image)){
    contextData.errors.push('The URL of your image has to be a url starting with http:// or https://');
  }
  if(suffix!=='.png' && suffix!=='.gif'){
    contextData.errors.push('The URL of your image has to be a url ending with .png or .gif');
  }
  var year = parseInt(request.body.year);
  if(year!==2015 && year!==2016 || request.body.year==='' || !validator.isInt(request.body.year)){
    contextData.errors.push('Year must be 2015 or 2016');
  }
  var month = parseInt(request.body.month);
  if(month<0 || month>11 || request.body.month===''|| !validator.isInt(request.body.month)){
    contextData.errors.push('month must be an integer between 0 and 11');
  }
  var day = parseInt(request.body.day);
  if(day<1 || day>31 || request.body.day===''|| !validator.isInt(request.body.day)){
    contextData.errors.push('day must be an integer between 1 and 31');
  }
  var hour = parseInt(request.body.hour);
  if(hour<0 || hour>23 || request.body.hour===''|| !validator.isInt(request.body.hour)){
    contextData.errors.push('hour must be an integer between 0 and 23');
  }
  var minute = parseInt(request.body.minute|| !validator.isInt(request.body.minute));
  if(minute!==0 && minute!==30 || request.body.year===''){
    contextData.errors.push('Minute must be 0 or 30');
  }

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

  if (contextData.errors.length === 0) {
    var newId = getNewId();
    var newEvent = {
      id: newId,
      title: request.body.title,
      location: request.body.location,
      image: request.body.image,
      date: new Date(),
      attending: []
    };
    events.all.push(newEvent);
    response.redirect('/events/'+newId);
  }else{
    response.render('create-event.html', contextData);
  }
}

function isInt(n){
        return Number(n)===n && n%1===0;
}
function eventDetail (request, response) {
  var ev = events.getById(parseInt(request.params.id));
  if (ev === null) {
    response.status(404).send('No such event');
  }
  response.render('event-detail.html', {event: ev});
}
function pay (request,response){
  var contextData = {
    'title': '',
    'tagline': 'The world\'s best Eventbrite clone',
    'events': [],
    'tagword': 'monehz',
  };
  
  response.render('pay.html', contextData);   
}
function rsvp (request, response){
  var ev = events.getById(parseInt(request.params.id));
  var contextData = {errors: [], event: ev};
  if (ev === null) {
    response.status(404).send('No such event');
  }
  
  if(!validator.contains(request.body.email.toLowerCase(), '@yale.edu')){
    contextData.errors.push('Yalies Only');
    response.render('event-detail.html', contextData); 
  }
  else{
    if(validator.isEmail(request.body.email)){
      ev.attending.push(request.body.email);
      response.redirect('/events/' + ev.id);
    }else{
      contextData.errors.push('Invalid email');
      response.render('event-detail.html', contextData);    
    }
  }

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
  'showEvent': showEvent,
  'listEventsJSON': listEventsJSON,
  'pay': pay
};