const express = require('express');

const router = express.Router();
const { HotspotPuzzle } = require('../models/hotspotPuzzle');

const { authenticateAdmin } = require('../middleware/authenticate');

router.patch('/approved-fix', authenticateAdmin, (req, res) => {
  HotspotPuzzle.find({}).then((puzzleList) => {
    puzzleList.forEach((puzzle) => {
      if (puzzle !== undefined && puzzle.approved === undefined) {
        HotspotPuzzle.findByIdAndUpdate(puzzle.id, { approved: 'pending' }, { new: true })
        .then((fixedPuzzle) => {
          console.log(`found puzzle with id ${fixedPuzzle.id}, and added approved field set to pending`);
        }, (e) => {
          res.status(400).send(e);
        });
      }
    });
  }, (e) => {
    res.status(400).send(e);
  });
});

module.exports = router;
