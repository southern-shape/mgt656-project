/*jshint expr: true*/
'use strict';

// Set the NODE_ENV environment variable to testing
process.env.NODE_ENV = 'testing';

var assert = require('assert');
var app = require('../app.js');
var Browser = require('zombie');
var async = require('async');
var chai = require('chai');
var expect = chai.expect;
var _ = require('lodash');
var request = require('request');
var jsdom = require('jsdom');

var HOST;
var PORT;
var SITE;

var testedEventUrls = ['/events/0', '/events/1', '/events/2'];

function setSite (testBlock) {
  // Do this once to set up HOST, PORT, SITE correctly
  // so that we can run mocha programmatically and pass
  // in these parameters. This is ghetto hack by Jensen
  // so that we can grade student projects using this
  // same code. In the course code, we'll have to set
  // mocha.ctx, which is the `parent` here.
  HOST = testBlock.parent.ctx.HOST || process.env.HOST || 'localhost';
  if (testBlock.parent.ctx.PORT === '') {
    PORT = '';
  }else{
    PORT = testBlock.parent.ctx.PORT || 3005;
  };
  SITE = 'http://' + HOST + ':' + PORT;
}

describe('The site, on all pages',function(){

  // See note above. Ghetto hack.
  setSite(this);

  before(function(done){
    this.port = PORT;
    this.server = app.listen(this.port, done);
    var testedUrls = _.union(['/', '/about', '/events/new'], testedEventUrls);

    // Runs a `testFunc` against a `url`. `testFunc`
    // should take a zombie browser as its sole parameter.
    var createPageTestFunction = function(testFunc) {
      return function(url, callback){
        var browser = new Browser({site: SITE});
        browser.visit(url, function(){
          if (!browser.success) {
            return callback(null, true);
          }
          // expect(browser.query('footer a[href="/about"]')).to.be.ok
          return callback(null, testFunc(browser));
        });
      };
    };

    // `testFunc` should take the a URL
    this.testPages = function(testFunc, done){
      async.mapSeries(testedUrls, createPageTestFunction(testFunc), done);
    };

    this.queryIsOk = function(selector, message){
      return function(browser){
        assert.ok(browser.query(selector), message + ' on page at ' + browser.location.pathname);
      }
    };
  });

  it('should be using Bootstrap CSS', function(done){
    this.testPages(this.queryIsOk('head link[href*="bootstrap"]', 'Expected Bootstrap CSS'), done);
  });

  it('should have a header element', function(done){
    this.testPages(this.queryIsOk('header', 'Expected to find a header element'), done);
  });

  it('should have a footer element', function(done){
    this.testPages(this.queryIsOk('footer', 'Expected to find a footer element'), done);
  });

  it('should have a link to /about in the footer', function(done){
    this.testPages(this.queryIsOk('footer a[href="/about"]', 'Expected link to /about'), done);
  });

  it('should have a link to / in the footer', function(done){
    this.testPages(this.queryIsOk('footer a[href="/"]', 'Expected link to /'), done);
  });

  after(function(done){
    this.server.close(done);
  });
});

