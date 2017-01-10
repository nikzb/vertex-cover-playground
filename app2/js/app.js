// Variables for manipulating the DOM
var challengeDiv = null;
var instructDiv = null;
var keyDiv = null;
var buttonDiv = null;
var prevButton = null;
var resetButton = null;
var instruct = null;
var hotspotCountDiv = null;

var stageInstructIndex = 0;
var stageInstructions = null;

populateStageInstructions();

var nodes = null;
var edges = null;
var network = null;
var data = null;

var container;

// Stages are
  // 0: intro
  // 1: add-hotspots
  // 2: add-serviced-nodes
  // 3: make-clusters
  // 4: connect-clusters
  // 5: finished
var stage = 'intro';
var options;


function populateStageInstructions() {
  stageInstructions = [];

  stageInstructions[0] = `
    <ul class='instruct-details'>
      <li>It is relatively easy to create one of these problems.</li>
      <li>It may be very difficult for someone else to solve your problem!</li>
    </ul>
    <h3 class='to-do'>Follow the instructions to create your own Wifi Hotspot Problem!</h3>
  `

  stageInstructions[1] = `
    <h2 class='step-label'>Step <span class='step-number'>1</span>: Add the Hotspots</h2>
    <ul class='instruct-details'>
      <li>Click in the graph canvas to add the hotspots.</li>
    </ul>
  `

  stageInstructions[2] = `
    <h2 class='step-label'>Step <span class='step-number'>2</span>: Add More Nodes</h2>
    <ul class='instruct-details'>
      <li>Click in the graph canvas to add additional nodes.</li>
      <li>You will connect the nodes in the next steps.</li>
    </ul>
  `

  stageInstructions[3] = `
    <h2 class='step-label'>Step <span class='step-number'>3</span>: Make Clusters</h2>
    <ul class='instruct-details'>
      <li>Click a white node and drag to connect it to a black node.</li>
      <li>Each white node should be connected to exactly one black node to form clusters.</li>
      <li>Black nodes can be connected to multiple white nodes.</li>
    </ul>
  `

  stageInstructions[4] = `
    <h2 class='step-label'>Step <span class='step-number'>4</span>: Connect the Clusters</h2>
    <ul class='instruct-details'>
      <li>Connect white nodes from difference clusters.</li>
      <li>You can connect nodes to multiple other nodes, as long as they are from different clusters.</li>
    </ul>
  `

  stageInstructions[5] = `
    <h2 class='step-label'>Step <span class='step-number'>5</span>: Finish Up</h2>
    <ul class='instruct-details'>
      <li>Click Next to create your puzzle!</li>
    </ul>
  `

  stageInstructions[6] = `
    <ul class='instruct-details'>
      <li>Click a node to add a hotspot. Click it again to remove it.</li>
      <li>Only nodes that do not already have service can become hotspots.</li>
    </ul>
  `
}

function resetPuzzleBuilder() {
  console.log('reset puzzle buider');
  console.log(network);
  network.destroy();
  nodes = new vis.DataSet();
  edges = new vis.DataSet();
  data = {nodes: nodes, edges, edges};
  network = new vis.Network(container, data, options);
  console.log(network);
  stage = 'add-hotspots';
  setUpOptionsForAddHotspots();

}

function updateNetworkOptions() {
  network.setOptions(options);
}

function setUpOptionsForAddHotspots() {
  options.manipulation.addNode = getAddNodeFunc('hotspot');
  options.manipulation.addEdge = false;
  options.manipulation.deleteNode = true;
  options.manipulation.enabled = true;
  updateNetworkOptions();
  network.addNodeMode();
}

function setUpOptionsForAddServicedNodes() {
  options.manipulation.addNode = getAddNodeFunc('service');
  options.manipulation.addEdge = false;
  options.manipulation.deleteNode = true;
  updateNetworkOptions();
  network.addNodeMode();
}

