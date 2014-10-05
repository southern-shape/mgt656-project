

module.exports = function(request, response) {

  var contextData = {
    'title': 'MGT 645',
    'tagline': 'You are doomed (just kidding).'
  }
  response.render('index.html', contextData);
}
