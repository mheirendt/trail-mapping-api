var User = require('../models/user');
var passport = require('passport');

module.exports = {};

/*
 * Params:
 *   username: proposed new user's username
 *   password: password of the new user
 *   email:    email of the new user
 *   avatar: (optional) _id of the GFS image for profile picture
 */
module.exports.create = function(req, res) {
    if (!req.body.username || !req.body.password || !req.body.email)
        return res.status(400).end('Invalid input');
    User.findOne({ username:  req.body.username }, function(err, user) {
        if (user)
            return res.status(400).end(req.body.username + ' already exists, please pick another.');
        else {
            var newUser = new User();
            newUser.username = req.body.username;
	    newUser.avatar = req.body.avatar
            newUser.local.password = newUser.generateHash(req.body.password);
            newUser.email = req.body.email;
            newUser.score = 0;
	    newUser.created = new Date();
	    newUser.followers = new Array();
	    newUser.following = new Array();
            newUser.save(function(error, user){
		if (error)
		    return res.status(400).end('an internal error occurred: ' + JSON.stringify(error));
		req.login(newUser, function(err) {
                    if (err) {
			console.log("Err: " + JSON.stringify(err))
			return res.status(400).end('Failed to login: ' + JSON.stringify(err));
		    }
                    else {
			//req.session.key = newUser.username;
			req.session.key = newUser._id;
			console.log(req.session.key);
			newUser = newUser.toObject();
			delete newUser.local.password;
			return res.end(JSON.stringify(newUser));
		    }
		});
	    });
        }
    });
};

module.exports.login = function(req, res, next) {
        passport.authenticate('local', function(err, user, info) {
            if (err)
                next(err);
            if(!user)
                res.status(400).json({SERVER_RESPONSE: 0, SERVER_MESSAGE: "Wrong Credentials"});
            req.logIn(user, function(err) {
                if (err)
                    return next(err);
                else{
		    //req.session.key = req.body.username;
		    req.session.key = user._id;
                    res.end(JSON.stringify(user));
		}
            });
        })(req, res, next);
};

module.exports.read = function(req, res) {
    User.findOne({ _id : req.params.id })//, function(err, user) {
    .populate('following')
    .populate('followers')
    .exec(function(err, user) {
        if (user) {
            res.writeHead(200, {"Content-Type": "application/json"});
            //user = user.toObject();
            //delete user.local.password;
            //delete user.__v;
            return res.end(JSON.stringify(user));
        } else {
            return res.status(400).end('User not found');
        }
    });
};

module.exports.readByUsername = function(req, res) {
    User.findOne({ username: req.params.username })//, function(err, user) {
    .populate('following')
    .populate('followers')
    .exec(function(err, user) {
        if (user) {
            res.writeHead(200, {"Content-Type": "application/json"});
	    if (!user)
		return res.status(400).end("user not found");
            user = user.toObject();
	    if (user.local)
		user.local.password ? delete user.local.password : null;
	    delete user.__v;
            return res.end(JSON.stringify(user));
        } else {
            return res.status(400).end('User not found');
        }
    });
};

module.exports.findUsers = function(req, res) {
    User.find({username : new RegExp(req.params.usernames, "i")})
    .populate('following')
    .populate('followers')
    .limit(10)
    .exec(function(err, results) {
	if (err)
	    return res.status(400).end('User not found');
	//var users = [];
	//results.forEach(function(user) {
            //user = user.toObject();
            //delete user.local.password;
            //delete user.__v;
	    //if (user.username != req.user.username)
	    //users.push(user);
	//});
	
	return res.status(200).end(JSON.stringify(results));
	});
    };
    //return res.end(users);
//};

