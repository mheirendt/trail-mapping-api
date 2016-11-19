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
		console.log(err);
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
		 // do something with req.user
		 console.log("made it through...");
		 //res.status(req.user? 200 : 401);
		 if (req.user){
		     console.log("set the key: " + req.user.token);
		     req.session.key = req.user.token;
		     return res.status(200).end('user successfully authenticated with facebook');
		 } else {
		     console.log("we got a 401 here");
		     return res.status(401).end('user not found with facebook');
		 }
	     });
    
    /*
//why
app.get('/auth/facebook', passport.authenticate('facebook-token', { scope : 'email' }));
//users.facebookAuthenticate
app.get('/auth/facebook/callback',
	passport.authenticate('facebook-token', { failureRedirect: '/signin' }),
	function(req, res) {
	    // Successful authentication, redirect home.
	    res.status(200);
	    res.redirect('/');
	});

    };
    */
}


function isLoggedIn(req, res, next) {
    //if (req.isAuthenticated())
    if(req.session.key)
        return next();
    res.status(400).end('Not logged in');
}