function setUpOptionsForMakeClusters() {
  options.manipulation.addNode = false;
  options.manipulation.deleteNode = false;
  options.manipulation.editEdge = false;
  options.manipulation.addEdge = function (data, callback) {
    // Need to ensure that new edge connects a lonely service node to a hotspot
    var from = nodes.get(data.from);
    var to = nodes.get(data.to);

    if (from.group !== to.group) { // data.from != data.to
      console.log('Nodes not in same group');
      var serviceNode;
      var hotspot;
      if (from.group === 'service') {
        serviceNode = from;
        hotspot = to;
      }
      else {
        serviceNode = to;
        hotspot = from;
      }
      if (serviceNode.connectedToWithinCluster.length === 0) {
        serviceNode.connectedToWithinCluster.push(hotspot);
        hotspot.connectedToWithinCluster.push(serviceNode);
        callback(data);
        network.addEdgeMode();
      }
    }
  };
  updateNetworkOptions();
  network.addEdgeMode();
}

function setUpOptionsForConnectClusters() {
  options.manipulation.addNode = false;
  options.manipulation.deleteNode = false;
  options.manipulation.editEdge = false;
  options.manipulation.addEdge = function (data, callback) {
    // Need to ensure that new edge connects a lonely service node to a hotspot
    var from = nodes.get(data.from);
    var to = nodes.get(data.to);

    if (data.to !== data.from &&
        from.group === 'service' &&
        to.group === 'service' &&
        !InSameCluster(from, to)) { // data.from != data.to
      console.log('Nodes are service nodes and not in the same cluster');
      data.dashes = 'true';
      console.log(data);
      callback(data);
      network.addEdgeMode();
    }
  };
  updateNetworkOptions();
  network.addEdgeMode();
}

function InSameCluster(nodeA, nodeB) {

  var hotspot = nodeA.connectedToWithinCluster[0];

  for (var i = 0; i < hotspot.connectedToWithinCluster.length; i += 1) {
    console.log(hotspot.connectedToWithinCluster[i].id === nodeB.id);
    if (hotspot.connectedToWithinCluster[i].id === nodeB.id) {
      return true;
    }
  }

  return false;
}

function setUpOptionsForFinished() {
  options.manipulation.addNode = false;
  options.manipulation.deleteNode = false;
  options.manipulation.editEdge = false;
  options.manipulation.addEdge = false;
  options.manipulation.deleteEdge = false;
  updateNetworkOptions();

}

function goToNextStage() {
  if (stage === 'intro') {
    stage = 'add-hotspots';
    setUpOptionsForAddHotspots();
    instruct.innerHTML = stageInstructions[1];
    resetButton.style.visibility = 'visible';
  } else if (stage === 'add-hotspots') {
    stage = 'add-serviced-nodes';
    setUpOptionsForAddServicedNodes();
    instruct.innerHTML = stageInstructions[2];
  } else if (stage === 'add-serviced-nodes') {
    stage = 'make-clusters';
    setUpOptionsForMakeClusters();
    instruct.innerHTML = stageInstructions[3];
  } else if (stage === 'make-clusters') {
    stage = 'connect-clusters';
    setUpOptionsForConnectClusters();
    instruct.innerHTML = stageInstructions[4];
  } else if (stage === 'connect-clusters') {
    stage = 'finished';
    setUpOptionsForFinished();
    instruct.innerHTML = stageInstructions[5];
  } else if (stage === 'finished') {
    // network.disableEditMode();
    setUpProblem();
    challengeDiv.style.display = 'initial';
    buttonDiv.style.display = 'none';
    keyDiv.style.display = 'initial';
    instruct.innerHTML = stageInstructions[6];
    instructDiv.querySelector('.title').textContent = 'Instructions';
    hotspotCountDiv.style.visibility = 'visible';

  }
  console.log(stage);
}

function goToPrevStage() {
  if (stage === 'add-serviced-nodes') {
    stage = 'add-hotspots';
    setUpOptionsForAddHotspots();
  } else if (stage === 'make-clusters') {
    stage = 'add-serviced-nodes';
    setUpOptionsForAddServicedNodes();
  } else if (stage === 'connect-clusters') {
    stage = 'make-clusters';
    setUpOptionsForMakeClusters();
  } else if (stage === 'finished') {
    stage = 'connect-clusters';
    setUpOptionsForConnectClusters();
  }
  console.log(stage);
}

function getAddNodeFunc(group) {
  return function (data, callback) {
    data.label = '';
    data.original = (group === 'hotspot');
    data.group = group;
    data.connectedToWithinCluster = [];
    callback(data);
    network.addNodeMode();
  }
}

