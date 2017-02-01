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
var domain = 'localhost:3000';

//useDefaultPuzzle();

function usePuzzle(code) {
  console.log('Printing code: ' + code);

  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      var data = JSON.parse(this.responseText);
      setUpNetwork(data.puzzle.graph.nodes, data.puzzle.graph.edges);
    }
  };

  xhttp.open("GET", "http://" + domain + "/hotspot/" + code, true);
  xhttp.send();
}

function useDefaultPuzzle() {
  var coordsArray = [
    [0,0],[2,0],[3,0],[4,0],[4,2],[4,3],[4,4],[3,4],[2,4],[1,4],[0,4],[0,3],[0,2],
    [1,2],[1,1],[2,1],[3,1],[3,2],[3,3],[2,3],[2,2],[1,3]
  ];

  coordsArray = coordsArray.map(function(coords) {
    return [coords[0] * 0.707 - coords[1] * -0.707, (coords[0] * -0.707 + coords[1] * 0.707) * 0.75];
  });
  var scaleFactor = 200;

  var nodeArray = [];
  var originals = [6, 12, 15, 17, 20];

  for (var i = 1; i <= coordsArray.length; i++) {
    var isOriginal = false;
    if (originals.includes(i)) {
      isOriginal = true;
    }
    nodeArray.push(
      {
        id: i,
        group: 'noService',
        // label: i,
        original: isOriginal,
        x: coordsArray[i-1][0] * scaleFactor,
        y: coordsArray[i-1][1] * scaleFactor
      }
    );
  }

  var edgePairs = [[1,2],[1,15],[1,13],[2,15],[2,3],[2,16],[3,4],[3,17],[5,18],
                   [5,6],[6,8],[6,7],[7,8],[8,9],[9,10],[9,20],[10,11],[10,12],
                   [11,12],[12,13],[13,14],[14,15],[14,21],[15,16],[16,21],
                   [17,18],[18,19],[18,21],[19,20],[20,21],[4,5],[4,17],[12,22],
                   [14,22]];

  var edgeArray = [];

  edgePairs.forEach(function(edgePair) {
    edgeArray.push({from: edgePair[0], to: edgePair[1]});
  });

  setUpNetwork(nodeArray, edgeArray);
}

function setUpNetwork(nodeArray, edgeArray) {
  setUpOptions();
  setUpData(nodeArray, edgeArray);
  setUpContainer();
  network = new vis.Network(container, data, options);
  setUpClickHandlers();
  saveOptimalAnswer();
}

function setUpClickHandlers() {
  network.on("click", function (params) {
      params.event = "[original event]";
      //document.getElementById('eventSpan').innerHTML = '<h2>Click event:</h2>' + JSON.stringify(params, null, 4);
      if (params.nodes.length > 0) {
        var id = params.nodes[0];
        var node = nodes.get(id);
        //document.getElementById('eventSpan2').innerHTML = '<h2>Node info:</h2>' + JSON.stringify(node, null, 4);
        if (node.group !== 'hotspot') {
          nodes.update({id: id, group: 'hotspot'});
          updateHotspotCount();
          // Then update which nodes should be in group 'service'
          updateConnectedNodes();
        }
        else if (node.group === 'hotspot') {
          nodes.update({id: id, group: 'noService'});
          // Then update which nodes should be in group 'service'
          updateHotspotCount();
          updateConnectedNodes();
        }

        checkForCompletion();
      }
  });

  document.querySelector('button[name="reset"]').addEventListener("click", function() {
    resetAllNodes();
    updateHotspotCount();
    document.querySelector('.optimal-message').innerHTML = '';
  });
}

function saveOptimalAnswer() {
  optimalAnswer = nodes.get().reduce(function(total, node) {
    return node.original ? total + 1 : total;
  }, 0);
}

function setUpContainer() {
  container = document.querySelector('.graph');
}

function setUpData(nodeArray, edgeArray) {
  var newEdgeArray = [];
  edgeArray.forEach(function(edge) {
    newEdgeArray.push({id: edge.id, from: edge.from, to: edge.to});
  });

  edges = new vis.DataSet(newEdgeArray);
  nodes = new vis.DataSet(nodeArray);
  resetAllNodes();
  data = {
    nodes: nodes,
    edges: edges
  };
}

function setUpOptions() {
  options = {
    nodes: {
        shape: 'dot',
        size: 30,
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
        size:20
      },
      hotspot: {
        color: {
          background:'orange',
          highlight: { background: 'orange', border: 'orange', borderWidth: 0 }
        },
        size:25
      },
      service: {
        color: {
          background:'yellow',
          highlight: { background: 'yellow', border: 'yellow', borderWidth: 0 }
        },
        size:20
      }
    }
  };
}

var updateConnectedNodes = function() {
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
      edges.forEach(function(edge) {
        var servicedId = 0;
        if (edge.from === node.id) {
          servicedId = edge.to;
        }
        else if (edge.to === node.id) {
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
}

var resetAllNodes = function() {
  nodes.forEach(function(node) {
    node.group = 'noService';
    nodes.update(node);
  });
}

var allNodesHaveWifi = function() {
  return nodes.get().every(function(node) {
    return node.group !== 'noService';
  });
}

var countHotspots = function() {
  var hotspots = 0;

  nodes.forEach(function(node) {
    if (node.group === 'hotspot') {
      hotspots += 1;
    }
  });

  return hotspots;
}

var updateHotspotCount = function() {
  document.querySelector('.hotspot-count').innerHTML = countHotspots();
}

var checkForCompletion = function() {
  if (allNodesHaveWifi()) {
    // Display a message telling whether optimization is complete
    if (countHotspots() === optimalAnswer) {
      // Success!
      document.querySelector('.optimal-message').innerHTML = 'You found an optimal solution!';
    }
    else {
      document.querySelector('.optimal-message').innerHTML = 'It is possible to use less hotspots. Try again. You can do it!';
    }
  }
  else {
    document.querySelector('.optimal-message').innerHTML = '';
  }
}
