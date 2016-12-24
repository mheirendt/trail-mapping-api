var mongoose = require('mongoose');

var postSchema = mongoose.Schema({
    body: String,
    type: String,
    submittedUser: {
	type: String,
	ref: 'User'
    },
    likes: Number,
    comments: Array,
    created: Date
});

module.exports = mongoose.model('Post', postSchema);
    
