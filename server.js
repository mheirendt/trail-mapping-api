var express = require("express");
var path = require("path");
var bodyParser = require("body-parser");
var mongodb = require("mongodb");
var ObjectID = mongodb.ObjectID;

//Authentication
var exphbs = require('express-handlebars'),
    logger = require('morgan'),
    cookieParser = require('cookie-parser'),
    methodOverride = require('method-override'),
    session = require('express-session'),
    passport = require('passport'),
    LocalStrategy = require('passport-local'),
    TwitterStrategy = require('passport-twitter'),
    GoogleStrategy = require('passport-google'),
    FacebookStrategy = require('passport-facebook'),
    ensure = require('connect-ensure-login');
////config file contains all tokens and other private info
//funct file contains our helper functions for our Passport and database work
var config = require('./config.js');
var funct = require('./functions.js');


var TRAILS_COLLECTION = "trails";
var USERS_COLLECTION = "users";
var PROFILE_USERNAME = null;
var FACEBOOK_APP_ID = "143683242760890";
var FACEBOOK_APP_SECRET = "095c264c52e8cd9001ab259070d5e971";


var app = express();



//===============PASSPORT=================


// Passport session setup.
passport.serializeUser(function(user, done) {
  console.log("serializing " + user.username);
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  console.log("deserializing " + obj);
  done(null, obj);
});


// Use the LocalStrategy within Passport to login/”signin” users.
passport.use('local-signin', new LocalStrategy(
    {passReqToCallback : true},
    function(req, username, password, done) {
	funct.localAuth(username, password)
	    .then(function (user) {
		console.log("server.js local auth");
		if (user) {
		    PROFILE_USERNAME = user.username;
		    req.session.success = 'You are successfully logged in ' + user.username + '!';
		    console.log("Almost done with local auth in server.js");
		    done(null, user);
		}
		if (!user) {
		    PROFILE_USERNAME = null;
		    req.session.error = 'Could not log user in. Please try again.'; //inform user could not log them in
		    done(null, false);
		}
	    })
	    .fail(function (err){
		console.log("Error desc: " + err);
	    });
    }
));
// Use the LocalStrategy within Passport to register/"signup" users.
passport.use('local-signup', new LocalStrategy(
  {passReqToCallback : true}, //allows us to pass back the request to the callback
    function(req, username, password, done) {
	funct.localReg(username, password)
	    .then(function (user) {
		console.log("LocalReg in server.js");
		if (user) {
		    console.log("there is a user in local reg: " + user);
		    console.log("the username is : " + user.username);
		    PROFILE_USERNAME = user.username;
		    req.session.success = 'You are successfully registered and logged in ' + user.username + '!';
		    console.log("local reg almost done");
		    return done(null, user);
		}
		if (!user) {
		    console.log("there is a not user in local reg");
		    PROFILE_USERNAME = null;
		    req.session.error = 'That username is already in use, please try a different one.'; //inform user could not log them in
		    return done(null, user);
		}
	    })
	    .fail(function (err){
		console.log(err);
	    });
    }
));

// Simple route middleware to ensure user is authenticated.
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) { return next(); }
    PROFILE_USERNAME = null;
    req.session.error = 'Please sign in!';
    res.redirect('/signin');
}

//===============FACEBOOK================
passport.use(new FacebookStrategy({
    clientID: FACEBOOK_APP_ID,
    clientSecret: FACEBOOK_APP_SECRET,
    callbackURL: "https://secure-garden-50529.herokuapp.com/auth/facebook/callback"
  },
  function(accessToken, refreshToken, user, cb) {
      PROFILE_USERNAME = user.displayName;
      user.username = user.displayName;
      return cb(null, user);
  }
));

//===============EXPRESS================

app.use(express.static(__dirname + "/views"));
//authentication
// Configure Express
app.use(logger('combined'));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(methodOverride('X-HTTP-Method-Override'));
app.use(session({secret: 'supernova', saveUninitialized: true, resave: true}));
app.use(passport.initialize());
app.use(passport.session());

// Session-persisted message middleware
app.use(function(req, res, next){
  var err = req.session.error,
      msg = req.session.notice,
      success = req.session.success;

  delete req.session.error;
  delete req.session.success;
  delete req.session.notice;

  if (err) res.locals.error = err;
  if (msg) res.locals.notice = msg;
  if (success) res.locals.success = success;

  next();
});

// Configure express to use handlebars templates
var hbs = exphbs.create({
    defaultLayout: 'main', //we will be creating this layout shortly
});
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');

//===============MONGO DB===============

// Create a database variable outside of the database connection callback to reuse the connection pool in your app.
var db;

// Connect to the database before starting the application server.
mongodb.MongoClient.connect(process.env.MONGODB_URI, function (err, database) {
  if (err) {
    console.log(err);
    process.exit(1);
  }

  // Save database object from the callback for reuse.
  db = database;
  console.log("Database connection ready");
    
  // Initialize the app.
  var server = app.listen(process.env.PORT || 8080, function () {
    var port = server.address().port;
    console.log("App now running on port", port);
  });
});


//===============ROUTES===============

// Generic error handler used by all endpoints.
function handleError(res, reason, message, code) {
  console.log("ERROR: " + reason);
  res.status(code || 500).json({"error": message});
}

