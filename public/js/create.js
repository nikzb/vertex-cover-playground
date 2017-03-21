/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

// Variables for manipulating the DOM
var instructDiv = null;
var buttonDiv = null;
var prevButton = null;
var resetButton = null;
var instruct = null;
var hotspotCountDiv = null;
// var keyDiv = null;

var stageInstructIndex = 0;
var stageInstructions = null;

populateStageInstructions();

var nodes = null;
var edges = null;
var network = null;
var data = null;

var container;
var domain = 'localhost:3001';

// The stages are
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

  stageInstructions[0] = '\n    <ul class=\'info-container__list\'\'>\n      <li>It is relatively easy to create one of these problems.</li>\n      <li>It may be very difficult for someone else to solve your problem!</li>\n    </ul>\n    <h3 class=\'to-do\'>Follow the instructions to create your own Wifi Hotspot Problem!</h3>\n  ';

  stageInstructions[1] = '\n    <h2 class=\'step-label\'>Step <span class=\'step-number\'>1</span>: Add the Hotspots</h2>\n    <ul class=\'instruct-details\'>\n      <li>Click in the graph canvas to add the hotspots.</li>\n    </ul>\n  ';

  stageInstructions[2] = '\n    <h2 class=\'step-label\'>Step <span class=\'step-number\'>2</span>: Add The Remaining Nodes</h2>\n    <ul class=\'instruct-details\'>\n      <li>Click in the graph canvas to add the nodes that will receive service from the hotspots.</li>\n      <li>You will connect the nodes in the next steps.</li>\n    </ul>\n  ';

  stageInstructions[3] = '\n    <h2 class=\'step-label\'>Step <span class=\'step-number\'>3</span>: Make Clusters</h2>\n    <ul class=\'instruct-details\'>\n      <li>Click the white nodes and drag to connect them to a black node.</li>\n      <li>Each white node should be connected to exactly one black node.</li>\n      <li>Black nodes can be connected to multiple white nodes to form a cluster of nodes.</li>\n    </ul>\n  ';

  stageInstructions[4] = '\n    <h2 class=\'step-label\'>Step <span class=\'step-number\'>4</span>: Connect the Clusters</h2>\n    <ul class=\'instruct-details\'>\n      <li>Connect white nodes from different clusters.</li>\n      <li>You can connect nodes to multiple other nodes, as long as they are from different clusters.</li>\n      <li>You will be able to adjust the positions of the nodes in the next step.</li>\n    </ul>\n  ';

  stageInstructions[5] = '\n    <h2 class=\'step-label\'>Step <span class=\'step-number\'>5</span>: Finish Up</h2>\n    <ul class=\'instruct-details\'>\n      <li>Ajdust the final positioning of the nodes.</li>\n      <li>Then click Next to create your puzzle!</li>\n    </ul>\n  ';

  stageInstructions[6] = '\n    <ul class=\'instruct-details\'>\n      <li>Click a node to add a hotspot. Click it again to remove it.</li>\n      <li>Only nodes that do not already have service can become hotspots.</li>\n    </ul>\n  ';
}

