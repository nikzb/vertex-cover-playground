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
  // This code chooses a random small puzzle to use
  HotspotPuzzle.find({ size: 'small' }, 'code').then((codeList) => {
    const randomIndex = _.random(0, codeList.length - 1);
    const code = codeList[randomIndex].code;
    return res.render('puzzle.hbs', { code, isNew: false });
  });
});

// Render a puzzle page with the puzzle that has the requested code
app.get('/hotspot/:code', (req, res) => {
  const code = req.params.code;

  const isNew = req.query.new || false;

  if (code === 'CODE') {
    return res.render('puzzle.hbs', { code, isNew });
  }
  // if not a valid code, render the puzzle not found page
  HotspotPuzzle.findOne({ code }).then((puzzle) => {
    if (!puzzle) {
      // return res.send(`
      //   <h1>The code puzzle code ${code} is not valid!</h1>
      // `);
      return res.render('notFound.hbs', { code });
    }
    return res.render('puzzle.hbs', { code, isNew });
  }).catch(e => res.send('<h1>There was an error while attempting to load the puzzle</h1>'));
});

// Take a puzzle code and render the admin view for that puzzle
// Code 'X' can be used to load the next puzzle pending approval
app.get('/hotspot-master/:code', (req, res) => {
  const code = req.params.code;

  if (code === 'X') {
    HotspotPuzzle.findOne({ approved: 'pending' }).then((puzzle) => {
      if (!puzzle) {
        // return res.render('notFound.hbs', { code: 'ERROR' });
        return res.send('<h2>No pending puzzles</h2>');
      }
      return res.render('puzzleAdminView.hbs', { code: puzzle.code });
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

app.get('/approved-fix/', (req, res) => {
  HotspotPuzzle.find({}).then((puzzleList) => {
    puzzleList.forEach((puzzle) => {
      // Fix the sizes - only used an experiment
      // const numNodes = puzzle.nodes.reduce((acc, node) => {
      //   if (node.original === true) {
      //     return acc + 1;
      //   } else {
      //     return acc;
      //   }
      // }, 0);
      //
      // let size = 'x-large';
      // if (numNodes < 5) {
      //   size = 'small';
      // } else if (numNodes < 8) {
      //   size = 'medium';
      // } else if (numNodes < 11) {
      //   size = 'large';
      // }

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


app.get('/next-pending/:code', (req, res) => {
  const code = req.params.code;

  HotspotPuzzle.find({ approved: 'pending' }, 'code')
  .then((puzzleList) => {
    const codeList = puzzleList.map(puzzleObj => puzzleObj.code);

    if (codeList.length === 0 || (codeList.length === 1 && codeList[0] === code)) {
      return res.send(null);
    } else {
      const codeIndex = codeList.indexOf(code);

      let codeIndexForReturn = codeIndex + 1;
      // Make sure the code is not at the end of the list
      if (codeIndex === codeList.length - 1) {
        codeIndexForReturn = 0;
      }
      return res.send(codeList[codeIndexForReturn]);
    }
  }).catch(e => res.status(400).send(e));
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
app.post('/get-random-hotspot/', (req, res) => {
  const codesToAvoid = req.body;
  HotspotPuzzle.find({}, 'code').then((codeList) => {
    console.log(`Codes in database: ${codeList}`);
    if (!codeList) {
      return res.status(404).send();
    }
    const puzzleCodeChosen = getRandomCodeNotInListToAvoid(codeList, codesToAvoid);
    return res.send(puzzleCodeChosen);
  }).catch(e => res.status(400).send(e));
});

// Fetches a randomly selected puzzle code given a puzzle size and a list of codes to avoid
// Will only use puzzles that are approved
app.post('/get-hotspot-given-size/:size', (req, res) => {
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

app.post('/hotspot', (req, res) => {
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

app.post('/hotspot-remove/', (req, res) => {
  const code = req.body.code;
  HotspotPuzzle.findOneAndRemove({ code })
  .then((puzzle) => {
    res.send({ puzzle });
  }, (e) => {
    res.status(400).send(e);
  });
});

app.post('/hotspot-approve/', (req, res) => {
  const code = req.body.code;
  const approved = req.body.approved;
  HotspotPuzzle.findOneAndUpdate({ code }, { approved }, { new: true })
  .then((puzzle) => {
    res.send({ puzzle });
  }, (e) => {
    res.status(400).send(e);
  });
});

app.listen(port, () => {
  console.log(`Started on port ${port}`);
});

module.exports = { app };
