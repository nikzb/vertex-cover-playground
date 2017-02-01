require('./config/config');

const fp = require('path');
const express = require('express');
const hbs = require('hbs');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');

const {mongoose} = require('./db/mongoose');
const {HotspotPuzzle} = require('./models/hotspotPuzzle');
const {generateCode} = require('./helpers/codeGenerator');

const app = express();
const port = process.env.PORT;

console.log('Printing port in server.js: ' + port);

hbs.registerPartials(fp.join(__dirname, '/../views/partials'));
app.set('view engine', 'hbs');
app.use(bodyParser.json());
console.log(__dirname);
app.use(express.static(fp.join(__dirname, '/../public')));

hbs.registerHelper('loadScriptWithPuzzleCode', (code) => {
  return new hbs.SafeString(`<script type="text/javascript" src="/js/puzzle.js"></script>
                            <script>useDefaultPuzzle(${code});</script>`);
});

app.get('/hotspot/newCode', (req, res) => {
  console.log("server is handling request for new code");

  let codeIsUnique = false;

  generateCode(res, function(res, newCode) {
    res.send(newCode);
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
  console.log("In code GET request");
  const code = req.params.code;
  console.log(req.params);

  // if not a valid code, render the puzzle not found page
  // return res.send('<h1>This puzzle does not exist!</h1>');
  console.log('code: ' + code);
  HotspotPuzzle.findOne({code}).then((puzzle) => {
    console.log('puzzle: ' + JSON.stringify(puzzle));
    if (!puzzle) {
      console.log(puzzle);
      return res.send('<h1>This puzzle does not exist!</h1>');
    }
    console.log(puzzle.graph.nodes);
    console.log(puzzle.graph.edges);
    res.render('puzzle.hbs', {code: code});
  }).catch((e) => {
    console.log(e);
    return res.send('<h1>There was an error while attempting to load the puzzle</h1>');
  });
});

app.get('/hotspot-data/:code', (req, res) => {
  const code = req.params.code;

  HotspotPuzzle.findOne({code}).then((puzzle) => {
    console.log(puzzle);
    if (!puzzle) {
      return res.status(404).send();
    }
    res.send({puzzle});
  }).catch((e) => {
    res.status(400).send(e);
  });
});

app.post('/hotspot', (req, res) => {
  const puzzle = new HotspotPuzzle({
    graph: req.body.graph,
    code: req.body.code,
    size: req.body.size
  });

  puzzle.save().then((puzzle) => {
    res.send({puzzle});
  }, (e) => {
    res.status(400).send(e);
  });
});

app.listen(port, () => {
  console.log(`Started on port ${port}`);
});

module.exports = {app};
