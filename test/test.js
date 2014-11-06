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
var events = require('../models/events.js');

var HOST = 'localhost';
var PORT = parseInt(process.env.PORT) || 3005;
var SITE = 'http://' + HOST + ':' + PORT;



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
    expect(this.browser.success).to.be.ok;
  });

  it('should include bootstrap css', function(){
    expect(this.browser.query('link[href*="bootstrap.css"]')).to.be.ok;
  });

  it('should have a link to create a new event', function(){
    expect(this.browser.query('a#new[href*="/events/new"]')).to.be.ok;
  });

  it('should have a link to the about page in the footer of all pages that exist', function(done){
    var browser = this.browser;
    function getAboutLink (url, callback) {
      browser.visit(url, function(){
        if (!browser.success) {
          return callback(null, true);
        }
        return callback(null, expect(browser.query('footer a[href="/about"]')).to.be.ok); 
      });
    }
    var urls = ['/', '/about', '/events/new', '/events/0', '/events/1', '/events/2'];
    async.mapSeries(urls, getAboutLink, function(err, results){
      expect(_.all(results)).to.be.true;
      done();
    });
  });


  it('should have your team logo', function(){
    expect(this.browser.query('img#logo[src*=".png"]')).to.be.ok;
  });

  it('should have a list of events', function(){
    expect(this.browser.query('li.event[id*="event-"]')).to.be.ok;
  });

  it('should have a time tag for each event', function(){
    var numEvents = this.browser.queryAll('li.event[id*="event-"]').length;
    var numEventsWithTime = this.browser.queryAll('li.event[id*="event-"] time[datetime]').length;
    expect(numEvents).to.equal(numEventsWithTime).and.to.be.above(0);
  });

  it('should have a link for each event', function(){
    var numEvents = this.browser.queryAll('li.event[id*="event-"]').length;
    var numEventsWithLinks = this.browser.queryAll('li.event[id*="event-"] a[href^="/events/"]').length;
    expect(numEvents).to.equal(numEventsWithLinks).and.to.be.above(0);
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
      expect(error).is.null;
      var data = JSON.parse(body);
      expect(data).to.have.key('events');
      expect(data.events).to.be.a('Array');
      done();
    })
  });

  it('should allow for searching events by title', function(done){
    var search = 'BBQ';
    var url = this.url + '?search=' + search;
    request(url, function (error, response, body) {
      var data = JSON.parse(body);
      for (var i = data.events.length - 1; i >= 0; i--) {
        expect(data.events[i].title.indexOf(search)).is.above(-1);
      };
      done();
    })
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
    expect(this.browser.query('span[id$="-name"]')).to.be.ok;
  });

  it('should have a picture of each person', function(){
    var numPeople = this.browser.query('span[id$="-name"]').length;
    var numImages = this.browser.query('img[id$="-headshot"]').length;
    expect(numPeople).to.equal(numImages);
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
    expect(this.browser.success).to.be.ok;
  });

  it('should have a form that can be posted back', function(){
    expect(this.browser.query('form[method="POST"]')).to.be.ok;
  });

  it('should have appropriate form fields and labels', function(){
    var requiredFields = ['title', 'location', 'image', 'year', 'month', 'day', 'hour', 'minute'];
    for (var i = requiredFields.length - 1; i >= 0; i--) {
      // Test for labels
      expect(this.browser.query('[for="' + requiredFields[i] + '"]')).to.be.ok;
      // Test for form fields
      expect(this.browser.query('[name="' + requiredFields[i] + '"]')).to.be.ok;
    };
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
    var fetchEventDetail = function (ev, cb) {
      var browser = Browser();
      console.log('bbaaaaaaa');
      return browser.visit(SITE + '/event/' + ev.id, function(){
        expect(browser.success).to.be.ok();
        console.log('wooooot');
        cb();
      });
    }
    console.log(events.all);
    async.map(events.all, fetchEventDetail, function(err, results){
      console.log(results);
      done();
    });
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
    var fetchEventDetail = function (ev, cb) {
      return request.get(SITE + '/event/' + ev.id, cb);
    }
    console.log(events.all);
    async.map(events.all, fetchEventDetail, function(err, results){
      console.log(results.length);
      // console.log(results);
      done();
    });
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
        minute: 30        
      }
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
      min: 1,
      max: 12
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
      value: ri.min + 1
    });
    cases.push({
      field: ri.field,
      desc: 'is not an integer',
      type: 'select',
      value: 'foo'
    });
  };

  for (var i = cases.length - 1; i >= 0; i--) {
    var thisTest = function (c) {
      it('should display errors to the user when the ' + cases[i].field + ' ' + cases[i].desc, function(done){
        var field2method = {
          'input': 'fill',
          'select': 'select'
        }
        var postData = {
          url: this.url,
          form: this.getGoodData()
        };
        postData.form[c.field] = c.value;
        request.post(postData, function(err, httpResponse, body){
          expect(err).to.be.null;
          expect(httpResponse.statusCode).to.equal(200, "Bad form validation and response code");
          var window = jsdom.jsdom(body).createWindow();
          expect(window.document.getElementsByClassName('form-errors')).to.be.ok;
          done();
        });
      });
    };
    thisTest((cases[i]));
  };

  it('should redirect the user to the event detail page if the form is valid', function(done){
    var postData = {
      url: this.url,
      form: this.getGoodData()
    };
    request.post(postData, function(err, httpResponse, body){
      expect(err).to.be.null;
      expect(httpResponse.statusCode).to.equal(302, "Bad response code");
      expect(httpResponse.headers).to.contain.key('location');
      expect(httpResponse.headers.location).to.match(/events\/\d+\/?$/, "Bad redirect location, it should look like events/4, events/5, etc");
      done();
    });

  });


  after(function(done){
    this.server.close(done);
  });
});


