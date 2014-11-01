'use strict';

var assert = require('assert');
var app = require('../app.js');
var Browser = require('zombie');
var async = require('async');
var chai = require('chai');
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
          return callback(new Error('Page does not exist'), false);
        }
        return callback(null, expect(browser.query('footer a[href="/about"]')).to.be.ok); 
      });
    }
    var urls = ['/', '/about', '/events/new', '/events/0', '/events/1', '/events/2'];
    async.mapSeries(urls, getAboutLink, function(err, results){
      expect(_.all(results)).to.be.ok;
      done();
    });
  });

  it('should refuse empty submissions');
  it('should refuse partial submissions');
  it('should keep values on partial submissions');
  it('should refuse invalid emails');
  it('should accept complete submissions');

  after(function(done){
    this.server.close(done);
  });
});
