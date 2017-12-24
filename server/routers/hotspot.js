const express = require('express');

const router = express.Router();
const { HotspotPuzzle } = require('../models/hotspotPuzzle');

// Render a puzzle page with the puzzle that has the requested code
router.get('/:code', async (req, res) => {
  const code = req.params.code;

  const isNew = req.query.new || false;

  if (code === 'CODE') {
    return res.render('puzzle.hbs', { code, isNew });
  }
  try {
    // if not a valid code, render the puzzle not found page
    const puzzle = HotspotPuzzle.findOne({ code });
    if (!puzzle) {
      return res.render('notFound.hbs', { code });
    }
    return res.render('puzzle.hbs', { code, isNew });
  } catch (e) {
    return res.send('<h1>There was an error while attempting to load the puzzle</h1>');
  }
});

router.get('/data/:code', (req, res) => {
  const code = req.params.code;

  HotspotPuzzle.findOne({ code }).then((puzzle) => {
    if (!puzzle) {
      return res.status(404).send();
    }

    return res.send({ puzzle });
  }).catch((e) => {
    res.status(400).send(e);
  });
});

router.post('/', (req, res) => {
  const puzzle = new HotspotPuzzle({
    graph: req.body.graph,
    code: req.body.code,
    size: req.body.size,
    approved: req.body.approved
  });

  puzzle.save().then((savedPuzzle) => {
    res.send({ savedPuzzle });
  }, (e) => {
    res.status(400).send(e);
  });
});

router.delete('/:code', (req, res) => {
  const code = req.params.code;
  HotspotPuzzle.findOneAndRemove({ code })
  .then((puzzle) => {
    res.send({ puzzle });
  }, (e) => {
    res.status(400).send(e);
  });
});

router.patch('/approve/:code/:approved', (req, res) => {
  const code = req.params.code;
  const approved = req.params.approved;
  HotspotPuzzle.findOneAndUpdate({ code }, { approved }, { new: true })
  .then((puzzle) => {
    res.send({ puzzle });
  }, (e) => {
    res.status(400).send(e);
  });
});

// Take a puzzle code and render the admin view for that puzzle
// Code 'X' can be used to load the next puzzle pending approval
// If there are no pending puzzles, it will render a random puzzle
router.get('/master/:code', (req, res) => {
  const code = req.params.code;

  if (code === 'X') {
    HotspotPuzzle.findOne({ approved: 'pending' }).then((puzzle) => {
      if (!puzzle) {
        // return res.render('notFound.hbs', { code: 'ERROR' });
        HotspotPuzzle.findOne({ }).then(randomPuzzle =>
          res.render('puzzleAdminView.hbs', { code: randomPuzzle.code })
        );
      } else {
        return res.render('puzzleAdminView.hbs', { code: puzzle.code });
      }
    }).catch((e) => {
      res.status(400).send(e);
    });
  } else {
    HotspotPuzzle.findOne({ code }).then((puzzle) => {
      if (!puzzle) {
        return res.render('notFound.hbs', { code });
      }
      return res.render('puzzleAdminView.hbs', { code });
    }).catch((e) => {
      res.status(400).send(e);
    });
  }
});

module.exports = router;
