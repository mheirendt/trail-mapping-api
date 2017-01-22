'use strict';

var mongo = require('mongodb');
var mongoose = require('mongoose');
var Grid = require('gridfs-stream');
var fs = require('fs');

exports.create = function(req, res) {
    var dirname = "./",
	filename = req.file.name,
	path = req.file.path,
	type = req.file.mimetype,
	read_stream =  fs.createReadStream(dirname + '/' + path);
    
    Grid.mongo = mongoose.mongo;
    
    var gfs = new Grid(mongoose.connection.db),
	fileId = new mongo.ObjectId(),
	writeStream = gfs.createWriteStream({
	    _id: fileId,
	    filename: filename,
	    mode: 'w',
	    content_type: type,
	    metadata: {
		id: '123',
		number: '2',
		name: "Kenny Erasmuson"
	    }
	});
    read_stream.pipe(writeStream);

    //Error - Success handling
    //read_stream.on('end', function (file) {
    writeStream.on('close', function(file) {
	var fileJSON = {'avatar' : writeStream.id};
        res.status(200).end(JSON.stringify(fileJSON));
    });
    writeStream.on('error', function(err) {
	res.status(400).end(err);
    });
 
};
 
exports.read = function(req, res) {
    Grid.mongo = mongoose.mongo;
    var pic_id = req.params.id,
	gfs = new Grid(mongoose.connection.db);
    console.log(pic_id);
    gfs.exist({ _id: pic_id }, function(err, found) {
    if (err)
	return res.status(400).end("error finding file");
    if (!found) {
      res.send('Error on the database looking for the file.')
      return;
    }
	// We only get here if the file actually exists, so pipe it to the response
	var mime = 'image/jpeg';
	res.set('Content-Type', mime);
	gfs.createReadStream({ _id: pic_id }).pipe(res);
});
    /*
    gfs.files.find({ _id: pic_id }, function (err, files) {
	if (err)
	    res.status(400).end('File not found');
        var mime = 'image/jpeg',
	    readStream = gfs.createReadStream({filename: pic_id});
        res.set('Content-Type', mime);
        readStream.pipe(res);
    });*/


};
