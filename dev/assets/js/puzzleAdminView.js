const vis = require('vis');

const Graph = require('./modules/Graph');
const NetworkOptions = require('./modules/NetworkOptions');

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

const setUpNetwork = function setUpNetwork(nodeArray, edgeArray) {
  options = NetworkOptions.getOptionsForPuzzle();
  Graph.setUpData(nodeArray, edgeArray);
  setUpContainer();
  network = new vis.Network(container, Graph.getData(), options);
  Graph.revealOriginalHotspots();
  Graph.updateOptimalAnswer();
  Graph.updateConnectedNodes();
  updateHotspotCount();
};

const deletePuzzle = function deletePuzzle(code) {
  console.log('delete button pressed');
  const deletePuzzleRequestHeaders = new Headers({
    'Content-Type': 'application/json'
  });

  const deletePuzzleRequestInit = {
    method: 'POST',
    headers: deletePuzzleRequestHeaders,
    body: JSON.stringify({
      code
    })
  };

  const deletePuzzleRequest = new Request(`//${domain}/hotspot-remove/`, deletePuzzleRequestInit);

  fetch(deletePuzzleRequest)
  .then((deletePuzzleResponse) => {
    console.log('response from delete request');
    console.log(deletePuzzleResponse);
    if (!deletePuzzleResponse.ok) {
      throw new Error("Error with response to deleting puzzle");
    }
    // Successfully deleted puzzle, so load the next pending puzzle
    console.log('back where fetch request has returned');

    // Need to change this to match comment above. For now, should try to find puzzle and fail
    window.location=`//${domain}/hotspot/${code}`;
  })
  .catch((error) => {
    throw new Error(error);
  });
};

const setUpClickHandlersForButtons = function setUpClickHandlersForButtons(code, approved) {
  const approveButton = document.querySelector('button[name="approve"]');
  const disapproveButton = document.querySelector('button[name="disapprove"]');
  const deleteButton = document.querySelector('button[name="delete-permanent"]');
  const nextButton = document.querySelector('button[name="next"]');

  if (approved === 'yes') {
    // already approved so disable approve buttons
    approveButton.disable = true;
    deleteButton.disable = true;
  } else {
    approveButton.addEventListener("click", () => {
      // update puzzle in database to show that it has been approved

    });

    deleteButton.addEventListener("click", () => {
      // permanently delete the puzzle from the database
      deletePuzzle(code);
    });
  }

  if (approved === 'no') {
    disapproveButton.disable = true;
  } else {
    disapproveButton.addEventListener("click", () => {
      // update puzzle in database to show that it has been disapproved
    });
  }

  nextButton.addEventListener("click", () => {
    // pull up the next puzzle that is pending approval

  });
};

const setUpAll = function setUpAll({ nodes, edges, size, approved, code }) {
  setUpNetwork(nodes, edges);
  setUpClickHandlersForButtons(code, approved);
};

const handleResponseToPuzzleRequest = function handleResponseToPuzzleRequest(response, code) {
  if (response.ok) {
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.indexOf('application/json') !== -1) {
      return response.json().then((json) => {
        console.log(json);
        setUpAll({
          nodes: json.puzzle.graph.nodes,
          edges: json.puzzle.graph.edges,
          size: json.puzzle.size,
          approved: json.puzzle.approved,
          code
        });
      }).catch((error) => {
        throw new Error(`${error}, Error with JSON file`);
      });
    }
    throw new Error('Unexpected content type');
  }
  throw new Error('Error in network response');
};

const usePuzzle = function usePuzzle(code) {
  fetch(`//${domain}/hotspot-data/${code}`)
    .then(
      (response) => {
        handleResponseToPuzzleRequest(response, code);
      }
    )
    .catch((error) => {
      throw new Error(error);
    });
};

// Export this so that puzzleAdminView.hbs can call this function to get the puzzle set up
module.exports = {
  usePuzzle
};
