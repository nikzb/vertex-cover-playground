const vis = require('vis');

let nodes = null;
let edges = null;
let data = null;

const getNode = function getNode(id) {
  return nodes.get(id);
};

const getEdge = function getEdge(id) {
  return edges.get(id);
};

const updateNode = function updateNode(node) {
  nodes.update(node);
};

const getNodes = function getNodes() {
  return nodes.get();
};

const getEdges = function getEdges() {
  return edges.get();
};

const getData = function getData() {
  return data;
};

// Just deletes a particular node - does not look at connections at all
const deleteNode = function deleteNode(id) {
  nodes.remove(id);
};

const deleteEdge = function deleteEdge(id) {
  edges.remove(id);
};

const addNode = function addNode(newNode) {
  nodes.add(newNode);
};

const getNumberOfHotspots = function getNumberOfHotspots() {
  const nodesArray = nodes.get();
  return nodesArray.reduce((sum, node) => {
    if (node.original) {
      return sum + 1;
    } else {
      return sum;
    }
  }, 0);
};

const getNumberOfServicedNodes = function getNumberOfServicedNodes() {
  const nodesArray = nodes.get();
  return nodesArray.reduce((sum, node) => {
    if (node.original) {
      return sum;
    } else {
      return sum + 1;
    }
  }, 0);
};

const reset = function reset() {
  nodes = new vis.DataSet();
  edges = new vis.DataSet();
  data = { nodes, edges };
};

// Remove nodes that are not connected to any other nodes
const removeLonelyNodes = function removeLonelyNodes() {
  let i = 0;

  const nodesArray = nodes.get();

  while (i < nodesArray.length) {
    if (nodesArray[i].connectedToWithinCluster.length === 0) {
      nodes.remove(nodesArray[i].id);
    }
    i += 1;
  }

  console.log(nodes.get());
};

const getSize = function getSize() {
  const nodesToCopy = getNodes();
  let size;
  if (nodesToCopy.length <= 15) {
    size = "small";
  } else if (nodesToCopy.length <= 25) {
    size = "medium";
  } else {
    size = "large";
  }

  return size;
};

const deleteEdgesTouchingNode = function deleteEdgesTouchingNode(nodeId) {
  getEdges().forEach((edgeToCheck) => {
    if (edgeToCheck.from === nodeId || edgeToCheck.to === nodeId) {
      deleteEdge(edgeToCheck.id);
    }
  });
};

const processDeleteNode = function processDeleteNode(id) {
  const nodeToDelete = getNode(id);

  if (nodeToDelete.group === 'hotspot') {
    // Delete all the edges touching the serviced nodes this hotspot is connected to
    nodeToDelete.connectedToWithinCluster.forEach((serviceNodeId) => {
      deleteEdgesTouchingNode(serviceNodeId);
    });

    // Delete all the service nodes connected to the hotspot we are deleting
    nodeToDelete.connectedToWithinCluster.forEach((serviceNodeId) => {
      deleteNode(serviceNodeId);
    });

    // Delete the hotspot
    deleteNode(id);
  } else { // must be a service node
    // Must remove nodeId from the hotspots connectedToWithinCluster list
    const hotspotId = nodeToDelete.connectedToWithinCluster[0];
    const hotspot = getNode(hotspotId);
    const index = hotspot.connectedToWithinCluster.indexOf(id);
    hotspot.connectedToWithinCluster.splice(index, 1);
    updateNode(hotspot);

    // Delete all the edges touching the serviced node
    deleteEdgesTouchingNode(id);

    // Delete the service node
    deleteNode(id);
  }
};

const processDeleteEdge = function processDeleteEdge(id) {

};

module.exports = {
  getNode,
  getEdge,
  updateNode,
  getNodes,
  getEdges,
  getData,
  deleteNode,
  deleteEdge,
  addNode,
  reset,
  removeLonelyNodes,
  getSize,
  getNumberOfHotspots,
  getNumberOfServicedNodes,
  processDeleteNode,
  processDeleteEdge
};
