/**
 * An Array of all the events
 */
var allEvents = [
  {
    id: 0,
    title: "SOM House Party",
    date: 'This Friday',
    image: 'http://i.imgur.com/pXjrQ.gif',
    attending: ['kyle.jensen@yale.edu', 'kim.kardashian@yale.edu']
  },
  {
    id: 1,
    title: "BBQ party for hackers and nerds",
    date: '6/1/2015',
    image: null,
    attending: ['kyle.jensen@yale.edu', 'kim.kardashian@yale.edu']
  },
  {
    id: 2,
    title: "BBQ for managers",
    date: '7/1/2015',
    image: 'http://i.imgur.com/0qylcLh.jpg',
    attending: ['kim.kardashian@yale.edu'],
  }
];


/**
 * Returns the first event that has a particular id.
 */
function getById (id) {
  for (var i = allEvents.length - 1; i >= 0; i--) {
    if (id === allEvents[i]){
      return allEvents[i];
    }
  };
}

module.exports = exports = {
  all: allEvents,
  getById: getById
}