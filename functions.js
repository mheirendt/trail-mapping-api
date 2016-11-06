var bcrypt = require('bcryptjs'),
    Q = require('q'),
    config = require('./config.js'), //config file contains all tokens and other private info
    //db = require('mongodb')(config.mongodb); //config.db holds Orchestrate token
    //mongoClient = require('mongodb').MongoClient,
    mongodb = require("mongodb"),
    USERS_COLLECTION = "users";

    
//used in local-signup strategy
exports.localReg = function (username, password, email) {
    var deferred = Q.defer();
    var hash = bcrypt.hashSync(password, 8);
    var date = new Date();
    var user = {
      "username": username,
      "password": hash,
      "createDate" : date,
      "score" : 0,
      "email" : email
    }
    mongodb.MongoClient.connect(process.env.MONGODB_URI, function (err, db) {
	if (err) {
	    console.log("ERROR !!!! :" + err);
	} else {
	    var coll = db.collection(USERS_COLLECTION);
	    console.log("connected"); 
	    //coll.insertOne(user, function(){
		//console.log("posted");
		//console.log(user);
		//db.close()
	    //});
	    coll.findOne({username: username}, function(result){
		console.log("And the result is: " + result);
		  if (result) {
		      db.close();
		      deferred.resolve(false); //username already exists
		  } else {
		      coll.insertOne(user, function(){
			  console.log("posted");
			  console.log("function.js user is: " + user);
			  //db.close()
			  deferred.resolve(user);
		     });
		  }
	    });
	}
    });
    return deferred.promise;
};
  //check if username is already assigned in our database
  //db.get('local-users', username)
    //.then(function (result){ //case in which user already exists in db
    
    //console.log('username already exists');
    //deferred.resolve(false); //username already exists
  //})
  //.fail(function (result) {//case in which user does not already exist in db
      //console.log(result.body);
      //if (result.body.message == 'The requested items could not be found.'){
    //console.log('Username is free for use');
      //}
       /* db.put('local-users', username, user)
        .then(function () {
          console.log("USER: " + user);
          deferred.resolve(user);
        })
        .fail(function (err) {
          console.log("PUT FAIL:" + err.body);
          deferred.reject(new Error(err.body));
        });
      } else {
        deferred.reject(new Error(result.body));
      }
       */
  //});

//check if user exists
    //if user exists check if passwords match (use bcrypt.compareSync(password, hash); // true where 'hash' is password in DB)
      //if password matches take into website
  //if user doesn't exist or password doesn't match tell them it failed
exports.localAuth = function (userN, password, email) {
    console.log("Starting local auth!");
    var deferred = Q.defer();
    mongodb.MongoClient.connect(process.env.MONGODB_URI, function (err, db) {
        var coll = db.collection(USERS_COLLECTION);
        coll.findOne({username: userN}, function(error, userObj){
	    if (userObj) {
		console.log("found");
		console.log("userObj : " + userObj);
		console.log("userObj.body: " + userObj.body);
		console.log("userObj.body.password: " + userObj.body.password);
		var hash = userObj.body.password;
		console.log(hash);
		console.log(bcrypt.compareSync(password, hash));
		if (bcrypt.compareSync(password, hash)) {
                    deferred.resolve(userObj.body);
		    db.close();
		} else {
                    console.log("PASSWORDS DONT MATCH");
                    deferred.resolve(false);
		    db.close();
		}
	    } else {
		console.log("Ain't no results here!");
		deferred.resolve(false);
		db.close();
	    }
        });
    });
    return deferred.promise;
}
			
/*
  db.get('local-users', username)
  .then(function (result){
    console.log("FOUND USER");
    var hash = result.body.password;
    console.log(hash);
    console.log(bcrypt.compareSync(password, hash));
    if (bcrypt.compareSync(password, hash)) {
      deferred.resolve(result.body);
    } else {
      console.log("PASSWORDS NOT MATCH");
      deferred.resolve(false);
    }
  }).fail(function (err){
    if (err.body.message == 'The requested items could not be found.'){
          console.log("COULD NOT FIND USER IN DB FOR SIGNIN");
          deferred.resolve(false);
    } else {
      deferred.reject(new Error(err));
    }

  })
*/

