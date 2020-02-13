const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const methodOverride = require('method-override');
const session = require('express-session');
const FileStore = require('session-file-store')(session);

const mongoose = require('mongoose');
const indexRouter = require('./routes/index');
const mainRouter = require('./routes/main');
const loginRouter = require('./routes/login');
const registrRouter = require('./routes/registr');

const app = express();


// Подключаем mongoose.
mongoose.connect('mongodb://localhost:27017/instrument', { useNewUrlParser: true, useUnifiedTopology: true });

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


// Allows you to use PUT, DELETE with forms.
app.use(methodOverride((req, res) => {
  if (req.body && typeof req.body === 'object' && '_method' in req.body) {
    // look in urlencoded POST bodies and delete it
    const method = req.body._method;
    delete req.body._method;
    return method;
  }
}));

app.use(session({
  secret: '!ekl&mn?',
  store: new FileStore({}),
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false },
}));

app.use((req, res, next) => {
  if (req.session.user) {
    app.locals.loggedIn = true;
  } else {
    app.locals.loggedIn = false;
  }
  next();
});

app.use('/', indexRouter);
app.use('/main', mainRouter);
app.use('/login', loginRouter);
app.use('/registr', registrRouter);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
