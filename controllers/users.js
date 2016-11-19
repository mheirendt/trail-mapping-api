var User = require('../models/user');
var passport = require('passport');

module.exports = {};

module.exports.create = function(req, res) {
    if (!req.body.username || !req.body.password || !req.body.email){
        return res.status(400).end('Invalid input');
    }
    console.log("Req body: " + req.body.username + ", " + req.body.password);
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
	    
            newUser.save(function(error, user){
		console.log(error + ", " + user);
	    });

	    /*req.login(user, function(err) {
                if (err) {
                    res.status(500).end('Failed to login');
                }
            });*/

            //res.writeHead(200, {"Content-Type": "application/json"});
	    console.log("session: " + req.session);
	    req.session.key=req.body.username;
	    
            newUser = newUser.toObject();
            delete newUser.password;
            res.end(JSON.stringify(newUser));
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
		     console.log("session: " + req.session);
		    //set the session key
		    req.session.key=req.body.username;
                    return res.json({ SERVER_RESPONSE: 1, SERVER_MESSAGE: "Logged in!" });
		}
                
            });
        })(req, res, next);
};

module.exports.facebookAuthenticate = function(req, res, next) {
    passport.authenticate('facebook', { scope : 'email' });
}

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
                user.name = req.body.name ? req.body.name : user.name;
                user.desc = req.body.dec ? req.body.desc : user.desc;
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
