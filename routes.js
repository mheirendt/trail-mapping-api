var users  = require('./controllers/users');
var trails  = require('./controllers/trails');
var posts = require('./controllers/posts');
var express = require('express');
var passport = require('./config/passport');
var gridFs = require('./controllers/gridFS');
var multiparty = require('connect-multiparty')();
var multer = require("multer");
var upload = multer({dest: "./uploads"});

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

    // Search For Users by Useranme [x]
    app.get('/user/search/usernames/:usernames', isLoggedIn, users.findUsers);

    // Follow User by Username [x]
    app.post('/user/follow/username', isLoggedIn, users.follow);
    
    // Unfollow User by Username [x]
    app.post('/user/unfollow/username', isLoggedIn, users.unfollow);
    
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

    //==========File Store Routes============
    // Read an existing filestream [x]
    app.get('/upload/:filename', gridFs.read);

    // Create a new filestream [x]
    app.post('/upload', isLoggedIn, upload.single("recfile"), gridFs.create);

//==========Trail Mapping Routes============
    // Create a new trail [x]
    app.post('/trails', isLoggedIn, trails.create);

    // Get all trails [x]
    app.get('/trails', isLoggedIn, trails.getTrails);

//==========Trail Event Routes============

//==========Post Routes============
    // Create a new post [x]
    app.post('/posts', isLoggedIn, posts.create);

    //Get all posts of current user and following 
    app.get('/posts', isLoggedIn, posts.getPosts);

    //Get all the posts of only the current user 
    app.get('/posts/user', isLoggedIn, posts.getUserPosts);

    //A post is liked
    app.post('/posts/liked', isLoggedIn, posts.like);

    //A post is commented on
    app.post('/posts/comment', isLoggedIn, posts.comment);

    //Delete a post by ID [x]
    app.delete('/posts/search/id/:id', isLoggedIn, posts.deletePost);
    

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
