const mongoose = require('mongoose');


const instrumentSchema = new mongoose.Schema({
  title: String,
  body: String,
  profilePicture: String,
});


module.exports = mongoose.model('Instrument', instrumentSchema);
