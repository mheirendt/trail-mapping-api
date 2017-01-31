'use strict';

var mongo = require('mongodb'),
    mongoose = require('mongoose'),
    Grid = require('gridfs-stream'),
    fs = require('fs');

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
		number: '1',
		name: "name"
	    }
	});
    read_stream.pipe(writeStream);

    writeStream.on('close', function(file) {
	var fileJSON = {'avatar' : writeStream.id};
        return res.status(200).end(JSON.stringify(fileJSON));
    });
    writeStream.on('error', function(err) {
	return res.status(400).end(err);
    });
 
};
 
exports.read = function(req, res) {
    Grid.mongo = mongoose.mongo;
    var photoId = req.params.fileId,
	gfs = new Grid(mongoose.connection.db);
    gfs.exist({ _id: photoId }, function(err, found) {
    if (err)
	return res.status(400).end("error finding file");
    if (!found) 
	return res.send('Error on the database looking for the file.')

	// We only get here if the file actually exists, so pipe it to the response
	var mime = 'image/jpeg';
	res.set('Content-Type', mime);
	gfs.createReadStream({ _id: photoId }).pipe(res);
    });
};

exports.delete = function(req, res) {
    Grid.mongo = mongoose.mongo;
    var photoId = req.params.fileId,
	gfs = new Grid(mongoose.connection.db);
    gfs.exist({ _id: photoId }, function(err, found) {
	if (err)
	    return res.status(400).end("error finding file");
	if (!found) {
	    res.send('Error on the database looking for the file.')
	    return;
	}
        gfs.remove({_id : photoId }, function (err, success) {
            if (err)
		return res.status(400).end("Could not remove GFS file: " + JSON.stringify(err));
            return res.status(200).end("Successfully deleted GFS file: " + JSON.stringify(success)); 
        });
    });
}
