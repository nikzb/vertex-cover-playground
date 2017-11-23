const _ = require('lodash');

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

const getDeleteNodeFunc = function getDeleteNodeFunc(network, graph) {
  return (nodeData, callback) => {
    const IDsOfNodesToDelete = nodeData.nodes;
    console.log("IDs of nodes to delete");
    console.log(IDsOfNodesToDelete);

    IDsOfNodesToDelete.forEach((nodeId) => {
      const node = graph.getNode(nodeId);

      console.log("Deleting this node:");
      console.log(node);

      if (node.group === 'hotspot') {
        // Don't need this since next part will delete all the necessary edges
        // Delete all the edges between this hotspot and the service nodes it connects to
        // deleteEdgesTouchingNode(graph, nodeId);

        // Delete all the edges touching the serviced nodes this hotspot is connected to
        graph.getNode(nodeId).connectedToWithinCluster.forEach((serviceNodeId) => {
          deleteEdgesTouchingNode(graph, serviceNodeId);
        });

        // Delete all the service nodes connected to the hotspot we are deleting
        node.connectedToWithinCluster.forEach((serviceNodeId) => {
          console.log(`Deleting service node (because it is attached to hotspot we are deleting): ${serviceNodeId}`);
          graph.deleteNode(serviceNodeId);
        });

        // Delete the hotspot
        graph.deleteNode(nodeId);
      } else { // must be a service node
        // Must remove nodeId from the hotspots connectedToWithinCluster list
        const hotspotId = node.connectedToWithinCluster[0];
        const hotspot = graph.getNode(hotspotId);
        // const index = _.findIndex(hotspot.connectedToWithinCluster, o => o.id === nodeId);
        const index = hotspot.connectedToWithinCluster.indexOf(nodeId);
        hotspot.connectedToWithinCluster.splice(index, 1);
        console.log(`Updating hotspot`);
        console.log(hotspot);
        console.log(`So it is no longer connected to `);
        console.log(nodeId);
        graph.updateNode(hotspot);

        // Delete all the edges touching the serviced node
        deleteEdgesTouchingNode(graph, nodeId);

        // Delete the service node
        graph.deleteNode(nodeId);
      }
    });

    callback(nodeData);
  };
};

const getDeleteEdgeFunc = function getDeleteEdgeFunc(network, graph) {
  return (nodeData, callback) => {
    nodeData.edges.forEach((edgeId) => {
      const edge = graph.getEdge(edgeId);

      console.log("Edge to delete");
      console.log(edge);

      const fromNode = graph.getNode(edge.from);
      const toNode = graph.getNode(edge.to);

      // Check if is a cluster edge
      if (fromNode.group === 'hotspot' || toNode.group === 'hotspot') {
        // Deleting a cluster edge must also delete the serviced node
        let serviceNodeId;
        let hotspotId;

        if (fromNode.group === 'hotspot') {
          serviceNodeId = edge.to;
          hotspotId = edge.from;
        } else {
          serviceNodeId = edge.from;
          hotspotId = edge.to;
        }

        // Need to remove the id of the serviced node from the hotspot's connectedToWithinCluster list
        const hotspot = graph.getNode(hotspotId);
        const index = hotspot.connectedToWithinCluster.indexOf(serviceNodeId);
        hotspot.connectedToWithinCluster.splice(index, 1);
        console.log('Updating hotspot (so no longer connected to serviceNode)');
        console.log(hotspot);
        graph.updateNode(hotspot);

        // Need to delete all the edges that touch the service node that is about to get deleted
        deleteEdgesTouchingNode(graph, serviceNodeId);

        console.log('Deleting service node');
        console.log(serviceNodeId);
        graph.deleteNode(serviceNodeId);
      } else {
        // This must be an edge connecting two different clusters.
        // We only have to delete the selected edge from the graph
        console.log('Deleting edge');
        console.log(edgeId);
        graph.deleteEdge(edgeId);
      }
    });

    callback(nodeData);
  };
};

const updateNetworkOptions = function updateNetworkOptions(network, options) {
  network.setOptions(options);
};

const setUpOptionsForAddHotspots = function setUpOptionsForAddHotspots(network, graph, options) {
  options.manipulation.addNode = getAddNodeFunc('hotspot', network);
  options.manipulation.editNode = (nodeData, callback) => {
    callback(nodeData);
  };
  options.manipulation.addEdge = false;
  options.manipulation.deleteNode = getDeleteNodeFunc(network, graph);
  options.manipulation.deleteEdge = getDeleteEdgeFunc(network, graph);
  options.manipulation.editEdge = false;
  options.manipulation.enabled = true;
  updateNetworkOptions(network, options);
  network.addNodeMode();
};

const setUpOptionsForAddServicedNodes = function setUpOptionsForAddServicedNodes(network, graph, options) {
  options.manipulation.addNode = getAddNodeFunc('service', network);
  options.manipulation.addEdge = false;
  options.manipulation.deleteNode = getDeleteNodeFunc(network, graph);
  options.manipulation.deleteEdge = getDeleteEdgeFunc(network, graph);
  options.manipulation.editEdge = false;
  updateNetworkOptions(network, options);
  network.addNodeMode();
};

const setUpOptionsForMakeClusters = function setUpOptionsForMakeClusters(network, graph, options) {
  options.manipulation.addNode = false;
  options.manipulation.deleteNode = getDeleteNodeFunc(network, graph);
  options.manipulation.editEdge = false;
  options.manipulation.deleteEdge = getDeleteEdgeFunc(network, graph);
  // options.manipulation.deleteEdge = (nodeData, callback) => {
  //   // const edgeToDelete = graph.getEdge(nodeData.edges[0]);
  //   nodeData.edges.forEach((edgeToDelete) => {
  //     console.log(edgeToDelete);
  //     const from = graph.getNode(edgeToDelete.from);
  //     const to = graph.getNode(edgeToDelete.to);
  //
  //     let serviceNode;
  //     let hotspot;
  //
  //     if (from.group === 'service') {
  //       serviceNode = from;
  //       hotspot = to;
  //     } else {
  //       serviceNode = to;
  //       hotspot = from;
  //     }
  //
  //     serviceNode.connectedToWithinCluster = [];
  //     const index = hotspot.connectedToWithinCluster.indexOf(serviceNode.id);
  //     hotspot.connectedToWithinCluster.splice(index, 1);
  //
  //     graph.updateNode(serviceNode);
  //     graph.updateNode(hotspot);
  //   });
  //
  //   callback(nodeData);
  // };
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
  // Return true if nodeA and nodeB are in the same cluster
  // Precondition: nodeA and nodeB are both service nodes
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
  options.manipulation.deleteNode = getDeleteNodeFunc(network, graph);
  options.manipulation.editEdge = false;
  options.manipulation.deleteEdge = getDeleteEdgeFunc(network, graph);
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
