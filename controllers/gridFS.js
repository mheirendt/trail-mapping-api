'use strict';
 
var mongoose = require('mongoose');
var Grid = require('gridfs-stream');
var Busboy = require('busboy');
var mongo = require('mongodb');

//Grid.mongo = mongoose.mongo;
//var gfs = new Grid(mongoose.connection.db);

var gfs = gridfs(mongoose.connection);
var bb = new busboy({
    headers: req.headers
});
 
exports.create = function(req, res) {
           bb.on('file', function(fieldname, file, filename, encoding, mimetype) {
            var doc = new DocumentMeta();
            doc.setFileName(filename);
            doc.setMimetype(mimetype);
            doc.setEncoding(encoding);
            doc.insert(function(err) {
                if(!err) {
                    var ws = gfs.createWriteStream({
                        _id: mongoose.Types.ObjectId().toString(),
                        filename: filename,
                        mode: 'w',
                        content_type: mimetype
                    });
                    ws.on('close', function(file) {
                        console.log('Doc Written to DB');
                    });
                    file.on('data', function(data) {
                        console.log('GOT DATA');
                    });
                    file.pipe(ws);
                } else {
                    resp.json({success:false, msg: 'Error Creating Doc', data : { error : err.message }});
                }
            });
        });
        bb.on('finish', function() {
            resp.json({success:true, msg: 'Successfully Uploaded Doc'});
        });

        req.pipe(bb);

    });
    /*
1.
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
	console.log("filename: " + filename + ", fieldnaem: " + fieldname);
	file.pipe(writeStream);
    }).on('finish', function() {
	res.writeHead(200, {'content-type': 'text/html'});
	console.log("fileID: " + fileId);
	res.end(JSON.stringify(fileId));
    });

    req.pipe(busboy);
*/
    /*
2.
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
 
