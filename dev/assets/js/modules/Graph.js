let nodes = null;
let edges = null;
let data = null;
let optimalAnswer = null;

const updateOptimalAnswer = function updateOptimalAnswer() {
  optimalAnswer = nodes.get().reduce((total, node) => {
    return node.original ? total + 1 : total;
  }, 0);
};

const getOptimalAnswer = function getOptimalAnswer() {
  return optimalAnswer;
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

const getData = function getData() {
  return data;
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

const processNodeClick = function processNodeClick(id) {
  const node = nodes.get(id);
  if (node.group !== 'hotspot') {
    nodes.update({ id, group: 'hotspot' });
  } else if (node.group === 'hotspot') {
    nodes.update({ id, group: 'noService' });
  }
  // Update which nodes should be in group 'service'
  updateConnectedNodes();
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

  // setUpNetwork(nodeArray, edgeArray);
};

module.exports = {
  allNodesHaveWifi,
  countHotspots,
  getOptimalAnswer,
  updateOptimalAnswer,
  resetAllNodes,
  updateConnectedNodes,
  processNodeClick,
  getData,
  setUpData
};
