'use strict';

var Busboy = require('busboy');
var mongoose = require('mongoose');
var Grid = require('gridfs-stream');
var fs = require('fs');

exports.create = function(req, res) {
    var busboy = new Busboy({ headers: req.headers });
    var fileId = new mongo.ObjectId();
    busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
	console.log('got file', filename, mimetype, encoding);
	var writeStream = gfs.createWriteStream({
	    _id: fileId,
	    filename:filename,
	    mode:'w',
	    content_type:mimetype });
	file.pipe(writeStream);
    }).on('finish',
	  function()
	  { // show a link to the uploaded file
	      res.writeHead(200, {'content-type':'text/html'});
	      res.end('<a href="/file/'+ fileId.toString() + '">download file</a>');
	  });
    req.pipe(busboy);
    
    /*
    console.log("req: " + req.session.key);
    console.log("user: " + JSON.stringify(req.user));
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
    //read_stream.on('end', function (file) {
    writestream.on('close', function(file) {
	var fileJSON = {'avatar' : writestream.id};
        res.status(200).end(JSON.stringify(fileJSON));
    });
    writestream.on('error', function(err) {
	res.status(400).end(err);
    });
*/
 
};
 
exports.read = function(req, res) {
    /*
    Grid.mongo = mongoose.mongo;
    var pic_id = req.params.id,
	gfs = new Grid(mongoose.connection.db);
    gfs.files.find({ _id: pic_id }, function (err, files) {
	if (err)
	    res.status(400).end('File not found');
        var mime = 'image/jpeg',
	    readStream = gfs.createReadStream({filename: pic_id});
        res.set('Content-Type', mime);
        readStream.pipe(res);
    });
*/

};