module.exports.follow = function(req, res) {
    var id = req.user.id,
	userId = req.body.userId;
    if (userId) {
	User.findByIdAndUpdate(
	    userId,
	    {$push: {"followers": id}},
	    {safe: true, upsert: false},
	    function(err, otherUser) {
		if (err)
		    return res.status(500).end("Could not update user: " + JSON.stringify(err));;
		User.findByIdAndUpdate(
		    id,
		    {$push: {"following": userId}},
		    {safe: true, upsert: false},
		    function(err, updatedUser) {
			if (err)
			    return res.status(500).end("Could not update user: " + JSON.stringify(err));
			User.findOne({ _id :  userId})
			    .populate('following')
			    .populate('followers')
			    .exec(function(error, user) {
				if (error)
				    return res.status(500).end("Could not update user: " + error.toString());
				return res.end(user.toString());
			    });
		    });
	    });
	/*User.findOne({ _id: userId }, function(err, user) {
	    if (err)
		return res.status(400).end('Specified user not found: ' + JSON.stringify(err));
	    //User.findOne({ username: req.user.username }, function(error, currentUser) {
	     User.findOne({ _id: req.user._id }, function(error, currentUser) {
		if (error)
		    return res.status(400).end('Could not find current user: ' + JSON.stringify(error));
		currentUser.following.push(user._id);
		user.followers.push(currentUser._id);
		currentUser.save();
		user.save();
		return res.status(200).end(JSON.stringify(currentUser));
	    });
	});*/
    }
};

module.exports.unfollow = function(req, res) {
        var id = req.user.id,
	userId = req.body.userId;
    if (userId) {
	User.findByIdAndUpdate(
	    userId,
	    {$pull: {"followers": id}},
	    {safe: true, upsert: false},
	    function(err, otherUser) {
		if (err)
		    return res.status(500).end("Could not update user: " + JSON.stringify(err));;
		User.findByIdAndUpdate(
		    id,
		    {$pull: {"following": userId}},
		    {safe: true, upsert: false},
		    function(err, updatedUser) {
			if (err)
			    return res.status(500).end("Could not update user: " + JSON.stringify(err));
			User.findOne({ _id :  userId})
			    .populate('following')
			    .populate('followers')
			    .exec(function(error, user) {
				if (error)
				    return res.status(500).end("Could not update user: " + JSON.stringify(error));
				return res.end(JSON.stringify(user));
			    });
		    });
	    });
    }
 
    /*
    var userId = req.body.userId;
    User.findOne({ _id: userId }, function(err, user) {
	if (err)
	    return res.status(400).end('Specified user not found: ' + JSON.stringify(err));
	//User.findOne({ username: req.user.username }, function(error, currentUser) {
	User.findOne({ _id: req.user._id }, function(error, currentUser) {
	     if (error)
		 return res.status(400).end('Could not find current user: ' + JSON.stringify(error));
	     currentUser.following.remove(user._id);
	     user.followers.remove(currentUser._id);
	     currentUser.save();
	     user.save();
	     return res.status(200).end(JSON.stringify(currentUser));
	 });
    });*/
};

module.exports.me = function(req, res) {

    //User.findOne({ username: req.user.username })//, function(err, user) {
    User.findOne({ _id: req.user._id })
	.populate('following')
	.populate('followers')
	.exec(function(err, user) {
            if (user) {
		res.writeHead(200, {"Content-Type": "application/json"});
		user = user.toObject();
		if (user){
		    //delete user.local.password;
		    //delete user.__v;
		    return res.end(JSON.stringify(user));
		} else {
		    return res.status(400).end('An internal server error has occurred');
		}
            } else {
		return res.status(400).end('User not found');
            }
	});
    
};


module.exports.update = function(req, res, next) {
    User.findOne({ _id : req.user._id }, function(error, user) {
	if (error)
	    return next(error);
	if(!user) {
	    return res.status(404).json({
		message: 'User id: ' + req.user._id + ' could not be found.'
	    });
	}
	user.update(req.body, function(err, updatedUser) {
	    if(err)
		return next(err);
	    return res.json(updatedUser);
	});
    });
};

module.exports.delete = function(req, res) {
    if (req.user._id != req.params.id)
	return res.status(401).end("You cannot delete another user");
    User.remove({_id: req.user._id}, function(err) {
        return res.end('Deleted')
    });
};

//Allow removal from array by text value
Array.prototype.remove = function() {
    var what, a = arguments, L = a.length, ax;
    while (L && this.length) {
        what = a[--L];
        while ((ax = this.indexOf(what)) !== -1) {
            this.splice(ax, 1);
        }
    }
    return this;
};
