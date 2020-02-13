const express = require("express");
const User = require("../models/user");
const Instrument = require("../models/instrument");

const router = express.Router();

function checkGodMode(req, res, next) {
  if (req.session.status) {
    next();
  } else {
    res.sendStatus(404);
  }
}
async function checkToBd(req, res, next) {
  const email = req.body.email;
  const password = req.body.password;
  const user = await User.findOne({ loginEmail: email, password });
  console.log(user);
  if (!!user) {
    req.session.user = user._id;
    if (user.status === "admin") {
      req.session.status = "godMode";
    }
    next();
  } else {
    res.render("main/login", { error: true });
  }
}

router.get("/", async (req, res, next) => {
  const { user, status } = req.session;
  const instruments = await Instrument.find();
  console.log(req.session);
  res.render("main/index", { instruments, user, status });
});

router.get("/login", async (req, res) => {
  res.render("main/login");
});

router.post("/login", checkToBd, async (req, res) => {
  res.redirect("/");
});

router.get("/logout", async (req, res) => {
  delete req.session.user;
  delete req.session.status;
  res.redirect("/");
});
router.get("/registration", checkGodMode, async (req, res, next) => {
  res.render("main/registr", {});
});

router.get("/error", (req, res) => {
  res.render("main/error", { user: req.session.user });
});

router.get("/appliance/:id", async (req, res) => {
  const id = req.params.id;
  const appliance = await Instrument.findById(id);
  res.render("main/appliance", { appliance });
});

router.get('/appliance/:id/calendar', async (req, res) => {
  const id = req.params.id;  
  const appliance = await Instrument.findById(id);
  console.log('adsgag');
  
  const { events } = appliance;
  res.send([      {
    title: 'All Day Event',
    start: '2020-02-01'
  },
  {
    title: 'Long Event',
    start: '2020-02-07',
    end: '2020-02-10'
  }]);
});

module.exports = router;