function setUpDragFix() {
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

function resetPuzzleBuilder() {
  network.destroy();
  nodes = new vis.DataSet();
  edges = new vis.DataSet();
  data = _defineProperty({ nodes: nodes, edges: edges }, 'edges', edges);
  network = new vis.Network(container, data, options);
  setUpDragFix();

  stage = 'add-hotspots';
  instruct.innerHTML = stageInstructions[1];
  prevButton.style.visibility = 'hidden';
  setUpOptionsForAddHotspots();
}

function updateNetworkOptions() {
  network.setOptions(options);
}

function setUpOptionsForAddHotspots() {
  options.manipulation.addNode = getAddNodeFunc('hotspot');
  options.manipulation.addEdge = false;
  options.manipulation.deleteNode = true;
  // options.manipulation.enabled = true;
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

    if (from.group !== to.group) {
      var serviceNode;
      var hotspot;
      if (from.group === 'service') {
        serviceNode = from;
        hotspot = to;
      } else {
        serviceNode = to;
        hotspot = from;
      }
      if (serviceNode.connectedToWithinCluster.length === 0) {
        serviceNode.connectedToWithinCluster.push(hotspot.id);
        hotspot.connectedToWithinCluster.push(serviceNode.id);
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

    if (data.to !== data.from && from.group === 'service' && to.group === 'service' && !InSameCluster(from, to)) {
      data.dashes = 'true';
      callback(data);
      network.addEdgeMode();
    }
  };
  updateNetworkOptions();
  network.addEdgeMode();
}

function InSameCluster(nodeA, nodeB) {

  var hotspot = nodes.get(nodeA.connectedToWithinCluster[0]);

  for (var i = 0; i < hotspot.connectedToWithinCluster.length; i += 1) {
    if (hotspot.connectedToWithinCluster[i] === nodeB.id) {
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

function removeLonelyNodes() {
  var i = 0;

  var nodesArray = nodes.get();

  while (i < nodesArray.length) {
    if (nodesArray[i].connectedToWithinCluster.length === 0) {
      nodes.remove(nodesArray[i].id);
    }
    i++;
  }
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
    prevButton.style.visibility = 'visible';
  } else if (stage === 'add-serviced-nodes') {
    stage = 'make-clusters';
    setUpOptionsForMakeClusters();
    instruct.innerHTML = stageInstructions[3];
  } else if (stage === 'make-clusters') {
    stage = 'connect-clusters';
    removeLonelyNodes();
    setUpOptionsForConnectClusters();
    instruct.innerHTML = stageInstructions[4];
  } else if (stage === 'connect-clusters') {
    stage = 'finished';
    removeLonelyNodes();
    setUpOptionsForFinished();
    instruct.innerHTML = stageInstructions[5];
  } else if (stage === 'finished') {
    buttonDiv.style.display = 'none';
    // keyDiv.style.display = 'initial';
    instruct.innerHTML = stageInstructions[6];
    instructDiv.querySelector('.info-container__title').textContent = 'Instructions';
    hotspotCountDiv.style.visibility = 'visible';
    savePuzzleAndLoad();
  }
}

function goToPrevStage() {
  if (stage === 'add-serviced-nodes') {
    stage = 'add-hotspots';
    setUpOptionsForAddHotspots();
    instruct.innerHTML = stageInstructions[1];
    prevButton.style.visibility = 'hidden';
  } else if (stage === 'make-clusters') {
    stage = 'add-serviced-nodes';
    setUpOptionsForAddServicedNodes();
    instruct.innerHTML = stageInstructions[2];
  } else if (stage === 'connect-clusters') {
    stage = 'make-clusters';
    setUpOptionsForMakeClusters();
    instruct.innerHTML = stageInstructions[3];
  } else if (stage === 'finished') {
    stage = 'connect-clusters';
    setUpOptionsForConnectClusters();
    instruct.innerHTML = stageInstructions[4];
  }
}

function getAddNodeFunc(group) {
  return function (data, callback) {
    data.label = '';
    data.original = group === 'hotspot';
    data.group = group;
    data.connectedToWithinCluster = [];
    callback(data);
    network.addNodeMode();
  };
}

function draw() {
  // Create a network

  container = document.querySelector('.graph-area__graph-canvas');

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
          background: 'black',
          border: 'black',
          highlight: { background: 'orange', border: 'lightskyblue', borderWidth: 4 }
        },
        border: 'black',
        size: 15
      },
      service: {
        color: {
          background: 'white',
          border: 'black',
          highlight: { background: 'yellow', border: 'lightskyblue', borderWidth: 4 }
        },
        size: 15
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

  setUpDragFix();
}

function savePuzzleAndLoad() {
  // Need to ask the server to generate a code for this puzzle
  var xhttp = new XMLHttpRequest();

  xhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      var code = this.responseText;
      console.log("Code from server: " + code);
      if (code === 'Error') {
        // Load an error page?
      } else {
        xhttp = new XMLHttpRequest();

        xhttp.onreadystatechange = function () {
          if (this.readyState == 4 && this.status == 200) {
            console.log("done saving new puzzle");

            // Need to load the newly created puzzle
            window.location = "http://" + domain + "/hotspot/" + code;
          }
        };

        var nodesToCopy = nodes.get();
        var size;
        if (nodesToCopy.length <= 15) {
          size = "small";
        } else if (nodesToCopy.length <= 25) {
          size = "medium";
        } else {
          size = "large";
        }
        console.log("Determined size of puzzle: " + size);
        xhttp.open("POST", "http://" + domain + "/hotspot/", true);
        xhttp.setRequestHeader("Content-type", "application/json");
        xhttp.send(JSON.stringify({ graph: { nodes: nodesToCopy, edges: edges.get() }, code: code, size: size }));
      }
    }
  };
  xhttp.open("GET", "http://" + domain + "/hotspot/newCode", true);
  xhttp.send();
}

function init() {
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
}

/* To Do

-Probably should eliminate this functionality for now and implement later
  -Add proper deleteNode functions
  -Add proper deleteEdge functions

-Known Bugs
  -Clicking "Start Over" on puzzle builder makes the graph canvas resize to smaller size when it starts out very wide
*/

/***/ })
/******/ ]);