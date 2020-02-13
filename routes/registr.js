const express = require("express");
const User = require("../models/user");

const router = express.Router();

router.post("/add", async (req, res, next) => {
  const { login, email, password } = req.body;
  try {
    const user = new User({ login, email, password });
    await user.save();
    req.session.user = user._id;
    res.redirect("/entries");
  } catch (e) {
    const notLogined = "Пользователь с таким именем или почтой существуют";
    res.render("registr/registr", { notLogined });
  }
});
module.exports = router;
