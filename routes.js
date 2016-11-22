var users  = require('./controllers/users');
var trails  = require('./controllers/trails');
var express = require('express');
var passport = require('./config/passport');

module.exports = function(app, passport) {

    app.get('/', function(req, res) {
        res.writeHead(200, {"Content-Type": "application/json"});
        res.end("MobilePassport API v1");
    });
//==========Authentication Routes============
    // Login [x]
    app.post('/login', users.login);

    // Register [x]
    app.post('/signup', users.create); 

    // Search For User by ID [x]
    app.get('/user/search/id/:id', isLoggedIn, users.read);

    // Search For User by Username [x]
    app.get('/user/search/username/:username', isLoggedIn, users.readByUsername);

    // Follow User by Username [x]
    app.get('/user/follow/username/:username', isLoggedIn, users.follow);
    
    // Unfollow User by Username [x]
    app.get('/user/unfollow/username/:username', isLoggedIn, users.unfollow);

    // Get all followers of the current user [x]
    app.get('/user/followers', isLoggedIn, users.getFollowers);
    
    // Get all followers of a specific user [x]
    app.get('/user/followers/:username', isLoggedIn, users.viewFollowers);
    
    // Get all current user is following [x]
    app.get('/user/followers', isLoggedIn, users.getFollowing);
    
    // Get all a specific user is following [x]
    app.get('/user/followers/:username', isLoggedIn, users.viewFollowing);
    
    // My Profile for Currently Logged in User [x]
    app.get('/user/profile', isLoggedIn, users.me);

    // Update As Currently Logged In User [x]
    app.post('/user/update', isLoggedIn, users.update);

    // Delete Currently Logged in User [x]
    app.delete('/user/delete', isLoggedIn, users.delete);

    // [x]
    app.post('/logout', isLoggedIn, function(req, res) {
	req.session.destroy(function(err){
            if(err)
		res.status(500).end('an internal error occurred');
            else
		res.end('logged out');
	});
    });

//==========Trail Mapping Routes============
    // Create a new trail [x]
    app.post('/trails', isLoggedIn, trails.create);

    // Get all trails [x]
    app.get('/trails', isLoggedIn, trails.getTrails);

//==========Trail Event Routes============

//==========Feed Post Routes============
    

    //======Facebook Authentication Routes=======
    // Authenticate a user with facebook [x]
    app.post('/auth/facebook/token',
	     passport.authenticate('facebook-token'),
	     function (req, res) {
		 if (req.user){
		     return res.status(200).end('User successfully authenticated with facebook');
		 } else
		     return res.status(401).end('Facebook user not found');
	     });
}
// Make a call to redis to ensure an active session [x]
function isLoggedIn(req, res, next) {
    if(req.session.key)
        return next();
    res.status(400).end('Not logged in');
}
