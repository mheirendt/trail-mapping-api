'use strict';
 
var mongoose = require('mongoose');
var Grid = require('gridfs-stream');
var fs = require('fs');
var User = require('../models/user');

exports.create = function(req, res) {
    console.log(JSON.stringify(req.file));
    console.log("Body: " + JSON.stringify(req.body));
    console.log("User: " + JSON.stringify(req.user));

    var dirname = "./",
	filename = req.file.name,
	path = req.file.path,
	type = req.file.mimetype,
	read_stream =  fs.createReadStream(dirname + '/' + path);
    
    Grid.mongo = mongoose.mongo;
    
    var gfs = new Grid(mongoose.connection.db),
	writestream = gfs.createWriteStream({
            filename: filename
	});
    
    read_stream.pipe(writestream);

    //Error - Success handling
    read_stream.on('end', function (file) {
	User.findOne({ _id : req.body.id}, function(error, user) {
	    if (error)
		return res.status(400).end('User not signed in');
	    console.log("File: " + JSON.stringify(file));
	    user.avartar = user;
	    user.save();
            res.status(200).end('Upload Successful');
	});
    });
    read_stream.on('error', function(err) {
	res.status(400).end(err);
    });
 
};
 
exports.read = function(req, res) {
    Grid.mongo = mongoose.mongo;
    var pic_id = req.params.id,
	gfs = new Grid(mongoose.connection.db);
    gfs.files.findOne({ _id: pic_id }, function (err, file) {
	//console.log(file);
	if (err)
	    res.status(400).end('File not found');
        var mime = 'image/jpeg',
	    readStream = gfs.createReadStream({filename: pic_id});
        res.set('Content-Type', mime);
        readStream.pipe(res);
    });
};
