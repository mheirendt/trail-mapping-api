var User = require('../models/user');
var passport = require('passport');

module.exports = {};

module.exports.create = function(req, res) {
    console.log(JSON.stringify(req.body));
    if (!req.body.username || !req.body.password || !req.body.email){
        return res.status(400).end('Invalid input');
    }
    User.findOne({ username:  req.body.username }, function(err, user) {
        if (user) {
            return res.status(400).end('User already exists');
        } else {
	    //Create a new user from mongoose schema
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
		    return res.status(500).end('an internal error occurred');
		req.login(newUser, function(err) {
                    if (err) 
			res.status(500).end('Failed to login');
                    else {
			req.session.key = newUser.username;
			newUser = newUser.toObject();
			delete newUser.local.password;
			res.end(JSON.stringify(newUser));
		    }
		});
	    });
        }
    });
};

module.exports.login = function(req, res, next) {
    console.log("logging in");
    console.log("login: " + req.body.username);
        passport.authenticate('local', function(err, user, info) {
            if (err) {
		console.log("error Logging in at user: " + JSON.stringify(err));
                return next(err);
	    }
            if(!user) {
		console.log("User not found");
                return res.status(400).json({SERVER_RESPONSE: 0, SERVER_MESSAGE: "Wrong Credentials"});
	    }
            req.logIn(user, function(err) {
                if (err) {
		    console.log("error Logging in at user #2: " + JSON.stringify(err));
                    return next(err);
		}
                else{
		    console.log("Username: " + req.body.username);
		    req.session.key = req.body.username;
                    return res.json({ SERVER_RESPONSE: 1, SERVER_MESSAGE: "Logged in!" });
		}
                
            });
        })(req, res, next);
};

module.exports.read = function(req, res) {
    User.findById(req.params.id, function(err, user) {
        if (user) {
            res.writeHead(200, {"Content-Type": "application/json"});
            user = user.toObject();
            delete user.local.password;
            delete user.__v;
            res.end(JSON.stringify(user));
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
            user = user.toObject();
            delete user.local.password;
            delete user.__v;
            res.end(JSON.stringify(user));
        } else {
            return res.status(400).end('User not found');
        }
    });
};

module.exports.findUsers = function(req, res) {
    User.find({username : new RegExp(req.params.usernames, "i")})
    .populate('avatar')
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

//TODO refactor user schema and test
module.exports.follow = function(req, res) {
    if (req.body.username) {
	User.findOne({ username: req.body.username }, function(err, user) {
	    if (err)
		res.end('User not found');
	    User.findOne({ username: req.user.username }, function(error, currentUser) {
		if (error)
		    res.end('User not signed in');
		currentUser.following.push(user._id);
		user.followers.push(currentUser._id);
		currentUser.save();
		user.save();
	    });
	});
	User.findOne({ username: req.body.username })
            .populate('avatar')
	    .populate('following')
	    .populate('followers')
	    .exec(function(e, finalUser) {
		if (e)
		    res.status(400).end(JSON.stringify(user));
		res.status(200).end(JSON.stringify(finalUser));
	    });
    } else {
	return res.status(400).end("no username provided");
    }
};

module.exports.unfollow = function(req, res) {
    User.findOne({ username: req.body.username }, function(err, user) {
	if (err)
	    res.end('user not found');
	User.findOne({ username: req.user.username }, function(error, currentUser) {
	    if (error)
		res.end('User not signed in');
	    currentUser.following.remove(user._id);
	    user.followers.remove(currentUser._id);
	    currentUser.save();
	    user.save();
	});
	User.findOne({ username: req.body.username })
            .populate('avatar')
	    .populate('following')
	    .populate('followers')
	    .exec(function(e, finalUser) {
		if (e)
		    res.status(400).end(JSON.stringify(user));
		res.status(200).end(JSON.stringify(finalUser));
	    });
    });
};

module.exports.me = function(req, res) {

    User.findOne({ username: req.user.username }, function(err, user) {
        if (user) {
            res.writeHead(200, {"Content-Type": "application/json"});
            user = user.toObject();
	    if (user){
		//delete user.local.password;
		//delete user.__v;
		res.end(JSON.stringify(user));
	    } else {
		res.status(400).end('An internal server error has occurred');
	    }
        } else {
            return res.status(400).end('User not found');
        }
    });
    
};


module.exports.update = function(req, res) {
    User.findById(req.user.id, function(err, user) {
        if (user) {
            if (user.username != req.user.username) {
                return res.status(401).end('Modifying other user');
            } else {
                user.username = req.body.username ? req.body.username : user.username;
                user.local.password = req.body.password ? user.generateHash(req.body.password) : user.password;
                user.email = req.body.email ? req.body.email : user.email;
		user.avatar = req.body.avatar ? req.body.avatar : user.avatar;
                user.save();

                res.writeHead(200, {"Content-Type": "application/json"});
                user = user.toObject();
                delete user.password;
                res.end(JSON.stringify(user));
            }
        } else {
            return res.status(400).end('User not found');
        }
    });
};

module.exports.delete = function(req, res) {
    User.remove({_id: req.user.id}, function(err) {
        res.end('Deleted')
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
