var Post = require('../models/post');
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
    newPost.comments = new Array();
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
		.populate('comments.submittedUser')
	       	.populate('comments.replies.submittedUser')
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
		.populate('comments.submittedUser')
		.populate('comments.replies.submittedUser')
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
 *   typeId: _id of the comment / reply being liked
 */
module.exports.like = function (req, res) {
    var id = req.body.post,
	type = req.body.type,
	typeId = req.body.typeId,
	// user = req.user.username;
	userId = req.user._id,
	notification = new Notification();

    Post.findByIdAndUpdate(
	id,
	{$push: {"likes": userId}},
	{safe: true, upsert: false},
	function(err, post) {
            if (err)
		return res.status(500).end("Could not update post: " + JSON.stringify(err));
	    return res.end(JSON.stringify(post));
	});
    
    /*
    
    Post.findOne({ _id : id })//, function (error, post) {
	.populate('reference')
	.populate('submittedUser')
	.populate('likes')
	.populate('comments')
	.exec(function(error, post) {
	    if (error)
		return res.status(400).end(JSON.stringify(error));
	    //User.findOne({ username : user }, function (err, user) {
	    User.findOne({ _id : userId }, function (err, user) {
		if (err)
		    return  res.status(400).end(JSON.stringify(err));
		if (type == 1) {
		    //The post itself was liked
		    post.likes.push(user._id);
		    notification.action = "liked your post";
		} else if (type == 2) {
		    //A comment of the post was liked
		    post.comments.forEach(function(comment) {
			if (comment._id == typeId) {
			    comment.likes.push(user._id);
			    console.log("User has liked a comment");
			    notification.action = "liked your comment";
			    notification.toUser = comment.submittedUser;
			}
		    });
		} else {
		    //A reply to a comment of the post was liked
		    post.comments.forEach(function(comment) {
			comment.replies.forEach(function(reply) {
			    if (reply._id == typeId) {
				reply.likes.push(user._id);
				notification.action = "liked your reply";
				notification.toUser = reply.submittedUser;
			    }
			});
		    });
		}

		
		// Notification
		notification.seen = false;
		notification.reference = post._id;
		notification.submittedUser = userId;
		notification.created = new Date();
		notification.save();
		post.save(function(e, saved){
		    if (e)
			return res.status(400).end("Unable to update post: " + JSON.stringify(err));
		    return res.status(200).end(JSON.stringify(post));
		});
	    });
	});
    */

    
}

module.exports.unlike = function (req, res) {
    var id = req.body.post,
	type = req.body.type,
	typeId = req.body.typeId,
	userId = req.user._id;

        Post.findByIdAndUpdate(
	id,
	{$pullAll: {"likes": userId}},
	{safe: true, upsert: false},
	function(err, post) {
            if (err)
		return res.status(500).end("Could not update post: " + JSON.stringify(err));
	    return res.end(JSON.stringify(post));
	});
    /*
    Post.findOne({ _id : id })//, function (error, post) {
	.populate('reference')
	.populate('submittedUser')
	.populate('likes')
	.populate('comments')
	.exec(function(error, post) {
	    if (error)
		return res.status(400).end(JSON.stringify(error));
	    post.likes.forEach(function(like, index, object) {
		if (like._id == userId) {
		    object.splice(index, 1);
		}
	    });
	    post.save();
	    res.status(200).end(JSON.stringify(post));
	});*/
}

/*
 *  Params:
 *   id: _id of the post being commented on
 *   body: body of the comment to be posted
 *   type: type of post, 1 being main, 2 being reply
 *   typeId: _id of the post / comment being commented on
 */
module.exports.comment = function (req, res) {
    var id = req.body.post,
	body = req.body.body,
	type = req.body.type,
	typeId = req.body.typeId,
        //user = req.user.username;
	userId = req.user._id,
	notification = new Notification();
    
    Post.findOne({ _id : id })
    	.populate('reference')
	.populate('submittedUser')
	.populate('likes')
	.populate('comments')
	.exec(function(error, post) {
	    if (error)
		return res.status(400).end(JSON.stringify(error));
	    User.findOne({ _id : userId }, function (err, user) {
		if (err)
		    return  res.status(400).end(JSON.stringify(err));
		if (type == 1) {
		    var comment = {
			body: body,
			likes: new Array(),
			replies: new Array(),
			submittedUser: user._id,
			created: new Date()
		    };
		    post.comments.push(comment);
		    notification.action = "commented on your post";
		    notification.toUser = post.submittedUser;
		} else {
		    if (post.comments) {
			post.comments.forEach(function(comment) {
			    if (comment._id == typeId) {
				var reply = {
				    body: body,
				    likes: new Array(),
				    submittedUser: user._id,
				    created: new Date()
				};
				comment.replies.push(reply);
				notification.action = "replied to your comment";
				notification.toUser = comment.submittedUser;
			    }
			});
		    }
		}

		// Notification
		notification.seen = false;
		notification.reference = post._id;
		notification.submittedUser = req.user;
		notification.created = new Date();
		notification.save();
		post.save(function(e, saved){
		    if (e)
			return  res.status(400).end("Unable to update post: " + JSON.stringify(err));
		    return  res.status(200).end(JSON.stringify(post));
		});
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
						
    

