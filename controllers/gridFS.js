'use strict';
 
var mongoose = require('mongoose');
var Grid = require('gridfs-stream');
var fs = require('fs');

exports.create = function(req, res) {
    //console.log(JSON.stringify(req.file));

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
    read_stream.on('end', function () {
        res.status(200).end('Upload Successful');
    });
    read_stream.on('error', function(err) {
	res.status(400).end(err);
    });
 
};
 
 
exports.read = function(req, res) {
    var pic_id = req.params.id;
    //var gfs = req.gfs;
    Grid.mongo = mongoose.mongo;
    var gfs = new Grid(mongoose.connection.db);
    console.log(gfs.files.length);
    gfs.files.find({_id: pic_id}).toArray(function (err, files) {
    //Trail.find({$or: [{ submittedUser : {$in: user.following }}
        if (err)
            res.end(err);
        if (files.length > 0) {
            var mime = 'image/jpeg';
            res.set('Content-Type', mime);
            var read_stream = gfs.createReadStream({filename: pic_id});
            read_stream.pipe(res);
        } else {
            res.status(400).end('File Not Found');
        }
    });
};
