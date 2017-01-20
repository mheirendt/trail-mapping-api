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
    var pic_id = req.param('id');
    var gfs = req.gfs;
 
    gfs.files.find({filename: pic_id}).toArray(function (err, files) {
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
