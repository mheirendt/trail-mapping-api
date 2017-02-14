var Trail = require('../models/trail');
var User = require('../models/user');
var passport = require('passport');
var Post = require('../models/post');

module.exports = {};

module.exports.create = function(req, res) {
    if (!req.body.categories || !req.body.tags || !req.body.geometry)
        return res.status(400).end('Invalid input');
    
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
    newPost.body = "Created a new trail.";
    newPost.created = new Date();
    newTrail.reference = newPost;
    newPost.reference = newTrail;
    newTrail.save(function(error, trail){
	if (error)
	    return res.status(400).end('Could not save trail: ' + JSON.stringify(error));
    });
    newPost.save(function(error, post) {
	if (error)
	    return res.status(400).end('Could not save post');
    });
    res.writeHead(200, {"Content-Type": "application/json"});
    newTrail = newTrail.toObject();
    return res.end(JSON.stringify(newTrail));
};

module.exports.getTrails = function(req, res){
    //User.findOne({ username : req.user.username}, function(error, user) {
    User.findOne({ _id : req.user._id}, function(error, user) {
	if (error)
	    return res.status(401).end("User not signed in.");
	Trail.find({$or: [{ submittedUser : {$in: user.following }}, {submittedUser : user._id}]})
    	    .populate('reference')
	    .populate('submittedUser')
	    .exec(function(err, trails) {
		if (!err) {
		   return res.send(trails);
		}
		else
		    return res.status(400).end('Could not fetch trails: ' + JSON.stringify(err));
	    });
    });
};

module.exports.deleteTrail = function (req, res) {
    if (!req.user || req.user._id != req.params.id)
	return res.status(401).end('User not authenticated to delete trail');
    
    //Delete trail
    Trail.remove({_id: req.params.trailId}, function(error) {
	if (error)
	    return res.status(500).end("Unable to delete trail");
    });
    
    //Delete post
    Post.remove({ reference._id : req.params.trailId }, function(error) {
	if (error)
	    return res.status(500).end("Unable to delete post association");
    });
    
    //Delete comments
    Comment.remove({postId: req.params.id}, function(error) {
	if (error)
	    return res.status(500).end("Unable to delete comment associations");
        return res.end('Deleted');
    });
}
