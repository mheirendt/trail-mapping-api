var url = require('url'),
    redisStore = require('connect-redis')(session);

module.exports = {};

module.exports.initClient = function(){

    var redisUrl = url.parse(process.env.REDIS_URL),
	redisAuth = redisUrl.auth.split(':');
    
    console.log("info: " + redisUrl.hostname + ", " + redisUrl.port + ", " + redisAuth[0] + ", " + redisAuth[1]);

    var redis = require('redis').createClient(redisUrl.port, redisUrl.hostname);
    redis.auth(redisAuth[1]);

    redis.keys("sess:*", function(error, keys){
	console.log("Number of active sessions: ", keys.length);
    });
    return redis;
}
