var mongoose = require('mongoose');

var postSchema = mongoose.Schema({
    body: String,
    reference: {
	type: String,
	ref: 'Trail',
    },
    submittedUsername: String,
    submittedUser: {
	type: String,
	ref: 'User'
    },
    likes: Number,
    comments: Array,
    created: Date
});

module.exports = mongoose.model('Post', postSchema);
    
