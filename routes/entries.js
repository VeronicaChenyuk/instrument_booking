const express = require('express');

const router = express.Router();
const Entry = require('../models/entry');

console.log('started entries');


// entries
router.get('/', async (req, res, next) => {
  const entries = await Entry.mostRecent();
  res.render('registr/registr', { entries });
});

router.post('/', async (req, res, next) => {
  const newEntry = new Entry({ title: req.body.title, body: req.body.body });
  res.redirect(`/entries/${newEntry.id}`);
});

// new entries
router.get('/new', (req, res, next) => {
  res.render('entries/new');
});

// detail entry 
router.get('/:id', async (req, res, next) => {
  const entry = await Entry.findById(req.params.id);
  res.render('entries/show', { entry });
});

router.put('/:id', async (req, res, next) => {
  const entry = await Entry.findById(req.params.id);

  entry.title = req.body.title;
  entry.body = req.body.body;
  await entry.save();

  res.redirect(`/entries/${entry.id}`);
});

router.delete('/:id', async (req, res, next) => {
  await Entry.deleteOne({ _id: req.params.id });
  res.redirect('/');
});

router.get('/:id/edit', async (req, res, next) => {
  const entry = await Entry.findById(req.params.id);
  res.render('entries/edit', { entry });
});
module.exports = router;
