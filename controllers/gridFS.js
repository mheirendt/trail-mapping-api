'use strict';
 
var mongoose = require('mongoose');
var Grid = require('gridfs-stream');

Grid.mongo = mongoose.mongo;
var gfs = new Grid(mongoose.connection.db);
 
exports.create = function(req, res) {
    var part = req.files.file;
    console.log(req.files.file.name);
    console.log(JSON.stringify(req.body));
    var writeStream = gfs.createWriteStream({
        filename: part.name,
    	mode: 'w',
        content_type:req.files.file.mimetype,
	metadata: req.body
    });
    console.log("created var" + JSON.stringify(writeStream));
    
    writeStream.on('close', function() {
        return res.status(200).send({
	    message: 'Success'
	});
    });
    
    writeStream.write(part.data);
    
    writeStream.end();
 
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
 