describe('The home page',function(){
  before(function(done){
    this.port = PORT;
    this.browser = new Browser({site: SITE});
    this.server = app.listen(this.port, done);
  });

  before(function(done){
    this.browser.visit(SITE, done);
  });

  it('should be up and running', function(){
    assert.ok(this.browser.success, 'Home page not found at ' + this.browser.location.pathname);
  });

  it('should have your team logo', function(){
    assert.ok(this.browser.query('img#logo[src*=".png"]'), 'Expected logo .png on page at ' + this.browser.location.pathname);
  });

  it('should have a list of events', function(){
    assert.ok(this.browser.query('li.event[id*="event-"]'), 'Expected list (li) of events on page at ' + this.browser.location.pathname);
  });

  it('should have a time tag for each event', function(){
    var numEvents = this.browser.queryAll('li.event[id*="event-"]').length;
    var numEventsWithTime = this.browser.queryAll('li.event[id*="event-"] time[datetime]').length;
    assert.ok(numEvents === numEventsWithTime && numEvents > 0, 'Expected ' + (numEvents > 0 ? numEvents : 'some')  + ' events with time tags at ' + this.browser.location.pathname + ' (found ' + numEventsWithTime + ')');
  });

  it('should have a link for each event', function(){
    var numEvents = this.browser.queryAll('li.event[id*="event-"]').length;
    var numEventsWithLinks = this.browser.queryAll('li.event[id^="event-"] a[href^="/events/"]').length;
    assert.ok(numEvents === numEventsWithLinks && numEvents > 0, 'Expected ' + (numEvents > 0 ? numEvents : 'some')  + ' events with links at ' + this.browser.location.pathname + ' (found ' + numEventsWithLinks + ')');
  });

  it('should not show events that are over', function(){
    // Event #4 is in the default data and has a date in the past
    assert.ok(!this.browser.query('li.event[id$="event-4"]'), 'Expected to not see events in the past ' + this.browser.location.pathname);
  });

  it('should have a link to create a new event', function(){
    assert.ok(this.browser.query('a#new[href="/events/new"]'), 'Expected new event link on page at ' + this.browser.location.pathname);
  });

  after(function(done){
    this.server.close(done);
  });
});

describe('The API',function(){
  before(function(done){
    this.server = app.listen(PORT, done);
    this.url = 'http://' + HOST + ':' + PORT + '/api/events';

  });

  it('should return an array of upcoming events in JSON format', function(done){
    request(this.url, function (error, response, body) {
      assert.ok(error === null, 'Encountered error: ' + error + ' with JSON API at /api/events.');
      assert.ok(body !== 'null', 'JSON data has no contents.');
      assert.ok(response.statusCode !== 404, 'API not found at /api/events');
      var data = JSON.parse(body);
      assert.ok(data.hasOwnProperty('events'), 'JSON should have an events key.');
      assert.ok(data.events instanceof Array, 'Events JSON values should be an array.');
      done();
    });
  });

  it('should allow for searching events by title', function(done){
    var search = 'BBQ';
    var url = this.url + '?search=' + search;
    request(url, function (error, response, body) {
      assert.ok(response.statusCode !== 404, 'API not found at /api/events');
      var data = JSON.parse(body);
      assert.ok(data.events !== undefined, 'JSON should have at least one event.');
      // Search for ANY event with title = search
      for (var i = data.events.length - 1; i >= 0; i--) {
        assert.ok(data.events[i].title.indexOf(search) > -1, 'Expected to find ' + search + ' in title.');
      }
      done();
    });
  });

  after(function(done){
    this.server.close(done);
  });
});


describe('The about page',function(){
  before(function(done){
    this.server = app.listen(PORT, done);
  });

  before(function(done){
    this.browser = new Browser({site: SITE});
    this.browser.visit('/about', done);
  });

  it('should have people on it', function(){
    assert.ok(this.browser.query('span[id$="-name"]'), 'Expected spans with name-based ids on page at ' + this.browser.location.pathname);
  });

  it('should have a picture of each person', function(){
    var numPeople = this.browser.queryAll('span[id$="-name"]').length;
    var numImages = this.browser.queryAll('img[id$="-headshot"]').length;
    assert.ok(numPeople === numImages && numPeople > 0, 'Found ' + numPeople + ' people and ' + numImages + ' images.');
  });


  after(function(done){
    this.server.close(done);
  });
});


