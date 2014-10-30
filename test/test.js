var assert = require('assert');
var app = require('../app.js');
var Browser = require('zombie');

describe('Web site',function(){

  before(function(){
    var port = process.env.PORT | 3005;
    this.server = app.listen(port);
    this.browser = new Browser({site: 'http://localhost:' + port});
  });

  it('should include bootstrap css', function(done){
    this.browser.visit('/', done);
    console.log(this.browser.success);
    assert.ok(this.browser.success);
  });
  it('should refuse empty submissions');
  it('should refuse partial submissions');
  it('should keep values on partial submissions');
  it('should refuse invalid emails');
  it('should accept complete submissions');
});
