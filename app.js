const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
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

/** { <sessionID>: Set(n) {'<client 1 ws.id>', '<client 2 ws.id>', ..., '<client n ws.id>'} }
 *  {
 *          acTEDQu5cMJU1GCXAvQdKNov: Set(2) {'a51ac1b3-44fd-40e7-94d8-4e7c4ff742b3', 'ff7cbed5-26cc-4147-a6c9-db40e814237f'},
 *          ...
 *  }
 */
let sessionClients = {};

const wss = new WebSocket.Server({port: 8020});

wss.on('connection', function(ws) {
    ws.send("Connection opened!");
    ws.id = uuidv4();
    console.log("ws.id: ", ws.id);

    ws.on('message', function(message) {
        const sessionID = JSON.parse(message)['sessionID'];
        const session = sessionClients[sessionID];
        console.log("sessionClients: ", sessionClients);
        if (!session.has(ws.id)) {
            session.add(ws.id);
        }
        console.log(sessionClients);

        // console.log('Received from client: %s', message);
        ws.send('Server received from client: ' + message);
    });

    ws.on('close', function(code, reason) {
        console.log(ws.id, " has closed the websocket connection.");
        // If the connection was closed properly, we can get the sessionID one last
        // time through the reason parameter. If it wasn't closed properly, we'll
        // have to go through the trouble of looping through all sets in sessionClients
        let sessionID, session;
        if (code === 1000) {
            sessionID = JSON.parse(reason)['sessionID'];
        } else {
            for (let key of Object.keys(sessionClients)) {
                if (sessionClients[key].has(ws.id)) {
                    sessionID = key;
                }
            }
        }

        session = sessionClients[sessionID];
        session.delete(ws.id);

        // If this was the last websocket client on this sessionID, delete the sessionID.
        if (session.size === 0) {
            delete sessionClients[sessionID];
        }
        console.log(sessionClients);
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

    /*  If no websocket is currently open on this session, treat it as a new session
        and add it to the array of sessionsconsole.log(newSession);

        This is done here and not at the newSession route, because the app's design intentionally
        allows reusing the same link/sessionID without the first user having to create a new session and
        distribute it's shareURL every time.

        Since this user hasn't opened a websocket connection yet, he can't be uniquely identified at his point,
        so we can't add him as a client yet.
    */
    //if (!sessionClients.some(session => session[sessionID])) {
    if (!sessionClients.hasOwnProperty(sessionID)) {
        //const newSession = {[sessionID]: []};
        sessionClients[sessionID] = new Set();
    }

    return next();
});

app.use('/:id', function(req, res, next) {
    const sessionID = req.originalUrl.substr(req.originalUrl.indexOf('/') + 1);
    res.render('session', {
        title: 'Remotronome Session',

        environment: environment, // For clientsession.js websocket connection, uses wss (secure) in production, ws otherwise

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