var findAllTrails = function(db, callback) {
   var cursor = db.collection(TRAILS_COLLECTION).find( );
   cursor.each(function(err, doc) {
      assert.equal(err, null);
      if (doc != null) {
         console.dir(doc);
      } else {
         callback();
      }
   });
};

app.post("/trails", function(req, res) {
    if (PROFILE_USERNAME){
	var newTrail = req.body;
	newTrail.createDate = new Date();
	db.collection(TRAILS_COLLECTION).insertOne(newTrail, function(err, doc) {
	    if (err) {
		handleError(res, err.message, "Failed to create new trail.");
	    } else {
		res.status(201).json(doc.ops[0]);
	    }
	});
     } else {
	 res.redirect('/signin');
     }
});


app.get("/trails/:id", function(req, res) {
  db.collection(TRAILS_COLLECTION).findOne({ _id: new ObjectID(req.params.id) }, function(err, doc) {
    if (err) {
      handleError(res, err.message, "Failed to get trail");
    } else {
      res.status(200).json(doc);
    }
  });
});


app.get("/trails", function(req, res) {
     if (PROFILE_USERNAME){
	 db.open(function(err,db){ // <------everything wrapped inside this function
             db.collection(TRAILS_COLLECTION, function(err, collection) {
		 collection.find().toArray(function(err, items) {
                     console.log(items);
                     res.send(items);
		 });
             });
	 });
     } else {
	 res.redirect('/signin');
     }
});

app.put("/trails/:id", function(req, res) {
  var updateDoc = req.body;
  delete updateDoc._id;

  db.collection(TRAILS_COLLECTION).updateOne({_id: new ObjectID(req.params.id)}, updateDoc, function(err, doc) {
    if (err) {
      handleError(res, err.message, "Failed to update trail");
    } else {
      res.status(204).end();
    }
  });
});

app.delete("/trails/:id", function(req, res) {
  db.collection(TRAILS_COLLECTION).deleteOne({_id: new ObjectID(req.params.id)}, function(err, result) {
    if (err) {
      handleError(res, err.message, "Failed to delete trail");
    } else {
      res.status(204).end();
    }
  });
});


//USERS
/*
app.post("/users", function(req, res) {
  var newUser = req.body;
    newUser.createDate = new Date();

  db.collection(USERS_COLLECTION).insertOne(newUser, function(err, doc) {
    if (err) {
	handleError(res, err.message, "Failed to create new trail.");
    } else {
      res.status(201).json(doc.ops[0]);
    }
  });
});
*/
/*
app.get("/users/:username", function(req, res) {
    db.collection(USERS_COLLECTION).findOne({ username: req.params.username }, function(err, doc) {
    if (err) {
      handleError(res, err.message, "Failed to get trail");
    } else {
      res.status(200).json(doc);
    }
  });
});
*/
/*
app.get("/users", function(req, res) {
    	 db.open(function(err,db){ // <------everything wrapped inside this function
             db.collection(USERS_COLLECTION, function(err, collection) {
		 collection.find().toArray(function(err, items) {
                     console.log(items);
                     res.send(items);
		 });
             });
	 });
});
*/



//Authentication

//===============AUTH ROUTES=================
//displays our homepage
app.get('/', function(req, res){
  res.render('home', {user: req.user});
});

//displays our signup page
app.get('/signin', function(req, res){
  res.render('signin');
});

//sends the request through our local signup strategy, and if successful takes user to homepage, otherwise returns then to signin page
app.post('/local-reg', passport.authenticate('local-signup', {
  successRedirect: '/',
  failureRedirect: '/signin'
  }));

//sends the request through our local login/signin strategy, and if successful takes user to homepage, otherwise returns then to signin page
app.get('/login', function(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
      if (err) {
	  console.log("Error: " + error);
	  //res.json([null, err]);
	  return next(err);
      }
      if (!user) {
	  console.log("No user found");
	  return res.redirect('/signin');
      } else {
	  console.log("WE've got a match!");
	  //res.json([null, "Login failed"]);
	  res.redirect('/');
      }
    //req.logIn(user, function(err) {
      //if (err) { return next(err); }
      //return res.redirect('/' + user.username);
  });(req, res, next);
});
/*
app.post('/login', passport.authenticate('local-signin', function(req, res, next) {
    passport.authenticate('local', function(err, user, info) {
	if (err) {
	    res.json([null, err]);
	    return next(err);
	}
	if (!user) {
	    return res.redirect('/signin');
	} else {
	    res.redirect('/');
	}
	});
    })(req, res, next);
});
    //{
    //successRedirect: '/',
    //failureRedirect: '/signin'
//}));
*/

//logs user out of site, deleting them from the session, and returns to homepage
app.get('/logout', function(req, res){
  PROFILE_USERNAME = null;
  var name = req.user.username;
  console.log("LOGGIN OUT " + req.user.username)
  req.logout();
  res.redirect('/');
  req.session.notice = "You have successfully been logged out " + name + "!";
});
//==========Facebook Authentication Routes============
app.get('/auth/facebook',
  passport.authenticate('facebook'));

app.get('/auth/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/signin' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/');
  });
app.get('/profile',
  ensure.ensureLoggedIn(),
  function(req, res){
    res.render('profile', { user: req.user });
  });
