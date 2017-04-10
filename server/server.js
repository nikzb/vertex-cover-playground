"use strict";

require('./config/config');

const _ = require('lodash');
const fp = require('path');
const express = require('express');
const hbs = require('hbs');
const bodyParser = require('body-parser');
const { ObjectID } = require('mongodb');

const { mongoose } = require('./db/mongoose');
const { HotspotPuzzle } = require('./models/hotspotPuzzle');
const { generateCode } = require('./helpers/codeGenerator');

const app = express();
const port = process.env.PORT;

console.log(`Printing port in server.js:${port}`);

hbs.registerPartials(fp.join(__dirname, '/../views/partials'));
app.set('view engine', 'hbs');
app.use(bodyParser.json());
console.log(__dirname);
app.use(express.static(fp.join(__dirname, '/../public')));

hbs.registerHelper('loadScriptWithPuzzleCode', code =>
  new hbs.SafeString(`<script type="text/javascript" src="/js/puzzle.js"></script>
                            <script>useDefaultPuzzle(${code});</script>`)
);

app.get('/hotspot/newCode', (req, res) => {
  generateCode(res, (response, newCode) => {
    response.send(newCode);
  });
});

app.get('/create', (req, res) => {
  res.render('create.hbs');
});

app.get('/', (req, res) => {
  res.render('puzzle.hbs');
});

// Render a puzzle page with the puzzle that has the requested code
app.get('/hotspot/:code', (req, res) => {
  const code = req.params.code;

  // if not a valid code, render the puzzle not found page
  // return res.send('<h1>This puzzle does not exist!</h1>');
  HotspotPuzzle.findOne({ code }).then((puzzle) => {
    if (!puzzle) {
      return res.send('<h1>This puzzle does not exist!</h1>');
    }
    return res.render('puzzle.hbs', { code });
  }).catch(e => res.send('<h1>There was an error while attempting to load the puzzle</h1>'));
});

app.get('/hotspot-data/:code', (req, res) => {
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

// Takes a list of codes to choose from and a list of codes to avoid and returns
// a randomly chosen code.
const getRandomCodeNotInListToAvoid = function getRandomCodeNotInListToAvoid(codesToChooseFrom, codesToAvoid) {
  // Create a list that has the puzzles with codes to avoid removed
  const filteredList = _.differenceBy(codesToChooseFrom, codesToAvoid, 'code');

  // Now choose a puzzle at random, if there are any to choose from
  if (filteredList.length === 0) {
    // Nothing left to choose from
    return null;
  }
  const randomIndex = _.random(0, filteredList.length - 1);
  return filteredList[randomIndex].code;
};

// Fetches a randomly selected puzzle code given a list of codes to avoid
app.post('/get-random-hotspot/', (req, res) => {
  console.log('request object', req.body);
  const codesToAvoid = req.body;

  console.log(`Must choose one not in this list`, codesToAvoid);
  HotspotPuzzle.find({}, 'code').then((codeList) => {
    console.log(`Codes in databse: ${codeList}`);
    if (!codeList) {
      return res.status(404).send();
    }
    const puzzleCodeChosen = getRandomCodeNotInListToAvoid(codeList, codesToAvoid);

    console.log(`Puzzle chosen: ${puzzleCodeChosen}`);
    return res.send(puzzleCodeChosen);
  }).catch(e => res.status(400).send(e));
});

// Fetches a randomly selected puzzle code given a puzzle size and a list of codes to avoid
app.post('/get-hotspot-given-size/', (req, res) => {
  const size = req.params.size;
  console.log(`Looking for puzzles with size ${size}`);
  console.log(req.body);
  const codesToAvoid = req.body;
  console.log(`Must choose one not in this list`, codesToAvoid);
  // Query database for a list of puzzles with the given size
  HotspotPuzzle.find({ size }, 'code').then((codeList) => {
    if (!codeList) {
      return res.status(404).send();
    }
    console.log(`Codes with size ${size}: ${codeList}`);

    const puzzleCodeChosen = getRandomCodeNotInListToAvoid(codeList, codesToAvoid);

    console.log(`Puzzle chosen: ${puzzleCodeChosen}`);
    return res.send(puzzleCodeChosen);
  }).catch(e => res.status(400).send(e));
});

app.post('/hotspot', (req, res) => {
  const puzzle = new HotspotPuzzle({
    graph: req.body.graph,
    code: req.body.code,
    size: req.body.size
  });

  puzzle.save().then((savedPuzzle) => {
    res.send({ savedPuzzle });
  }, (e) => {
    res.status(400).send(e);
  });
});

app.listen(port, () => {
  console.log(`Started on port ${port}`);
});

module.exports = { app };
