var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var app = express();

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.set('router', express.Router() );
app.use(express.static(path.join(__dirname, '/public')));

//console.log('app..getio> %o', app.get('io'));

//var game_control = require('./server/server_receiver')(app.get('io'), express.Router() );
//app.use('/', game_control);


module.exports = app;
