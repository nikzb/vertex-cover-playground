const mongoose = require('mongoose');

const HotspotPuzzle = mongoose.model('HotspotPuzzle', {
  code: {
    type: String,
    required: true
  },
  graph: {
    type: Object,
    required: true
  },
  size: {
    type: String,
    required: true
  }
});

module.exports = { HotspotPuzzle };
