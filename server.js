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
    MongoStore = require('connect-mongo')(session);


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
    store: new MongoStore( {mongooseConnection: mongoose.connection} ),
    resave: false,
    saveUninitialized: false,
    cookie: {
	httpOnly: false,
	expires: new Date(253402300000000)
    }
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

require('./config/passport')(passport);
require('./routes')(app, passport);

app.listen(port);
console.log('Server running on port ' + port);
