const vis = require('vis');

let nodes = null;
let edges = null;
let data = null;

const getNode = function getNode(id) {
  return nodes.get(id);
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

const reset = function reset() {
  nodes = new vis.DataSet();
  edges = new vis.DataSet();
  data = { nodes, edges };
};

const removeLonelyNodes = function removeLonelyNodes() {
  let i = 0;

  const nodesArray = nodes.get();

  while (i < nodesArray.length) {
    if (nodesArray[i].connectedToWithinCluster.length === 0) {
      nodes.remove(nodesArray[i].id);
    }
    i += 1;
  }
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
  updateNode,
  getNodes,
  getEdges,
  getData,
  reset,
  removeLonelyNodes,
  getSize
};
