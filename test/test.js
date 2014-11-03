/*jshint expr: true*/
'use strict';

var assert = require('assert');
var app = require('../app.js');
var Browser = require('zombie');
var async = require('async');
var chai = require('chai');
var expect = chai.expect;
var _ = require('lodash');

describe('The home page',function(){
  before(function(done){
    this.port = process.env.PORT || 3005;
    this.site = 'http://localhost:' + this.port;
    this.browser = new Browser({
      site: this.site,
    });
    this.server = app.listen(this.port, done);
  });

  before(function(done){
    this.browser.visit(this.site, done);
  });

  it('should be up and running', function(){
    expect(this.browser.success).to.be.ok;
  });

  it('should include bootstrap css', function(done){
    expect(this.browser.query('link[href*="bootstrap.css"]')).to.be.ok;
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

  after(function(done){
    this.server.close(done);
  });
});


describe('As a user, I can visit your homepage',function(){
  before(function(done){
    this.port = process.env.PORT || 3005;
    this.site = 'http://localhost:' + this.port;
    this.browser = new Browser({
      site: this.site,
    });
    this.server = app.listen(this.port, done);
  });

  before(function(done){
    this.browser.visit(this.site, done);
  });

  it('should have your team logo', function(){
    expect(this.browser.query('img#logo[src*=".png"]')).to.be.ok;
  });

  after(function(done){
    this.server.close(done);
  });
});
