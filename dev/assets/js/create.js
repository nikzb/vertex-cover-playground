const vis = require('vis');

const graph = require('./modules/GraphForCreate');
const NetworkOptions = require('./modules/NetworkOptions');

// Variables for manipulating the DOM
let instructDiv = null;
let buttonDiv = null;
let prevButton = null;
let resetButton = null;
let instruct = null;
let stepTitle = null;

let stageInstructions = null;
let needMoreNodesWarning = null;

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
};

populateStageInstructions();

function setUpDragFix() {
  network.on("dragEnd", (params) => {
    if (params.nodes.length > 0) {
      const nodeId = params.nodes[0];
      const node = graph.getNode(nodeId);
      node.x = params.pointer.canvas.x;
      node.y = params.pointer.canvas.y;
      graph.updateNode(node);
    }
  });
}

const resetPuzzleBuilder = function resetPuzzleBuilder() {
  network.destroy();

  graph.reset();
  network = new vis.Network(container, graph.getData(), options);
  setUpDragFix();

  stage = 'add-hotspots';
  instruct.innerHTML = stageInstructions[1];
  stepTitle.innerHTML = 'Step 1';
  prevButton.style.visibility = 'hidden';
  NetworkOptions.setUpOptionsForAddHotspots(network, options);
};

const savePuzzleAndLoad = function savePuzzleAndLoad() {
  const newCodeHeaders = new Headers({
    'Content-Type': 'text/html'
  });
  const newCodeInit = {
    method: 'GET',
    headers: newCodeHeaders
  };

  // const requestNewCode = new Request(`https://${domain}/hotspot/newCode`, newCodeInit);
  const requestNewCode = new Request(`//${domain}/hotspot/newCode`, newCodeInit);

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

        // if (size <)

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
            window.location=`http://${domain}/hotspot/${code}`;
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
    NetworkOptions.setUpOptionsForAddHotspots(network, options);
    instruct.innerHTML = stageInstructions[1];
    stepTitle.innerHTML = 'Step 1';
    resetButton.style.visibility = 'visible';
  } else if (stage === 'add-hotspots') {
    stage = 'add-serviced-nodes';
    NetworkOptions.setUpOptionsForAddServicedNodes(network, options);
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
    NetworkOptions.setUpOptionsForConnectClusters(network, graph, options);
    instruct.innerHTML = stageInstructions[4];
    stepTitle.innerHTML = 'Step 4';
  } else if (stage === 'connect-clusters') {
    stage = 'finished';
    graph.removeLonelyNodes();
    NetworkOptions.setUpOptionsForFinished(network, options);
    instruct.innerHTML = stageInstructions[5];
    stepTitle.innerHTML = 'Step 5';
  } else if (stage === 'finished') {
    // Make sure there are enough hotspots to make a legitimate puzzle
    if (graph.getNumberOfHotspots() < 2 || graph.getNumberOfServicedNodes() < 2) {
      instruct.innerHTML = stageInstructions[5] + needMoreNodesWarning;
    } else {
      savePuzzleAndLoad();
    }
  }
};

const goToPrevStage = function goToPrevStage() {
  if (stage === 'add-serviced-nodes') {
    stage = 'add-hotspots';
    NetworkOptions.setUpOptionsForAddHotspots(network, options);
    instruct.innerHTML = stageInstructions[1];
    stepTitle.innerHTML = 'Step 1';
    prevButton.style.visibility = 'hidden';
  } else if (stage === 'make-clusters') {
    stage = 'add-serviced-nodes';
    NetworkOptions.setUpOptionsForAddServicedNodes(network, options);
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

  setUpDragFix();
};

const init = function init() {
  document.querySelector('button[name="next"]').addEventListener('click', goToNextStage);
  document.querySelector('button[name="prev"]').addEventListener('click', goToPrevStage);
  document.querySelector('button[name="reset"]').addEventListener("click", resetPuzzleBuilder);

  // challengeDiv = document.querySelector('.info-container.challenge');
  instructDiv = document.querySelector('.info-container.instructions');
  instruct = document.querySelector('.info-container__details.instructions');
  stepTitle = document.querySelector('.info-container__step-title');
  // keyDiv = document.querySelector('.key-container');
  buttonDiv = document.querySelector('.btn-container');
  prevButton = document.querySelector('button[name="prev"]');
  resetButton = document.querySelector('button[name="reset"]');

  prevButton.style.visibility = 'hidden';

  draw();
};

module.exports = {
  init
};
