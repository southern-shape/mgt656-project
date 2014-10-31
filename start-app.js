'use strict';

var app = require('./app.js');

// Start the server on port 3000
var port = process.env.port || 3500;
var ip = process.env.IP || 'localhost';
var server = app.listen(port, ip, function() {
    console.log('Listening on port %d', server.address().port);
});