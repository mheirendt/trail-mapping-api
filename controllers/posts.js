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
    newPost.comments = 0;
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
			return res.status(400).end('Could not fetch posts');
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

/*
 *  Params:
 *   id: _id of the post being commented on
 *   body: body of the comment to be posted
 */
module.exports.comment = function (req, res) {
    var id = req.body.post,
	body = req.body.body,
	userId = req.user._id,
	comment = new Comment();
    comment.body = body;
    comment.postId = id;
    comment.likes = new Array();
    comment.replies = new Array();
    comment.submittedUser = userId
    comment.created = new Date();
    comment.save();
    
    Post.findByIdAndUpdate(
	id,
	{$inc: {comments: 1}},
	{safe: true, upsert: false},
	function(err, post) {
            if (err)
		return res.status(500).end("Could not update post: " + JSON.stringify(err));
	    return res.end(JSON.stringify(comment));
	 });
}

module.exports.reply = function (req, res) {
    var id = req.body.comment,
	body = req.body.body,
	userId = req.user._id,
	reply = {
	    body: body,
	    likes: new Array(),
	    submittedUser: userId,
	    created: new Date()
	};
    
    Comment.findByIdAndUpdate(
	id,
	{$push: {"replies": reply}},
	{safe: true, upsert: false},
	function(err, post) {
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
}

module.exports.deletePost = function (req, res) {
    if (!req.user)
	return res.status(401).end('User not logged in')
    var postId = req.body.post;

    Post.findOne({ _id : postId }, function (err, post) {
	if (err)
	    return res.status(400).end('Could not find post');
	post.remove(function(error, result) {
	    if (error)
		return res.status(400).end('Unable to delete post');
	    return res.status(200).end('Successfully deleted post');
	});
    });
}
						
    

