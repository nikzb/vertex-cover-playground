require('nodelist-foreach-polyfill');
const vis = require('vis');

const browserIsIE = require('./modules/DetectIE');
const graph = require('./modules/GraphForCreate');
const NetworkOptions = require('./modules/NetworkOptions');

// Get title set up to link to main page
const setUpTitleLink = require('./modules/title');

setUpTitleLink();

// Variables for manipulating the DOM
let instructDiv = null;
let buttonDiv = null;
let prevButton = null;
let resetButton = null;
let instruct = null;
let stepTitle = null;
let deleteButton = null;
let nextButton = null;

let stageInstructions = null;
let needMoreNodesWarning = null;
let nodesNeedMoreSpaceWarning = null;

let selected = null;

let network = null;
let container;
// const domain = 'localhost:3001';
const domain = window.location.host;

// The stages are
  // 0: intro
  // 1: add-hotspots
  // 2: add-serviced-nodes
  // 3: make-clusters
  // 4: connect-clusters
  // 5: finished
let stage = 'intro';
let options;

const populateStageInstructions = function populateStageInstructions() {
  stageInstructions = [];

  stageInstructions[0] = `
    <h2 class='info-container__step-label'>Overview</h2>
    <h3 class='info-container__todo'>Click the NEXT arrow above to begin creating your own Wifi Hotspot Problem!</h3>
    <ul class='info-container__list'>
      <li>It is relatively easy to create one of these problems. It may be very difficult for someone else to solve your problem!</li>
    </ul>
    <h4 class='info-container__sub-list-header'>5 Steps: Create a Wifi Hotspot Problem</h4>
    <ul class='info-container__sub-list'>
      <li>Add hotspot nodes.</li>
      <li>Add nodes that will receive service from the hotspots.</li>
      <li>Connect each serviced node to exactly one hotspot.</li>
      <li>Connect serviced nodes to other serviced nodes.</li>
      <li>Make final adjustments to the positions of your nodes.</li>
    </ul>
  `;

  stageInstructions[1] = `
    <h2 class='info-container__step-label'>Add the Hotspots</h2>
    <h3 class='info-container__todo'>Click in the graph canvas to add the hotspots.</h3>
    <ul class='info-container__list'>
      <li>The nodes that will receive service will be added in the next step.</li>
    </ul>
  `;

  stageInstructions[2] = `
    <h2 class='info-container__step-label'>Add The Serviced Nodes</h2>
    <h3 class='info-container__todo'>Click in the graph canvas to add the nodes that will receive service from the hotspots.</h3>
    <ul class='info-container__list'>
      <li>You will connect the nodes in the next steps.</li>
    </ul>
  `;

  stageInstructions[3] = `
    <h2 class='info-container__step-label'>Make Clusters</h2>
    <h3 class='info-container__todo'>Click the white nodes and drag to connect them to a black node.</h3>
    <ul class='info-container__list'>
      <li>Each white node should be connected to exactly one black node.</li>
      <li>Black nodes can be connected to multiple white nodes to form a cluster of nodes.</li>
    </ul>
  `;

  stageInstructions[4] = `
    <h2 class='info-container__step-label'>Connect the Clusters</h2>
    <h3 class='info-container__todo'>Connect white nodes from different clusters.</h3>
    <ul class='info-container__list'>
      <li>You can connect nodes to multiple other nodes, as long as they are from different clusters.</li>
      <li>You will be able to adjust the positions of the nodes in the next step.</li>
    </ul>
  `;

  stageInstructions[5] = `
    <h2 class='info-container__step-label'>Finish Up</h2>
    <h3 class='info-container__todo'>Adjust the final positioning of the nodes and you are done!</h3>
    <ul class='info-container__list'>
      <li>Click the NEXT arrow to finish creating your puzzle.</li>
    </ul>
  `;

  needMoreNodesWarning = `
    <h3 class='info-container__todo info-container__todo-warning'>
      Your puzzle is too small! Go back and add some more nodes!
    </h3>
  `;

  nodesNeedMoreSpaceWarning = `
  <h3 class='info-container__todo info-container__todo-warning'>
    Some of your nodes are too close together! Move them a bit further apart from each other.
  </h3>
  `;
};

populateStageInstructions();

const showDeleteButton = function showDeleteButton() {
  // const deleteButton = document.querySelector('.btn--delete');
  deleteButton.style.display = 'block';
};

const hideDeleteButton = function hideDeleteButton() {
  // const deleteButton = document.querySelector('.btn--delete');
  deleteButton.style.display = 'none';
};

const updateHotspotCount = function updateHotspotCount() {
  document.querySelector('.graph-area__hotspot-count').textContent = graph.getNumberOfHotspots();
};

