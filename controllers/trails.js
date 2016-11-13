var Trail = require('../models/trail');
var passport = require('passport');

module.exports = {};

module.exports.create = function(req, res) {
    if (!req.body.categories || !req.body.tags || !req.body.geometry){
        return res.status(400).end('Invalid input');
    }
    var newTrail = new Trail();
    console.log("submitted user = " + req.session.user);
    newTrail.categories = req.body.categories;
    newTrail.tags = req.body.tags;
    newTrail.geometry = req.body.geometry;
    newTrail. submittedUser = req.session.user;
    newTrail.created = new Date();

    newTrail.save(function(error, trail){
	if (error)
	    res.status(400).end('Could not save trail');
    });
    res.writeHead(200, {"Content-Type": "application/json"});
    newTrail = newTrail.toObject();
    res.end(JSON.stringify(newTrail));
};

module.exports.getTrails = function(req, res){
    Trail.find({}, function(err, trails) {
	if (!err)
	    res.send(trails);
	else
	    res.status(400).end('Could not fetch trails');
	
    });
};
