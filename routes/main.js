const express = require('express');
const nodemailer = require('nodemailer');
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
  const { user, status } = req.session;
  const { email } = req.body;
  const { password } = req.body;
  const checkUser = await User.findOne({ email });
  if (checkUser === null) {
    await User.create({ email, password });
    next();
  } else {
    res.render('main/registration', { error: true, user, status });
  }
}

router.get('/', async (req, res) => {
  const { user, status } = req.session;
  const instruments = await Instrument.find();
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
  const fDate = fromDate.replace('-', '');
  const fTime = fromTime.replace(':', '');
  const tDate = toDate.replace('-', '');
  const tTime = toTime.replace(':', '');
  const fullDateNow = (new Date()).toJSON().substring(0, 10).replace(/[^0-9]+/g, '');
  const dateNow = fullDateNow.substring(0, 8);
  const timeNow = fullDateNow.substring(8, 9) + (Number(fullDateNow.substring(9, 10)) + 3) + fullDateNow.substring(10, 12);

  // if ((fDate === tDate && fTime > tTime)
  //   || (fDate === dateNow && fTime < timeNow)
  //   || fDate < dateNow
  //   || fDate > tDate) {
  //   return false;
  // }
  return true;
}

// function check

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

  if (
    !checkCorrectDate(fromDate, fromTime, toDate, toTime)
  ) {
    return res.redirect(`/main/appliance/${id}&split&${error}&split&${msg}`);
  }

  appliance.events.push({
    title: objUser.email,
    start,
    end,
  });
  await appliance.save();

  async function main() {
    // Generate test SMTP service account from ethereal.email
    // Only needed if you don't have a real mail account for testing
    const testAccount = await nodemailer.createTestAccount();
    // create reusable transporter object using the default SMTP transport
    const transporter = nodemailer.createTransport({
      host: 'smtp.mail.ru',
      port: 465,
      secure: true, // true for 465, false for other ports
      auth: {
        user: 'nii.gena@bk.ru', // generated ethereal user
        pass: 'Nii123456', // generated ethereal password
      },
    });

    // send mail with defined transport object
    const info = await transporter.sendMail({
      from: '"Booking instrument 🧬" <nii.gena@bk.ru>', // sender address
      to: 'bbyugh@mail.ru', // list of receivers
      subject: 'Вы записаны! ', // Subject line
      text: 'Информация о записе', // plain text body
      html: `<b>Здравствуйте! На сервисе Booking instrument Интститута биологии гена у Вас появилась новая запись!</b>
                                <p>Ваше бронирование: с <strong>${start}</strong> до <strong>${end}</strong> на прибор <i>${appliance.title}.</i></p>
                                <p>Более подробная информация у администратора сайта. </p>
                                <p>Обратитесь к администратору, если вы хотите изменить запись или отменить бронирование.</p>`, // html body
    });

    console.log('Message sent: %s', info.messageId);
    // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

    // Preview only available when sending through an Ethereal account
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
    res.send('Письмо отправлено!');
  }
  main().catch(console.error);

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
    },
  );
  newInstrument.save();
  const id = newInstrument._id;
  res.redirect(`/main/appliance/${id}/upload`);
});

router.get('/appliance/:id/upload', async (req, res) => {
  const { user, status } = req.session;
  const { id } = req.params;
  res.render('main/images', { id, user, status });
});

router.post('/appliance/:id/upload', async (req, res) => {
  const filedata = req.file;
  const instrument = await Instrument.findById(req.params.id);
  const fileName = filedata.originalname;
  instrument.profilePicture = fileName;
  await instrument.save();
  if (!filedata) res.send('Ошибка при загрузке файла');
  else res.redirect('/');
});

router.get('/appliance/:id/delete', async (req, res) => {
  const { id } = req.params;
  await Instrument.findByIdAndDelete(id);
  res.redirect('/');
});

router.get('/deleteUser', async (req, res) => {
  const { user, status } = req.session;
  const users = await User.find({ status: 'user' });
  res.render('main/deleteUser', { users, user, status });
});

router.delete('/deleteUser', async (req, res) => {
  const email = req.body.deletedUser;
  await User.findOneAndDelete({ email });
  res.json();
});


module.exports = router;
