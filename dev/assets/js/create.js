const vis = require('vis');

const graph = require('./modules/GraphForCreate');
const NetworkOptions = require('./modules/NetworkOptions');

// Variables for manipulating the DOM
let instructDiv = null;
let buttonDiv = null;
let prevButton = null;
let resetButton = null;
let instruct = null;
let hotspotCountDiv = null;

let stageInstructions = null;

let network = null;
let container;
const domain = 'localhost:3001';

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
    <ul class='info-container__list''>
      <li>It is relatively easy to create one of these problems.</li>
      <li>It may be very difficult for someone else to solve your problem!</li>
    </ul>
    <h3 class='to-do'>Follow the instructions to create your own Wifi Hotspot Problem!</h3>
  `;

  stageInstructions[1] = `
    <h2 class='step-label'>Step <span class='step-number'>1</span>: Add the Hotspots</h2>
    <ul class='instruct-details'>
      <li>Click in the graph canvas to add the hotspots.</li>
    </ul>
  `;

  stageInstructions[2] = `
    <h2 class='step-label'>Step <span class='step-number'>2</span>: Add The Remaining Nodes</h2>
    <ul class='instruct-details'>
      <li>Click in the graph canvas to add the nodes that will receive service from the hotspots.</li>
      <li>You will connect the nodes in the next steps.</li>
    </ul>
  `;

  stageInstructions[3] = `
    <h2 class='step-label'>Step <span class='step-number'>3</span>: Make Clusters</h2>
    <ul class='instruct-details'>
      <li>Click the white nodes and drag to connect them to a black node.</li>
      <li>Each white node should be connected to exactly one black node.</li>
      <li>Black nodes can be connected to multiple white nodes to form a cluster of nodes.</li>
    </ul>
  `;

  stageInstructions[4] = `
    <h2 class='step-label'>Step <span class='step-number'>4</span>: Connect the Clusters</h2>
    <ul class='instruct-details'>
      <li>Connect white nodes from different clusters.</li>
      <li>You can connect nodes to multiple other nodes, as long as they are from different clusters.</li>
      <li>You will be able to adjust the positions of the nodes in the next step.</li>
    </ul>
  `;

  stageInstructions[5] = `
    <h2 class='step-label'>Step <span class='step-number'>5</span>: Finish Up</h2>
    <ul class='instruct-details'>
      <li>Ajdust the final positioning of the nodes.</li>
      <li>Then click Next to create your puzzle!</li>
    </ul>
  `;

  stageInstructions[6] = `
    <ul class='instruct-details'>
      <li>Click a node to add a hotspot. Click it again to remove it.</li>
      <li>Only nodes that do not already have service can become hotspots.</li>
    </ul>
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
  const requestNewCode = new Request(`http://${domain}/hotspot/newCode`, newCodeInit);

  // const requestNewCode = new Request(`http://${domain}/hotspot/newCode`);

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
            code,
            size
          })
        };

        const addPuzzleRequest = new Request(`http://${domain}/hotspot/`, addPuzzleRequestInit);

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
    resetButton.style.visibility = 'visible';
  } else if (stage === 'add-hotspots') {
    stage = 'add-serviced-nodes';
    NetworkOptions.setUpOptionsForAddServicedNodes(network, options);
    instruct.innerHTML = stageInstructions[2];
    prevButton.style.visibility = 'visible';
  } else if (stage === 'add-serviced-nodes') {
    stage = 'make-clusters';
    NetworkOptions.setUpOptionsForMakeClusters(network, graph, options);
    instruct.innerHTML = stageInstructions[3];
  } else if (stage === 'make-clusters') {
    stage = 'connect-clusters';
    graph.removeLonelyNodes();
    NetworkOptions.setUpOptionsForConnectClusters(network, graph, options);
    instruct.innerHTML = stageInstructions[4];
  } else if (stage === 'connect-clusters') {
    stage = 'finished';
    graph.removeLonelyNodes();
    NetworkOptions.setUpOptionsForFinished(network, options);
    instruct.innerHTML = stageInstructions[5];
  } else if (stage === 'finished') {
    buttonDiv.style.display = 'none';
    // keyDiv.style.display = 'initial';
    instruct.innerHTML = stageInstructions[6];
    instructDiv.querySelector('.info-container__title').textContent = 'Instructions';
    hotspotCountDiv.style.visibility = 'visible';
    savePuzzleAndLoad();
  }
};

const goToPrevStage = function goToPrevStage() {
  if (stage === 'add-serviced-nodes') {
    stage = 'add-hotspots';
    NetworkOptions.setUpOptionsForAddHotspots(network, options);
    instruct.innerHTML = stageInstructions[1];
    prevButton.style.visibility = 'hidden';
  } else if (stage === 'make-clusters') {
    stage = 'add-serviced-nodes';
    NetworkOptions.setUpOptionsForAddServicedNodes(network, options);
    instruct.innerHTML = stageInstructions[2];
  } else if (stage === 'connect-clusters') {
    stage = 'make-clusters';
    NetworkOptions.setUpOptionsForMakeClusters(network, graph, options);
    instruct.innerHTML = stageInstructions[3];
  } else if (stage === 'finished') {
    stage = 'connect-clusters';
    NetworkOptions.setUpOptionsForConnectClusters(network, graph, options);
    instruct.innerHTML = stageInstructions[4];
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
  // keyDiv = document.querySelector('.key-container');
  buttonDiv = document.querySelector('.btn-container');
  prevButton = document.querySelector('button[name="prev"]');
  resetButton = document.querySelector('button[name="reset"]');
  hotspotCountDiv = document.querySelector('.graph-area__count-wrap');

  // challengeDiv.style.display = 'none';
  // keyDiv.style.display = 'none';
  prevButton.style.visibility = 'hidden';

  // resetButton.style.visibility = 'hidden';
  hotspotCountDiv.style.visibility = 'hidden';

  draw();
};

module.exports = {
  init
};
