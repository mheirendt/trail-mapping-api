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
    cookieParser = require('cookie-parser'),
    redisStore = require('connect-redis')(session),
    url = require('url'),
    redisUrl = url.parse(process.env.REDIS_URL),
    redisAuth = redisUrl.auth.split(':'),
    redis = require('redis').createClient(redisUrl.port, redisUrl.hostname);

mongoose.Promise = global.Promise;
mongoose.connect( process.env.MONGOLAB_URI, function(err) {
    if (err) throw err;
});
var db = mongoose.connection;
db.once('open', function(){

});

app.use(morgan('dev'));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

redis.auth(redisAuth[1]);

redis.keys("sess:*", function(error, keys){
    //console.log("Number of active sessions: ", keys.length);
});

app.use(session({
    secret: 'saltydoob',
    store: new redisStore( {client: redis} ),
    resave: false,
    saveUninitialized: false,
    cookie: {
	httpOnly: false,
	path    : '/',
	expires: new Date(253402300000000),
	maxAge: new Date(253402300000000)
    }
}));
//	expires: new Date(253402300000000),
//	maxAge: new Date(253402300000000)
/*
	expires: new Date(253402300000000),
	maxAge: new Date() + 180000,
	rolling: true
*/

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

require('./config/passport')(passport);
require('./routes')(app, passport);

app.listen(port);
console.log('Server running on port ' + port);
