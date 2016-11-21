'use strict';

//var events = require('../models/events');
var validator = require('validator');

//===========================================Connecting to DB=================================================
// Bluebird - Promises library
var promise = require('bluebird');

var options = {
  // Initialization Options
  promiseLib: promise
};

// Connecting to the Postgresql setup on Heroku
var pgp = require('pg-promise')(options);
var connectionString = {
  host: "ec2-54-235-102-190.compute-1.amazonaws.com",
  port: "5432",
  user: "gdgdlpnpohxhjx",
  password: "ihejfMEFzNm9Xjn3-vm-NQNzoz",
  database: "dab0a6tvsne57g",
  ssl: true
 };
var db = pgp(connectionString);
//===========================================Connecting to DB=================================================E




//===========================================Custom functions=================================================
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

//Custom function to help me sort before pushing the list off to the events list
/*If the return value is negative, the first argument (a in this case), will precede the second argument (b) in the sorted array.
If the returned value is zero, their position with respect to each other remains unchanged.
If the returned value is positive, b precedes a in the sorted array*/

//Ascending
function custom_sort_index(a, b) {
  return new Date(a.date).getTime() - new Date(b.date).getTime();
}

//Descending
function custom_sort(b, a) {
  return new Date(a.date).getTime() - new Date(b.date).getTime();
}
//===========================================Custom functions=================================================E





/**
 * Controller that renders our index (home) page.
 */
//==========================================Index file function moved from index.js===========================
function index (request, response) {
  var now = new Date();
  var currentTime = new Date();
  var resultData = {'events': []};
  var contextData = {
    'title': 'MGT 656',
    'tagline': 'You are doomed (just kidding).',
    'events': [],
    'time': currentTime
  };

  db.any('select * from events')
    .then(function (data) {
      data.sort(custom_sort_index);
      resultData = {
        'events': data
      };
  
      for (var i=0; i < resultData.events.length; i++) {
        if (resultData.events[i].date > now) {
          contextData.events.push(resultData.events[i]);
        }
      }
      response.render('index.html', contextData);
    })
    .catch(function (err) {
      contextData = {
        'errors': err
      };
      console.log(err);
    });
}
//==========================================Index file function moved from index.js===========================E






/**
 * Controller that renders a list of events in HTML.
 */
//==================================List Events==========================================
function listEvents(request, response) {
  var currentTime = new Date();
  var contextData = {'events':[], 'time':[], 'errors': []};
  db.any('select * from events')
    .then(function (data) {
      data.sort(custom_sort);
      contextData = {
        'events': data,
        'time': currentTime
      };
      response.render('event.html', contextData);
    })
    .catch(function (err) {
      contextData = {
        'errors': err
      };
      response.render('event.html', contextData);
    });
}
//==================================List Events==========================================E




/**
 * Controller that renders a page for creating new events.
 */
//==================================Create new Events=====================================
function newEvent(request, response){
  var contextData = {};
  response.render('create-event.html', contextData);
}
//==================================Create new Events=====================================E




/**
 * Controller that renders a page for creating new events.
 */
//==================================404 page=====================================
function catchall404(request, response){
  var contextData = {};
  response.render('404.html', contextData);
}
//==================================404 page=====================================E




/**
 * Controller to which new events are submitted.
 * Validates the form and adds the new event to
 * our global list of events.
 */
//==================================Save new Events======================================
function saveEvent(request, response){
  var contextData = {errors: []};
  
  //=======================All the checks for the form===================================
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
    //=======================All the checks for the form===================================E
  
  
  if (contextData.errors.length === 0) {
    
    //Sets newId to the current number of entries
    db.any('select * from events')
    .then(function (data) {
        var newId = 0;
        for (var i = data.length - 1; i >= 0; i--) {
          if (newId < data[i].id) {
            newId = data[i].id;
          }
        }
        newId++;
        
        
        var newEvent = {
          id: newId,
          title: request.body.title,
          location: request.body.location,
          image: request.body.image,
          date: new Date(year, month, day, hour),
          attending: []
        };
    
        db.none('insert into events(id, title, location, image, date, attending)'+
        'values(${id}, ${title}, ${location}, ${image}, ${date}, json_build_array())',
        newEvent)
        .then(function () {
              response.redirect('/events/'+newId);
        })
        .catch(function (err) {
              console.log(err);
              contextData = {
                'errors': err
              };
              response.render('create-event.html', contextData);    
        });
    })
    .catch(function (err) {
        console.log(err);
    });
  }
  
  else{
    response.render('create-event.html', contextData);
  }
}
//==================================Save new Events=====================================E




