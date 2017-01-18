'use strict';
 
var mongoose = require('mongoose');
var Grid = require('gridfs-stream');

Grid.mongo = mongoose.mongo;
var gfs = new Grid(mongoose.connection.db);
 
exports.create = function(req, res) {
    var busboy = new Busboy({ headers : req.headers });
    var fileId = new mongo.ObjectId();

    req.busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
	console.log('got file', filename, mimetype, encoding);
	var writeStream = gfs.createWriteStream({
	    _id: fileId,
	    filename: filename,
	    mode: 'w',
	    content_type: mimetype,
	});
	console.log("filename: " + filename);
	file.pipe(writeStream);
    }).on('finish', function() {
	res.writeHead(200, {'content-type': 'text/html'});
	console.log("fileID: " + fileId);
	res.end(JSON.stringify(fileId));
    });

    req.pipe(busboy);
 
};
 
 
exports.read = function(req, res) {
 
	gfs.files.find({ filename: req.params.filename }).toArray(function (err, files) {
 
 	    if(files.length===0){
			return res.status(400).send({
				message: 'File not found'
			});
 	    }
	
		res.writeHead(200, {'Content-Type': files[0].contentType});
		
		var readstream = gfs.createReadStream({
			  filename: files[0].filename
		});
 
	    readstream.on('data', function(data) {
	        res.write(data);
	    });
	    
	    readstream.on('end', function() {
	        res.end();        
	    });
 
		readstream.on('error', function (err) {
		  console.log('An error occurred!', err);
		  throw err;
		});
	});
 
};
 
/*
    var busboy = new Busboy({ headers : req.headers });
    var fileId = new mongo.ObjectId();

    busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
	console.log('got file', filename, mimetype, encoding);
	var writeStream = gfs.createWriteStream({
	    _id: fileId,
	    filename: filename,
	    mode: 'w',
	    content_type: mimetype,
	});
	console.log("filename: " + filename);
	file.pipe(writeStream);
    }).on('finish', function() {
	res.writeHead(200, {'content-type': 'text/html'});
	console.log("fileID: " + fileId);
	res.end(JSON.stringify(fileId));
    });

    req.pipe(busboy);
*/
