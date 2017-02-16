var Post = require('../models/post');
var Comment = require('../models/comment');
var User = require('../models/user');
var Notification = require('../models/notification');

module.exports = {};

module.exports.create = function(req, res) {
    if (!req.user)
	return res.status(401).end('User not logged in')

    //Post
    var newPost = new Post();
    newPost.body = req.body.body;
    newPost.submittedUser = req.user;
    newPost.likes = new Array();
    newPost.comments = new Number();
    newPost.created = new Date();
    newPost.save(function(error, post) {
	if (error)
	    return res.status(400).end('Could not save post: ' + JSON.stringify(error));
    });
    res.writeHead(200, {"Content-Type": "application/json"});
    //newPost = newPost.toObject();
    return res.end(JSON.stringify(newPost));
};

module.exports.getUserPosts = function (req, res) {

}

module.exports.getPosts = function (req, res) {
    var lastSeen = req.params.lastSeen;
    if (!req.user)
	return res.status(401).end("User not authenticated");
    //User.findOne({ username : req.user.username}, function(error, user) {
    User.findOne({ _id : req.user._id}, function(error, user) {
	if (error)
	    return res.status(401).end("User not signed in.");
	if (lastSeen == '0' || lastSeen == 0) {
	    Post.find({$or: [{ submittedUser : {$in: user.following }}, {submittedUser : user._id}]})
    		.populate('reference')
		.populate('submittedUser')
		.populate('likes')
		.sort({ "created": -1 })
		.limit(5)
		.exec(function(err, posts) {
		    if (!posts)
			return res.status(201).end("No data");
		    if (!err) {
			console.log("We are in.......");
			if (posts.slice(-1)[0]) {
			    lastSeen = posts.slice(-1)[0].created;
			    var message = {
				'posts': posts,
				'lastSeen': lastSeen
			    };
			    return res.json(message);
			} else {
			    return res.status(200).end(JSON.stringify(posts));
			}
		    }
		    else
			return res.status(400).end('Could not fetch posts' + JSON.stringify(err));
		});
	} else {
	    //Pick up the query where it was left off
	    Post.find({$or: [{ submittedUser : {$in: user.following }}, {submittedUser : user._id}], "created": { "$lt": lastSeen }})
    		.populate('reference')
		.populate('submittedUser')
		.populate('likes')
		.sort({ "created": -1 })
		.limit(5)
		.exec(function(err, posts) {
		    if (!err) {
			var nextPost = posts.slice(-1)[0];
			if (nextPost) {
			    lastSeen = nextPost.created;
			    var message = {
				'posts': posts,
				'lastSeen': lastSeen
			    };
			    return res.json(message);
			} else {
			    return res.status(200).end('no more posts');
			}
		    }
		    else
			return res.status(400).end('Could not fetch posts');
		});
	}
    });
}

/*
 *  Params:
 *   id: _id of the post being liked
 *   type: type of post, 1 being main, 2 being comment, 3 beign reply
 */
module.exports.like = function (req, res) {
    var id = req.body.post,
	type = req.body.type,
	userId = req.user._id,
	notification = new Notification();
    
    if (type == 1) {
	Post.findByIdAndUpdate(
	    id,
	    {$push: {"likes": userId}},
	    {safe: true, upsert: false},
	    function(err, post) {
		if (err)
		    return res.status(500).end("Could not update post: " + JSON.stringify(err));
		Post.findOne({ _id : id })
		    .populate('reference')
		    .populate('submittedUser')
		    .populate('likes')
		    .exec(function(error, finalPost) {
			if (error)
			    return res.status(400).end(JSON.stringify(error));
			return res.end(JSON.stringify(finalPost));
		    });
	    });  
    } else if (type== 2) {
	Comment.findByIdAndUpdate(
	    id,
	    {$push: {"likes": userId}},
	    {safe: true, upsert: false},
	    function(err, post) {
		if (err)
		    return res.status(500).end("Could not update post: " + JSON.stringify(err));
		Comment.findOne({ _id : id })
		    .populate('submittedUser')
		    .populate('likes')
		    .poputlate('replies')
		    .exec(function(error, finalComment) {
			if (error)
			    return res.status(400).end(JSON.stringify(error));
			return res.end(JSON.stringify(finalComment));
		    });
	    });  
    } else {
	Comment.replies.findByIdAndUpdate(
	    id,
	    {$push: {"likes": userId}},
	    {safe: true, upsert: false},
	    function(err, reply) {
		if (err)
		    return res.status(500).end("Could not update reply: " + JSON.stringify(err));
		Comment.findOne({ _id : id })
		    .populate('submittedUser')
		    .populate('likes')
		    .exec(function(error, finalReply) {
			if (error)
			    return res.status(400).end(JSON.stringify(error));
			return res.end(JSON.stringify(finalReply));
		    });
	    }); 
    }
}

module.exports.unlike = function (req, res) {
    var id = req.body.post,
	type = req.body.type,
	userId = req.user._id;
    if (type == 1) {
	Post.findByIdAndUpdate(
	    id,
	    {$pull: {"likes": userId}},
	    {safe: true, upsert: false},
	    function(err, post) {
		if (err)
		    return res.status(500).end("Could not update post: " + JSON.stringify(err));
		Post.findOne({ _id : id })
		    .populate('reference')
		    .populate('submittedUser')
		    .populate('likes')
		    .exec(function(error, finalPost) {
			if (error)
			    return res.status(400).end(JSON.stringify(error));
		    return res.end(JSON.stringify(finalPost));
		    });
	    });
    } else if (type == 2) {
	Comment.findByIdAndUpdate(
	    id,
	    {$pull: {"likes": userId}},
	    {safe: true, upsert: false},
	    function(err, comment) {
		if (err)
		    return res.status(500).end("Could not update comment: " + JSON.stringify(err));
		Comment.findOne({ _id : id })
		    .populate('submittedUser')
		    .populate('likes')
		    .populate('replies')
		    .exec(function(error, finalComment) {
			if (error)
			    return res.status(400).end(JSON.stringify(error));
		    return res.end(JSON.stringify(finalComment));
		    });
	    });
    } else {
	Comment.replies.findByIdAndUpdate(
	    id,
	    {$pull: {"likes": userId}},
	    {safe: true, upsert: false},
	    function(err, reply) {
		if (err)
		    return res.status(500).end("Could not update reply: " + JSON.stringify(err));
		Comment.findOne({ _id : id })
		    .populate('submittedUser')
		    .populate('likes')
		    .populate('replies')
		    .exec(function(error, finalReply) {
			if (error)
			    return res.status(400).end(JSON.stringify(error));
		    return res.end(JSON.stringify(finalReply));
		    });
	    });
    }
}

module.exports.deletePost = function (req, res) {
    if (!req.user || req.user._id != req.params.id)
	return res.status(401).end('User not authenticated to delete post')
    
    //Delete Post
    Post.remove({ _id : req.params.postId }, function (error) {
	if (error)
	    return res.status(400).end('Unable to delete post');
    });
    
    //Delete Trail
    Trail.remove({reference : req.params.postId}, function(error) {
	if (err)
	    return res.status(500).end("Unable to delete trail");
    });

    //Delete all comments for Post
    Comment.find({postId : postId}).remove(function(error) {
	if (error)
	    return res.status(500).end("Unable to remove post");
	return res.status(200).end('Successfully deleted post');
    });
}
						
    

