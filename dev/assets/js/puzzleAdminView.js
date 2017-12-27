const vis = require('vis');

const Graph = require('./modules/Graph');
const NetworkOptions = require('./modules/NetworkOptions');
const setUpTitleLink = require('./modules/title');

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

const getPuzzleApprovedSelection = function getPuzzleApprovedSelection() {
  // Look at radio elements to figure out which approved status is selected for viewing
  let selection;

  if (document.getElementById('status-1').checked) {
    selection = 'pending';
  } else if (document.getElementById('status-2').checked) {
    selection = 'yes';
  } else if (document.getElementById('status-3').checked) {
    selection = 'no';
  }

  return selection;
};

const nextPuzzle = function nextPuzzle(code='X', direction='forward') {
  const approved = getPuzzleApprovedSelection();

  fetch(`//${domain}/code/next/${approved}/${code}/${direction}`)
  .then((response) => {
    if (response.ok) {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.indexOf('text') !== -1) {
        response.text().then((nextCode) => {
          // If there is a valid code returned, show the admin page for it
          // Otherwise, need to show a "No more of this type" message
          if (nextCode === '') {
            document.querySelector('.status-select__no-puzzles-to-show').style.display = 'block';
            document.querySelector('.graph-area').style.display = 'none';
          } else {
            window.location.href = `//${domain}/hotspot/master/${nextCode}`;
          }
        });
      }
    }
  }).catch((error) => {
    throw new Error(error);
  });
};

const deletePuzzle = function deletePuzzle(code) {
  const headers = new Headers({
    'x-auth': window.localStorage.getItem('hotspotAuthToken')
  });

  const deletePuzzleRequestInit = {
    method: 'DELETE',
    headers
  };

  const deletePuzzleRequest = new Request(`//${domain}/hotspot/${code}`, deletePuzzleRequestInit);

  fetch(deletePuzzleRequest)
  .then((deletePuzzleResponse) => {
    if (!deletePuzzleResponse.ok) {
      throw new Error("Error with response to deleting puzzle");
    }
    // Successfully deleted puzzle, so load the next puzzle
    nextPuzzle();
  })
  .catch((error) => {
    throw new Error(error);
  });
};

const approvePuzzle = function approvePuzzle({ code, approved }) {
  const headers = new Headers({
    'x-auth': window.localStorage.getItem('hotspotAuthToken')
  });

  const approvePuzzleRequestInit = {
    method: 'PATCH',
    headers
  };

  const approvePuzzleRequest = new Request(`//${domain}/hotspot/approve/${code}/${approved}`, approvePuzzleRequestInit);

  fetch(approvePuzzleRequest)
  .then((approvePuzzleResponse) => {
    if (!approvePuzzleResponse.ok) {
      throw new Error("Error with response to approving puzzle");
    }
    // Successfully approved puzzle, so load the next puzzle
    nextPuzzle(code);
  })
  .catch((error) => {
    throw new Error(error);
  });
};

const setUpRadio = function setUpRadio(approved) {
  const radio1 = document.getElementById('status-1');
  const radio2 = document.getElementById('status-2');
  const radio3 = document.getElementById('status-3');

  if (approved === 'yes') {
    radio2.checked = true;
  } else if (approved === 'no') {
    radio3.checked = true;
  }

  radio1.addEventListener('click', () => {
    nextPuzzle();
  });
  radio2.addEventListener('click', () => {
    nextPuzzle();
  });
  radio3.addEventListener('click', () => {
    nextPuzzle();
  });
};

const setUpSignOutButton = function setUpSignOutButton() {
  const signOutButton = document.querySelector('button[name="sign-out"]');

  signOutButton.addEventListener('click', async () => {
    const signOutRequestHeaders = new Headers({
      'x-auth': window.localStorage.getItem('hotspotAuthToken')
    });

    const signOutRequestInit = {
      method: 'DELETE',
      headers: signOutRequestHeaders,
    };

    const signOutRequest = new Request(`//${domain}/users/token`, signOutRequestInit);

    try {
      const response = await fetch(signOutRequest);

      if (!response.ok) {
        throw new Error('Error with signing out');
      }

      window.localStorage.removeItem('hotspotAuthToken');

      window.location.href = `//${domain}/`;
    } catch (e) {
      throw new Error(e);
    }
  });
};

const setUpClickHandlersForButtons = function setUpClickHandlersForButtons(code, approved) {
  const approveButton = document.querySelector('button[name="approve"]');
  const disapproveButton = document.querySelector('button[name="disapprove"]');
  const deleteButton = document.querySelector('button[name="delete-permanent"]');
  const nextButton = document.querySelector('button[name="next"]');
  const previousButton = document.querySelector('button[name="previous"]');

  if (approved === 'yes') {
    // already approved so disable approve buttons
    approveButton.disabled = true;
    deleteButton.disabled = true;
  } else {
    approveButton.addEventListener("click", () => {
      // update puzzle in database to show that it has been approved
      approvePuzzle({ code, approved: 'yes' });
    });

    deleteButton.addEventListener("click", () => {
      // permanently delete the puzzle from the database
      deletePuzzle(code);
    });
  }

  if (approved === 'no') {
    disapproveButton.disabled = true;
  } else {
    disapproveButton.addEventListener("click", () => {
      // update puzzle in database to show that it has been disapproved
      approvePuzzle({ code, approved: 'no' });
    });
  }

  nextButton.addEventListener("click", () => {
    // pull up the next puzzle that is pending approval
    nextPuzzle(code);
  });

  previousButton.addEventListener("click", () => {
    // pull up the next puzzle that is pending approval
    nextPuzzle(code, 'back');
  });

  setUpSignOutButton();
};

const setUpAll = function setUpAll({ nodes, edges, size, approved, code }) {
  setUpNetwork(nodes, edges);
  setUpRadio(approved);
  setUpClickHandlersForButtons(code, approved);
};

const handleResponseToPuzzleRequest = function handleResponseToPuzzleRequest(response, code) {
  if (response.ok) {
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.indexOf('application/json') !== -1) {
      return response.json().then((json) => {
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
  fetch(`//${domain}/hotspot/data/${code}`)
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
