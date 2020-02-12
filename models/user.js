const mongoose = require('mongoose');


const userSchema = new mongoose.Schema({
  loginEmail: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  status: { type: String, default: 'user' },
});


module.exports = mongoose.model('User', userSchema);
fdasjghas
