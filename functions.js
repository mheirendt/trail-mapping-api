var bcrypt = require('bcryptjs'),
    Q = require('q'),
    config = require('./config.js'), //config file contains all tokens and other private info
    //db = require('mongodb')(config.mongodb); //config.db holds Orchestrate token
    //mongoClient = require('mongodb').MongoClient,
    mongodb = require("mongodb"),
    USERS_COLLECTION = "users";

    
//used in local-signup strategy
exports.localReg = function (username, password) {
    var deferred = Q.defer();
    var hash = bcrypt.hashSync(password, 8);
    var date = new Date();
    var user = {
	"username": username,
	"password": hash,
	"createDate" : date,
	"score" : 0,
	"email" : "test@testing"
    }
    mongodb.MongoClient.connect(process.env.MONGODB_URI, function (err, db) {
	if (err) {
	    console.log("ERROR !!!! :" + err);
	} else {
	    var coll = db.collection(USERS_COLLECTION);
	    coll.findOne({username: username}, function(result){
		console.log("And the result is: " + result);
		  if (result) {
		      db.close();
		      deferred.resolve(false); //username already exists
		  } else {
		      coll.insertOne(user, function(){
			  console.log("posted");
			  console.log("function.js user is: " + user);
			  db.close()
			  deferred.resolve(user);
		     });
		  }
	    });
	}
    });
    return deferred.promise;
};

exports.localAuth = function (userN, password, email) {
    console.log("Starting local auth!");
    var deferred = Q.defer();
    mongodb.MongoClient.connect(process.env.MONGODB_URI, function (err, db) {
        var coll = db.collection(USERS_COLLECTION);
        coll.findOne({username: userN}, function(err, item){
	    if (item) {
		console.log("found");
		console.log("userObj : " + item);
		console.log("userObj.password: " + item.password);
		var hash = item.password;
		console.log(hash);
		console.log(bcrypt.compareSync(password, hash));
		if (bcrypt.compareSync(password, hash)) {
                    deferred.resolve(item);
		    //db.close();
		} else {
                    console.log("PASSWORDS DONT MATCH");
                    deferred.resolve(false);
		    //db.close();
		}
	    } else {
		console.log("Ain't no results here!");
		deferred.resolve(false);
		//db.close();
	    }
        });
    });
    return deferred.promise;
}

