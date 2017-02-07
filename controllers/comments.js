var Post = require('../models/post');
var Comment = require('../models/comment');
var User = require('../models/user');
var Notification = require('../models/notification');
module.exports = {};

module.exports.create = function(req, res) {
    if (!req.user)
	return res.status(401).end('User not logged in');
	
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
	{$inc: {'comments': 1}},
	{safe: true, upsert: false},
	function(err, post) {
            if (err)
		return res.status(500).end("Could not update post: " + JSON.stringify(err));
	    return res.end(JSON.stringify(comment));
	 });
}

module.exports.getComments = function(req, res) {
    var lastSeen = req.params.lastSeen;
    User.findOne({ _id : req.user._id}, function(error, user) {
	if (error)
	    return res.status(401).end("User not signed in.");
	if (lastSeen == '0' || lastSeen == 0) {
	    Comment.find({$or: [{ submittedUser : {$in: user.following }}, {submittedUser : user._id}]})
		.populate('submittedUser')
		.populate('likes')
		.populate('replies')
		.sort({ "created": -1 })
		.limit(20)
		.exec(function(err, comments) {
		    if (!comments)
			return res.status(201).end("No data");
		    if (!err) {
			if (comments.slice(-1)[0]) {
			    lastSeen = comments.slice(-1)[0].created;
			    var message = {
				'comments': comments,
				'lastSeen': lastSeen
			    };
			    return res.json(message);
			} else {
			    return res.status(200).end(JSON.stringify(comments));
			}
		    }
		    else
			return res.status(400).end('Could not fetch comments');
		});
	} else {
	    //Pick up the query where it was left off
	    Comment.find({$or: [{ submittedUser : {$in: user.following }}, {submittedUser : user._id}], "created": { "$lt": lastSeen }})
		.populate('submittedUser')
		.populate('likes')
		.populate('replies')
		.sort({ "created": -1 })
		.limit(20)
		.exec(function(err, comments) {
		    if (!err) {
			var nextComment = comments.slice(-1)[0];
			if (nextComment) {
			    lastSeen = nextComment.created;
			    var message = {
				'comments': comments,
				'lastSeen': lastSeen
			    };
			    return res.json(message);
			} else {
			    return res.status(200).end('no more comments');
			}
		    }
		    else
			return res.status(400).end('Could not fetch comments');
		});
	}
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
