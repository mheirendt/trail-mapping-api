var express = require("express");
var path = require("path");
var bodyParser = require("body-parser");
var mongodb = require("mongodb");
var ObjectID = mongodb.ObjectID;

//Authentication
var session = require('express-session');
var passport = require('passport');
var LocalStrategy = require('passport-local');
var FacebookStrategy = require('passport-facebook');
var GoogleStrategy = require('passport-google');
var TwitterStrategy = require('passport-twitter');
//var config = require('./config.js'), funct = require('./function.js');



var TRAILS_COLLECTION = "trails";
var USERS_COLLECTION = "users";

var app = express();
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.json());
//authentication
app.use(session({secret:'supernova', saveUninitialized: true, resave: true}));
app.use(passport.initialize());
app.use(passport.session());

//Session
app.use(function(req,res,next){
    var err = req.session.error,
	msg = req.session.notice,
	success = req.session.success;

    delete req.session.error;
    delete req.session.notice
    delete req.session.success;

    if (err) res.locals.error = err;
    if (msg) res.locals.notice = msg;
    if (success) res.locals.success = success;

    next();
});

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
  var newTrail = req.body;
    newTrail.createDate = new Date();
    /*
  if (!(req.body.Name || req.body.Location)) {
    handleError(res, "Invalid user input", "Must provide a first or last name.", 400);
  }
*/
  db.collection(TRAILS_COLLECTION).insertOne(newTrail, function(err, doc) {
    if (err) {
	handleError(res, err.message, "Failed to create new trail.");
    } else {
      res.status(201).json(doc.ops[0]);
    }
  });
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
    db.open(function(err,db){ // <------everything wrapped inside this function
         db.collection(TRAILS_COLLECTION, function(err, collection) {
             collection.find().toArray(function(err, items) {
                 console.log(items);
                 res.send(items);
             });
         });
     });
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

app.get("/users/:username", function(req, res) {
    db.collection(USERS_COLLECTION).findOne({ username: req.params.username }, function(err, doc) {
    if (err) {
      handleError(res, err.message, "Failed to get trail");
    } else {
      res.status(200).json(doc);
    }
  });
});



//Authentication

app.get('/', function(req, res){
    res.render('home', {user: req.user});
});

app.get('/signin', function(req, res){
    res.render('siginin');
});

app.post('/local-reg', passport.authenticate('local-signup', {
    successRedirect: '/',
    failureRedirect: '/signin'
    })
	);

app.get('/logout', function(req, res){
    var name = req.user.username;
    console.log("LOGGING OUT " + name);
    req.logout();
    res.redirect('/');
    req.session.notice = "You have succesfully been logget out " + name + ".";
});
	 
	 
