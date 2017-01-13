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
            newUser.local.password = newUser.generateHash(req.body.password);
            newUser.email = req.body.email;
            newUser.score = 0;
	    newUser.created = new Date();
	    newUser.followers = new Array();
	    newUser.following = new Array();
	    //newUser.facebook = null;
	    
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
        passport.authenticate('local', function(err, user, info) {
            if (err)
                return next(err);
            if(!user)
                return res.status(400).json({SERVER_RESPONSE: 0, SERVER_MESSAGE: "Wrong Credentials"});
            req.logIn(user, function(err) {
                if (err)
                    return next(err);
                else{
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
    User.findOne({ username: req.params.username }, function(err, user) {
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
    //User.findOne({ username: req.params.username }, function(err, user) {
    console.log("username" + req.params.usernames);
    console.log(new RegExp(req.params.usernames, "i"));
    User.find({ $username : new RegExp(req.params.usernames, "i")})
    .limit(10)
    .exec(function(err, results) {
	if (err)
	    return res.status(400).end('User not found');
	var users = [];
	res.writeHead(200, {"Content-Type": "application/json"});
	console.log("results: " + results);
	results.forEach(function(user) {
            user = user.toObject();
            delete user.local.password;
            delete user.__v;
	    users.push(user);
	});
       res.send(users);
	
    });
        //if (user) {
        //    res.writeHead(200, {"Content-Type": "application/json"});
        //    user = user.toObject();
        //    delete user.local.password;
        //    delete user.__v;
        //    res.end(JSON.stringify(user));
        //} else {
        //    return res.status(400).end('User not found');
        //}
    //});
};

//TODO refactor user schema and test
module.exports.follow = function(req, res) {
    User.findOne({ username: req.params.username }, function(err, user) {
        if (user) {
	    if (error)
		res.end('internal server error');
	    User.findOne({ username: req.user.username }, function(error, currentUser) {
		if (error)
		    res.end('internal server error');
		currentUser.following.push(user.username);
		user.followers.push(currentUser.username);
		currentUser.save();
		user.save();
		res.status(200).end(currentUser.username + " has successfully followed " + user.username);
	    });
        } else {
            return res.status(400).end('User not found');
        }
    });
};

//TODO refactor user schema and test
module.exports.unfollow = function(req, res) {
    User.findOne({ username: req.params.username }, function(err, user) {
        if (user) {
	    if (error)
		res.end('internal server error');
	    User.findOne({ username: req.user.username }, function(error, currentUser) {
		if (error)
		    res.end('internal server error');
		currentUser.following.remove(user.username);
		user.followers.remove(currentUser.username);
		currentUser.save();
		user.save();
		res.status(200).end(currentUser.username + " has successfully unfollowed " + user.username);
	    });
        } else {
            return res.status(400).end('User not found');
        }
    });
};

//the next four may not be necessary because the read method returns all needed info which can then be organized client side
//TODO refactor user and test
module.exports.getFollowers = function(req, res) {
    User.findOne({ username: req.user.username }, function(error, currentUser) {
	if (err)
	    res.end('internal server error');
	res.status(200).end(JSON.stringify(currentUser.followers));
    });
}

//TODO refactor user and test
module.exports.viewFollowers = function(req, res) {
    User.findOne({ username: req.params.username }, function(err, user) {
	if (err)
	    res.end('internal server error');
	res.status(200).end(JSON.stringify(user.followers));
    });
}

//TODO refactor user and test
module.exports.getFollowing = function(req, res) {
    User.findOne({ username: req.user.username }, function(error, currentUser) {
	if (err)
	    res.end('internal server error');
	res.status(200).end(JSON.stringify(currentUser.following));
    });
}

//TODO refactor user and test
module.exports.viewFollowing = function(req, res) {
    User.findOne({ username: req.params.username }, function(err, user) {
	if (err)
	    res.end('internal server error');
	res.status(200).end(JSON.stringify(user.following));
    });
}

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
