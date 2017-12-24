require('./config/config');

const _ = require('lodash');
const fp = require('path');

const express = require('express');
const hbs = require('hbs');
const bodyParser = require('body-parser');
const { ObjectID } = require('mongodb');

const { mongoose } = require('./db/mongoose');

const { HotspotPuzzle } = require('./models/hotspotPuzzle');

const batch = require('./routers/batch');
const codes = require('./routers/code');
const hotspot = require('./routers/hotspot');

const app = express();

const port = process.env.PORT;

console.log(`Printing port in server.js:${port}`);

hbs.registerPartials(fp.join(__dirname, '/../views/partials'));
app.set('view engine', 'hbs');
app.use(bodyParser.json());

app.use(express.static(fp.join(__dirname, '/../public')));

hbs.registerHelper('loadScriptWithPuzzleCode', codeToUse =>
  new hbs.SafeString(`<script type="text/javascript" src="/js/puzzle.js"></script>
                            <script>useDefaultPuzzle(${codeToUse});</script>`)
);

app.use('/batch', batch);
app.use('/code', codes);
app.use('/hotspot', hotspot);

app.get('/', (req, res) => {
  // This code chooses a random small puzzle to use
  HotspotPuzzle.find({ size: 'small' }, 'code').then((codeList) => {
    const randomIndex = _.random(0, codeList.length - 1);
    const code = codeList[randomIndex].code;
    return res.render('puzzle.hbs', { code, isNew: false });
  }).catch((e) => { console.log('Failed to find a small puzzle'); });
});

app.get('/create', (req, res) => {
  res.render('create.hbs');
});

app.listen(port, () => {
  console.log(`Started on port ${port}`);
});

module.exports = { app };
