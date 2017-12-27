const express = require('express');
const _ = require('lodash');

const router = express.Router();
const { User } = require('../models/user');
const { authenticateAdmin } = require('../middleware/authenticate');

router.post('/', async (req, res) => {
  try {
    const body = _.pick(req.body, ['email', 'password']);
    const user = new User(body);
    await user.save();
    const token = await user.generateAuthToken();
    res.header('x-auth', token).send(user);
  } catch (e) {
    res.status(400).send(e);
  }
});

router.post('/login', async (req, res) => {
  try {
    const body = _.pick(req.body, ['email', 'password']);

    const user = await User.findByCredentials(body.email, body.password);
    const token = await user.generateAuthToken();
    res.header('x-auth', token).send(user);
  } catch (e) {
    res.status(400).send();
  }
});

router.delete('/token', authenticateAdmin, async (req, res) => {
  try {
    await req.user.removeToken(req.token);
    res.status(200).send();
  } catch (e) {
    res.status(400).send();
  }
});

module.exports = router;
