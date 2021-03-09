const crypto = require('crypto');
const base64url = require('base64url');
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const WebSocket = require('ws');
const environment = process.env.NODE_ENV || 'development';

const indexRouter = require('./routes/index');

const app = express();

const wss = new WebSocket.Server({port: 8020});
wss.on('connection', function(ws) {
    ws.on('message', function(message) {
        console.log('Received from client: %s', message);
        ws.send('Server received from client: ' + message);
    });
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, '/public/static')));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
// 18 random bytes, since 18 is divisible by 6 for base64url encoding (base64url has no padding).
// For scaling purposes (so many users that collision probability rises remarkably), increase by 6
app.get('/newSession', function (req, res) {
    crypto.randomBytes(18, function(err, buf) {
        const sessionID = base64url(buf, 'hex');
        res.redirect('/' + sessionID);
    });
})

app.use('/:id', function(req, res, next) {
    const sessionID = req.originalUrl.substr(req.originalUrl.indexOf('/') + 1);
    // Check if :id is a valid sessionID
    const validIdConditions = [
        base64url.decode(sessionID, 'hex').length === 36, // Length of string is twice the number of random bytes, since each nibble is a hex "character"
        /^[A-Za-z0-9\-_]+$/.test(sessionID) // Valid characters in Base64URL encoding
    ]

    if (validIdConditions.includes(false)) {
        console.log('Invalid sessionID:', sessionID);
        return next(createError(404));
    }

    return next();
});

app.use('/:id', function(req, res, next) {
    res.render('session', {
        title: 'Remotronome Session',

        environment: environment, // For clientsession.js websocket connection, uses wss in production, ws otherwise

        shareURL: 'https://' + req.get('host') + req.originalUrl,

        synchronizedNumber: 1,
        connectedNumber: 1
    });
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404))
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
