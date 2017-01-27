require('./config/config');

const fp = require('path');
const express = require('express');
const hbs = require('hbs');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');

const {mongoose} = require('./db/mongoose');
const {HotspotPuzzle} = require('./models/hotspotPuzzle');

const app = express();
const port = process.env.PORT;

hbs.registerPartials(fp.join(__dirname, '/../views/partials'));
app.set('view engine', 'hbs');
app.use(bodyParser.json());
console.log(__dirname);
app.use(express.static(fp.join(__dirname, '/../public')));

app.get('/create', (req, res) => {
  res.render('create.hbs');
});

app.get('/', (req, res) => {
  res.render('puzzle.hbs');
});

app.get('/hotspot/:code', (req, res) => {
  const code = req.params.code;
  console.log(code);

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
