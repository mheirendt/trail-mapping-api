var Trail = require('../models/trail');
var passport = require('passport');
var Post = require('../models/post');

module.exports = {};

module.exports.create = function(req, res) {
    if (!req.body.categories || !req.body.tags || !req.body.geometry){
        return res.status(400).end('Invalid input');
    }
    //trail
    var newTrail = new Trail();
    //console.log("submitted user = " + req.user);
    newTrail.categories = req.body.categories;
    newTrail.tags = req.body.tags;
    newTrail.geometry = req.body.geometry;
    newTrail. submittedUser = req.user;
    newTrail.created = new Date();

    newTrail.save(function(error, trail){
	if (error)
	    res.status(400).end('Could not save trail');
	//post
	var newPost = new Post();
	newPost.submittedUsername = req.user;
	newPost.submittedUser = trail.submittedUser;
	newPost.reference = trail._id;
	newPost.body = "Created a new trail.";
	newPost.created = new Date();

	newPost.save(function(error, post) {
	    if (error)
		res.status(400).end('Could not save post');
	});
    });

    
    res.writeHead(200, {"Content-Type": "application/json"});
    newTrail = newTrail.toObject();
    res.end(JSON.stringify(newTrail));
};

module.exports.getTrails = function(req, res){
    Trail.find({}, function(err, trails) {
	if (!err)
	    res.send(trails);
	else
	    res.status(400).end('Could not fetch trails');
	
    });
};
