'use strict';
 
var mongoose = require('mongoose');
var Grid = require('gridfs-stream');
var Busboy = require('busboy');
var mongo = require('mongodb');

Grid.mongo = mongoose.mongo;
var gfs = new Grid(mongoose.connection.db);
 
exports.create = function(req, res) {
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
    file.pipe(writeStream);
  }).on('finish', function() {
      res.writeHead(200, {'content-type': 'text/html'});
      console.log("fileID: " + fileId);
      res.end(JSON.stringify(fileId);
  });

  req.pipe(busboy);
    /*
    var part = req.files.file;
    console.log(req.files.file.name);
    console.log(JSON.stringify(req.body));
    var writeStream = gfs.createWriteStream({
        filename: part.name,
    	mode: 'w',
        content_type:req.files.file.mimetype,
	metadata: req.body
    });
    writeStream.on('close', function() {
        return res.status(200).send({
	    message: 'Success'
	});
    });
    
    writeStream.write(part.data);
    
    writeStream.end();
*/
 
};
 
 
    exports.read = function(req, res) {
	gfs.findOne({ _id: req.params.id }, function (err, file) {
	    if (err) return res.status(400).send(err);
	    if (!file) return res.status(404).send('');

	    res.set('Content-Type', file.contentType);
	    res.set('Content-Disposition', 'attachment; filename="' + file.filename + '"');

	    var readstream = gfs.createReadStream({
		_id: file._id
	    });

	    readstream.on("error", function(err) {
		console.log("Got error while processing stream " + err.message);
		res.end();
	    });

	    readstream.pipe(res);
	});
 /*
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
*/
 
};
 
