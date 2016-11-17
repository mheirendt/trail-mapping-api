require('dotenv').load();

var express = require('express'),
    app = express(),
    port = process.env.PORT || 3000,
    mongoose = require('mongoose'),
    passport = require('passport'),
    flash = require('connect-flash'),
    socketio = require('socket.io'),
    morgan = require('morgan'),
    bodyParser = require('body-parser'),
    session = require('express-session'),
    redisStore = require('connect-redis')(session),
    url = require('url');

mongoose.Promise = global.Promise;
mongoose.connect( process.env.MONGOLAB_URI, function(err) {
    if (err) throw err;
});
var db = mongoose.connection;
db.once('open', function(){
    console.log('MongoDB connection successful.');
});

app.use(morgan('dev'));
//app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

var redisUrl = url.parse(process.env.REDISTOGO_URL),
    redisAuth = redisUrl.auth.split(':');
    app.set('redisHost', redisUrl.hostname);
    app.set('redisPort', redisUrl.port);
    app.set('redisDb', redisAuth[0]);
app.set('redisPass', redisAuth[1]);
console.log("info: " + redisUrl.hostname + ", " + redisUrl.port + ", " + redisAuth[0] + ", " + redisAuth[1]);

var redis = require('redis').createClient(redisUrl.port, redisUrl.hostname).auth(redisAuth[1]);

app.use(session({
    secret: 'saltydoob',
    store: new redisStore({
        host: redisUrl.hostname,
        port: redisUrl.port,
	pass:  redisAuth[1],
	client: redis
    }),
    resave: false,
    saveUninitialized: false,
    cookie: {
	httpOnly: false,
	resave: false,
	path    : '/',
	expires: new Date(253402300000000),
	maxAge: new Date(253402300000000)
    }
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

require('./config/passport')(passport);
require('./routes')(app, passport);

app.listen(port);
console.log('Server running on port ' + port);
