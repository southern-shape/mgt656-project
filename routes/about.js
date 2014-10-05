

module.exports = function(request, response) {
  var contextData = {};
  response.render('about.html', contextData);
}
