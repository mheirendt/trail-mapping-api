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

    // My Profile for Currently Logged in User [x]
    app.get('/user/profile', isLoggedIn, users.me);

    // Update As Currently Logged In User [x]
    app.post('/user/update', isLoggedIn, users.update);

    // Delete Currently Logged in User [x]
    app.delete('/user/delete', isLoggedIn, users.delete);

    // [x]
    app.post('/logout', isLoggedIn, function(req, res) {
	req.session.destroy(function(err){
            if(err){
		console.log('an internal error occurred at: ' + JSON.stringify(err));
		res.status(500).end('an internal error occurred');
            } else {
		res.end('logged out');
            }
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
    app.post('/auth/facebook/token',
	     passport.authenticate('facebook-token'),
	     function (req, res) {
		 if (req.user){
		     return res.status(200).end('user successfully authenticated with facebook');
		 } else
		     return res.status(401).end('user not found with facebook');
	     });
}

function isLoggedIn(req, res, next) {
    //if (req.isAuthenticated())
    console.log(JSON.stringify(req.session, null, 4));
    console.log("req: " + req + ", Session: " + req.session + ", key: " + req.session.key);
    if(req.session.key){
	console.log("the session key is set, we are all good here");
        return next();
    }
    res.status(400).end('Not logged in');
}
