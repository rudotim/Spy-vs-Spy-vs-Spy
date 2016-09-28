var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

//var routes = require('./routes/index');
//var routes = require('./routes/game_control_server');
var game_control = require('./routes/game_control_server');

var app = express();

// view engine setup
//app.set('view engine', 'html');
//app.set('views', path.join(__dirname, 'views'));
//app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

//app.use('/', routes);
app.use(express.static(path.join(__dirname, '/public')));
app.use('/', game_control);




module.exports = app;
