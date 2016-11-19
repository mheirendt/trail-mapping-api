var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var User = require('../models/user');
var auth = require('../config/auth');

module.exports = function(passport) {

    passport.serializeUser(function(user, done) {
	done(null, user.id);
    });

    passport.deserializeUser(function(id, done) {
	console.log("Deserializing user");
        User.findById(id, function(err, user){
            done(err, user);
        });
    
    });
/*
    //===============FACEBOOK================
passport.use(new FacebookStrategy({
    clientID: FACEBOOK_APP_ID,
    clientSecret: FACEBOOK_APP_SECRET,
    callbackURL: "https://secure-garden-50529.herokuapp.com/auth/facebook/callback"
  },
  function(accessToken, refreshToken, user, cb) {
      PROFILE_USERNAME = user.displayName;
      user.username = user.displayName;
      return cb(null, user);
  }
));
*/

    //===============LOCAL STRATEGIES================
    passport.use(new LocalStrategy(function(username, password, done) {
	
        User.findOne({ 'local.username': username }, function (err, user) {
	    console.log("finding");
            if (err) { return done(err); }
            if (!user) {
		 console.log("incorrect username");
                return done(null, false, { message: 'Incorrect username.' });
            }
            if (!user.validPassword(password)) {
		 console.log("incorrect password");
                return done(null, false, { message: 'Incorrect password.' });
            }
	     console.log("successfully found");
            return done(null, user);
        });
    }));

    passport.use(new FacebookStrategy({
        clientID: '143683242760890',
        clientSecret: '095c264c52e8cd9001ab259070d5e971',
        callbackURL: 'https://secure-garden-50529.herokuapp.com/auth/facebook/callback',
        passReqToCallback: true 
    }, function(req, token, refreshToken, profile, done) {
        process.nextTick(function() {
	    console.log("starting facebook");
            if (!req.user) {
		 console.log("No session");
                User.findOne({ 'facebook.id' : profile.id }, function(err, user) {
                    if (err)
                        return done(err);
                    if (user) {
			 console.log("There is a user id already but no token");
                        // if there is a user id already but no token (user was linked at one point and then removed)
                        if (!user.facebook.token) {
			     console.log("assigning facebook token");
                            user.facebook.token = token;
                            user.facebook.name  = profile.name.givenName + ' ' + profile.name.familyName;
                            user.facebook.email = profile.emails[0].value;

                            user.save(function(err) {
                                if (err)
                                    throw err;
				 console.log("user saved");
                                return done(null, user);
                            });
                        }
                        return done(null, user); // user found, return that user
                    } else {
                        // if there is no user, create them
			 console.log("createing facebook user");
                        var newUser = new User();
			newUser.facebook.username = req.body.username;
                        newUser.facebook.id = profile.id;
                        newUser.facebook.token = token;
                        newUser.facebook.name = profile.name.givenName + ' ' + profile.name.familyName;
                        newUser.facebook.email = profile.emails[0].value;
			newUser.facebook.score = 0;
			newUser.facebook.created = new Date();

                        newUser.save(function(err) {
                            if (err)
                                throw err;
			    console.log("facebook user created");
                            return done(null, newUser);
                        });
			req.session.key=req.body.username;
                    }
                });

            } else {
		 console.log("linking user to facebook");
                // user already exists and is logged in, we have to link accounts
                var user= req.user; // pull the user out of the session

                user.facebook.id = profile.id;
                user.facebook.token = token;
                user.facebook.name  = profile.name.givenName + ' ' + profile.name.familyName;
                user.facebook.email = profile.emails[0].value;

                user.save(function(err) {
                    if (err)
                        throw err;
		    console.log("local user linked to facebook");
                    return done(null, user);
                });

            }
        });

    }));


};
