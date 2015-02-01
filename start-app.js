'use strict';

var app = require('./app.js');

// Get config variables
var port = process.env.PORT || 3500;
var host = process.env.C9_HOSTNAME || process.env.IP;

// Start the server
app.listen(port, function() {
  
  if (process.env.C9_HOSTNAME) {

    // Looks like we're on Cloud9, print a nice message for students.
    console.log('Your app is running at http://' + host);  
  
  }else{
  
    // We're running somewhere else, just print the port number.
    console.log('Your app is running on PORT ', port);
  
  }
});
