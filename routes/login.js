const express = require('express');
const User = require('../models/user');

const router = express.Router();

router.get('/', async (req, res, next) => {
  res.render('login/login');
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
