const mongoose = require('mongoose');


const entrySchema = new mongoose.Schema({
  title: String,
  body: String,
  createdAt: String,
  updatedAt: Date,
});

entrySchema.statics.mostRecent = async function () {
  return this.find().sort('createdAt').limit(5).exec();
};

module.exports = mongoose.model('Entry', entrySchema);
