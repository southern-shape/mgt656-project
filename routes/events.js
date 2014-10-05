var events = require('../models/events');

module.exports = function(request, response) {
  var currentTime = new Date();
  var contextData = {
    'events': events,
    'time': currentTime
  };
  response.render('event.html', contextData);
}
