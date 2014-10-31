var assert = require('assert');
var app = require('../app.js');
var Browser = require('zombie');


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
    assert.ok(this.browser.statusCode === 200);
  });

  it('should include bootstrap css', function(done){
    var dis = this;
    this.browser.visit(dis.site, function(){
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
