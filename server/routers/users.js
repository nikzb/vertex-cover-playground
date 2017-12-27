const express = require('express');
const _ = require('lodash');

const router = express.Router();
const { User } = require('../models/user');

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
    console.log(body);
    const user = await User.findByCredentials(body.email, body.password);
    const token = await user.generateAuthToken();
    res.header('x-auth', token).send(user);
  } catch (e) {
    res.status(400).send();
  }
});

module.exports = router;
