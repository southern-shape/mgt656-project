'use strict';

/**
 * An Array of all the events
*/
var allEvents = [
  {
    id: 0,
    title: 'The Super Superman Bro Party',
    // Note that JavaScript months are zero-indexed,
    // so, month zero is January. This is Jan 17th
    // 2013 at 4:30pm local time.
    date:   new Date(2016, 11, 17, 16, 30, 0),
    image: 'https://s-media-cache-ak0.pinimg.com/originals/f9/a3/78/f9a378c6bba6893c667dc249b7a52adb.gif',
    location: 'Kyle\'s fortress of solitude',
    attending: ['kyle.jensen@yale.edu','not.batman@yale.edu', 'lex.luthor@yale.edu']
  },
  {
    id: 1,
    title: 'Christmas Wonder Women @ SOM',
    date:   new Date(2015, 11, 25, 19, 0, 0),
    image: 'http://static7.comicvine.com/uploads/original/10/100439/2506708-tumblr_lslr8jpnsu1qko4x4o1_500.gif',
    location: 'Evans Hall 2400',
    attending: ['wim@yale.edu', 'amy.wrz@yale.edu', 'tori.bre@yale.edu']
  },
  {
    id: 2,
    title: 'Batman party for dating enthusiasts',
    date:   new Date(2016, 11, 20, 11, 0, 0),
    image: 'https://66.media.tumblr.com/bc1fa4352a7211a42dd23e28f3bd948f/tumblr_nbmgr0AnSY1rtvb79o1_400.gif',
    location: 'GPSCY',
    attending: ['mr.deadpool@yale.edu','x.men@yale.edu'],
  },
  {
    id: 3,
    title: 'Aqua bbq for couples',
    date:   new Date(2016, 10, 5, 13, 0, 0),
    image: 'https://media.giphy.com/media/qBvHZHgiUmWBi/giphy.gif',
    location: 'Yale Farm',
    attending: ['peter.parker@yale.edu', 'maryjane.watson@yale.edu','clark.kent@yale.edu','lois.lane@yale.edu'],
  }
];


/**
 * Returns the first event that has a particular id.
 */
function getById (id) {
  for (var i = allEvents.length - 1; i >= 0; i--) {
    if (id === allEvents[i].id){
      return allEvents[i];
    }
  }
  return null;
}

module.exports = exports = {
  all: allEvents,
  getById: getById
};