function draw() {
  // Create a network

  container = document.querySelector('.graph');

  options = {
    manipulation: {
      // enabled: true, //set to false to hide edit button
      // addNode: getAddNodeFunc('hotspot'),
      // addEdge: false,
      // deleteNode: true,
      // initiallyActive: false
      enabled: false
    },
    groups: {
      useDefaultGroups: false,
      hotspot: {
        color: {
          background:'black',
          highlight: { background: 'orange', border: 'lightskyblue', borderWidth: 4 }
        },
        border: 'black',
        size:15
      },
      service: {
        color: {
          background:'white',
          border:'black',
          highlight: { background: 'yellow', border: 'lightskyblue', borderWidth: 4 }
        },
        size:15
      }
    },
    edges: {
      smooth: {
        type: 'continuous',
        forceDirection: 'none',
        roundness: 0
      }
    },
    physics: {
      enabled: false
    }
  };

  nodes = new vis.DataSet();
  edges = new vis.DataSet();

  data = {
      nodes: nodes,
      edges: edges
  };

  network = new vis.Network(container, data, options);

  network.on("dragEnd", function (params) {

    if (params.nodes.length > 0) {
      var nodeId = params.nodes[0];
      var node = nodes.get(nodeId);
      node.x = params.pointer.canvas.x;
      node.y = params.pointer.canvas.y;
      nodes.update(node);
    }
  });
}

function setUpProblem() {

  var optimalAnswer = nodes.get().reduce(function(total, node) {
    return node.original ? total + 1 : total;
  }, 0);

  // nodes.forEach(function(node) {
  //   console.log(node);
  //   node.group = 'noService';
  //   nodes.update(node);
  // });

  options = {
    nodes: {
        shape: 'dot',
        size: 15,
        font: {
            size: 32
        },
        borderWidth: 0,
        shadow:true,
        fixed: true,
        labelHighlightBold: false
    },
    edges: {
        width: 2,
        shadow:false,
        dashes:false,
        color: {
          color: 'darkgrey'
          // inherit: 'both'
        },
        selectionWidth: 0
    },
    interaction:{
      // hover:true,
    },
    groups: {
      useDefaultGroups: false,
      noService: {
        color: {
          background:'red',
          highlight: { background: 'red', border: 'red', borderWidth: 0 }
        },
        size:15
      },
      hotspot: {
        color: {
          background:'orange',
          highlight: { background: 'orange', border: 'orange', borderWidth: 0 }
        },
        size:20
      },
      service: {
        color: {
          background:'yellow',
          highlight: { background: 'yellow', border: 'yellow', borderWidth: 0 }
        },
        size:15
      }
    }
  };

  var newNodes = [];
  var newEdges = [];

  nodes.forEach(function(node) {
    newNodes.push({id: node.id, group: 'noService', label: '', original:node.original, x: node.x, y: node.y});
  });
  edges.forEach(function(edge) {
    newEdges.push({id: edge.id, from: edge.from, to: edge.to});
  });
  nodes = new vis.DataSet(newNodes);
  edges = new vis.DataSet(newEdges);
  data = {nodes: nodes, edges: edges};

  //network.setOptions(options);
  network = new vis.Network(container, data, options);

  var updateConnectedNodes = function(nodes, edges) {
    // Reset all serviced nodes to nodes to unserviced
    nodes.forEach(function(node) {
      if (node.group === 'service') {
        node.group = 'noService';
        nodes.update(node);
      }
    });

    // Find all the hotspot nodes and have them service all the connected non-hotspot nodes
    nodes.forEach(function(node) {
      if (node.group === 'hotspot') {
        console.log(`found hotspot at node ${node.id}`);
        edges.forEach(function(edge) {
          var servicedId = 0;
          if (edge.from === node.id) {
            servicedId = edge.to;
          }
          else if (edge.to === node.id) {
            servicedId = edge.from;
          }
          console.log(`Serviced ID: ${servicedId}`);
          if (servicedId) {
            var servicedNode = nodes.get(servicedId);
            console.log(`Before: ${servicedNode.group}`);
            if (servicedNode.group === 'noService') {
              servicedNode.group = 'service';
              nodes.update(servicedNode);
            }
            console.log(`After: ${servicedNode.group}`);
          }
        });
      }
    });
  }

  var resetAllNodes = function(nodes) {
    nodes.forEach(function(node) {
      node.group = 'noService';
      nodes.update(node);
    });
  }

  var allNodesHaveWifi = function(nodes) {
    return nodes.get().every(function(node) {
      return node.group !== 'noService';
    });
  }

  var countHotspots = function(nodes) {
    var hotspots = 0;

    nodes.forEach(function(node) {
      if (node.group === 'hotspot') {
        hotspots += 1;
      }
    });

    return hotspots;
  }

  var updateHotspotCount = function(nodes) {
    document.querySelector('.hotspot-count').innerHTML = countHotspots(nodes);
  }

  var checkForCompletion = function(nodes) {
    if (allNodesHaveWifi(nodes)) {
      // Display a message telling whether optimization is complete
      var numHotspots = countHotspots(nodes);
      if (numHotspots > 0) {
        if (numHotspots === optimalAnswer) {
          // Success!
          document.querySelector('.optimal-message').innerHTML = 'You found an optimal solution!';
        }
        else {
          document.querySelector('.optimal-message').innerHTML = 'It is possible to use less hotspots. Try again. You can do it!';
        }
      }
    }
    else {
      document.querySelector('.optimal-message').innerHTML = '';
    }
  }

  network.on("click", function (params) {

      params.event = "[original event]";
      //document.getElementById('eventSpan').innerHTML = '<h2>Click event:</h2>' + JSON.stringify(params, null, 4);

      var id = params.nodes[0];
      var node = nodes.get(id);
      //document.getElementById('eventSpan2').innerHTML = '<h2>Node info:</h2>' + JSON.stringify(node, null, 4);
      if (node.group === 'noService') {
        nodes.update({id: id, group: 'hotspot'});
        updateHotspotCount(nodes);
        // Then update which nodes should be in group 'service'
        updateConnectedNodes(nodes, edges);
      }
      else if (node.group === 'hotspot') {
        nodes.update({id: id, group: 'noService'});
        // Then update which nodes should be in group 'service'
        updateHotspotCount(nodes);
        updateConnectedNodes(nodes, edges);
      }

      checkForCompletion(nodes);

  });

  function resetPuzzle() {
    console.log('reset puzzle');
    resetAllNodes(nodes);
    updateHotspotCount(nodes);
    document.querySelector('.optimal-message').innerHTML = '';
  }

  document.querySelector('button[name="reset"]').removeEventListener("click", resetPuzzleBuilder);
  document.querySelector('button[name="reset"]').addEventListener("click", resetPuzzle);
}

