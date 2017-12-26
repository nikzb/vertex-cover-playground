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

const returnNextIndex = function returnNextIndex(codeList, code, direction) {
  const codeIndex = codeList.indexOf(code);

  let codeIndexForReturn;

  if (direction === 'forward') {
    codeIndexForReturn = codeIndex + 1;
    // Make sure the code is not at the end of the list
    if (codeIndex === codeList.length - 1) {
      codeIndexForReturn = 0;
    }
  } else { // direction must be 'back'
    codeIndexForReturn = codeIndex - 1;
    // Make sure the code is not at the front of the list
    if (codeIndex === 0) {
      codeIndexForReturn = codeList.length - 1;
    }
  }

  return codeIndexForReturn;
};

// Given a status, return the first puzzle with that status
router.get('/admin/:status', async (req, res) => {
  const status = req.params.status;

  try {
    const puzzleList = await HotspotPuzzle.find({ approved: status }, 'code');

    // If there are no puzzles with this status, send back an empty string
    if (puzzleList.length === 0) {
      return res.send('');
    }

    const codeList = puzzleList.map(puzzleObj => puzzleObj.code);

    return res.send(codeList[0]);
  } catch (e) {
    return res.status(400).send(e);
  }
});

// Given a puzzle status, code, and direction, attempt to return the next puzzle with that status
router.get('/next/:status/:code/:direction', async (req, res) => {
  const code = req.params.code;
  const status = req.params.status;
  const direction = req.params.direction || 'forward';

  try {
    const puzzleList = await HotspotPuzzle.find({ approved: status }, 'code');
    const codeList = puzzleList.map(puzzleObj => puzzleObj.code);

    // If there are no puzzles with this status, send back an empty string
    if (codeList.length === 0) {
      return res.send('');
    }

    // If there is only one pending puzzle, send back its code
    if (codeList.length === 1) {
      return res.send(codeList[0]);
    }

    // If there are multiple puzzles, find the one that was sent and return the next one
    const index = returnNextIndex(codeList, code, direction);

    return res.send(codeList[index]);
  } catch (e) {
    return res.status(400).send(e);
  }
});

// Deprecated
// Get the next puzzle that is pending approval (next after the one with the given code)
// If none need approval, just get the next puzzle from all the puzzles
router.get('/next-pending/:code', async (req, res) => {
  const code = req.params.code;

  let list;

  try {
    const puzzleList = await HotspotPuzzle.find({ approved: 'pending' }, 'code');
    const codeList = puzzleList.map(puzzleObj => puzzleObj.code);

    if (codeList.length === 0 || (codeList.length === 1 && codeList[0] === code)) {
      const allPuzzlesList = await HotspotPuzzle.find({}, 'code');

      const allCodesList = allPuzzlesList.map(puzzleObj => puzzleObj.code);
      list = allCodesList;
    } else {
      list = codeList;
    }
  } catch (e) {
    return res.status(400).send(e);
  }

  const index = returnNextIndex(list, code);
  return res.send(list[index]);
});

module.exports = router;
