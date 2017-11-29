const getOptionsForPuzzle = function getOptionsForPuzzle() {
  return {
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

const getOptionsForCreatePuzzle = function getOptionsForCreatePuzzle() {
  return {
    manipulation: {
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
};

const deleteEdgesTouchingNode = function deleteEdgesTouchingNode(graph, nodeId) {
  graph.getEdges().forEach((edgeToCheck) => {
    if (edgeToCheck.from === nodeId || edgeToCheck.to === nodeId) {
      graph.deleteEdge(edgeToCheck.id);
    }
  });
};

const getAddNodeFunc = function getAddNodeFunc(group, network) {
  return (nodeData, callback) => {
    nodeData.label = '';
    nodeData.original = (group === 'hotspot');
    nodeData.group = group;
    nodeData.connectedToWithinCluster = [];
    callback(nodeData);
    network.addNodeMode();
  };
};

const getAddEdgeForMakeClustersFunc = function getAddEdgeForMakeClustersFunc(network, graph) {
  return (nodeData, callback) => {
    // Need to ensure that new edge connects a lonely service node to a hotspot
    const from = graph.getNode(nodeData.from);
    const to = graph.getNode(nodeData.to);

    if (from.group !== to.group) {
      let serviceNode;
      let hotspot;
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
        callback(nodeData);
        network.addEdgeMode();
      }
    }
  };
};

// Return true if nodeA and nodeB are in the same cluster
// Precondition: nodeA and nodeB are both service nodes
const inSameCluster = function inSameCluster(graph, nodeA, nodeB) {
  const hotspot = graph.getNode(nodeA.connectedToWithinCluster[0]);

  for (let i = 0; i < hotspot.connectedToWithinCluster.length; i += 1) {
    if (hotspot.connectedToWithinCluster[i] === nodeB.id) {
      return true;
    }
  }

  return false;
};

const getAddEdgeForConnectClustersFunc = function getAddEdgeForConnectClustersFunc(network, graph) {
  return (nodeData, callback) => {
    // Need to ensure that new edge connects a lonely service node to a hotspot
    const from = graph.getNode(nodeData.from);
    const to = graph.getNode(nodeData.to);

    if (nodeData.to !== nodeData.from &&
        from.group === 'service' &&
        to.group === 'service' &&
        !inSameCluster(graph, from, to)) {
      nodeData.dashes = 'true';
      callback(nodeData);
      network.addEdgeMode();
    }
  };
};

const updateNetworkOptions = function updateNetworkOptions(network, options) {
  network.setOptions(options);
};

const setUpOptionsForAddHotspots = function setUpOptionsForAddHotspots(network, graph, options) {
  options.manipulation.addEdge = false;
  updateNetworkOptions(network, options);
};

const setUpOptionsForAddServicedNodes = function setUpOptionsForAddServicedNodes(network, graph, options) {
  options.manipulation.addEdge = false;
  updateNetworkOptions(network, options);
};

const setUpOptionsForMakeClusters = function setUpOptionsForMakeClusters(network, graph, options) {
  options.manipulation.addEdge = getAddEdgeForMakeClustersFunc(network, graph);
  updateNetworkOptions(network, options);
  network.addEdgeMode();
};

const setUpOptionsForConnectClusters = function setUpOptionsForConnectClusters(network, graph, options) {
  options.manipulation.addEdge = getAddEdgeForConnectClustersFunc(network, graph);
  updateNetworkOptions(network, options);
  network.addEdgeMode();
};

const setUpOptionsForFinished = function setUpOptionsForFinished(network, options) {
  options.manipulation.addEdge = false;
  updateNetworkOptions(network, options);
};

module.exports = {
  getOptionsForPuzzle,
  getOptionsForCreatePuzzle,
  setUpOptionsForAddHotspots,
  setUpOptionsForAddServicedNodes,
  setUpOptionsForMakeClusters,
  setUpOptionsForConnectClusters,
  setUpOptionsForFinished
};
