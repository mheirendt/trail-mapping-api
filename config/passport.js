var LocalStrategy = require('passport-local').Strategy;
var User = require('../models/user');

module.exports = function(passport) {

    passport.serializeUser(function(user, done) {
	done(null, user.id);
    });

    passport.deserializeUser(function(id, done) {
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
};
