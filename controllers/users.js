var User = require('../models/user');
var passport = require('passport');

module.exports = {};

module.exports.create = function(req, res) {
    if (!req.body.username || !req.body.password || !req.body.email){
        return res.status(400).end('Invalid input');
    }
    User.findOne({ username:  req.body.username }, function(err, user) {
        if (user) {
            return res.status(400).end('User already exists');
        } else {
	    //Create a new user from mongoose schema
            var newUser = new User();
            newUser.local.username = req.body.username;
            newUser.local.password = newUser.generateHash(req.body.password);
            newUser.local.email = req.body.email;
            newUser.local.score = 0;
	    newUser.local.created = new Date();
	    //newUser.local.followers = new Array();
	    //newUser.local.following = new Array();
	    
            newUser.save(function(error, user){
		if (error)
		    return res.status(500).end('an internal error occurred');
		req.login(newUser, function(err) {
                    if (err) 
			res.status(500).end('Failed to login');
                    else {
			req.session.key = newUser.local.username;
			newUser = newUser.toObject();
			delete newUser.password;
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
            delete user.password;
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
            delete user.password;
            delete user.__v;
            res.end(JSON.stringify(user));
        } else {
            return res.status(400).end('User not found');
        }
    });
};

module.exports.me = function(req, res) {

    User.findOne({ username: req.user.username }, function(err, user) {
        if (user) {
            res.writeHead(200, {"Content-Type": "application/json"});
            user = user.toObject();
            delete user.password;
            delete user.__v;
            res.end(JSON.stringify(user));
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
                user.password = req.body.password ? user.generateHash(req.body.password) : user.password;
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