describe('The event detail pages',function(){
  before(function(done){
    this.server = app.listen(PORT, done);
  });
  it('should exist for each event and should have title, image, etc', function(done){
    var fetchEventDetail = function (url, cb) {
      var browser = new Browser({site: SITE});
      browser.visit(url, function(){
        cb(null, browser);
      });
    };
    async.map(testedEventUrls, fetchEventDetail, function(err, results){
      assert.ok(_.every(results, 'success'), 'Couldn\'t retreive all events at /events/:id.');
      for (var i = results.length - 1; i >= 0; i--) {
        var b = results[i];
        assert.ok(b.query('h1#title'), 'No title for event '  + i);
        assert.ok(b.query('span#date'), 'No date for event '  + i);
        assert.ok(b.query('span#location'), 'No location for event '  + i);
        assert.ok(b.query('img#image'), 'No image for event '  + i);
        assert.ok(b.query('ul#attendees'), 'No attendees for event '  + i);
      }
      done();
    });
  });

  it('should allow Yale users to RSVP', function(done){
    var browser = new Browser();
    var email = 'foobar@YAle.edu';

    browser.visit(SITE + '/events/0', function(){
      assert.ok(browser.html().indexOf(email) === -1, 'Email ' + email + ' found before filling form at /events/0.');
      browser
        .fill('email', email)
        .pressButton('Submit', function(){
          assert.ok(browser.html().indexOf(email) > -1, 'Email ' + email + ' not successfully RSVP\'d.');
          done();
        });
    });
  });

  it('should reject RSVPs from non-Yale addresses', function(done){
    var browser = new Browser();
    var email = 'foobar@harvard.edu';

    browser.visit(SITE + '/events/0', function(){
      browser
        .fill('email', email)
        .pressButton('Submit', function(){
          assert.ok(browser.query('ul.form-errors'), 'RSVP from joker at Harvard should have been rejected.');
          done();
        });
    });
  });


  after(function(done){
    this.server.close(done);
  });
});


describe('The new event creation page',function(){
  before(function(done){
    this.server = app.listen(PORT, done);
  });

  before(function(done){
    this.browser = new Browser({site: SITE});
    this.browser.visit('/events/new', done);
  });

  it('should exist', function(){
    assert.ok(this.browser.success, 'No page found at /events/new');
  });

  it('should have a form that can be posted back', function(){
    assert.ok(this.browser.query('form[method="POST"]'), 'Missing form with post method at ' + this.browser.location.pathname);
  });

  it('should have appropriate form fields and labels', function(){
    var requiredFields = ['title', 'location', 'image', 'year', 'month', 'day', 'hour', 'minute'];
    for (var i = requiredFields.length - 1; i >= 0; i--) {
      // Test for labels
      assert.ok(this.browser.query('[for="' + requiredFields[i] + '"]'), 'Should have form label for ' + requiredFields[i] + ' at ' + this.browser.location.pathname);
      // Test for form fields
      assert.ok(this.browser.query('[name="' + requiredFields[i] + '"]'), 'Should have form name for ' + requiredFields[i] + ' at ' + this.browser.location.pathname);
    }
  });

  it('should use select inputs for year, month, day, hour and minute form elements.', function () {
    var requiredFields = ['year', 'month', 'day', 'hour', 'minute'];
    for (var i = 0; i < requiredFields.length; i++) {
      assert.ok(this.browser.query('select[name="' + requiredFields[i] + '"]'), 'Should have select input for ' + requiredFields[i] + ' at ' + this.browser.location.pathname);
    }
  });

  it('should have the appropriate options for select elements', function () {
      var requiredFieldValues = {
        'year' : [2015, 2016],
        'month' : _.range(12),
        'hour' : _.range(24),
        'minute' : [0, 30]
      };

      _.forOwn(requiredFieldValues, function (expectedOptionValues, fieldName) {
          var select = this.browser.query('select[name="' + fieldName + '"]');
          assert.ok(select, 'Should have select input for ' + fieldName);
          assert.deepEqual(
            _.map(select.getElementsByTagName('option'),
                  function (el) { return el.getAttribute('value'); }),
            _.map(expectedOptionValues, function (v) { return v.toString(); }),
          'Should have options ' + expectedOptionValues.join(', ') + ' for select input with name ' + fieldName);
      }, this);

      var months = this.browser.query('select[name="month"]');
      var names = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December'
      ];

      _.forEach(_.zip(months.getElementsByTagName('option'), names, _.range(12)), _.spread(function (child, text, value) {
          assert.equal(child.getAttribute('value').toString(), value.toString(),
            'Month option value is not as expected. ' + child.getAttribute('value').toString() + ' != ' + value.toString());
          assert.equal(child.text, text, 'Month options are not as expected. ' + child.text + ' != ' + text);
      }), this);
  });

  after(function(done){
    this.server.close(done);
  });
});

