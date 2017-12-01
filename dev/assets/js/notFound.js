// Get title set up to link to main page
const setUpTitleLink = require('./modules/title');
const setUpNextPuzzleLinks = require('./modules/nextPuzzle');
const setUpCreateLinks = require('./modules/goToCreate');
const messageBox = require('./modules/messageBox');

const domain = window.location.host;

messageBox.setUp(domain, '');

setUpTitleLink();
setUpNextPuzzleLinks(messageBox, domain);
setUpCreateLinks();
