var Trail = require('../models/trail');
var User = require('../models/user');
var passport = require('passport');
var Post = require('../models/post');

module.exports = {};

module.exports.create = function(req, res) {
    if (!req.body.categories || !req.body.tags || !req.body.geometry){
        return res.status(400).end('Invalid input');
    }
    //trail
    var newTrail = new Trail();
    newTrail.categories = req.body.categories;
    newTrail.tags = req.body.tags;
    newTrail.geometry = req.body.geometry;
    newTrail. submittedUser = req.user;
    newTrail.created = new Date();

    //post
    var newPost = new Post();
    newPost.submittedUser = req.user;
    newPost.body = "Created a new trail";// + "\n" + trail.categories + "\n" + trail.tags;
    newPost.created = new Date();

    newTrail.reference = newPost;
    newPost.reference = newTrail;

    newTrail.save(function(error, trail){
	if (error)
	    res.status(400).end('Could not save trail');
    });

    newPost.save(function(error, post) {
	if (error)
	    res.status(400).end('Could not save post');
	//trail.reference = post;
	//trail.save(function(error, trail) {
	    //if (error)
		//res.status(400).end('Could not save post');
	//});
    });

    
    res.writeHead(200, {"Content-Type": "application/json"});
    newTrail = newTrail.toObject();
    res.end(JSON.stringify(newTrail));
};

module.exports.getTrails = function(req, res){
    User.findOne({ username : req.user.username}, function(error, user) {
	if (error)
	    res.status(401).end("User not signed in.");
	console.log("following: " + user.following);
	Trail.find({ submittedUser : {$in: user.following._id }})
    	    .populate('reference')
	    .populate('submittedUser')
	    .exec(function(err, trails) {
		if (!err) {
		    console.log("Trails: " + trails);
		    res.send(trails);
		}
		else
		    res.status(400).end('Could not fetch trails');
	    });
	});

    });
};
