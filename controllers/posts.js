var Post = require('../models/post');
var User = require('../models/user');

module.exports = {};

module.exports.create = function(req, res) {
    if (!req.user) {
	return res.status(401).end('User not logged in')
    }
    var newPost = new Post();
    newPost.body = req.body.body;
    newPost.submittedUser = req.user;
    newPost.likes = new Array();
    newPost.comments = new Array();
    newPost.created = new Date();
    newPost.save(function(error, post) {
	if (error)
	    res.status(400).end('Could not save post');
    });
    res.writeHead(200, {"Content-Type": "application/json"});
    newPost = newPost.toObject();
    res.end(JSON.stringify(newPost));
};

module.exports.getUserPosts = function (req, res) {

}

module.exports.getPosts = function (req, res) {
    console.log("posts: " + req.user.username);
    console.log("posts: " + req.session.key);
        User.findOne({ username : req.user.username}, function(error, user) {
	if (error)
	    res.status(401).end("User not signed in.");
	    Post.find({$or: [{ submittedUser : {$in: user.following }}, {submittedUser : user._id}]})
    	    .populate('reference')
	    .populate('submittedUser')
	    .exec(function(err, posts) {
		if (!err) {
		    res.send(posts);
		}
		else
		    res.status(400).end('Could not fetch posts');
	    });
    });
}

module.exports.like = function (req, res) {
    var id = req.body.post;
    var user = req.user.username;
    Post.findOne({ _id : id }, function (error, post) {
	if (error)
	    return res.status(400).end(JSON.stringify(error));
	User.findOne({ username : user }, function (err, user) {
	    if (err)
		return  res.status(400).end(JSON.stringify(err));
	    post.likes.push(user._id);
	    post.save(function(e, saved){
		if (e)
		    return  res.status(400).end("Unable to update post: " + JSON.stringify(err));
		return  res.status(200).end(JSON.stringify(post));
	    });
	});
    });
}

module.exports.comment = function (req, res) {

}

module.exports.deletePost = function (req, res) {
    if (!req.user) {
	return res.status(401).end('User not logged in')
    }
    Post.find({ '_ID' : req.body.post }, function (err, post) {
	if (err)
	    return res.status(400).end('Could not find post');
	post.remove(function(error, result) {
	    if (error)
		return res.status(400).end('Unable to delete post');
	    res.status(200).end('Successfully deleted post');
	});
    });
}
						
    

