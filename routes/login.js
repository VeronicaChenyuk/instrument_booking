const express = require("express");
const User = require("../models/user");

const router = express.Router();

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
    res.render("login/login", { error: true });
  }
}

router.get("/", async (req, res) => {
  res.render("login/login");
});

router.post("/", checkToBd, async (req, res) => {
  res.redirect("/");
});

router.get("/logout", async (req, res) => {
  delete req.session.user;
  if (req.session.status === 'admin') {
    delete req.session.status;
  }
  res.redirect("/");
});

module.exports = router;
