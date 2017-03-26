var EntryPoint =
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
/******/ 	return __webpack_require__(__webpack_require__.s = 1);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */,
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


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

var nodes = null;
var edges = null;
var data = null;
var options = null;
var container = null;
var network = null;
var optimalAnswer = null;
var domain = 'localhost:3001';

var removeActive = function removeActive(element) {
  if (element.classList.contains('active')) {
    element.classList.remove('active');
  }
};

var saveOptimalAnswer = function saveOptimalAnswer() {
  optimalAnswer = nodes.get().reduce(function (total, node) {
    return node.original ? total + 1 : total;
  }, 0);
};

var setUpContainer = function setUpContainer() {
  container = document.querySelector('.graph-area__graph-canvas');
};

var setUpOptions = function setUpOptions() {
  options = {
    nodes: {
      shape: 'dot',
      size: 15,
      font: {
        size: 32
      },
      borderWidth: 0,
      shadow: {
        enabled: true,
        size: 3
      },
      fixed: true,
      labelHighlightBold: false
    },
    edges: {
      width: 2,
      shadow: false,
      dashes: false,
      color: {
        color: 'darkgrey'
        // inherit: 'both'
      },
      selectionWidth: 0
    },
    interaction: {
      // hover:true,
    },
    groups: {
      useDefaultGroups: false,
      noService: {
        color: {
          background: 'red',
          highlight: { background: 'red', border: 'red', borderWidth: 0 }
        },
        size: 15
      },
      hotspot: {
        color: {
          background: 'orange',
          highlight: { background: 'orange', border: 'orange', borderWidth: 0 }
        },
        size: 18
      },
      service: {
        color: {
          background: 'yellow',
          highlight: { background: 'yellow', border: 'yellow', borderWidth: 0 }
        },
        size: 15
      }
    }
  };
};

var updateConnectedNodes = function updateConnectedNodes() {
  // Reset all serviced nodes to unserviced (but leave hotspots alone)
  nodes.forEach(function (node) {
    if (node.group === 'service') {
      node.group = 'noService';
      nodes.update(node);
    }
  });

  // Find all the hotspot nodes and have them service all the connected non-hotspot nodes
  nodes.forEach(function (node) {
    if (node.group === 'hotspot') {
      edges.forEach(function (edge) {
        var servicedId = 0;
        if (edge.from === node.id) {
          servicedId = edge.to;
        } else if (edge.to === node.id) {
          servicedId = edge.from;
        }

        if (servicedId) {
          var servicedNode = nodes.get(servicedId);

          if (servicedNode.group === 'noService') {
            servicedNode.group = 'service';
            nodes.update(servicedNode);
          }
        }
      });
    }
  });
};

var resetAllNodes = function resetAllNodes() {
  nodes.forEach(function (node) {
    node.group = 'noService';
    nodes.update(node);
  });
};

var setUpData = function setUpData(nodeArray, edgeArray) {
  var newEdgeArray = [];
  edgeArray.forEach(function (edge) {
    newEdgeArray.push({ id: edge.id, from: edge.from, to: edge.to });
  });

  edges = new vis.DataSet(newEdgeArray);
  nodes = new vis.DataSet(nodeArray);
  resetAllNodes();
  data = {
    nodes: nodes,
    edges: edges
  };
};

var allNodesHaveWifi = function allNodesHaveWifi() {
  return nodes.get().every(function (node) {
    return node.group !== 'noService';
  });
};

var countHotspots = function countHotspots() {
  var hotspots = 0;

  nodes.forEach(function (node) {
    if (node.group === 'hotspot') {
      hotspots += 1;
    }
  });

  return hotspots;
};

var updateHotspotCount = function updateHotspotCount() {
  document.querySelector('.graph-area__count-wrap-count').innerHTML = countHotspots();
};

var checkForCompletion = function checkForCompletion() {
  var messageDiv = document.querySelector('.message-box');
  var messageElem = document.querySelector('.message-box__message');
  var links = document.querySelectorAll('.message-box__options');
  if (allNodesHaveWifi()) {
    // Display a message telling whether optimization is complete
    if (countHotspots() === optimalAnswer) {
      // Success!
      messageElem.innerHTML = 'You found an optimal solution!';
      links.forEach(function (link) {
        link.style.display = 'block';
      });
    } else {
      messageElem.innerHTML = 'Try again using less hotspots. You can do it!';
      links.forEach(function (link) {
        link.style.display = 'none';
      });
    }
    messageDiv.classList.add('active');
  } else {
    document.querySelector('.message-box__message').innerHTML = '';
    removeActive(messageDiv);
  }
};

