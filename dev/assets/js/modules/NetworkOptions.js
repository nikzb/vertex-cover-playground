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

const updateNetworkOptions = function updateNetworkOptions(network, options) {
  network.setOptions(options);
};

const setUpOptionsForAddHotspots = function setUpOptionsForAddHotspots(network, options) {
  options.manipulation.addNode = getAddNodeFunc('hotspot', network);
  options.manipulation.addEdge = false;
  options.manipulation.deleteNode = true;
  // options.manipulation.enabled = true;
  updateNetworkOptions(network, options);
  network.addNodeMode();
};

const setUpOptionsForAddServicedNodes = function setUpOptionsForAddServicedNodes(network, options) {
  options.manipulation.addNode = getAddNodeFunc('service', network);
  options.manipulation.addEdge = false;
  options.manipulation.deleteNode = true;
  updateNetworkOptions(network, options);
  network.addNodeMode();
};

const setUpOptionsForMakeClusters = function setUpOptionsForMakeClusters(network, graph, options) {
  options.manipulation.addNode = false;
  options.manipulation.deleteNode = false;
  options.manipulation.editEdge = false;
  options.manipulation.addEdge = (nodeData, callback) => {
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
  updateNetworkOptions(network, options);
  network.addEdgeMode();
};

const setUpOptionsForConnectClusters = function setUpOptionsForConnectClusters(network, graph, options) {
  const inSameCluster = function inSameCluster(nodeA, nodeB) {
    const hotspot = graph.getNode(nodeA.connectedToWithinCluster[0]);

    for (let i = 0; i < hotspot.connectedToWithinCluster.length; i += 1) {
      if (hotspot.connectedToWithinCluster[i] === nodeB.id) {
        return true;
      }
    }

    return false;
  };

  options.manipulation.addNode = false;
  options.manipulation.deleteNode = false;
  options.manipulation.editEdge = false;
  options.manipulation.addEdge = (nodeData, callback) => {
    // Need to ensure that new edge connects a lonely service node to a hotspot
    const from = graph.getNode(nodeData.from);
    const to = graph.getNode(nodeData.to);

    if (nodeData.to !== nodeData.from &&
        from.group === 'service' &&
        to.group === 'service' &&
        !inSameCluster(from, to)) {
      nodeData.dashes = 'true';
      callback(nodeData);
      network.addEdgeMode();
    }
  };
  updateNetworkOptions(network, options);
  network.addEdgeMode();
};

const setUpOptionsForFinished = function setUpOptionsForFinished(network, options) {
  options.manipulation.addNode = false;
  options.manipulation.deleteNode = false;
  options.manipulation.editEdge = false;
  options.manipulation.addEdge = false;
  options.manipulation.deleteEdge = false;
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