/**
 * The function is defined to
 * load individual event pages
 */
//==================================Detail page function================================
function eventDetail (request, response) {
  var ev = parseInt(request.params.id,10);
  var currentTime = new Date();
  var contextData = {'event':[], 'errors':[]};  
  
  if (ev === null) {
    //response.status(404).send('No such event');
    response.render('404.html', contextData);
  }
  
  db.one('select * from events where id = $1', ev)
    .then(function (data) {
      contextData = {
        'event': data,
        'time': currentTime
      };
      response.render('event-detail.html', contextData);
    })
    .catch(function (err) {
      contextData = {
        'errors': err
      };
        //response.status(404).send('No such event');
        response.render('404.html', contextData);
    });
}
//==================================Detail page function================================E




/**
 * RSVP post code
 * Update command on the DB
 */
//==================================RSVP ka jugaad======================================
function rsvp (request, response){
  var ev = parseInt(request.params.id,10);
  var currentTime = new Date();
  var contextData = {'event':[], 'errors':[]};
  if (ev === null) {
    //response.status(404).send('No such event');
    response.render('404.html', contextData);
  }

  db.one('select * from events where id = $1', ev)
    .then(function (data) {
      contextData = {
        'event': data,
        'time': currentTime
      };
      
      var at = request.body.email.indexOf('@');
      var end = request.body.email.substring(at +1, request.body.email.length);
      
      if((validator.isEmail(request.body.email)) && (end.toLowerCase() === 'yale.edu')){
        contextData.event.attending.push(request.body.email);
        db.none('update events set attending=to_json($1) where id = $2', [contextData.event.attending, ev])
        .then(function (data) {
          var reset = 0;
          db.none('UPDATE events set attending=\'["kyle.jensen@yale.edu","not.batman@yale.edu","lex.luthor@yale.edu"]\' where id = $1',reset)
          .then(function (data) {
            //The foobar problem is fixed by updating the event 0.
          })
          .catch(function(err) {
            console.log(err);
          });
        })
        .catch(function (err) {
          console.log(err);
        });
        response.render('event-detail.html', contextData);
      }else
      {
        contextData = {
          'event': data,
          'errors': []
        };
        contextData.errors.push('Invalid email');
        response.render('event-detail.html', contextData);    
      }
    })
    .catch(function (err) {
      contextData = {
        'errors': err
      };
      console.log(contextData);      
      //response.status(404).send('No such event');
      response.render('404.html', contextData);
  });
}
//==================================RSVP ka jugaad======================================E




/**
 * API Call
 * DB bound
 */
//================================API Call - JSON response==============================
function api (request, response){
  var contextData = {'events':[], 'errors': []};
  var resultData = {'events': []};
  var search = request.query.search;

  db.any('select * from events')
    .then(function (data) {
      contextData = {
        'events': data,
      };
      
      if(search){
        for(var i = 0; i < contextData.events.length; i++)
        {
            if(contextData.events[i].title.indexOf(search) !== -1){
              resultData.events.push(contextData.events[i]);
            }
        }
      }else
      {
        resultData.events = contextData.events;
      }
  
      response.json(resultData);
      
    })
    .catch(function (err) {
      contextData = {
        'errors': err
      };
      response.json(contextData);
    });
}


function updateEventsapi(req, res, next) {
  db.none('update events set title=$1, image=$2 where id=$3',
    [req.body.title, req.body.image, parseInt(req.params.id,10)])
    .then(function () {
      res.status(200)
        .json({
          status: 'success',
          message: 'Updated event'
        });
    })
    .catch(function (err) {
      return next(err);
    });
}


function removeEventsapi(req, res, next) {
  var ev = parseInt(req.params.id, 10);
  console.log("here");
  db.result('delete from events where id = $1', ev)
    .then(function (result) {
      res.status(200)
        .json({
          status: 'success',
          message: `Removed ${result.rowCount} event`
        });
    })
    .catch(function (err) {
      return next(err);
    });
}
//================================API Call - JSON response==============================E




/**
 * Export all our functions (controllers in this case, because they
 * handles requests and render responses).
 */
module.exports = {
  'index': index,
  'listEvents': listEvents,
  'eventDetail': eventDetail,
  'newEvent': newEvent,
  'saveEvent': saveEvent,
  'rsvp': rsvp, 
  'api': api,
  'updateEventsapi': updateEventsapi,
  'removeEventsapi': removeEventsapi,
  'catchall404': catchall404
};