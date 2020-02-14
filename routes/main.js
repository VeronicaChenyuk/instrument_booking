const express = require('express');
const User = require('../models/user');
const Instrument = require('../models/instrument');

const router = express.Router();

function checkGodMode(req, res, next) {
  if (req.session.status) {
    next();
  } else {
    res.sendStatus(404);
  }
}
async function checkToBd(req, res, next) {
  const { email } = req.body;
  const { password } = req.body;
  const user = await User.findOne({ email, password });
  if (user) {
    req.session.user = user._id;
    if (user.status === 'admin') {
      req.session.status = 'godMode';
    }
    next();
  } else {
    res.render('main/login', { error: true });
  }
}
async function checkUser(req, res, next) {
  console.log(req.body.date, req.body.time);
  const { user, status } = req.session;
  const { email } = req.body;
  const { password } = req.body;
  const checkUser = await User.findOne({ email });
  console.log(!!checkUser, email, password);
  if (checkUser === null) {
    console.log('fdfsf');
    await User.create({ email, password });
    console.log('GGGGGGGG');
    next();
  } else {
    res.render('main/registration', { error: true, user, status });
  }
}

router.get('/', async (req, res) => {
  const { user, status } = req.session;
  const instruments = await Instrument.find();
  console.log(req.session);
  res.render('main/index', { instruments, user, status });
});

router.get('/login', async (req, res) => {
  res.render('main/login');
});

router.post('/login', checkToBd, async (req, res) => {
  res.redirect('/');
});

router.get('/logout', async (req, res) => {
  delete req.session.user;
  delete req.session.status;
  res.redirect('/');
});
router.get('/registration', checkGodMode, async (req, res) => {
  const { user, status } = req.session;
  res.render('main/registration', { user, status });
});

router.post('/registration', checkUser, async (req, res) => {
  res.redirect('/');
});

router.get('/error', (req, res) => {
  res.render('main/error', { user, status });
});

router.get('/appliance/:id', async (req, res) => {
  const { user, status } = req.session;
  const { id } = req.params;
  const appliance = await Instrument.findById(id);
  res.render('main/appliance', { appliance, user, status });
});

router.get('/appliance/:id/calendar', async (req, res) => {
  const { id } = req.params;
  const appliance = await Instrument.findById(id);
  const { events } = appliance;
  res.send(events);
});
router.post('/appliance/:id/record', async (req, res) => {
  const { id } = req.params;
  const userId = req.session.user;
  const user = await User.findById(userId);
  const start = `${req.body.fromDate} ${req.body.fromTime}`;
  const end = `${req.body.toDate} ${req.body.toTime}`;

  const appliance = await Instrument.findById(id);
  appliance.events.push({
    title: user.email,
    start,
    end,
  });
  await appliance.save();
  res.redirect(`/main/appliance/${id}`);
});

module.exports = router;
