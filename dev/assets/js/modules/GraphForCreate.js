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
  getNumberOfServicedNodes
};
