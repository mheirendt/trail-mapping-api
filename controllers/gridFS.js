'use strict';
 
var mongoose = require('mongoose');
var Grid = require('gridfs-stream');
//var Busboy = require('busboy');
var fs = require("fs");
var multer = require("multer");
var upload = multer({dest: "./uploads"});
var formidable = require("formidable");

Grid.mongo = mongoose.mongo;
var gfs = new Grid(mongoose.connection.db);
var conn = mongoose.connection;
 
exports.create = function(req, res) {
    console.log(JSON.stringify(req.file));
    console.log("body: " + JSON.stringify(req.body));
    //delete app.use(express.bodyParser());
    var form = new formidable.IncomingForm();
    form.uploadDir = "./Uploads";
    form.keepExtensions = true;
    console.log("about to start");
    form.on('error', function(err) { console.log(err); });
    form.on('aborted', function() { console.log('Aborted'); })
    form.on('end', function () {
        res.send('Completed ... go check fs.files & fs.chunks in mongodb');
    });
    console.log(JSON.stringify(form));
    form.parse(req, function (err, fields, files) {
	console.log("parsed");
        if (!err) {
	    console.log("no error");
            console.log('Files Uploaded: ' + files.file)
            grid.mongo = mongoose.mongo;
            var gfs = Grid(conn.db);
            var writestream = gfs.createWriteStream({
                filename: files.file.name
            });
            fs.createReadStream(files.file.path).pipe(writestream);
        } else {
	    console.log(JSON.stringify(err));
	    res.status(400).end('unable to parse form');
	}
	
    });
    
  //var tmp_path = req.file.path;
  /** The original name of the uploaded file
      stored in the variable "originalname". **/
    /*
  var target_path = 'uploads/' + req.file.originalname;
  var src = fs.createReadStream(tmp_path);
  var dest = fs.createWriteStream(target_path);
  src.pipe(dest);
  src.on('end', function() { res.status('400'); });
    src.on('error', function(err) { res.status('200').end('upload complete')});*/
 
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
