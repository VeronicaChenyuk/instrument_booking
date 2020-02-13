const mongoose = require('mongoose');


const instrumentSchema = new mongoose.Schema({
  title: String,
  body: String,
  profilePicture: String,
  events: [
    {
      user: String,
      tittle: String,
      start: Date,
      end: Date
    }
  ]
});


module.exports = mongoose.model('Instrument', instrumentSchema);
