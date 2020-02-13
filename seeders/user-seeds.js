// Подключаем mongoose.
const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://Krolik:Krolik@cluster0-jlft0.mongodb.net/instrument?retryWrites=true&w=majority', { useNewUrlParser: true });


const User = require('../models/user');


const users = [
  {
    loginEmail: 'beresneva.veronika@mail.ru',
    password: 'Krolik',
    status: 'admin',
  },
  {
    loginEmail: 'ivanov.stepan@mail.ru',
    password: 'Pizza',
    status: 'user',
  },
  {
    loginEmail: 'dolgoryki.grisha@mail.ru',
    password: 'Krolik',
    status: 'user',
  },
];


User.insertMany(users).then(() => {
  mongoose.connection.close();
});
