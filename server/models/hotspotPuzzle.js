const mongoose = require('mongoose');

const HotspotPuzzle = mongoose.model('HotspotPuzzle', {
  code: {
    type: String,
    required: true
  },
  graph: {
    type: Object,
    required: true
  }
});

module.exports = { HotspotPuzzle };
