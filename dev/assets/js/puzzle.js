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
const messageBox = require('./modules/messageBox');

let container = null;
let options = null;
let network = null;

const domain = window.location.host;

const setUpContainer = function setUpContainer() {
  container = document.querySelector('.graph-area__graph-canvas');
};

const updateHotspotCount = function updateHotspotCount() {
  document.querySelector('.graph-area__count-wrap-count').innerHTML = Graph.countHotspots();
};

const checkForCompletion = function checkForCompletion() {
  if (Graph.allNodesHaveWifi()) {
    // Display a message telling whether optimization is complete
    if (Graph.countHotspots() === Graph.getOptimalAnswer()) {
      messageBox.show('success');
    } else {
      messageBox.show('retry', Graph.countHotspots());
    }
  } else {
    messageBox.hide();
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

const setUpNetwork = function setUpNetwork(nodeArray, edgeArray) {
  options = NetworkOptions.getOptionsForPuzzle();
  Graph.setUpData(nodeArray, edgeArray);
  setUpContainer();
  network = new vis.Network(container, Graph.getData(), options);
  setUpClickHandlerForGraph();
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

const setUpClickHandlerForResetButton = function setUpClickHandlerForResetButton(messageDiv) {
  document.querySelector('button[name="reset"]').addEventListener("click", () => {
    Graph.resetAllNodes();
    updateHotspotCount();

    messageBox.hide();
  });
};

const setUpShareButton = function setUpShareButton() {
  const shareIcon = document.querySelector('.share-icon');

  shareIcon.addEventListener('click', () => {
    if (messageBox.isActive()) {
      messageBox.hide();
    } else {
      messageBox.show('share');
    }
  });
};

const setUpCodeButton = function setUpCodeButton() {
  const codeDisplay = document.querySelector('.graph-area__code');

  codeDisplay.addEventListener('click', () => {
    if (messageBox.isActive()) {
      messageBox.hide();
    } else {
      messageBox.show('load');
    }
  });
};

const setUpUIClickHandlers = function setUpUIClickHandlers() {
  const messageDiv = document.querySelector('.message-box');
  setUpTitleLink();
  setUpNextPuzzleLinks();
  setUpCreateLinks();
  setUpShareButton();
  setUpCodeButton();
  setUpClickHandlerForResetButton(messageDiv);
};

const setUpAll = function setUpAll({ nodes, edges, code }) {
  setUpNetwork(nodes, edges);
  setUpUIClickHandlers();
  messageBox.setUp(domain, code);
};

const handleResponseToPuzzleRequest = function handleResponseToPuzzleRequest(response, code, isNew) {
  if (response.ok) {
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.indexOf('application/json') !== -1) {
      return response.json().then((json) => {
        setUpAll({
          nodes: json.puzzle.graph.nodes,
          edges: json.puzzle.graph.edges,
          code
        });
        if (isNew) {
          messageBox.show('share');
        }
        addCodeToListOfAttemptedPuzzles(code);
      }).catch((error) => {
        throw new Error(`${error}, Error with JSON file`);
      });
    }
    throw new Error('Unexpected content type');
  }
  throw new Error('Error in network response');
};

const usePuzzle = function usePuzzle(code, isNew) {
  if (code === 'CODE') {
    const arrays = Graph.useDefaultPuzzle();
    setUpAll({
      nodes: arrays.nodeArray,
      edges: arrays.edgeArray,
      code
    });
  } else {
    fetch(`//${domain}/hotspot-data/${code}`)
      .then(
        (response) => {
          handleResponseToPuzzleRequest(response, code, isNew);
        }
      )
      .catch((error) => {
        throw new Error(error);
      });
  }
};

// Export this so that puzzle.hbs can call this function to get the puzzle set up
module.exports = {
  usePuzzle
};
