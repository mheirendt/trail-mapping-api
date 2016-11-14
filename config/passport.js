var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook');
var User = require('../models/user');

var FACEBOOK_APP_ID = "143683242760890";
var FACEBOOK_APP_SECRET = "095c264c52e8cd9001ab259070d5e971";

module.exports = function(passport) {

    passport.serializeUser(function(user, done) {
	done(null, user.id);
    });

    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user){
            done(err, user);
        });
    
    });

    //===============FACEBOOK================
    passport.use(new FacebookStrategy({

        // pull in our app id and secret from our auth.js file
        clientID        : FACEBOOK_APP_ID,
        clientSecret    : FACEBOOK_APP_SECRET,
        callbackURL     : "https://secure-garden-50529.herokuapp.com/auth/facebook/callback",
	// allows us to pass in the req from our route (lets us check if a user is logged in or not)
        passReqToCallback : true 

    },
    function(req, token, refreshToken, profile, done) {
        process.nextTick(function() {
            if (!req.user) {
                User.findOne({ 'facebook.id' : profile.id }, function(err, user) {
                    if (err)
                        return done(err);
                    if (user) {
                        return done(null, user);
                    } else {
                        // if there is no user found with that facebook id, create them
                        var newUser = new User();

                        newUser.facebook.id    = profile.id;                   
                        newUser.facebook.token = token;                   
                        newUser.facebook.name  = profile.name.givenName + ' ' + profile.name.familyName;
                        newUser.facebook.email = profile.emails[0].value;

                        newUser.save(function(err) {
                            if (err)
                                throw err;
                            return done(null, newUser);
                        });
                    }
                });
            } else {
                // user already exists and is logged in, we have to link accounts
                var user = req.user;

                user.facebook.id    = profile.id;
                user.facebook.token = token;
                user.facebook.name  = profile.name.givenName + ' ' + profile.name.familyName;
                user.facebook.email = profile.emails[0].value;

                user.save(function(err) {
                    if (err)
                        throw err;
                    return done(null, user);
                });
            }
        });

    //===============LOCAL STRATEGIES================
    passport.use(new LocalStrategy(function(username, password, done) {
	
        User.findOne({ username: username }, function (err, user) {
            if (err) { return done(err); }
            if (!user) {
                return done(null, false, { message: 'Incorrect username.' });
            }
            if (!user.validPassword(password)) {
                return done(null, false, { message: 'Incorrect password.' });
            }
            return done(null, user);
        });
    }
));
