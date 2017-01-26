require('./config/config');

const express = require('express');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');

const {mongoose} = require('./db/mongoose');
const {HotspotPuzzle} = require('./models/hotspotPuzzle');

const app = express();
const port = process.env.PORT;

app.use(bodyParser.json());

app.get('/hotspot/:code', (req, res) => {
  const code = req.params.code;
  console.log(code);

  HotspotPuzzle.find({code}).then((puzzle) => {
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

  puzzle.save().then((puz) => {
    res.send(puz);
  }, (e) => {
    res.status(400).send(e);
  });
});

app.listen(port, () => {
  console.log(`Started on port ${port}`);
});

module.exports = {app};
