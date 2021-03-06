
var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

var userSchema = mongoose.Schema({
    username: {
	    type: String,
	    index: true
    },
    avatar: String,
    email: String,
    score: Number,
    created: Date,
    following: [{
	type : mongoose.Schema.Types.ObjectId,
	ref: 'User'
    }],
    followers: [{
	type : mongoose.Schema.Types.ObjectId,
	ref: 'User'
    }],
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
