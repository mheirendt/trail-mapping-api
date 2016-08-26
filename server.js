var express = require("express");
var path = require("path");
var bodyParser = require("body-parser");
var mongodb = require("mongodb");
var ObjectID = mongodb.ObjectID;

var LOCATIONS_COLLECTION = "locations";

var app = express();
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.json());

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

/*  "/locations"
 *    GET: finds all locations
 *    POST: creates a new location
 */

app.get("/locations", function(req, res) {
});

app.post("/locations", function(req, res) {
});

/*  "/locations/:id"
 *    GET: find locations by id
 *    PUT: update location by id
 *    DELETE: deletes location by id
 */

app.get("/locations/:id", function(req, res) {
});

app.put("/locations/:id", function(req, res) {
});

app.delete("/locations/:id", function(req, res) {
});

app.post("/locations", function(req, res) {
  var newLocation = req.body;
  newLocation.createDate = new Date();

  if (!(req.body.firstName || req.body.lastName)) {
    handleError(res, "Invalid user input", "Must provide a first or last name.", 400);
  }

  db.collection(LOCATIONS_COLLECTION).insertOne(newLocation, function(err, doc) {
    if (err) {
      handleError(res, err.message, "Failed to create new location.");
    } else {
      res.status(201).json(doc.ops[0]);
    }
  });
});
