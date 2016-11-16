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
    redisStore = require('connect-redis')(session);

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

app.use(session({
    secret: 'saltydoob',
    store: new redisStore( {redis://h:p27m91r19rkiin16bnrf28tt4b9@ec2-174-129-196-231.compute-1.amazonaws.com:10749} ),
    resave: false,
    saveUninitialized: false,
    cookie: {
	httpOnly: false,
	resave: false,
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