describe('The form for creating new events',function(){
  before(function(done){
    this.server = app.listen(PORT, done);
  });

  before(function(){
    this.url = SITE + '/events/new';
    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    this.getGoodData = function () {
      return {
        title: 'Test event' + getRandomInt(0, 10000),
        location: 'Caseus',
        year: 2015,
        month: 6,
        day: 1,
        hour: 4,
        minute: 30,
        image: 'http://i.imgur.com/z8dajuP.png'
      };
    };
  });

  var cases = [
    {
      field: 'title',
      desc: 'is empty',
      type: 'input',
      value: '',
    },
    {
      field: 'title',
      desc: 'is too long',
      type: 'input',
      value: '012345678901234567890123456789012345678901234567890123456789',
    },
    {
      field: 'location',
      desc: 'is empty',
      type: 'input',
      value: '',
    },
    {
      field: 'location',
      desc: 'is too long',
      type: 'input',
      value: '012345678901234567890123456789012345678901234567890123456789',
    },
    {
      field: 'image',
      desc: 'is not a URL',
      type: 'input',
      value: 'foo',
    },
    {
      field: 'image',
      desc: 'is not a gif or png',
      type: 'input',
      value: 'http://www.foo.com/woot.jpg',
    },
  ];
  var rangedIntCases = [
    {
      field: 'year',
      min: 2015,
      max: 2016
    },
    {
      field: 'month',
      min: 0,
      max: 11
    },
    {
      field: 'day',
      min: 1,
      max: 31
    },
    {
      field: 'hour',
      min: 0,
      max: 23
    },
  ];
  for (var i = rangedIntCases.length - 1; i >= 0; i--) {
    var ri = rangedIntCases[i];
    cases.push({
      field: ri.field,
      desc: 'is less than ' + ri.min,
      type: 'select',
      value: ri.min - 1
    });
    cases.push({
      field: ri.field,
      desc: 'is more than ' + ri.max,
      type: 'select',
      value: ri.max + 1
    });
    cases.push({
      field: ri.field,
      desc: 'is not an integer',
      type: 'select',
      value: 'foo'
    });
  }

  var thisTest = function (c) {
    it('should display errors to the user when the ' + c.field + ' ' + c.desc, function(done){
      var field2method = {
        'input': 'fill',
        'select': 'select'
      };
      var postData = {
        url: this.url,
        form: this.getGoodData()
      };
      postData.form[c.field] = c.value;
      request.post(postData, function(err, httpResponse, body){
        assert.ok(err === null, 'Error: ' + err);
        assert.ok(httpResponse.statusCode === 200, 'Expected status code 200, but got' + httpResponse.statusCode);
        var window = jsdom.jsdom(body).defaultView;
        var formErrors = window.document.querySelector('ul.form-errors');
        assert.ok(formErrors, 'Error page should contain form errors.');
        var errorListItems = formErrors.getElementsByTagName('li');
        assert.ok(errorListItems, 'Expected form errors.');
        assert(errorListItems.length > 0, 'Expected form errors.');
        done();
      });
    });
  };
  for (var j = cases.length - 1; j >= 0; j--) {
    thisTest((cases[j]));
  }

  it('should redirect the user to the event detail page if the form is valid', function(done){
    var postData = {
      url: this.url,
      form: this.getGoodData(),
      followRedirect: false
    };
    request.post(postData, function(err, httpResponse, body){
      assert.ok(err === null, 'Error: ' + err);
      assert.ok(httpResponse.statusCode === 302, 'Expected error code 302, but got ' + httpResponse.statusCode);
      assert.ok(httpResponse.headers.hasOwnProperty('location'), 'http response header should include location.');
      expect(httpResponse.headers.location).to.match(/events\/\d+\/?$/, 'Bad redirect location, it should look like events/4, events/5, etc');
      done();
    });

  });


  after(function(done){
    this.server.close(done);
  });
});
