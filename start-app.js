'use strict';

var app = require('./app.js');

// Start the server on port 3000
var port = process.env.port || 3500;
var ip = process.env.IP || 'localhost';
var server = app.listen(port, ip, function() {
  console.log('Your app is running at http://' + process.env.C9_HOSTNAME || process.env.IP + ':' + process.env.PORT);
});