const setUpEventHandlers = function setUpEventHandlers() {
  network.on('click', (params) => {
    if (params.nodes.length > 0) { // If a node is selected
      network.selectNodes([params.nodes[0]]);
      selected = params.nodes[0];
      showDeleteButton();
    } else if (params.edges.length > 0) { // Else if an edge is selected
      network.selectEdges([params.edges[0]]);
      selected = params.edges[0];
      showDeleteButton();
    } else if (selected !== null) { // Else if a node was already selected, on a click is made on empty space, just deselect the node
      network.unselectAll();
      selected = null;
      hideDeleteButton();
    } else if (stage === 'add-hotspots') {
      graph.addNode({
        label: '',
        original: true,
        group: 'hotspot',
        connectedToWithinCluster: [],
        x: params.pointer.canvas.x,
        y: params.pointer.canvas.y
      });
    } else if (stage === 'add-serviced-nodes') {
      graph.addNode({
        label: '',
        original: false,
        group: 'service',
        connectedToWithinCluster: [],
        x: params.pointer.canvas.x,
        y: params.pointer.canvas.y
      });
    }
    updateHotspotCount();
  });

  network.on("dragEnd", (params) => {
    if (params.nodes.length > 0) {
      const nodeId = params.nodes[0];
      selected = nodeId;
      showDeleteButton();

      const node = graph.getNode(nodeId);
      node.x = params.pointer.canvas.x;
      node.y = params.pointer.canvas.y;
      graph.updateNode(node);
    }
  });
};

const resetPuzzleBuilder = function resetPuzzleBuilder() {
  network.destroy();

  graph.reset();
  updateHotspotCount();
  network = new vis.Network(container, graph.getData(), options);
  setUpEventHandlers();

  stage = 'add-hotspots';
  instruct.innerHTML = stageInstructions[1];
  stepTitle.innerHTML = 'Step 1';
  prevButton.style.visibility = 'hidden';
  NetworkOptions.setUpOptionsForAddHotspots(network, graph, options);
};

const deleteSelected = function deleteSelected() {
  const selection = network.getSelection();

  if (selection.nodes.length === 0 && selection.edges.length === 0) {
    throw new Error('Nothing selected to delete');
  }

  // The delete button should already be showing when something is selected.
  // Therefore we just need to know if it is a node or edge that is selected
  if (selection.nodes.length > 0) {
    graph.processDeleteNode(selection.nodes[0]);
  } else {
    graph.processDeleteEdge(selection.edges[0]);
  }

  selected = null;
  hideDeleteButton();
  updateHotspotCount();
};

const nodesHaveAdequateSpace = function nodesHaveAdequateSpace() {
  // getPositions - takes array of node ids and returns object with ids as name and object with x, y as name and coords as values as value
  const nodes = graph.getNodes();

  for (let index = 0; index < nodes.length - 1; index += 1) {
    for (let compIndex = index + 1; compIndex < nodes.length; compIndex += 1) {
      const nodeA = nodes[index];
      const nodeB = nodes[compIndex];

      // distance is center to center
      const distanceBetween = Math.hypot(nodeA.x - nodeB.x, nodeA.y - nodeB.y);

      if (distanceBetween < 45) {
        return false;
      }
    }
  }

  return true;
};

const savePuzzleAndLoad = function savePuzzleAndLoad() {
  const newCodeHeaders = new Headers({
    'Content-Type': 'text/html'
  });
  const newCodeInit = {
    method: 'GET',
    headers: newCodeHeaders
  };

  const requestNewCode = new Request(`//${domain}/code/new`, newCodeInit);

  fetch(requestNewCode)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Error in response to fetch request");
      }
      const contentType = response.headers.get('content-type');
      if (!contentType || contentType.indexOf('text') === -1) {
        throw new Error("Problem with content type");
      }
      // The text sent back is the code that will be used to save this puzzle
      response.text().then((code) => {
        // Figure out the correct size for the puzzle
        const size = graph.getSize();

        const addPuzzleRequestHeaders = new Headers({
          'Content-Type': 'application/json'
        });

        const addPuzzleRequestInit = {
          method: 'POST',
          headers: addPuzzleRequestHeaders,
          body: JSON.stringify({
            graph: {
              nodes: graph.getNodes(),
              edges: graph.getEdges()
            },
            approved: 'pending',
            code,
            size
          })
        };

        const addPuzzleRequest = new Request(`//${domain}/hotspot/`, addPuzzleRequestInit);

        fetch(addPuzzleRequest)
          .then((addPuzzleResponse) => {
            if (!addPuzzleResponse.ok) {
              throw new Error("Error with response to adding puzzle");
            }
            // Successfully added puzzle, so load page with puzzle
            window.location.href =`//${domain}/hotspot/${code}?new=true`;
          })
          .catch((error) => {
            throw new Error(error);
          });
      })
      .catch((error) => {
        throw new Error(error);
      });
    })
    .catch((error) => {
      throw new Error(error);
    });
};