function init() {
  document.querySelector('button[name="next"]').addEventListener('click', goToNextStage);
  document.querySelector('button[name="prev"]').addEventListener('click', goToPrevStage);
  document.querySelector('button[name="reset"]').addEventListener("click", resetPuzzleBuilder);

  challengeDiv = document.querySelector('.challenge-wrap');
  instructDiv = document.querySelector('.instruct-wrap');
  instruct = document.querySelector('.instruct');
  keyDiv = document.querySelector('.key-wrap');
  buttonDiv = document.querySelector('.button-wrap');
  prevButton = document.querySelector('button[name="prev"]');
  resetButton = document.querySelector('button[name="reset"]');
  hotspotCountDiv = document.querySelector('.hotspot-count-wrap');

  challengeDiv.style.display = 'none';
  keyDiv.style.display = 'none';
  prevButton.style.visibility = 'hidden';
  resetButton.style.visibility = 'hidden';
  hotspotCountDiv.style.visibility = 'hidden';

  draw();
}

/* To Do

-Buggy: positions don't hold (they revert upon hitting next buttton)
   -Removing the updateOptions command somehow fixed this, but then the options are incorrect so ????

-Probably should eliminate this functionality for now and implement later
  -Going back to previous steps
  -Add proper deleteNode functions
  -Add proper deleteEdge functions

-Known Bugs
  -When you drag an existing node to a new location, it reverts when you click "next" to proceed to the next stage.
  -Clicking "Start Over" on puzzle builder makes the graph canvas resize to smaller size when it starts out very wide

*/
