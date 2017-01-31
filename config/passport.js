var LocalStrategy = require('passport-local').Strategy;
var FacebookTokenStrategy = require('passport-facebook-token');
var User = require('../models/user');
var auth = require('../config/auth');

module.exports = function(passport) {

    passport.serializeUser(function(user, done) {
	done(null, user.id);
    });

    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user){
            done(err, user);
        });
    
    });

    //===============LOCAL STRATEGIES================
    passport.use(new LocalStrategy(function(username, password, done) {
	console.log("localStrategy: " + username);
        User.findOne({ 'username': username }, function (err, user) {
            if (err) {
		return done(err);
	    }
            if (!user) {
                return done(null, false, { message: 'Incorrect username.' });
            }
            if (!user.validPassword(password)) {
                return done(null, false, { message: 'Incorrect password.' });
            }
            return done(null, user);
        });
    }));

    //===============FACEBOOK================

    passport.use(new FacebookTokenStrategy({
	clientID:  auth.facebookAuth.clientID,
	clientSecret: auth.facebookAuth.clientSecret,
	passReqToCallback: true
    }, function(req, accessToken, refreshToken, profile, done) {
                User.findOne({ 'facebook.id' : profile.id }, function(err, user) {
                    if (err)
                        return done(err);
                    if (user) {
			//user already has a token, log them in
			req.logIn(user, function(err) {
			    if (err)
				return done(err);
			    else{
				req.session.key = user.facebook.token;
				return done(null, user);
			    }
			});
                    } else {
			if (!req.user){
                            // if there is no user in the database, create them
                            var newUser = new User();
			    newUser.username = req.body.username;
			    newUser.avatar = req.body.avatar;
                            newUser.facebook.id = profile.id;
                            newUser.facebook.token = accessToken;
                            newUser.facebook.name = profile.name.givenName + ' ' + profile.name.familyName;
                            newUser.email = profile.emails[0].value;
			    newUser.score = 0;
			    newUser.created = new Date();
			    newUser.followers = new Array();
			    newUser.following = new Array();
                            newUser.save(function(err) {
				if (err)
                                    throw err;
				req.logIn(newUser, function(err) {
				    if (err)
					return done(err);
				    else{
					req.session.key = accessToken;
					return done(null, newUser);
				    }
				});
                            });
			} else {
			    //user exists locally, we must link accounts
			    var localUser = req.user;
			    localUser.username = req.body.username;
			    localUser.avatar = req.body.avatar;
			    localUser.facebook.id    = profile.id;
			    localUser.facebook.token = token;
			    localUser.facebook.name  = profile.name.givenName + ' ' + profile.name.familyName;
			    localUser.email = profile.emails[0].value;
			    localUser.followers = new Array();
			    localUser.following = new Array();
			    localUser.save(function(err) {
				if (err){
				    return done(err);
				} else {
				    req.logIn(localUser, function(err) {
					if (err)
					    return done(err);
					else{
					    req.session.key=token;
					    return done(null, localUser);
					}
				    });
				}
			    });
			}
                    }
                });
    }
));

};