const goToNextStage = function goToNextStage() {
  if (stage === 'intro') {
    stage = 'add-hotspots';
    NetworkOptions.setUpOptionsForAddHotspots(network, graph, options);
    instruct.innerHTML = stageInstructions[1];
    stepTitle.innerHTML = 'Step 1';
    resetButton.style.visibility = 'visible';
  } else if (stage === 'add-hotspots') {
    stage = 'add-serviced-nodes';
    NetworkOptions.setUpOptionsForAddServicedNodes(network, graph, options);
    instruct.innerHTML = stageInstructions[2];
    stepTitle.innerHTML = 'Step 2';
    prevButton.style.visibility = 'visible';
  } else if (stage === 'add-serviced-nodes') {
    stage = 'make-clusters';
    NetworkOptions.setUpOptionsForMakeClusters(network, graph, options);
    instruct.innerHTML = stageInstructions[3];
    stepTitle.innerHTML = 'Step 3';
  } else if (stage === 'make-clusters') {
    stage = 'connect-clusters';
    graph.removeLonelyNodes();
    updateHotspotCount();
    NetworkOptions.setUpOptionsForConnectClusters(network, graph, options);
    instruct.innerHTML = stageInstructions[4];
    stepTitle.innerHTML = 'Step 4';
  } else if (stage === 'connect-clusters') {
    stage = 'finished';
    graph.removeLonelyNodes();
    updateHotspotCount();
    NetworkOptions.setUpOptionsForFinished(network, options);
    instruct.innerHTML = stageInstructions[5];
    stepTitle.innerHTML = 'Step 5';
  } else if (stage === 'finished') {
    // Validate puzzle
    // 1) Make sure there are enough hotspots to make a legitimate puzzle
    // 2) Make sure there is enough space between the nodes (not too crowded)
    let warningMessage = '';
    if (graph.getNumberOfHotspots() < 2 || graph.getNumberOfServicedNodes() < 4) {
      warningMessage += needMoreNodesWarning;
    }
    if (!nodesHaveAdequateSpace()) {
      warningMessage += nodesNeedMoreSpaceWarning;
    }

    // If there are warnings to give, show them, otherwise save puzzle
    if (warningMessage.length > 0) {
      instruct.innerHTML = stageInstructions[5] + warningMessage;
    } else {
      savePuzzleAndLoad();
      nextButton.disabled = true;
    }
  }
};

const goToPrevStage = function goToPrevStage() {
  if (stage === 'add-serviced-nodes') {
    stage = 'add-hotspots';
    NetworkOptions.setUpOptionsForAddHotspots(network, graph, options);
    instruct.innerHTML = stageInstructions[1];
    stepTitle.innerHTML = 'Step 1';
    prevButton.style.visibility = 'hidden';
  } else if (stage === 'make-clusters') {
    stage = 'add-serviced-nodes';
    NetworkOptions.setUpOptionsForAddServicedNodes(network, graph, options);
    instruct.innerHTML = stageInstructions[2];
    stepTitle.innerHTML = 'Step 2';
  } else if (stage === 'connect-clusters') {
    stage = 'make-clusters';
    NetworkOptions.setUpOptionsForMakeClusters(network, graph, options);
    instruct.innerHTML = stageInstructions[3];
    stepTitle.innerHTML = 'Step 3';
  } else if (stage === 'finished') {
    stage = 'connect-clusters';
    NetworkOptions.setUpOptionsForConnectClusters(network, graph, options);
    instruct.innerHTML = stageInstructions[4];
    stepTitle.innerHTML = 'Step 4';
  }
};

const draw = function draw() {
  // Create a network
  container = document.querySelector('.graph-area__graph-canvas');

  options = NetworkOptions.getOptionsForCreatePuzzle();
  graph.reset();

  network = new vis.Network(container, graph.getData(), options);
  setUpEventHandlers();
};

const init = function init() {
  if (browserIsIE()) {
    document.querySelector('.main-container__no-ie').style.display = 'block';
    document.querySelector('.middle-container').style.display = 'none';
    return;
  }

  // challengeDiv = document.querySelector('.info-container.challenge');
  instructDiv = document.querySelector('.info-container.instructions');
  instruct = document.querySelector('.info-container__details.instructions');
  stepTitle = document.querySelector('.info-container__step-title');
  // keyDiv = document.querySelector('.key-container');
  buttonDiv = document.querySelector('.btn-container');
  prevButton = document.querySelector('button[name="prev"]');
  resetButton = document.querySelector('button[name="reset"]');
  deleteButton = document.querySelector('button[name="delete"]');
  nextButton = document.querySelector('button[name="next"]');

  nextButton.addEventListener('click', goToNextStage);
  prevButton.addEventListener('click', goToPrevStage);
  resetButton.addEventListener('click', resetPuzzleBuilder);
  deleteButton.addEventListener('click', deleteSelected);

  prevButton.style.visibility = 'hidden';


  draw();
};

module.exports = {
  init
};
