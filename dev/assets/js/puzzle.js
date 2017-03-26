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

let nodes = null;
let edges = null;
let data = null;
let options = null;
let container = null;
let network = null;
let optimalAnswer = null;
const domain = 'localhost:3001';

const removeActive = function removeActive(element) {
  if (element.classList.contains('active')) {
    element.classList.remove('active');
  }
};

const saveOptimalAnswer = function saveOptimalAnswer() {
  optimalAnswer = nodes.get().reduce((total, node) => {
    return node.original ? total + 1 : total;
  }, 0);
};

const setUpContainer = function setUpContainer() {
  container = document.querySelector('.graph-area__graph-canvas');
};

const setUpOptions = function setUpOptions() {
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

const updateConnectedNodes = function updateConnectedNodes() {
  // Reset all serviced nodes to unserviced (but leave hotspots alone)
  nodes.forEach((node) => {
    if (node.group === 'service') {
      node.group = 'noService';
      nodes.update(node);
    }
  });

  // Find all the hotspot nodes and have them service all the connected non-hotspot nodes
  nodes.forEach((node) => {
    if (node.group === 'hotspot') {
      edges.forEach((edge) => {
        let servicedId = 0;
        if (edge.from === node.id) {
          servicedId = edge.to;
        } else if (edge.to === node.id) {
          servicedId = edge.from;
        }

        if (servicedId) {
          const servicedNode = nodes.get(servicedId);

          if (servicedNode.group === 'noService') {
            servicedNode.group = 'service';
            nodes.update(servicedNode);
          }
        }
      });
    }
  });
};

const resetAllNodes = function resetAllNodes() {
  nodes.forEach((node) => {
    node.group = 'noService';
    nodes.update(node);
  });
};

const setUpData = function setUpData(nodeArray, edgeArray) {
  const newEdgeArray = [];
  edgeArray.forEach((edge) => {
    newEdgeArray.push({ id: edge.id, from: edge.from, to: edge.to });
  });

  edges = new vis.DataSet(newEdgeArray);
  nodes = new vis.DataSet(nodeArray);
  resetAllNodes();
  data = {
    nodes,
    edges
  };
};

const allNodesHaveWifi = function allNodesHaveWifi() {
  return nodes.get().every(node => node.group !== 'noService');
};

const countHotspots = function countHotspots() {
  let hotspots = 0;

  nodes.forEach((node) => {
    if (node.group === 'hotspot') {
      hotspots += 1;
    }
  });

  return hotspots;
};

const updateHotspotCount = function updateHotspotCount() {
  document.querySelector('.graph-area__count-wrap-count').innerHTML = countHotspots();
};

const checkForCompletion = function checkForCompletion() {
  const messageDiv = document.querySelector('.message-box');
  const messageElem = document.querySelector('.message-box__message');
  const links = document.querySelectorAll('.message-box__options');
  if (allNodesHaveWifi()) {
    // Display a message telling whether optimization is complete
    if (countHotspots() === optimalAnswer) {
      // Success!
      messageElem.innerHTML = 'You found an optimal solution!';
      links.forEach((link) => {
        link.style.display = 'block';
      });
    } else {
      messageElem.innerHTML = 'Try again using less hotspots. You can do it!';
      links.forEach((link) => {
        link.style.display = 'none';
      });
    }
    messageDiv.classList.add('active');
  } else {
    document.querySelector('.message-box__message').innerHTML = '';
    removeActive(messageDiv);
  }
};

const setUpClickHandlers = function setUpClickHandlers() {
  network.on("click", (params) => {
    params.event = "[original event]";
    if (params.nodes.length > 0) {
      const id = params.nodes[0];
      const node = nodes.get(id);
      if (node.group !== 'hotspot') {
        nodes.update({ id, group: 'hotspot' });
        updateHotspotCount();
        // Then update which nodes should be in group 'service'
        updateConnectedNodes();
      } else if (node.group === 'hotspot') {
        nodes.update({ id, group: 'noService' });
        // Then update which nodes should be in group 'service'
        updateHotspotCount();
        updateConnectedNodes();
      }

      checkForCompletion();
    }
  });

  const messageDiv = document.querySelector('.message-box');

  messageDiv.addEventListener("click", () => {
    removeActive(messageDiv);
  });

  document.querySelector('button[name="reset"]').addEventListener("click", () => {
    resetAllNodes();
    updateHotspotCount();
    const messageElem = document.querySelector('.message-box__message');
    messageElem.innerHTML = '';
    removeActive(messageDiv);
  });

  const nextGraphLinks = document.querySelectorAll('.next-graph');

  nextGraphLinks.forEach((link) => {
    link.addEventListener("click", () => {
      // Need to get a puzzle that hasn't been attempted yet based on what is in localStorage
      const puzzleListString = localStorage.getItem('hotspotPuzzlesAttempted');

      // Need to figure out how this size will be determined
      const size = 'small';

      const xhttp = new XMLHttpRequest();
      xhttp.onreadystatechange = function() {
        if (this.readyState === 4 && this.status === 200) {
          console.log(`Response received from trying to get another puzzle: ${this.responseText}`);
          const code = this.responseText;
          window.location=`http://${domain}/hotspot/${code}`;
        }
      };
      console.log("Puzzle list as string: ", puzzleListString);
      xhttp.open("POST", `http://${domain}/get-hotspot-given-size/${size}`, true);
      xhttp.setRequestHeader("Content-type", "application/json");
      xhttp.send(puzzleListString);
    });
  });

  const createOwnLinks = document.querySelectorAll('.create-own');

  createOwnLinks.forEach((link) => {
    link.addEventListener("click", () => {
      window.location=`http://${domain}/create`;
    });
  });
};

const setUpNetwork = function setUpNetwork(nodeArray, edgeArray) {
  setUpOptions();
  setUpData(nodeArray, edgeArray);
  setUpContainer();
  network = new vis.Network(container, data, options);
  setUpClickHandlers();
  saveOptimalAnswer();
};

const useDefaultPuzzle = function useDefaultPuzzle() {
  let coordsArray = [
   [0, 0], [2, 0], [3, 0], [4, 0], [4, 2], [4, 3], [4, 4], [3, 4], [2, 4],
   [1, 4], [0, 4], [0, 3], [0, 2], [1, 2], [1, 1], [2, 1], [3, 1], [3, 2],
   [3, 3], [2, 3], [2, 2], [1, 3]
  ];

  coordsArray = coordsArray.map(coords =>
   [(coords[0] * 0.707) - (coords[1] * -0.707), ((coords[0] * -0.707) + ((coords[1] * 0.707) * 0.75))]
  );
  const scaleFactor = 200;

  const nodeArray = [];
  const originals = [6, 12, 15, 17, 20];

  for (let i = 1; i <= coordsArray.length; i += 1) {
    let isOriginal = false;
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

  const edgePairs = [[1, 2], [1, 15], [1, 13], [2, 15], [2, 3], [2, 16], [3, 4],
                   [3, 17], [5, 18], [5, 6], [6, 8], [6, 7], [7, 8], [8, 9],
                   [9, 10], [9, 20], [10, 11], [10, 12], [11, 12], [12, 13],
                   [13, 14], [14, 15], [14, 21], [15, 16], [16, 21], [17, 18],
                   [18, 19], [18, 21], [19, 20], [20, 21], [4, 5], [4, 17],
                   [12, 22], [14, 22]];

  const edgeArray = [];

  edgePairs.forEach(edgePair =>
    edgeArray.push({ from: edgePair[0], to: edgePair[1] })
  );

  setUpNetwork(nodeArray, edgeArray);
};

const addCodeToListOfAttemptedPuzzles = function addCodeToListOfAttemptedPuzzles(code) {
  const puzzleList = JSON.parse(localStorage.getItem('hotspotPuzzlesAttempted')) || [];
  let found = false;
  for (let i = 0; i < puzzleList.length; i += 1) {
    if (puzzleList[i].code === code) {
      found = true;
    }
  }
  console.log(`Code ${code} was found: ${found}`);
  if (!found) {
    puzzleList.push({ code });
  }
  localStorage.setItem('hotspotPuzzlesAttempted', JSON.stringify(puzzleList));
};

const usePuzzle = function usePuzzle(code) {
  fetch(`http://${domain}/hotspot-data/${code}`)
    .then(
      (response) => {
        if (response.ok) {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.indexOf('application/json') !== -1) {
            return response.json().then((json) => {
              setUpNetwork(json.puzzle.graph.nodes, json.puzzle.graph.edges);
              addCodeToListOfAttemptedPuzzles(code);
            }).catch(error => console.log("Error with JSON file"));
          }
          throw new Error('Unexpected content type');
        }
        throw new Error('Error in network response');
      }
    )
    .catch(() => {
      // handle error condition
    });
};

// Export this so that puzzle.hbs can call this function to get the puzzle set up
module.exports = {
  usePuzzle
};
