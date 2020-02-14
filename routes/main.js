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

// TODO:
router.get('/appliance/:id', async (req, res) => {
  const { user, status } = req.session;
  const arrParams = req.params.id.split('&split&');
  const id = arrParams[0];
  const error = arrParams[1];
  const msg = arrParams[2];
  const appliance = await Instrument.findById(id);
  res.render('main/appliance', {
    appliance, user, status, error, msg,
  });
});

router.get('/appliance/:id/calendar', async (req, res) => {
  const str = req.params.id;
  const id = str.split('&split&')[0];
  const appliance = await Instrument.findById(id);
  const { events } = appliance;
  res.send(events);
});

function checkCorrectDate(fromDate, fromTime, toDate, toTime) {
  console.log(fromDate, fromTime, toDate, toTime);
  const fDate = fromDate.replace('-', '');
  const fTime = fromTime.replace(':', '');
  const tDate = toDate.replace('-', '');
  const tTime = toTime.replace(':', '');
  if (fDate > tDate) {
    return false;
  }
  if (fDate === tDate && fTime > tTime) {
    return false;
  }
  return true;
}

router.post('/appliance/:id/record', async (req, res) => {
  const { user } = req.session;
  const { id } = req.params;
  const {
    fromDate, fromTime, toDate, toTime,
  } = req.body;
  const userId = user;
  const objUser = await User.findById(userId);
  const start = `${fromDate} ${fromTime}`;
  const end = `${toDate} ${toTime}`;
  const msg = 'Время некорректно';
  const error = true;

  const appliance = await Instrument.findById(id);
  const { events } = appliance;

  if (!checkCorrectDate(fromDate, fromTime, toDate, toTime)) {
    return res.redirect(`/main/appliance/${id}&split&${error}&split&${msg}`);
  }

  appliance.events.push({
    title: objUser.email,
    start,
    end,
  });
  await appliance.save();
  res.redirect(`/main/appliance/${id}`);
});
router.get('/appliance', async (req, res) => {
  const { user, status } = req.session;
  res.render('main/newinstrument', { user, status });
});
router.post('/appliance', async (req, res) => {
  const newInstrument = new Instrument(
    {
      title: req.body.title,
      body: req.body.body,
      profilePicture: '',
    });
  newInstrument.save();
  const id = newInstrument._id;
  res.redirect(`/main/appliance/${id}/upload`);
});

router.get('/appliance/:id/upload', async (req, res) => {
  const { user, status } = req.session;
  const id = req.params.id;
  res.render('main/images', { id, user, status });
});

router.post('/appliance/:id/upload', async (req, res) => {
  const filedata = req.file;
  const instrument = await Instrument.findById(req.params.id);
  const fileName = filedata.originalname;
  instrument.profilePicture = fileName;
  await instrument.save()
  if (!filedata) res.send('Ошибка при загрузке файла');
  else res.redirect('/');
});

router.get('/appliance/:id/delete', async (req, res) => {
  const id = req.params.id;
  await Instrument.findByIdAndDelete(id);
  console.log('Deleted');
  res.redirect('/');
});


module.exports = router;
