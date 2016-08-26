var express = require("express");
var path = require("path");
var bodyParser = require("body-parser");
var mongodb = require("mongodb");
var ObjectID = mongodb.ObjectID;
var BSON = require('bson')

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

var findAllLocations = function(db, callback) {
   var cursor = db.collection(LOCATIONS_COLLECTION).find( );
   cursor.each(function(err, doc) {
      assert.equal(err, null);
      if (doc != null) {
         console.dir(doc);
      } else {
         callback();
      }
   });
};

app.post("/locations", function(req, res) {
  var newLocation = req.body;
  newLocation.createDate = new Date();

  if (!(req.body.Name || req.body.Location)) {
    handleError(res, "Invalid user input", "Must provide a first or last name.", 400);
  }

  db.collection(LOCATIONS_COLLECTION).insertOne(newLocation, function(err, doc) {
      console.log("updating collection");
    if (err) {
	handleError(res, err.message, "Failed to create new location.");
	console.log("error");
    } else {
	console.log("succeed");
      res.status(201).json(doc.ops[0]);
    }
  });
});


app.get("/locations/:id", function(req, res) {
  db.collection(LOCATIONS_COLLECTION).findOne({ _id: new ObjectID(req.params.id) }, function(err, doc) {
    if (err) {
      handleError(res, err.message, "Failed to get location");
    } else {
      res.status(200).json(doc);
    }
  });
});


app.get("/locations", function(req, res) {
    console.log("abcdefghij");
   /*
    db.collection(LOCATIONS_COLLECTION).find().toArray, (function(err, doc) {
	if (err) {
	    console.log("klmnopqrs");
	    handleError(res, err.message, "Failed to send locations to array");
	} else {
	    console.log("tuvwxyz");
	    res.status(200).json(doc);
	}
    });
   */
    var o_id = new BSON.ObjectID(id);
    db.collection(LOCATIONS_COLLECTION).find({'_id':o_id}, function(err, doc){
	if (err) {
	    console.log("klmnopqrs");
	    handleError(res, err.message, "Failed to send locations to array");
	} else {
	    console.log("tuvwxyz");
	    doc.toArray(callback);
	    res.status(200).json(doc);
	}
    });
//});
});

app.put("/locations/:id", function(req, res) {
  var updateDoc = req.body;
  delete updateDoc._id;

  db.collection(LOCATIONS_COLLECTION).updateOne({_id: new ObjectID(req.params.id)}, updateDoc, function(err, doc) {
    if (err) {
      handleError(res, err.message, "Failed to update location");
    } else {
      res.status(204).end();
    }
  });
});

app.delete("/locations/:id", function(req, res) {
  db.collection(LOCATIONS_COLLECTION).deleteOne({_id: new ObjectID(req.params.id)}, function(err, result) {
    if (err) {
      handleError(res, err.message, "Failed to delete location");
    } else {
      res.status(204).end();
    }
  });
});
