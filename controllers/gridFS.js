'use strict';
 
var mongoose = require('mongoose');
var Grid = require('gridfs-stream');
//var Busboy = require('busboy');
var fs = require("fs");
var multer = require("multer");
var upload = multer({dest: "./uploads"});
//var formidable = require("formidable");


//var gfs = new Grid(mongoose.connection.db);
//var conn = mongoose.connection;
 
exports.create = function(req, res) {
    console.log(JSON.stringify(req.file));
    console.log("body: " + JSON.stringify(req.body));

    var dirname = "./";
     var filename = req.file.name;
     var path = req.file.path;
     var type = req.file.mimetype;
      
     var read_stream =  fs.createReadStream(dirname + '/' + path);
 
    var conn = req.conn;
    Grid.mongo = mongoose.mongo;
 
    //var gfs = Grid(conn.db);
    var gfs = new Grid(mongoose.connection.db);
      
     var writestream = gfs.createWriteStream({
        filename: filename
    });
    
    read_stream.pipe(writestream);
    
    read_stream.on('end', function () {
        console.log('*** file upload finished');
    });
    read_stream.on('error', function() {
        console.log('*** error occured');
        doCSUpdate();
    });
 
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