var setUpClickHandlers = function setUpClickHandlers() {
  network.on("click", function (params) {
    params.event = "[original event]";
    if (params.nodes.length > 0) {
      var id = params.nodes[0];
      var node = nodes.get(id);
      if (node.group !== 'hotspot') {
        nodes.update({ id: id, group: 'hotspot' });
        updateHotspotCount();
        // Then update which nodes should be in group 'service'
        updateConnectedNodes();
      } else if (node.group === 'hotspot') {
        nodes.update({ id: id, group: 'noService' });
        // Then update which nodes should be in group 'service'
        updateHotspotCount();
        updateConnectedNodes();
      }

      checkForCompletion();
    }
  });

  var messageDiv = document.querySelector('.message-box');

  messageDiv.addEventListener("click", function () {
    removeActive(messageDiv);
  });

  document.querySelector('button[name="reset"]').addEventListener("click", function () {
    resetAllNodes();
    updateHotspotCount();
    var messageElem = document.querySelector('.message-box__message');
    messageElem.innerHTML = '';
    removeActive(messageDiv);
  });

  var nextGraphLinks = document.querySelectorAll('.next-graph');

  nextGraphLinks.forEach(function (link) {
    link.addEventListener("click", function () {
      // Need to get a puzzle that hasn't been attempted yet based on what is in localStorage
      var puzzleListString = localStorage.getItem('hotspotPuzzlesAttempted');

      // Need to figure out how this size will be determined
      var size = 'small';

      var xhttp = new XMLHttpRequest();
      xhttp.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
          console.log('Response received from trying to get another puzzle: ' + this.responseText);
          var code = this.responseText;
          window.location = 'http://' + domain + '/hotspot/' + code;
        }
      };
      console.log("Puzzle list as string: ", puzzleListString);
      xhttp.open("POST", 'http://' + domain + '/get-hotspot-given-size/' + size, true);
      xhttp.setRequestHeader("Content-type", "application/json");
      xhttp.send(puzzleListString);
    });
  });

  var createOwnLinks = document.querySelectorAll('.create-own');

  createOwnLinks.forEach(function (link) {
    link.addEventListener("click", function () {
      window.location = 'http://' + domain + '/create';
    });
  });
};

var setUpNetwork = function setUpNetwork(nodeArray, edgeArray) {
  setUpOptions();
  setUpData(nodeArray, edgeArray);
  setUpContainer();
  network = new vis.Network(container, data, options);
  setUpClickHandlers();
  saveOptimalAnswer();
};

var useDefaultPuzzle = function useDefaultPuzzle() {
  var coordsArray = [[0, 0], [2, 0], [3, 0], [4, 0], [4, 2], [4, 3], [4, 4], [3, 4], [2, 4], [1, 4], [0, 4], [0, 3], [0, 2], [1, 2], [1, 1], [2, 1], [3, 1], [3, 2], [3, 3], [2, 3], [2, 2], [1, 3]];

  coordsArray = coordsArray.map(function (coords) {
    return [coords[0] * 0.707 - coords[1] * -0.707, coords[0] * -0.707 + coords[1] * 0.707 * 0.75];
  });
  var scaleFactor = 200;

  var nodeArray = [];
  var originals = [6, 12, 15, 17, 20];

  for (var i = 1; i <= coordsArray.length; i += 1) {
    var isOriginal = false;
    if (originals.includes(i)) {
      isOriginal = true;
    }
    nodeArray.push({
      id: i,
      group: 'noService',
      // label: i,
      original: isOriginal,
      x: coordsArray[i - 1][0] * scaleFactor,
      y: coordsArray[i - 1][1] * scaleFactor
    });
  }

  var edgePairs = [[1, 2], [1, 15], [1, 13], [2, 15], [2, 3], [2, 16], [3, 4], [3, 17], [5, 18], [5, 6], [6, 8], [6, 7], [7, 8], [8, 9], [9, 10], [9, 20], [10, 11], [10, 12], [11, 12], [12, 13], [13, 14], [14, 15], [14, 21], [15, 16], [16, 21], [17, 18], [18, 19], [18, 21], [19, 20], [20, 21], [4, 5], [4, 17], [12, 22], [14, 22]];

  var edgeArray = [];

  edgePairs.forEach(function (edgePair) {
    return edgeArray.push({ from: edgePair[0], to: edgePair[1] });
  });

  setUpNetwork(nodeArray, edgeArray);
};

var addCodeToListOfAttemptedPuzzles = function addCodeToListOfAttemptedPuzzles(code) {
  var puzzleList = JSON.parse(localStorage.getItem('hotspotPuzzlesAttempted')) || [];
  var found = false;
  for (var i = 0; i < puzzleList.length; i += 1) {
    if (puzzleList[i].code === code) {
      found = true;
    }
  }
  console.log('Code ' + code + ' was found: ' + found);
  if (!found) {
    puzzleList.push({ code: code });
  }
  localStorage.setItem('hotspotPuzzlesAttempted', JSON.stringify(puzzleList));
};

var usePuzzle = function usePuzzle(code) {
  fetch('http://' + domain + '/hotspot-data/' + code).then(function (response) {
    if (response.ok) {
      var contentType = response.headers.get('content-type');
      if (contentType && contentType.indexOf('application/json') !== -1) {
        return response.json().then(function (json) {
          setUpNetwork(json.puzzle.graph.nodes, json.puzzle.graph.edges);
          addCodeToListOfAttemptedPuzzles(code);
        }).catch(function (error) {
          return console.log("Error with JSON file");
        });
      }
      throw new Error('Unexpected content type');
    }
    throw new Error('Error in network response');
  }).catch(function () {
    // handle error condition
  });
};

// Export this so that puzzle.hbs can call this function to get the puzzle set up
module.exports = {
  usePuzzle: usePuzzle
};

/***/ })
/******/ ]);