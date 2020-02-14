/* eslint-disable import/no-unresolved */
// Подключаем mongoose.
const mongoose = require('mongoose');

mongoose.connect(
  'mongodb+srv://Krolik:Krolik@cluster0-jlft0.mongodb.net/instrument?retryWrites=true&w=majority',
  { useNewUrlParser: true },
);

const Instrument = require('../models/instrument');

const instrumentes = [
  {
    title: 'Прибор 2',
    body: 'Улучшенная версия 2014 года',
    profilePicture: '\\',
    events: [
      {
        user: 'String',
        title: 'String',
        start: '2020-02-13 02:00',
        end: '2020-02-13 15:00',
      },
    ],
  },
];

Instrument.insertMany(instrumentes).then(() => {
  mongoose.connection.close();
});
