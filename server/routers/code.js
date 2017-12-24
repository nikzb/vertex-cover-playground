const express = require('express');
const _ = require('lodash');

const router = express.Router();
const { HotspotPuzzle } = require('../models/hotspotPuzzle');
const { generateCode } = require('../helpers/codeGenerator');

router.get('/new', (req, res) => {
  generateCode(res, (response, newCode) => {
    response.send(newCode);
  });
});

// Takes a list of codes to choose from and a list of codes to avoid and returns
// a randomly chosen code.
const getRandomCodeNotInListToAvoid = function getRandomCodeNotInListToAvoid(codesToChooseFrom, codesToAvoid) {
  // Create a list that has the puzzles with codes to avoid removed
  const filteredList = _.differenceBy(codesToChooseFrom, codesToAvoid, 'code');

  // Now choose a puzzle at random, if there are any to choose from
  if (filteredList.length === 0) {
    // Technically there is nothing left to choose from, so just choose one at random
    const randomIndex = _.random(0, codesToChooseFrom.length - 1);
    return codesToChooseFrom[randomIndex].code;
  }
  const randomIndex = _.random(0, filteredList.length - 1);
  return filteredList[randomIndex].code;
};

// Fetches a randomly selected puzzle code given a list of codes to avoid
router.post('/random', (req, res) => {
  const codesToAvoid = req.body;
  HotspotPuzzle.find({}, 'code').then((codeList) => {
    if (!codeList) {
      return res.status(404).send();
    }
    const puzzleCodeChosen = getRandomCodeNotInListToAvoid(codeList, codesToAvoid);
    return res.send(puzzleCodeChosen);
  }).catch(e => res.status(400).send(e));
});

// Fetches a randomly selected puzzle code given a puzzle size and a list of codes to avoid
// Will only use puzzles that are approved
router.post('/random/:size', (req, res) => {
  const size = req.params.size;
  const codesToAvoid = req.body;
  // Query database for a list of puzzles with the given size
  HotspotPuzzle.find({ size, approved: 'yes' }, 'code').then((codeList) => {
    if (!codeList) {
      return res.status(404).send();
    }
    const puzzleCodeChosen = getRandomCodeNotInListToAvoid(codeList, codesToAvoid);
    return res.send(puzzleCodeChosen);
  }).catch(e => res.status(400).send(e));
});

// Get the next puzzle that is pending approval (next after the one with the given code)
// If none need approval, just get the next puzzle from all the puzzles
router.get('/next-pending/:code', (req, res) => {
  const returnNextIndex = function returnNextIndex(codeList, code) {
    const codeIndex = codeList.indexOf(code);

    let codeIndexForReturn = codeIndex + 1;
    // Make sure the code is not at the end of the list
    if (codeIndex === codeList.length - 1) {
      codeIndexForReturn = 0;
    }
    return res.send(codeList[codeIndexForReturn]);
  };

  const code = req.params.code;

  HotspotPuzzle.find({ approved: 'pending' }, 'code')
  .then((puzzleList) => {
    const codeList = puzzleList.map(puzzleObj => puzzleObj.code);

    if (codeList.length === 0 || (codeList.length === 1 && codeList[0] === code)) {
      HotspotPuzzle.find({}, 'code')
      .then((allPuzzlesList) => {
        const allCodesList = allPuzzlesList.map(puzzleObj => puzzleObj.code);
        returnNextIndex(allCodesList, code);
      });
    } else {
      returnNextIndex(codeList, code);
    }
  }).catch(e => res.status(400).send(e));
});

module.exports = router;
