const express = require('express');
const User = require('../models/user');
const Instrument = require('../models/instrument');

const router = express.Router();

router.get('/', async (req, res, next) => {
  const {user, status} = req.session
  const instruments = await Instrument.find();
  console.log(req.session)
  res.render('index/index', { instruments, user, status });
});

router.get('/logout', async (req, res, next) => {
  req.session.destroy();
  res.clearCookie('connect.sid');
  res.redirect('/');
});

router.post('/auth', async (req, res, next) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (user) {
    if (email === user.email && password === user.password) {
      req.session.user = user._id;
      res.redirect('/entries');
    } else {
      const notLogined = 'Имя пользователя или пароль не существуют';
      res.render('login/login', { notLogined });
    }
  }
});
module.exports = router;
