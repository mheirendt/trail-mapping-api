
var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');
//var md5 = require('MD5');

var userSchema = mongoose.Schema({
    username: {
	    index: true
    },
    avatar: String,
    email: String,
    score: Number,
    created: Date,
    following: Array,
    followers: Array,
    local: {
	password: String
    },
    facebook: {
        id: String,
        token: String,
        name: String
    }
});

userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password);
};

module.exports = mongoose.model('User', userSchema);
