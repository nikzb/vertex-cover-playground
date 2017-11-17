// create an array with nodes - this was the original small graph
// var nodes = new vis.DataSet([
//   {id: 1, label: 'Node 1', group: 'noService', original: false},
//   {id: 2, label: 'Node 2', group: 'noService', original: true},
//   {id: 3, label: 'Node 3', group: 'noService', original: true},
//   {id: 4, label: 'Node 4', group: 'noService', original: false},
//   {id: 5, label: 'Node 5', group: 'noService', original: false},
//   {id: 6, label: 'Node 6', group: 'noService', original: false}
// ]);
// create an array with edges - original small graph
// var edges = new vis.DataSet([
//   {from: 1, to: 3},
//   {from: 1, to: 2},
//   {from: 2, to: 4},
//   {from: 2, to: 5},
//   {from: 3, to: 6}
// ]);
const vis = require('vis');

const Graph = require('./modules/Graph');
const NetworkOptions = require('./modules/NetworkOptions');

// Get title set up to link to main page
const setUpTitleLink = require('./modules/title');
const setUpNextPuzzleLinks = require('./modules/nextPuzzle');
const setUpCreateLinks = require('./modules/goToCreate');

let container = null;
let setUpClickHandlers;
let options = null;
let network = null;

let messageInput = null;

// const domain = 'localhost:3001';

const domain = window.location.host;

const removeActive = function removeActive(element) {
  if (element.classList.contains('active')) {
    element.classList.remove('active');
  }
};

const setUpContainer = function setUpContainer() {
  container = document.querySelector('.graph-area__graph-canvas');
};

const updateHotspotCount = function updateHotspotCount() {
  document.querySelector('.graph-area__count-wrap-count').innerHTML = Graph.countHotspots();
};

const showCodeSelection = function showCodeSelection() {
  const messageDiv = document.querySelector('.message-box');
  const messageElem = document.querySelector('.message-box__message');
  const links = document.querySelectorAll('.message-box__options');

  messageInput.style.display = 'flex';
  messageElem.textContent = 'Load a Puzzle';
  links.forEach((link) => {
    link.style.display = 'none';
  });
  messageDiv.classList.add('active');
};

const setUpUIFeatures = function setUpUIFeatures() {
  messageInput = document.querySelector('.message-box__input-container');
  messageInput.style.display = 'none';

  const codeDisplay = document.querySelector('.graph-area__code');

  const loadButton = document.querySelector('.message-box__input-button');

  loadButton.addEventListener('click', () => {
    const userCode = document.querySelector('.message-box__input').value;

    if (userCode.length === 4 && /[A-Za-z0-9]{4}/.test(userCode)) {
      document.querySelector('.message-box__input').value = '';
      window.location=`http://${domain}/hotspot/${userCode}`;
    }
  });

  codeDisplay.addEventListener('click', () => {
    showCodeSelection();
  });
};

const checkForCompletion = function checkForCompletion() {
  const messageDiv = document.querySelector('.message-box');
  const messageElem = document.querySelector('.message-box__message');
  const links = document.querySelectorAll('.message-box__options');

  if (Graph.allNodesHaveWifi()) {
    // Display a message telling whether optimization is complete
    if (Graph.countHotspots() === Graph.getOptimalAnswer()) {
      // Success!
      messageElem.textContent = 'You found an optimal solution!';
      links.forEach((link) => {
        link.style.display = 'block';
      });
    } else {
      messageElem.innerHTML= `You used ${Graph.countHotspots()} hotspots.<br><br> Try again using less hotspots. You can do it!`;
      links.forEach((link) => {
        link.style.display = 'none';
      });
    }
    messageDiv.classList.add('active');
  } else {
    document.querySelector('.message-box__message').textContent = '';
    removeActive(messageDiv);
  }
};

const setUpNetwork = function setUpNetwork(nodeArray, edgeArray) {
  options = NetworkOptions.getOptionsForPuzzle();
  Graph.setUpData(nodeArray, edgeArray);
  setUpContainer();
  network = new vis.Network(container, Graph.getData(), options);
  setUpClickHandlers();
  Graph.updateOptimalAnswer();
};

const addCodeToListOfAttemptedPuzzles = function addCodeToListOfAttemptedPuzzles(code) {
  const puzzleList = JSON.parse(localStorage.getItem('hotspotPuzzlesAttempted')) || [];

  let found = false;
  for (let i = 0; i < puzzleList.length; i += 1) {
    if (puzzleList[i].code === code) {
      found = true;
    }
  }
  if (!found) {
    puzzleList.push({ code });
  }
  localStorage.setItem('hotspotPuzzlesAttempted', JSON.stringify(puzzleList));
};

const handleResponseToPuzzleRequest = function handleResponseToPuzzleRequest(response, code) {
  if (response.ok) {
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.indexOf('application/json') !== -1) {
      return response.json().then((json) => {
        setUpNetwork(json.puzzle.graph.nodes, json.puzzle.graph.edges);
        addCodeToListOfAttemptedPuzzles(code);
      }).catch((error) => {
        throw new Error(`${error}, Error with JSON file`);
      });
    }
    throw new Error('Unexpected content type');
  }
  throw new Error('Error in network response');
};

const usePuzzle = function usePuzzle(code) {
  setUpUIFeatures();
  if (code === '' || code === 'CODE') {
    // code = 'E2KB';
    console.log('no code or code is CODE');
    const arrays = Graph.useDefaultPuzzle();
    setUpNetwork(arrays.nodeArray, arrays.edgeArray);

    // addCodeToListOfAttemptedPuzzles(code);
  } else {
    fetch(`//${domain}/hotspot-data/${code}`)
      .then(
        (response) => {
          handleResponseToPuzzleRequest(response, code);
        }
      )
      .catch((error) => {
        throw new Error(error);
      });
  }
};

const setUpClickHandlerForGraph = function setUpClickHandlerForGraph() {
  network.on("click", (params) => {
    params.event = "[original event]";
    if (params.nodes.length > 0) {
      const id = params.nodes[0];

      Graph.processNodeClick(id);

      updateHotspotCount();
      checkForCompletion();
    }
  });
};

const setUpClickHandlerForResetButton = function setUpClickHandlerForResetButton(messageDiv) {
  document.querySelector('button[name="reset"]').addEventListener("click", () => {
    Graph.resetAllNodes();
    updateHotspotCount();
    const messageElem = document.querySelector('.message-box__message');
    messageElem.innerHTML = '';
    removeActive(messageDiv);
  });
};

const setUpClickHandlerForMessageBox = function setUpClickHandlerForMessageBox(messageDiv) {
  messageDiv.addEventListener("click", (event) => {
    if (event.target.className !== 'message-box__input' && event.target.className.indexOf('message-box__input-button') === -1) {
      removeActive(messageDiv);
      document.querySelector('.message-box__input').value = '';
      messageInput.style.display = 'none';
    }
  });
};

setUpClickHandlers = () => {
  const messageDiv = document.querySelector('.message-box');

  setUpClickHandlerForGraph();
  setUpTitleLink();
  setUpNextPuzzleLinks();
  setUpCreateLinks();
  setUpClickHandlerForResetButton(messageDiv);
  setUpClickHandlerForMessageBox(messageDiv);
};

// Export this so that puzzle.hbs can call this function to get the puzzle set up
module.exports = {
  usePuzzle
};
