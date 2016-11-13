var Trail = require('../models/trail');
var passport = require('passport');

module.exports = {};

module.exports.create = function(req, res) {
    console.log("creating trails....");
    if (!req.body.categories || !req.body.tags || !req.body.geometry){
        return res.status(400).end('Invalid input');
    }

    console.log("2nd phase!");
     var newTrail = new Trail();
     newTrail.categories = req.body.categories;
     newTrail.tags = req.body.tags;
     newTrail.geometry = req.body.geometry;
     newTrail. submittedUser = "";
     newTrail.created = new Date();


     newTrail.save(function(error, trail){console.log(error + ", " + trail);});

     res.writeHead(200, {"Content-Type": "application/json"});

     newTrail = newTrail.toObject();
     
    res.end(JSON.stringify(newTrail));
};

module.exports.getTrails = function(req, res){
    console.log("finding trails....");
    Trail.find({}, function(err, trails) {
	console.log("The trails are: " + trails);
	var trailObjects = {};
	trails.forEach(function(trail) {
	    trailObjects[trail._id] = trail;
	    console.log("trail: " + trail);
	});
    res.send(trailObjects);
    });
};
